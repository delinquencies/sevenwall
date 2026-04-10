/**
 * URL to Evennia's bundled webclient.css (color-*, .out, .err, etc.).
 * In dev, Vite proxies `/evennia-portal` → portal HTTP.
 */
export function getEvenniaWebclientCssUrl(): string {
  const origin = import.meta.env.VITE_EVENNIA_PORTAL_ORIGIN?.trim();
  if (origin) {
    return `${origin.replace(/\/$/, '')}/static/webclient/css/webclient.css`;
  }
  if (import.meta.env.DEV) {
    return '/evennia-portal/static/webclient/css/webclient.css';
  }
  return 'http://127.0.0.1:4001/static/webclient/css/webclient.css';
}
