const appIdInput = document.getElementById("appId");
const tabStatus = document.getElementById("tabStatus");
const logBox = document.getElementById("log");
const detectBtn = document.getElementById("detectBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toggleAdvanced = document.getElementById("toggleAdvanced");
const advancedPanel = document.getElementById("advancedPanel");
const pathsInput = document.getElementById("paths");
const detectPathsBtn = document.getElementById("detectPathsBtn");
const downloadByPathsBtn = document.getElementById("downloadByPathsBtn");

let activeTab = null;

init();

async function init() {
  activeTab = await getActiveTab();
  const appId = extractAppId(activeTab?.url || "");
  tabStatus.textContent = appId ? "Base44" : "No Base44 Tab";
  if (appId) appIdInput.value = appId;
  log(appId ? "Base44 project detected. Click 'Download ZIP' to export all files." : "Open the Base44 editor tab or paste Project ID.");
}

detectBtn.addEventListener("click", async () => {
  activeTab = await getActiveTab();
  const appId = extractAppId(activeTab?.url || "");
  if (!appId) return log("Could not detect Project ID in active tab.");
  appIdInput.value = appId;
  tabStatus.textContent = "Base44";
  log(`Project ID: ${appId}`);
});

downloadBtn.addEventListener("click", async () => {
  await withBusy(downloadBtn, async () => {
    const appId = requireAppId();
    log("Starting extraction with content load waiting...\nPlease wait while each file is clicked, loaded, and saved.");

    const result = await runInPage(crawlBase44WorkspaceWithWait, [appId]);
    if (!result.ok) {
      log(`Extraction failed: ${result.error}`);
      return;
    }

    const fileCount = Object.keys(result.files).length;
    if (fileCount === 0) {
      log("No file contents could be read from Monaco editor.");
      return;
    }

    log(`Extracted ${fileCount} files successfully!\nBuilding ZIP archive...`);
    await saveZip(result.files, `olympido-base44-${appId}.zip`);
    log(`Success! ${fileCount} files saved as ZIP archive into your Downloads.`);
  });
});

toggleAdvanced.addEventListener("click", () => {
  advancedPanel.hidden = !advancedPanel.hidden;
});

detectPathsBtn.addEventListener("click", async () => {
  await withBusy(detectPathsBtn, async () => {
    log("Scanning sidebar for all project files...");
    const result = await runInPage(detectAllTreeFiles, []);
    if (result.paths && result.paths.length) {
      pathsInput.value = result.paths.join("\n");
      log(`Found ${result.paths.length} files in sidebar tree.`);
    } else {
      log("Could not detect files. Make sure the 'Code files' sidebar is open.");
    }
  });
});

downloadByPathsBtn.addEventListener("click", async () => {
  await withBusy(downloadByPathsBtn, async () => {
    const appId = requireAppId();
    const paths = parsePaths(pathsInput.value);
    if (!paths.length) throw new Error("Path list is empty.");
    log(`Downloading ${paths.length} files from list with load waiting...`);
    const result = await runInPage(downloadBySpecifiedPathsWithWait, [appId, paths]);
    if (!result.ok) {
      log(`Error: ${result.error}`);
      return;
    }
    await saveZip(result.files, `olympido-base44-${appId}.zip`);
    log(`Success! ${Object.keys(result.files).length} files downloaded as ZIP.`);
  });
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function extractAppId(url) {
  const match = String(url).match(/app\.base44\.com\/apps\/([^/]+)/);
  return match?.[1] || "";
}

function requireAppId() {
  const appId = appIdInput.value.trim();
  if (!/^[a-zA-Z0-9_-]{8,}$/.test(appId)) throw new Error("Please enter a valid Project ID.");
  return appId;
}

function parsePaths(text) {
  return [...new Set(text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
}

function log(message) {
  logBox.textContent = message;
}

async function withBusy(button, task) {
  const buttons = [detectBtn, downloadBtn, detectPathsBtn, downloadByPathsBtn];
  try {
    buttons.forEach((btn) => (btn.disabled = true));
    await task();
  } catch (error) {
    log(error?.message || String(error));
  } finally {
    buttons.forEach((btn) => (btn.disabled = false));
  }
}

async function runInPage(func, args) {
  activeTab = activeTab || await getActiveTab();
  if (!activeTab?.id) throw new Error("Cannot access active tab.");
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    world: "MAIN",
    func,
    args
  });
  return result.result;
}

/**
 * In-page crawler function with proper Monaco content load waiting
 */
async function crawlBase44WorkspaceWithWait(appId) {
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Step 1: Expand all folders repeatedly
  for (let pass = 0; pass < 6; pass++) {
    const closedFolders = Array.from(document.querySelectorAll('[role="treeitem"][state="closed"], [role="treeitem"][data-state="closed"]'));
    if (closedFolders.length === 0) break;
    for (const folder of closedFolders) {
      folder.click();
      await sleep(150);
    }
    await sleep(250);
  }

  // Step 2: Identify all file items
  const allItems = Array.from(document.querySelectorAll('[role="treeitem"]'));
  const fileItems = allItems.filter(el => {
    const state = el.getAttribute("state") || el.getAttribute("data-state");
    if (state === "open" || state === "closed") return false;
    const txt = el.textContent?.trim() || "";
    return txt.includes(".") || txt === ".gitignore";
  });

  if (fileItems.length === 0) {
    return { ok: false, error: "Could not find file items in sidebar tree." };
  }

  const files = {};

  // Step 3: Click each file item and wait for Monaco to finish rendering
  for (let i = 0; i < fileItems.length; i++) {
    const item = fileItems[i];
    const fileName = item.textContent?.trim();

    // Click item
    item.click();

    let finalPath = "";
    let code = "";

    // Poll for up to 4 seconds for content to load
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(200);

      const url = new URL(window.location.href);
      const urlParam = url.searchParams.get("filePath");

      if (urlParam && decodeURIComponent(urlParam).endsWith(fileName)) {
        finalPath = decodeURIComponent(urlParam).replace(/\\/g, "/").replace(/^\/+/, "");
      }

      code = readMonacoText(fileName, finalPath);
      if (code && code.trim().length > 0) {
        await sleep(300); // extra debounce
        code = readMonacoText(fileName, finalPath);
        break;
      }
    }

    if (!finalPath) {
      const urlParam = new URL(window.location.href).searchParams.get("filePath");
      finalPath = urlParam ? decodeURIComponent(urlParam).replace(/\\/g, "/").replace(/^\/+/, "") : fileName;
    }

    if (code && code.trim().length > 0) {
      files[finalPath] = code;
    }
  }

  return { ok: true, files };

  function readMonacoText(fileName, filePath) {
    try {
      if (window.monaco && window.monaco.editor && window.monaco.editor.getModels) {
        const models = window.monaco.editor.getModels();
        if (models && models.length > 0) {
          const target = filePath || fileName;
          const match = models.find(m => m.uri.toString().endsWith(target) || m.uri.toString().endsWith(fileName));
          if (match && match.getValue().trim().length > 0) {
            return match.getValue();
          }
          if (models.length === 1 && models[0].getValue().trim().length > 0) {
            return models[0].getValue();
          }
        }
      }
    } catch (e) {}

    const editor = document.querySelector(".monaco-editor.focused") || document.querySelector(".monaco-editor");
    if (!editor) return "";

    const lines = Array.from(editor.querySelectorAll(".view-line"));
    if (lines.length > 0) {
      return lines.map(l => l.innerText.replace(/\u00a0/g, " ")).join("\n").replace(/\r\n/g, "\n").trimEnd();
    }

    const viewLines = editor.querySelector(".view-lines");
    if (viewLines) {
      return viewLines.innerText.replace(/\u00a0/g, " ").replace(/\r\n/g, "\n").trimEnd();
    }

    return "";
  }
}

/**
 * Scan sidebar to detect all file paths
 */
async function detectAllTreeFiles() {
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  for (let pass = 0; pass < 4; pass++) {
    const closedFolders = Array.from(document.querySelectorAll('[role="treeitem"][state="closed"], [role="treeitem"][data-state="closed"]'));
    if (closedFolders.length === 0) break;
    for (const folder of closedFolders) {
      folder.click();
      await sleep(150);
    }
    await sleep(200);
  }

  const allItems = Array.from(document.querySelectorAll('[role="treeitem"]'));
  const paths = allItems
    .filter(el => {
      const state = el.getAttribute("state") || el.getAttribute("data-state");
      if (state === "open" || state === "closed") return false;
      const txt = el.textContent?.trim() || "";
      return txt.includes(".") || txt === ".gitignore";
    })
    .map(el => el.textContent?.trim())
    .filter(Boolean);

  return { paths: [...new Set(paths)] };
}

/**
 * Download specified file paths with wait
 */
async function downloadBySpecifiedPathsWithWait(_appId, paths) {
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  const files = {};

  for (let pass = 0; pass < 4; pass++) {
    const closed = Array.from(document.querySelectorAll('[role="treeitem"][state="closed"], [role="treeitem"][data-state="closed"]'));
    if (closed.length === 0) break;
    for (const f of closed) { f.click(); await sleep(120); }
  }

  const allItems = Array.from(document.querySelectorAll('[role="treeitem"]'));

  for (const path of paths) {
    const fileName = path.split("/").pop();
    const item = allItems.find(el => el.textContent?.trim() === fileName || el.textContent?.trim() === path);
    if (item) {
      item.click();
      for (let attempt = 0; attempt < 15; attempt++) {
        await sleep(200);
        const editor = document.querySelector(".monaco-editor.focused") || document.querySelector(".monaco-editor");
        const viewLines = editor?.querySelector(".view-lines");
        if (viewLines && viewLines.innerText.trim().length > 0) {
          await sleep(250);
          files[path] = viewLines.innerText.replace(/\u00a0/g, " ").replace(/\r\n/g, "\n").trimEnd();
          break;
        }
      }
    }
  }

  return { ok: true, files };
}

async function saveZip(files, filename) {
  const zip = createZip(files);
  const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" }));
  await chrome.downloads.download({
    url,
    filename,
    saveAs: true
  });
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function createZip(files) {
  const encoder = new TextEncoder();
  const entries = Object.entries(files).map(([name, content]) => ({
    name: sanitizeZipPath(name),
    data: encoder.encode(String(content ?? ""))
  })).filter((entry) => entry.name);

  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const now = new Date();
  const dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((now.getSeconds() / 2) & 31);
  const dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const localHeader = concatBytes(
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
      u32(crc), u32(entry.data.length), u32(entry.data.length), u16(nameBytes.length), u16(0), nameBytes
    );
    localParts.push(localHeader, entry.data);
    const centralHeader = concatBytes(
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(dosTime), u16(dosDate),
      u32(crc), u32(entry.data.length), u32(entry.data.length), u16(nameBytes.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), nameBytes
    );
    centralParts.push(centralHeader);
    offset += localHeader.length + entry.data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = concatBytes(
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralSize), u32(offset), u16(0)
  );
  return concatBytes(...localParts, ...centralParts, end);
}

function sanitizeZipPath(path) {
  return String(path).replace(/\\/g, "/").replace(/^\/+/, "").split("/").filter((part) => part && part !== "." && part !== "..").join("/");
}

function concatBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u16(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function u32(value) {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
