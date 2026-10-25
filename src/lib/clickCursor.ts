/**
 * Click to move the cursor in Claude Code's prompt.
 *
 * Codex and OpenCode turn mouse reporting on and place the cursor themselves;
 * Claude Code leaves the mouse to the terminal, so a click there only starts
 * a selection. It does keep the terminal's own cursor on its caret, though,
 * so a click can be turned into the arrow keys that take the caret there.
 * Its prompt is drawn between two rules of `─`, each line of it indented two
 * columns past a `❯ `. Up and Down keep the column (clamped to the line),
 * Left and Right run through the text, across line ends; Up on the first
 * line recalls history instead, so it is never sent from there.
 */

/** A terminal cell, as far as finding the caret's way matters. */
export interface Cell {
  chars: string
  /** 0 for the second half of a wide character. */
  width: number
  /** Placeholders and suggestions are dim; they are not text to move into. */
  dim: boolean
}

/** The cells of the buffer row `y`, or undefined past the buffer. */
export type RowReader = (y: number) => Cell[] | undefined

export interface Point {
  x: number
  y: number
}

/** Where the text of a prompt line starts, past `❯ ` or its indent. */
export const PROMPT_INDENT = 2
/** How far from the caret the rules around the prompt are looked for. */
const MAX_PROMPT_ROWS = 200

const isRule = (row: Cell[] | undefined) => row?.[0]?.chars === '─'
const isBlank = (c: Cell | undefined) => !c || c.chars === '' || c.chars === ' ' || c.chars === ' '

/**
 * The rows of the prompt the caret is in, `first` to `last`; null when the
 * caret is not in one — a dialog, a menu, a program other than Claude Code.
 */
export function promptRows(read: RowReader, cursorY: number): { first: number; last: number } | null {
  let top = -1
  for (let y = cursorY; y >= Math.max(0, cursorY - MAX_PROMPT_ROWS); y--) {
    const row = read(y)
    if (!row) return null
    if (isRule(row)) {
      top = y
      break
    }
  }
  let bottom = -1
  for (let y = cursorY; y <= cursorY + MAX_PROMPT_ROWS; y++) {
    const row = read(y)
    if (!row) return null
    if (isRule(row)) {
      bottom = y
      break
    }
  }
  if (top < 0 || bottom < 0 || bottom - top < 2) return null
  // The first line opens with the prompt sign and a space.
  const head = read(top + 1)
  if (!head || isBlank(head[0]) || !isBlank(head[1])) return null
  return { first: top + 1, last: bottom - 1 }
}

/** The column just past the last character typed on a row. */
export function textEnd(row: Cell[]): number {
  for (let x = row.length - 1; x >= PROMPT_INDENT; x--) {
    const c = row[x]
    if (c.width === 0 || isBlank(c) || c.dim) continue
    return x + c.width
  }
  return PROMPT_INDENT
}

/** Arrow keys, in the encoding the program asked for (DECCKM). */
export function arrow(dir: 'up' | 'down' | 'left' | 'right', appCursor: boolean): string {
  const key = { up: 'A', down: 'B', right: 'C', left: 'D' }[dir]
  return (appCursor ? '\x1bO' : '\x1b[') + key
}

/**
 * The keys for the next step from the caret towards `target`, or '' when
 * there is nothing (more) to do. Rows are taken one Up or Down at a time, the
 * caret's landing checked before the next, since a line that wraps may not
 * count as the rows it takes; the column then in one go.
 */
export function nextStep(
  read: RowReader,
  cursor: Point,
  target: Point,
  appCursor: boolean,
): string {
  const rows = promptRows(read, cursor.y)
  if (!rows || target.y < rows.first || target.y > rows.last) return ''
  if (target.y < cursor.y) return cursor.y > rows.first ? arrow('up', appCursor) : ''
  if (target.y > cursor.y) return arrow('down', appCursor)
  const row = read(cursor.y)
  if (!row) return ''
  const to = Math.max(PROMPT_INDENT, Math.min(target.x, textEnd(row)))
  // One key per character, not per cell: a wide one takes two.
  let chars = 0
  for (let x = Math.min(cursor.x, to); x < Math.max(cursor.x, to); x++) {
    if ((row[x]?.width ?? 1) > 0) chars++
  }
  return arrow(to < cursor.x ? 'left' : 'right', appCursor).repeat(chars)
}
