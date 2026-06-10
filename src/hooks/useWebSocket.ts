import { useCallback, useEffect, useRef, useState } from "react";

export interface WsCandle {
  type: "candle";
  symbol: string;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
  is_final: boolean;
}

export interface WsSignal {
  type: "signal";
  strategy: string;
  symbol: string;
  timeframe: string;
  signal: string;
  price: number;
  confidence: number;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  metadata: Record<string, unknown>;
  timestamp: string;
  trade?: Record<string, unknown>;
}

export type WsMessage = WsCandle | WsSignal;

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${location.host}/ws`);
    ws.onopen = () => setConnected(true);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "candle" || data.type === "signal") {
          setLastMessage(data as WsMessage);
        }
      } catch { /* ignore */ }
    };
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { connected, lastMessage };
}
