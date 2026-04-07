/**
 * WebSocket URL for Evennia's portal webclient (default port WEBSOCKET_CLIENT_PORT = 4002).
 *
 * - In dev, Vite proxies `/evennia-ws` → portal (see vite.config.ts) so the browser stays same-origin.
 * - On another machine, set `VITE_EVENNIA_WS_URL` in `client/.env.local`, e.g. `ws://192.168.1.5:4002`.
 */
export function getEvenniaWebSocketUrl(): string {
  const explicit = import.meta.env.VITE_EVENNIA_WS_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/evennia-ws`;
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.hostname}:4002`;
}
