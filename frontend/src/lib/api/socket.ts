import { getAccessToken } from "./client";

type EventHandler = (data: any) => void;

class OlympidoSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private isConnected = false;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private joinedRooms: Set<string> = new Set();
  private url: string;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
    // Convert http/https to ws/wss
    this.url = baseUrl.replace(/^http/, "ws");
  }

  public connect(): void {
    if (typeof window === "undefined" || this.ws) return;

    try {
      const endpoint = `${this.url}/socket.io/?EIO=4&transport=websocket`;
      this.ws = new WebSocket(endpoint);

      this.ws.onopen = () => {
        // Socket opened, waiting for Engine.IO handshake packet '0'
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        // Silently capture websocket error to prevent unhandled rejections
        console.debug("[WS Note] Socket connection idle or offline:", err);
      };
    } catch (err) {
      console.debug("[WS Note] Socket initialization suppressed:", err);
    }
  }

  private handleMessage(data: string): void {
    if (typeof data !== "string") return;

    // Engine.IO open packet: 0{"sid":"..."}
    if (data.startsWith("0")) {
      const token = getAccessToken();
      const authPayload = token ? JSON.stringify({ token }) : "{}";
      // Connect to Socket.IO namespace /ws with auth token
      this.ws?.send(`40/ws,${authPayload}`);
      return;
    }

    // Engine.IO ping packet: 2 -> respond with 3 (pong)
    if (data === "2") {
      this.ws?.send("3");
      return;
    }

    // Socket.IO connected acknowledgment: 40/ws,
    if (data.startsWith("40/ws")) {
      this.isConnected = true;
      // Re-join any previously tracked contest rooms
      this.joinedRooms.forEach((cId) => {
        this.emit("contest:join", { contestId: cId });
      });
      return;
    }

    // Socket.IO event: 42/ws,[eventName, eventData]
    if (data.startsWith("42/ws,")) {
      try {
        const rawJson = data.replace("42/ws,", "");
        const [eventName, eventPayload] = JSON.parse(rawJson);
        this.dispatch(eventName, eventPayload);
      } catch (err) {
        console.debug("[WS Parse Error]:", err);
      }
    }
  }

  public emit(event: string, payload: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const packet = `42/ws,${JSON.stringify([event, payload])}`;
    try {
      this.ws.send(packet);
    } catch (err) {
      console.debug("[WS Emit Error]:", err);
    }
  }

  public on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);

    // Auto connect on first listener subscription if in browser
    if (!this.ws && typeof window !== "undefined") {
      this.connect();
    }

    return () => {
      this.off(event, handler);
    };
  }

  public off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  private dispatch(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (e) {
          console.error(`[WS Handler Error on ${event}]:`, e);
        }
      });
    }
  }

  public joinContest(contestId: string): void {
    this.joinedRooms.add(contestId);
    if (this.isConnected) {
      this.emit("contest:join", { contestId });
    } else {
      this.connect();
    }
  }

  public leaveContest(contestId: string): void {
    this.joinedRooms.delete(contestId);
    if (this.isConnected) {
      this.emit("contest:leave", { contestId });
    }
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.ws = null;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.joinedRooms.size > 0 || this.listeners.size > 0) {
        this.connect();
      }
    }, 5000);
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.cleanup();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const olympidoSocket = new OlympidoSocketClient();
