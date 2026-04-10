import { useCallback, useEffect, useRef, useState } from 'react';
import { bootstrapEvenniaSession, getEvenniaWebclientFetchUrl } from './bootstrapSession';
import { getEvenniaWebSocketUrl } from '../config/evennia';

export type ConnectionStatus = 'idle' | 'bootstrapping' | 'connecting' | 'open' | 'error';

function browserTag(): string {
  const a = navigator.userAgent.toLowerCase();
  if (a.includes('edg')) return 'chromium based edge (dev or canary)';
  if (a.includes('chrome') && !a.includes('edg')) return 'chrome';
  if (a.includes('firefox')) return 'firefox';
  if (a.includes('safari')) return 'safari';
  return 'other';
}

function makeCuid(): string {
  const s = () => Math.random().toString(36).slice(2, 10);
  return `${s()}${s()}`;
}

type ServerMessage = [string, unknown[], Record<string, unknown>];

export function useEvenniaWebClient() {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const cmdidRef = useRef(0);
  const everOpenRef = useRef(false);
  const cuidRef = useRef<string | null>(null);
  const connectGenRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(['websocket_close', [], {}]));
      } catch {
        /* ignore */
      }
      ws.close();
    }
  }, []);

  const connect = useCallback(async () => {
    const myGen = ++connectGenRef.current;
    setError(null);
    setStatus('bootstrapping');

    if (!cuidRef.current) {
      cuidRef.current = makeCuid();
    }
    const cuid = cuidRef.current;
    const browser = browserTag();

    try {
      const webclientUrl = getEvenniaWebclientFetchUrl();
      const { csessid } = await bootstrapEvenniaSession(webclientUrl);

      if (myGen !== connectGenRef.current || !mountedRef.current) {
        return;
      }

      setStatus('connecting');
      const baseWs = getEvenniaWebSocketUrl();
      const url = `${baseWs}?${encodeURIComponent(csessid)}&${encodeURIComponent(cuid)}&${encodeURIComponent(browser)}`;

      disconnect();
      everOpenRef.current = false;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        everOpenRef.current = true;
        if (mountedRef.current) {
          setStatus('open');
        }
      };

      ws.onmessage = (ev: MessageEvent) => {
        if (wsRef.current !== ws) return;

        const raw = ev.data;
        if (typeof raw !== 'string') return;

        let data: ServerMessage;
        try {
          data = JSON.parse(raw) as ServerMessage;
        } catch {
          return;
        }

        const [cmd, args] = data;
        if (!Array.isArray(args)) return;

        switch (cmd) {
          case 'text': {
            const chunk = args[0];
            if (typeof chunk === 'string') {
              const t = chunk.trimEnd();
              if (t) {
                setLines((prev) => [...prev, t]);
              }
            }
            break;
          }
          case 'prompt': {
            const p = args[0];
            if (typeof p === 'string') {
              setPrompt(p);
            }
            break;
          }
          default:
            if (import.meta.env.DEV && cmd !== 'ajax_keepalive') {
              console.debug('[evennia]', cmd, args, data[2]);
            }
        }
      };

      ws.onerror = () => {
        if (wsRef.current !== ws) return;
        if (!everOpenRef.current && mountedRef.current) {
          setError('WebSocket failed (is Evennia portal running and WEBSOCKET_CLIENT_PORT open?)');
          setStatus('error');
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
        if (mountedRef.current) {
          setStatus((s) => (s === 'open' ? 'idle' : s));
        }
      };
    } catch (e) {
      if (myGen !== connectGenRef.current || !mountedRef.current) {
        return;
      }
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus('error');
    }
  }, [disconnect]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void connect();
    });
    return () => {
      cancelAnimationFrame(id);
      connectGenRef.current += 1;
      disconnect();
    };
  }, [connect, disconnect]);

  const sendText = useCallback((line: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('Not connected.');
      return;
    }
    const cmdid = cmdidRef.current++;
    const payload: ServerMessage = ['text', [line], { cmdid }];
    ws.send(JSON.stringify(payload));
  }, []);

  return {
    status,
    error,
    lines,
    prompt,
    reconnect: connect,
    sendText,
  };
}
