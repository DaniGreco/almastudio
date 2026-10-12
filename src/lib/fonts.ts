/** The terminal font setting, and which installed fonts can serve it. */

import { fontFamilies } from './ipc'

/** Used when the setting is empty, and behind a chosen font for any glyph it lacks. */
export const DEFAULT_TERMINAL_FONT =
  "'SFMono-Regular', 'JetBrains Mono', Menlo, Consolas, monospace"

/** The CSS font stack xterm is given for a setting. */
export function terminalFontStack(setting: string): string {
  const s = setting.trim()
  return s ? `${s}, ${DEFAULT_TERMINAL_FONT}` : DEFAULT_TERMINAL_FONT
}

/** A family name as a quoted CSS font-family value. */
export function quoteFamily(family: string): string {
  return `"${family.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * The single family a setting names, or null when it is empty or a list.
 * Settings written before the picker were free text, e.g. `'Fira Code'`.
 */
export function settingFamily(setting: string): string | null {
  const s = setting.trim()
  if (!s) return null
  const quoted = /^(["'])(.*)\1$/.exec(s)
  if (quoted) return quoted[2].replace(/\\(.)/g, '$1')
  return s.includes(',') ? null : s
}

const PROBES = ['iiiiiiiiii', 'WWWWWWWWWW', 'mmmmmmmmmm', '1111111111', '..........']
const SIZE = 40

/**
 * Whether the webview renders `family` with every cell the same width.
 *
 * Two checks in one: a family the webview can't use falls back to the
 * generic one behind it, so measuring the same text against two different
 * generics tells whether the family is really drawn; and comparing narrow
 * and wide glyphs tells whether it is fixed-pitch.
 */
export function isUsableMonospace(ctx: CanvasRenderingContext2D, family: string): boolean {
  const width = (font: string, text: string) => {
    ctx.font = `${SIZE}px ${font}`
    return ctx.measureText(text).width
  }
  const q = quoteFamily(family)
  const drawn = ['serif', 'sans-serif'].some(
    (generic) => width(`${q}, ${generic}`, PROBES[0]) !== width(generic, PROBES[0]),
  )
  if (!drawn) return false
  const widths = PROBES.map((text) => width(`${q}, serif`, text))
  return widths.every((w) => Math.abs(w - widths[0]) < 0.5)
}

let cached: Promise<string[]> | null = null

/** The installed fonts suitable for a terminal, sorted; looked up once per session. */
export function installedMonospaceFonts(): Promise<string[]> {
  cached ??= fontFamilies()
    .then((families) => {
      const ctx = document.createElement('canvas').getContext('2d')
      if (!ctx) return []
      return families
        .filter((family) => isUsableMonospace(ctx, family))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    })
    .catch(() => {
      cached = null
      return []
    })
  return cached
}
