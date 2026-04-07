const CS_RE = /var\s+csessid\s*=\s*(?:"([^"]*)"|false)\s*;/;

export type EvenniaSessionBootstrap = {
  csessid: string;
};

/**
 * Load `/webclient/` through the Vite dev proxy so the browser gets Django's sessionid cookie.
 * Parses `csessid` from the inline script (same as stock webclient).
 */
export async function bootstrapEvenniaSession(webclientUrl: string): Promise<EvenniaSessionBootstrap> {
  const res = await fetch(webclientUrl, {
    credentials: 'include',
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Evennia webclient HTTP ${res.status}: ${webclientUrl}`);
  }

  const html = await res.text();
  const m = html.match(CS_RE);
  if (!m) {
    throw new Error('Could not find csessid in Evennia webclient page (is WEBCLIENT_ENABLED?)');
  }
  if (!m[1]) {
    throw new Error(
      'Evennia returned no browser session (csessid is false). Open the portal URL in this browser once or check cookies.'
    );
  }

  return { csessid: m[1] };
}

export function getEvenniaWebclientFetchUrl(): string {
  const origin = import.meta.env.VITE_EVENNIA_PORTAL_ORIGIN?.trim();
  if (origin) {
    return `${origin.replace(/\/$/, '')}/webclient/`;
  }
  if (import.meta.env.DEV) {
    return '/evennia-portal/webclient/';
  }
  return 'http://127.0.0.1:4001/webclient/';
}
