// The parts of the kitty graphics protocol a terminal needs to show images
// placed with Unicode placeholders, the way Claude Code draws them:
// https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders
//
// A program sends the image in an APC sequence (`ESC _ G <keys> ; <payload>
// ESC \`) and then prints, for every cell the image covers, the placeholder
// character U+10EEEE coloured with the image's id and followed by two
// diacritics that give the cell's row and column in the image. xterm.js keeps
// those cells like any other text, so they scroll, reflow and clear with it;
// all that is left is to draw the image over them.

/** The character a program prints in each cell an image covers. */
export const PLACEHOLDER = 0x10eeee

/**
 * The diacritics that number rows and columns, in order: the n-th one means
 * row or column n. From kitty's gen/rowcolumn-diacritics.txt.
 */
const DIACRITICS = [
  0x0305, 0x030D, 0x030E, 0x0310, 0x0312, 0x033D, 0x033E, 0x033F, 0x0346, 0x034A, 0x034B, 0x034C,
  0x0350, 0x0351, 0x0352, 0x0357, 0x035B, 0x0363, 0x0364, 0x0365, 0x0366, 0x0367, 0x0368, 0x0369,
  0x036A, 0x036B, 0x036C, 0x036D, 0x036E, 0x036F, 0x0483, 0x0484, 0x0485, 0x0486, 0x0487, 0x0592,
  0x0593, 0x0594, 0x0595, 0x0597, 0x0598, 0x0599, 0x059C, 0x059D, 0x059E, 0x059F, 0x05A0, 0x05A1,
  0x05A8, 0x05A9, 0x05AB, 0x05AC, 0x05AF, 0x05C4, 0x0610, 0x0611, 0x0612, 0x0613, 0x0614, 0x0615,
  0x0616, 0x0617, 0x0657, 0x0658, 0x0659, 0x065A, 0x065B, 0x065D, 0x065E, 0x06D6, 0x06D7, 0x06D8,
  0x06D9, 0x06DA, 0x06DB, 0x06DC, 0x06DF, 0x06E0, 0x06E1, 0x06E2, 0x06E4, 0x06E7, 0x06E8, 0x06EB,
  0x06EC, 0x0730, 0x0732, 0x0733, 0x0735, 0x0736, 0x073A, 0x073D, 0x073F, 0x0740, 0x0741, 0x0743,
  0x0745, 0x0747, 0x0749, 0x074A, 0x07EB, 0x07EC, 0x07ED, 0x07EE, 0x07EF, 0x07F0, 0x07F1, 0x07F3,
  0x0816, 0x0817, 0x0818, 0x0819, 0x081B, 0x081C, 0x081D, 0x081E, 0x081F, 0x0820, 0x0821, 0x0822,
  0x0823, 0x0825, 0x0826, 0x0827, 0x0829, 0x082A, 0x082B, 0x082C, 0x082D, 0x0951, 0x0953, 0x0954,
  0x0F82, 0x0F83, 0x0F86, 0x0F87, 0x135D, 0x135E, 0x135F, 0x17DD, 0x193A, 0x1A17, 0x1A75, 0x1A76,
  0x1A77, 0x1A78, 0x1A79, 0x1A7A, 0x1A7B, 0x1A7C, 0x1B6B, 0x1B6D, 0x1B6E, 0x1B6F, 0x1B70, 0x1B71,
  0x1B72, 0x1B73, 0x1CD0, 0x1CD1, 0x1CD2, 0x1CDA, 0x1CDB, 0x1CE0, 0x1DC0, 0x1DC1, 0x1DC3, 0x1DC4,
  0x1DC5, 0x1DC6, 0x1DC7, 0x1DC8, 0x1DC9, 0x1DCB, 0x1DCC, 0x1DD1, 0x1DD2, 0x1DD3, 0x1DD4, 0x1DD5,
  0x1DD6, 0x1DD7, 0x1DD8, 0x1DD9, 0x1DDA, 0x1DDB, 0x1DDC, 0x1DDD, 0x1DDE, 0x1DDF, 0x1DE0, 0x1DE1,
  0x1DE2, 0x1DE3, 0x1DE4, 0x1DE5, 0x1DE6, 0x1DFE, 0x20D0, 0x20D1, 0x20D4, 0x20D5, 0x20D6, 0x20D7,
  0x20DB, 0x20DC, 0x20E1, 0x20E7, 0x20E9, 0x20F0, 0x2CEF, 0x2CF0, 0x2CF1, 0x2DE0, 0x2DE1, 0x2DE2,
  0x2DE3, 0x2DE4, 0x2DE5, 0x2DE6, 0x2DE7, 0x2DE8, 0x2DE9, 0x2DEA, 0x2DEB, 0x2DEC, 0x2DED, 0x2DEE,
  0x2DEF, 0x2DF0, 0x2DF1, 0x2DF2, 0x2DF3, 0x2DF4, 0x2DF5, 0x2DF6, 0x2DF7, 0x2DF8, 0x2DF9, 0x2DFA,
  0x2DFB, 0x2DFC, 0x2DFD, 0x2DFE, 0x2DFF, 0xA66F, 0xA67C, 0xA67D, 0xA6F0, 0xA6F1, 0xA8E0, 0xA8E1,
  0xA8E2, 0xA8E3, 0xA8E4, 0xA8E5, 0xA8E6, 0xA8E7, 0xA8E8, 0xA8E9, 0xA8EA, 0xA8EB, 0xA8EC, 0xA8ED,
  0xA8EE, 0xA8EF, 0xA8F0, 0xA8F1, 0xAAB0, 0xAAB2, 0xAAB3, 0xAAB7, 0xAAB8, 0xAABE, 0xAABF, 0xAAC1,
  0xFE20, 0xFE21, 0xFE22, 0xFE23, 0xFE24, 0xFE25, 0xFE26, 0x10A0F, 0x10A38, 0x1D185, 0x1D186, 0x1D187,
  0x1D188, 0x1D189, 0x1D1AA, 0x1D1AB, 0x1D1AC, 0x1D1AD, 0x1D242, 0x1D243, 0x1D244,
]
const DIACRITIC_INDEX = new Map(DIACRITICS.map((cp, i) => [cp, i]))

/** The diacritic that numbers row or column `n`, for tests and tools. */
export const diacritic = (n: number) => String.fromCodePoint(DIACRITICS[n])

/**
 * Where a cell sits in its image, from the cell's text: the placeholder and
 * up to three diacritics (row, column, and the id's top byte). A missing row
 * or column is null, to be taken from the cell before it. Not a placeholder
 * cell at all: undefined.
 */
export function readPlaceholder(
  chars: string,
): { row: number | null; col: number | null; idHigh: number } | undefined {
  if (chars.codePointAt(0) !== PLACEHOLDER) return undefined
  const marks: number[] = []
  // The placeholder is two UTF-16 units; the diacritics follow it.
  for (let i = 2; i < chars.length && marks.length < 3; ) {
    const cp = chars.codePointAt(i)!
    const n = DIACRITIC_INDEX.get(cp)
    if (n === undefined) break
    marks.push(n)
    i += cp > 0xffff ? 2 : 1
  }
  return { row: marks[0] ?? null, col: marks[1] ?? null, idHigh: marks[2] ?? 0 }
}

// ------------------------------------------------------------ the stream ---

const ESC = 0x1b
const APC = 0x5f // _
const G = 0x47
const BACKSLASH = 0x5c

/** The longest graphics command kept: anything longer is dropped unread. */
const MAX_COMMAND = 64 * 1024 * 1024

// U+10EEEE in UTF-8.
const PLACEHOLDER_UTF8 = [0xf4, 0x8e, 0xbb, 0xae]
const CONCEAL = [0x1b, 0x5b, 0x38, 0x6d] // ESC [ 8 m
const REVEAL = [0x1b, 0x5b, 0x32, 0x38, 0x6d] // ESC [ 2 8 m

/**
 * Marks the placeholders in the output as concealed text (SGR 8), so xterm
 * keeps them in its buffer but draws no glyph for them: fonts have none, and
 * the box drawn instead spills into the cells beside the image. The text is
 * revealed again at the next ASCII byte — a row of placeholders ends with an
 * escape sequence or a line break — and not right after each one: the
 * diacritics that follow join a cell only when nothing comes in between.
 */
export class PlaceholderConcealer {
  private held: number[] = []
  private concealed = false

  push(chunk: Uint8Array): Uint8Array {
    let bytes = chunk
    if (this.held.length) {
      bytes = new Uint8Array(this.held.length + chunk.length)
      bytes.set(this.held)
      bytes.set(chunk, this.held.length)
      this.held = []
    }
    if (!this.concealed && bytes.indexOf(0xf4) === -1) return bytes
    const out: number[] = []
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i]
      if (b < 0x80) {
        if (this.concealed) {
          out.push(...REVEAL)
          this.concealed = false
        }
      } else if (b === 0xf4 && !this.concealed) {
        // A placeholder cut off at the end: the next chunk decides.
        if (i + 4 > bytes.length) {
          const rest = bytes.subarray(i)
          if (rest.every((x, k) => x === PLACEHOLDER_UTF8[k])) {
            this.held = Array.from(rest)
            break
          }
        } else if (
          bytes[i + 1] === PLACEHOLDER_UTF8[1] && bytes[i + 2] === PLACEHOLDER_UTF8[2] &&
          bytes[i + 3] === PLACEHOLDER_UTF8[3]
        ) {
          out.push(...CONCEAL)
          this.concealed = true
        }
      }
      out.push(b)
    }
    return Uint8Array.from(out)
  }

  reset() {
    this.held = []
    this.concealed = false
  }
}

/**
 * Takes graphics commands out of a program's output as it streams in, so
 * xterm.js — which reads APC sequences only to throw them away — gets the
 * rest. Commands may be split anywhere across chunks.
 */
export class GraphicsFilter {
  // 0: text; 1: after ESC; 2: after ESC _; 3: in a command; 4: ESC in one
  private state = 0
  private parts: string[] = []
  private size = 0

  /** The output with graphics commands removed, and the commands found. */
  push(chunk: Uint8Array): { text: Uint8Array; commands: string[] } {
    const commands: string[] = []
    if (this.state === 0 && chunk.indexOf(ESC) === -1) return { text: chunk, commands }
    let bytes = chunk
    // An ESC or ESC _ that ended the last chunk was held back until this one
    // said whether it starts a command; it is scanned again from here.
    if (this.state === 1 || this.state === 2) {
      const held = this.state === 1 ? [ESC] : [ESC, APC]
      bytes = new Uint8Array(held.length + chunk.length)
      bytes.set(held)
      bytes.set(chunk, held.length)
      this.state = 0
    }
    const out: Uint8Array[] = []
    let from = 0 // start of the text not yet copied out
    let esc = 0 // where the ESC that may start a command is
    let body = 0 // start of the command's bytes in this chunk
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i]
      switch (this.state) {
        case 0:
          if (b === ESC) {
            esc = i
            this.state = 1
          }
          break
        case 1:
          this.state = b === APC ? 2 : b === ESC ? 1 : 0
          if (b === ESC) esc = i
          break
        case 2:
          if (b === G) {
            if (esc > from) out.push(bytes.subarray(from, esc))
            this.state = 3
            this.parts = []
            this.size = 0
            body = i + 1
          } else {
            this.state = b === ESC ? 1 : 0
            if (b === ESC) esc = i
          }
          break
        case 3:
          if (b === ESC) this.state = 4
          break
        case 4:
          if (b === BACKSLASH) {
            // The ESC may have ended the last chunk, which left it out.
            this.take(bytes.subarray(body, Math.max(body, i - 1)))
            if (this.size <= MAX_COMMAND) commands.push(this.parts.join(''))
            this.parts = []
            this.state = 0
            from = i + 1
          } else if (b !== ESC) {
            this.state = 3
          }
          break
      }
    }
    if (this.state === 0) {
      if (from < bytes.length) out.push(bytes.subarray(from))
    } else if (this.state === 1 || this.state === 2) {
      if (esc > from) out.push(bytes.subarray(from, esc))
    } else {
      // The command goes on in the next chunk; an ESC at the very end may be
      // the start of its ST, so it is left out.
      this.take(bytes.subarray(body, this.state === 4 ? bytes.length - 1 : bytes.length))
    }
    return { text: concat(out), commands }
  }

  /** Forgets a command cut off midway, as after a terminal reset. */
  reset() {
    this.state = 0
    this.parts = []
    this.size = 0
  }

  private take(bytes: Uint8Array) {
    if (bytes.length === 0) return
    this.size += bytes.length
    // Too long to be anything sensible: counted, so it is dropped, not kept.
    if (this.size > MAX_COMMAND) {
      this.parts = []
      return
    }
    // Commands are ASCII: keys, then base64.
    this.parts.push(latin1(bytes))
  }
}

function latin1(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return s
}

function concat(parts: Uint8Array[]): Uint8Array {
  if (parts.length === 1) return parts[0]
  if (parts.length === 0) return new Uint8Array(0)
  let n = 0
  for (const p of parts) n += p.length
  const out = new Uint8Array(n)
  let at = 0
  for (const p of parts) {
    out.set(p, at)
    at += p.length
  }
  return out
}

// ----------------------------------------------------------- the command ---

export interface GraphicsCommand {
  /** Keys as sent: `a`, `t`, `f`, `i`, `c`, `r`, `m`, `q`, `U`… */
  keys: Record<string, string>
  payload: string
}

/** Splits `a=T,f=100,i=7;<base64>` into its keys and payload. */
export function parseCommand(raw: string): GraphicsCommand {
  const semi = raw.indexOf(';')
  const head = semi === -1 ? raw : raw.slice(0, semi)
  const payload = semi === -1 ? '' : raw.slice(semi + 1)
  const keys: Record<string, string> = {}
  for (const pair of head.split(',')) {
    const eq = pair.indexOf('=')
    if (eq > 0) keys[pair.slice(0, eq)] = pair.slice(eq + 1)
  }
  return { keys, payload }
}

/** A key as a non-negative integer, or `fallback`. */
export function intKey(keys: Record<string, string>, key: string, fallback = 0): number {
  const v = keys[key]
  if (v === undefined || !/^\d+$/.test(v)) return fallback
  return Number(v)
}

/** The answer to a command, or null when its `q` asks for none. */
export function reply(keys: Record<string, string>, message: string): string | null {
  const id = keys.i
  const number = keys.I
  if (!id && !number) return null
  const quiet = intKey(keys, 'q')
  if (quiet >= 2 || (quiet === 1 && message === 'OK')) return null
  const ids = [id && `i=${id}`, number && `I=${number}`, keys.p && `p=${keys.p}`]
    .filter(Boolean)
    .join(',')
  return `\x1b_G${ids};${message}\x1b\\`
}

// ---------------------------------------------------------- the drawing ---

/**
 * Where an image of `w`×`h` pixels is drawn in a box of `cols`×`rows` cells:
 * scaled to fit, keeping its shape, and centred, as kitty does for
 * placeholders. In CSS pixels from the box's top-left corner.
 */
export function fitInBox(
  w: number, h: number, cols: number, rows: number, cellW: number, cellH: number,
): { x: number; y: number; w: number; h: number } {
  const boxW = cols * cellW
  const boxH = rows * cellH
  const scale = Math.min(boxW / w, boxH / h)
  const dw = w * scale
  const dh = h * scale
  return { x: (boxW - dw) / 2, y: (boxH - dh) / 2, w: dw, h: dh }
}
