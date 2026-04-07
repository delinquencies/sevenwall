const ANSI_SGR = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

/** Rough pass: strip common ANSI SGR and Evennia |codes so scrollback stays readable. */
export function plainEvenniaText(raw: string): string {
  return raw
    .replace(ANSI_SGR, '')
    .replace(/\|[^|]/g, '')
    .replace(/\|/g, '');
}
