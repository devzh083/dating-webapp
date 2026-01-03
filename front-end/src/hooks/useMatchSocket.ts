import { useEffect } from "react";

export function useMatchSocket(onEvent: (data: any) => void) {
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/matches/");

    ws.onmessage = event => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    return () => ws.close();
  }, []);
}
