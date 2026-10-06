/**
 * Olympido Base44 Code Extractor (Console Script)
 *
 * Instructions:
 * 1. Open your Base44 editor tab in Chrome:
 *    https://app.base44.com/apps/6ac530e3c8db0c2db3bf2155/editor/workspace/code
 * 2. Press F12 (or Right-click -> Inspect) to open DevTools, then click the "Console" tab.
 * 3. Paste this entire script into the console and press Enter.
 * 4. Watch the on-screen progress badge. The script will click each file, wait 1.5 - 2 seconds
 *    for Monaco editor to fully load and render the content, extract the code,
 *    and download "olympido-base44.zip"!
 */

(async function extractBase44WithProperWait() {
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Create an on-screen status banner so you can see live progress
  let banner = document.getElementById("b44-extract-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "b44-extract-banner";
    banner.style.position = "fixed";
    banner.style.bottom = "24px";
    banner.style.right = "24px";
    banner.style.zIndex = "999999";
    banner.style.background = "#1e1b4b";
    banner.style.color = "#ffffff";
    banner.style.padding = "16px 22px";
    banner.style.borderRadius = "12px";
    banner.style.fontFamily = "system-ui, -apple-system, sans-serif";
    banner.style.fontSize = "14px";
    banner.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)";
    banner.style.border = "1px solid #6366f1";
    banner.style.maxWidth = "400px";
    banner.style.lineHeight = "1.5";
    document.body.appendChild(banner);
  }

  function updateStatus(title, detail = "") {
    banner.innerHTML = `
      <div style="font-weight: 700; color: #a5b4fc; font-size: 15px; margin-bottom: 4px;">${title}</div>
      <div style="color: #e0e7ff; font-size: 13px;">${detail}</div>
    `;
    console.log(`[Base44 Extractor] ${title} ${detail}`);
  }

  updateStatus("Scanning project...", "Expanding all folders in sidebar...");

  // Step 1: Expand all folders in sidebar
  for (let pass = 0; pass < 6; pass++) {
    const closed = Array.from(document.querySelectorAll('[role="treeitem"][state="closed"], [role="treeitem"][data-state="closed"]'));
    if (closed.length === 0) break;
    for (const f of closed) {
      f.click();
      await sleep(150);
    }
    await sleep(300);
  }

  // Step 2: Find all file items in the tree
  const allTreeItems = Array.from(document.querySelectorAll('[role="treeitem"]'));
  const fileItems = allTreeItems.filter(el => {
    const state = el.getAttribute("state") || el.getAttribute("data-state");
    if (state === "open" || state === "closed") return false;
    const txt = el.textContent?.trim() || "";
    return txt.includes(".") || txt === ".gitignore";
  });

  if (fileItems.length === 0) {
    updateStatus("Error: No files found", "Make sure the 'Code files' sidebar is open and visible.");
    return;
  }

  updateStatus("Ready to extract", `Found ${fileItems.length} files. Starting extraction with load wait...`);
  await sleep(1000);

  const files = {};
  const failed = [];

  // Step 3: Iterate through each file and WAIT for Monaco editor to load
  for (let i = 0; i < fileItems.length; i++) {
    const item = fileItems[i];
    const fileName = item.textContent?.trim();

    updateStatus(`[${i + 1}/${fileItems.length}] Opening file...`, fileName);

    // Click the file item to trigger load
    item.click();

    // Wait for the URL and editor content to load
    let finalPath = "";
    let code = "";

    // Poll for up to 4 seconds for content to load
    for (let attempt = 0; attempt < 20; attempt++) {
      await sleep(200);

      const url = new URL(window.location.href);
      const urlParam = url.searchParams.get("filePath");

      // Check if URL parameter updated to this file
      if (urlParam && decodeURIComponent(urlParam).endsWith(fileName)) {
        finalPath = decodeURIComponent(urlParam).replace(/\\/g, "/").replace(/^\/+/, "");
      }

      // Read code from Monaco editor
      code = getMonacoContent(fileName, finalPath);

      if (code && code.trim().length > 0) {
        // Wait an additional 300ms to allow Monaco to finish full rendering
        await sleep(300);
        code = getMonacoContent(fileName, finalPath);
        break;
      }
    }

    if (!finalPath) {
      const urlParam = new URL(window.location.href).searchParams.get("filePath");
      finalPath = urlParam ? decodeURIComponent(urlParam).replace(/\\/g, "/").replace(/^\/+/, "") : fileName;
    }

    if (code && code.trim().length > 0) {
      files[finalPath] = code;
      updateStatus(`[${i + 1}/${fileItems.length}] ✓ Loaded (${code.length} chars)`, finalPath);
    } else {
      console.warn(`[Base44 Extractor] Warning: Content empty for ${finalPath}`);
      failed.push(finalPath);
    }
  }

  const successCount = Object.keys(files).length;
  updateStatus("Extraction Finished!", `Extracted ${successCount} files. ${failed.length > 0 ? `(${failed.length} failed)` : ""} Building ZIP...`);
  await sleep(800);

  if (successCount > 0) {
    downloadZip(files, "olympido-base44.zip");
    updateStatus("ZIP Downloaded!", `${successCount} files saved. Check your browser Downloads!`);
    setTimeout(() => { banner.remove(); }, 15000);
  } else {
    updateStatus("Extraction Failed", "No file contents could be read from Monaco editor.");
  }

  // Helper: Read code from Monaco model or DOM
  function getMonacoContent(fileName, filePath) {
    // Method 1: Check window.monaco models if available
    try {
      if (window.monaco && window.monaco.editor && window.monaco.editor.getModels) {
        const models = window.monaco.editor.getModels();
        if (models && models.length > 0) {
          // Look for matching model
          const target = filePath || fileName;
          const match = models.find(m => m.uri.toString().endsWith(target) || m.uri.toString().endsWith(fileName));
          if (match && match.getValue().trim().length > 0) {
            return match.getValue();
          }
          // If only 1 active model
          if (models.length === 1 && models[0].getValue().trim().length > 0) {
            return models[0].getValue();
          }
        }
      }
    } catch (e) {}

    // Method 2: Read DOM lines
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

  // Helper: In-memory ZIP builder
  function downloadZip(fileMap, filename) {
    const encoder = new TextEncoder();
    const entries = Object.entries(fileMap).map(([name, content]) => ({
      name: name.replace(/\\/g, "/").replace(/^\/+/, ""),
      data: encoder.encode(String(content ?? ""))
    }));

    const localParts = [];
    const centralParts = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((now.getSeconds() / 2) & 31);
    const dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);

    for (const entry of entries) {
      const nameBytes = encoder.encode(entry.name);
      const crc = getCrc32(entry.data);
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

    const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
    const end = concatBytes(
      u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
      u32(centralSize), u32(offset), u16(0)
    );
    const zipBytes = concatBytes(...localParts, ...centralParts, end);

    const blob = new Blob([zipBytes], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  function concatBytes(...parts) {
    const total = parts.reduce((sum, p) => sum + p.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of parts) { out.set(p, off); off += p.length; }
    return out;
  }
  function u16(n) { return new Uint8Array([n & 255, (n >>> 8) & 255]); }
  function u32(n) { return new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]); }
  function getCrc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
})();
