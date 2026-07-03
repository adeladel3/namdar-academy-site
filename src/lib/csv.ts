/**
 * CSV cell escape with formula-injection protection.
 *
 * Excel/Google Sheets treat a cell starting with `=`, `+`, `-`, `@`, tab or
 * CR as a formula — if user-controlled text lands in an exported CSV, an
 * attacker can plant `=HYPERLINK(...)` / `=cmd|...` that fires when an
 * admin opens the export. Prefixing a single quote neutralises the formula
 * without changing how the cell displays once imported.
 *
 * We also quote when the cell contains CRLF, commas, or double-quotes, and
 * escape embedded quotes by doubling per RFC 4180.
 */
export function csvCell(raw: unknown): string {
  let s = raw == null ? "" : String(raw);
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  const needsQuoting = /[",\r\n]/.test(s);
  if (needsQuoting) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}
