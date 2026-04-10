import { useEffect, useRef } from 'react';
import { getEvenniaWebclientCssUrl } from './portalCss';

type Props = {
  /** Evennia `parse_html` output (HTML string). */
  html: string;
  className?: string;
};

/**
 * Renders Evennia HTML inside a shadow root and loads stock `webclient.css`
 * so `.out`, `.color-*`, etc. apply without polluting the rest of the page.
 */
export function EvenniaHtmlBlock({ html, className = '' }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!host.shadowRoot) {
      const shadow = host.attachShadow({ mode: 'open' });
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = getEvenniaWebclientCssUrl();
      shadow.appendChild(link);

      const root = document.createElement('div');
      root.className = 'evennia-html';
      shadow.appendChild(root);
    }

    const root = host.shadowRoot?.querySelector('.evennia-html');
    if (root) {
      root.innerHTML = html;
    }
  }, [html]);

  return <div ref={hostRef} className={className} />;
}

type LinesProps = {
  /** Each entry is one server message (already HTML). */
  lines: string[];
  className?: string;
};

export function EvenniaHtmlLines({ lines, className = '' }: LinesProps) {
  const combined = lines.join('');
  return <EvenniaHtmlBlock html={combined} className={className} />;
}
