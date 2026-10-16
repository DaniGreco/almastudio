// Images in a terminal, drawn with the kitty graphics protocol's Unicode
// placeholders (see kittyGraphics.ts). The program's output passes through
// `write`, which keeps the graphics commands and hands xterm.js the rest; the
// images are drawn on a canvas over xterm's own, in the cells holding their
// placeholders.

import type { IDisposable, Terminal } from '@xterm/xterm'
import {
  GraphicsFilter, PLACEHOLDER, PlaceholderConcealer, fitInBox, intKey, parseCommand, readPlaceholder, reply,
} from './kittyGraphics'
import { readTerminalImage } from './ipc'

interface StoredImage {
  bitmap: ImageBitmap
  /** The cells its placeholders span, from its placement. */
  cols: number
  rows: number
}

/** Decoded pixels kept per terminal before the oldest images are dropped. */
const STORAGE_LIMIT = 320 * 1024 * 1024
const PLACEHOLDER_TEXT = String.fromCodePoint(PLACEHOLDER)

class GraphicsError extends Error {}

/** Cells side by side showing one row of an image. */
interface Run {
  /** The first cell's column on screen. */
  x: number
  id: number
  /** The row and first column in the image. */
  row: number
  col: number
  len: number
}

export class TerminalImages {
  private filter = new GraphicsFilter()
  private concealer = new PlaceholderConcealer()
  private images = new Map<number, StoredImage>()
  /** A transmission sent in chunks (`m=1`), until its last one. */
  private chunked: { keys: Record<string, string>; data: string[] } | null = null
  /** Orders uploads and deletions, which finish out of order. */
  private seq = 0
  private latest = new Map<number, number>()
  private deletedAt = new Map<number, number>()
  private clearedAt = 0
  private canvas: HTMLCanvasElement | null = null
  private frame = 0
  private subs: IDisposable[] = []

  /** `respond` sends answers to the program, as typed input would be. */
  constructor(private term: Terminal, private respond: (data: string) => void) {}

  /** Puts the canvas over the terminal; call once the terminal is open. */
  attach() {
    const screen = this.term.element?.querySelector('.xterm-screen')
    if (!screen) return
    const canvas = document.createElement('canvas')
    canvas.className = 'term__images'
    screen.appendChild(canvas)
    this.canvas = canvas
    const schedule = () => this.schedule()
    this.subs.push(
      this.term.onRender(schedule), this.term.onResize(schedule), this.term.onScroll(schedule),
    )
  }

  /** The program's output with its graphics commands taken out. */
  write(bytes: Uint8Array): Uint8Array {
    const { text, commands } = this.filter.push(bytes)
    for (const c of commands) this.handle(c)
    return this.concealer.push(text)
  }

  /** Forgets every image, as a terminal reset does. */
  reset() {
    this.filter.reset()
    this.concealer.reset()
    this.chunked = null
    this.clearedAt = ++this.seq
    for (const img of this.images.values()) img.bitmap.close()
    this.images.clear()
    this.schedule()
  }

  /** Drops a command the output was cut off in, keeping the images. */
  abandon() {
    this.filter.reset()
    this.concealer.reset()
    this.chunked = null
  }

  /** The terminal's cells in CSS pixels, rounded; 0×0 before it is laid out. */
  screenSize(): { width: number; height: number } {
    if (!this.canvas?.parentElement?.clientWidth) return { width: 0, height: 0 }
    const { width, height } = this.cellSize()
    return {
      width: Math.min(65535, Math.round(width * this.term.cols)),
      height: Math.min(65535, Math.round(height * this.term.rows)),
    }
  }

  dispose() {
    cancelAnimationFrame(this.frame)
    for (const s of this.subs) s.dispose()
    this.subs = []
    for (const img of this.images.values()) img.bitmap.close()
    this.images.clear()
    this.canvas?.remove()
    this.canvas = null
  }

  // ------------------------------------------------------------ commands --

  private handle(raw: string) {
    const { keys, payload } = parseCommand(raw)
    // The chunks after the first carry only `m` (and `q`).
    if (this.chunked) {
      this.chunked.data.push(payload)
      if (keys.m !== '1') {
        const { keys: first, data } = this.chunked
        this.chunked = null
        void this.transmit(first, data.join(''))
      }
      return
    }
    const action = keys.a ?? 't'
    if (action === 'd') return this.remove(keys)
    if (action === 'p') return this.place(keys)
    if (action === 't' || action === 'T' || action === 'q') {
      if (keys.m === '1') {
        this.chunked = { keys, data: [payload] }
        return
      }
      void this.transmit(keys, payload)
      return
    }
    this.answer(keys, 'EINVAL:unsupported action')
  }

  private async transmit(keys: Record<string, string>, payload: string) {
    const action = keys.a ?? 't'
    const id = intKey(keys, 'i')
    const seq = ++this.seq
    if (id && action !== 'q') this.latest.set(id, seq)
    let bitmap: ImageBitmap
    try {
      bitmap = await decode(keys, await this.load(keys, payload))
    } catch (err) {
      const msg = err instanceof GraphicsError ? err.message : `EINVAL:${String(err)}`
      this.answer(keys, msg)
      return
    }
    // A query only asks whether the image would load.
    if (action === 'q' || !id) {
      bitmap.close()
      this.answer(keys, 'OK')
      return
    }
    // Overtaken by a newer upload of the same id, or deleted meanwhile.
    if (
      this.latest.get(id) !== seq || this.clearedAt > seq ||
      (this.deletedAt.get(id) ?? 0) > seq
    ) {
      bitmap.close()
      return
    }
    const old = this.images.get(id)
    if (old) {
      old.bitmap.close()
      this.images.delete(id)
    }
    const image: StoredImage = { bitmap, cols: 0, rows: 0 }
    this.images.set(id, image)
    if (action === 'T' && keys.U === '1') this.setPlacement(image, keys)
    this.evict()
    this.answer(keys, 'OK')
    this.schedule()
  }

  private async load(keys: Record<string, string>, payload: string): Promise<Uint8Array> {
    const medium = keys.t ?? 'd'
    let data: Uint8Array
    if (medium === 'd') {
      data = fromBase64(payload)
    } else if (medium === 'f' || medium === 't') {
      const path = new TextDecoder().decode(fromBase64(payload))
      const b64 = await readTerminalImage(path).catch((e) => {
        throw new GraphicsError(`ENOENT:${String(e)}`)
      })
      data = fromBase64(b64)
    } else {
      throw new GraphicsError('EINVAL:unsupported transmission medium')
    }
    if (keys.o === 'z') data = await inflate(data)
    return data
  }

  /** A placement of an image already sent (`a=p`). */
  private place(keys: Record<string, string>) {
    const image = this.images.get(intKey(keys, 'i'))
    if (!image) return this.answer(keys, 'ENOENT:no such image')
    // Only placements through placeholders; a placement at the cursor would
    // need drawing outside the cells, which nothing here does.
    if (keys.U !== '1') return this.answer(keys, 'EINVAL:only virtual placements are supported')
    this.setPlacement(image, keys)
    this.answer(keys, 'OK')
    this.schedule()
  }

  private setPlacement(image: StoredImage, keys: Record<string, string>) {
    const { width, height } = this.cellSize()
    image.cols = intKey(keys, 'c') || Math.max(1, Math.ceil(image.bitmap.width / width))
    image.rows = intKey(keys, 'r') || Math.max(1, Math.ceil(image.bitmap.height / height))
  }

  private remove(keys: Record<string, string>) {
    const what = keys.d ?? 'a'
    const seq = ++this.seq
    if (what === 'a' || what === 'A') {
      this.clearedAt = seq
      for (const img of this.images.values()) img.bitmap.close()
      this.images.clear()
    } else if (what === 'i' || what === 'I') {
      const id = intKey(keys, 'i')
      this.deletedAt.set(id, seq)
      this.images.get(id)?.bitmap.close()
      this.images.delete(id)
    }
    // Other selectors name placements by position, which placeholders don't
    // have; their cells are cleared like text.
    this.schedule()
  }

  /** Drops the oldest images once their pixels pass the limit. */
  private evict() {
    let total = 0
    for (const img of this.images.values()) total += img.bitmap.width * img.bitmap.height * 4
    for (const [id, img] of this.images) {
      if (total <= STORAGE_LIMIT || this.images.size === 1) break
      total -= img.bitmap.width * img.bitmap.height * 4
      img.bitmap.close()
      this.images.delete(id)
    }
  }

  private answer(keys: Record<string, string>, message: string) {
    const r = reply(keys, message)
    if (r) this.respond(r)
  }

  // ------------------------------------------------------------- drawing --

  private schedule() {
    if (this.frame || !this.canvas) return
    this.frame = requestAnimationFrame(() => {
      this.frame = 0
      this.draw()
    })
  }

  private cellSize(): { width: number; height: number } {
    // xterm's own measure, when it is reachable; otherwise the screen's size
    // shared out among the cells.
    const core = (this.term as unknown as {
      _core?: { _renderService?: { dimensions?: { css?: { cell?: { width: number; height: number } } } } }
    })._core
    const cell = core?._renderService?.dimensions?.css?.cell
    if (cell && cell.width > 0 && cell.height > 0) return cell
    const screen = this.canvas?.parentElement
    return {
      width: (screen?.clientWidth ?? 0) / this.term.cols || 8,
      height: (screen?.clientHeight ?? 0) / this.term.rows || 16,
    }
  }

  private draw() {
    const canvas = this.canvas
    if (!canvas) return
    const term = this.term
    const { width: cw, height: ch } = this.cellSize()
    const dpr = window.devicePixelRatio || 1
    const w = term.cols * cw
    const h = term.rows * ch
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    if (this.images.size === 0) return
    ctx.imageSmoothingQuality = 'high'

    const buffer = term.buffer.active
    const cell = buffer.getNullCell()
    for (let y = 0; y < term.rows; y++) {
      const line = buffer.getLine(buffer.viewportY + y)
      if (!line || !line.translateToString(false).includes(PLACEHOLDER_TEXT)) continue
      // A run of cells showing one image's row, side by side, is drawn in one go.
      let run: Run | null = null
      let prev: { id: number; row: number; col: number } | null = null
      for (let x = 0; x < term.cols; x++) {
        const c = line.getCell(x, cell)
        const p = c ? readPlaceholder(c.getChars()) : undefined
        if (!c || !p) {
          if (run) this.drawRun(ctx, run, y, cw, ch)
          run = null
          prev = null
          continue
        }
        const id: number = ((c.isFgRGB() || c.isFgPalette() ? c.getFgColor() : 0) | (p.idHigh << 24)) >>> 0
        // A cell without its row or column carries on from the one before.
        const before = prev !== null && prev.id === id ? prev : null
        const row: number = p.row ?? before?.row ?? 0
        const col: number = p.col ?? (before && before.row === row ? before.col + 1 : 0)
        prev = { id, row, col }
        if (run && run.id === id && run.row === row && run.col + run.len === col && run.x + run.len === x) {
          run.len++
        } else {
          if (run) this.drawRun(ctx, run, y, cw, ch)
          run = { x, id, row, col, len: 1 }
        }
      }
      if (run) this.drawRun(ctx, run, y, cw, ch)
    }
  }

  private drawRun(
    ctx: CanvasRenderingContext2D,
    run: Run,
    y: number, cw: number, ch: number,
  ) {
    const image = this.images.get(run.id)
    if (!image || !image.cols || !image.rows) return
    const { bitmap } = image
    const dx = run.x * cw
    const dy = y * ch
    const fit = fitInBox(bitmap.width, bitmap.height, image.cols, image.rows, cw, ch)
    // The part of the image's box these cells cover, and of the image in it.
    const bx0 = run.col * cw
    const bx1 = (run.col + run.len) * cw
    const by0 = run.row * ch
    const by1 = by0 + ch
    const ix0 = Math.max(bx0, fit.x)
    const ix1 = Math.min(bx1, fit.x + fit.w)
    const iy0 = Math.max(by0, fit.y)
    const iy1 = Math.min(by1, fit.y + fit.h)
    if (ix1 <= ix0 || iy1 <= iy0) return
    const sx = ((ix0 - fit.x) / fit.w) * bitmap.width
    const sy = ((iy0 - fit.y) / fit.h) * bitmap.height
    const sw = ((ix1 - ix0) / fit.w) * bitmap.width
    const sh = ((iy1 - iy0) / fit.h) * bitmap.height
    ctx.drawImage(bitmap, sx, sy, sw, sh, dx + ix0 - bx0, dy + iy0 - by0, ix1 - ix0, iy1 - iy0)
  }
}

// -------------------------------------------------------------- decoding --

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** The pixels of an image in the format its `f` key names. */
async function decode(keys: Record<string, string>, data: Uint8Array): Promise<ImageBitmap> {
  const format = intKey(keys, 'f', 32)
  if (format === 100) {
    try {
      return await createImageBitmap(new Blob([data as BlobPart], { type: 'image/png' }))
    } catch {
      throw new GraphicsError('EBADPNG:the image could not be decoded')
    }
  }
  if (format !== 32 && format !== 24) throw new GraphicsError('EINVAL:unsupported format')
  const w = intKey(keys, 's')
  const h = intKey(keys, 'v')
  const channels = format === 32 ? 4 : 3
  if (!w || !h || data.length < w * h * channels) {
    throw new GraphicsError('EINVAL:the size does not match the data')
  }
  const rgba = new Uint8ClampedArray(w * h * 4)
  if (channels === 4) {
    rgba.set(data.subarray(0, w * h * 4))
  } else {
    for (let i = 0, j = 0; i < w * h * 3; i += 3, j += 4) {
      rgba[j] = data[i]
      rgba[j + 1] = data[i + 1]
      rgba[j + 2] = data[i + 2]
      rgba[j + 3] = 255
    }
  }
  return createImageBitmap(new ImageData(rgba, w, h))
}
