import { describe, expect, it } from 'vitest'
import {
  GraphicsFilter, PlaceholderConcealer, diacritic, fitInBox, parseCommand, readPlaceholder, reply,
} from './kittyGraphics'

const enc = (s: string) => new TextEncoder().encode(s)

/** Feeds `input` to a filter in pieces cut at `cuts`, as a pty might deliver it. */
function run(input: string, cuts: number[] = []) {
  const f = new GraphicsFilter()
  const decoder = new TextDecoder()
  const bytes = enc(input)
  let text = ''
  const commands: string[] = []
  let at = 0
  for (const cut of [...cuts, bytes.length]) {
    const r = f.push(bytes.subarray(at, cut))
    text += decoder.decode(r.text, { stream: true })
    commands.push(...r.commands)
    at = cut
  }
  return { text, commands }
}

describe('GraphicsFilter', () => {
  it('passes plain output through untouched', () => {
    expect(run('hello \x1b[31mred\x1b[0m')).toEqual({ text: 'hello \x1b[31mred\x1b[0m', commands: [] })
  })

  it('takes a graphics command out of the output', () => {
    const input = 'a\x1b_Ga=T,f=100,i=7;QUJD\x1b\\b'
    expect(run(input)).toEqual({ text: 'ab', commands: ['a=T,f=100,i=7;QUJD'] })
  })

  it('leaves other APC sequences to xterm', () => {
    expect(run('\x1b_Xjunk\x1b\\ok').text).toBe('\x1b_Xjunk\x1b\\ok')
  })

  it('finds a command split at every possible point', () => {
    const input = 'x\x1b_Gi=1;AAAA\x1b\\y'
    for (let cut = 1; cut < input.length; cut++) {
      expect(run(input, [cut])).toEqual({ text: 'xy', commands: ['i=1;AAAA'] })
    }
  })

  it('handles a lone ESC at the end of a chunk', () => {
    expect(run('a\x1b', [])).toEqual({ text: 'a', commands: [] })
    expect(run('a\x1b[0mb', [2])).toEqual({ text: 'a\x1b[0mb', commands: [] })
  })

  it('reads several commands in one chunk', () => {
    const input = '\x1b_Ga=t,i=1,m=1;AA\x1b\\\x1b_Gm=0;BB\x1b\\'
    expect(run(input).commands).toEqual(['a=t,i=1,m=1;AA', 'm=0;BB'])
  })

  it('keeps UTF-8 text around commands intact', () => {
    const input = 'è\x1b_Gi=2;A\x1b\\\u{10EEEE}'
    expect(run(input, [1, 9])).toEqual({ text: 'è\u{10EEEE}', commands: ['i=2;A'] })
  })
})

describe('parseCommand', () => {
  it('splits keys and payload', () => {
    expect(parseCommand('a=T,U=1,i=5,c=10,r=3;Zm9v')).toEqual({
      keys: { a: 'T', U: '1', i: '5', c: '10', r: '3' },
      payload: 'Zm9v',
    })
    expect(parseCommand('a=d,d=I,i=4')).toEqual({ keys: { a: 'd', d: 'I', i: '4' }, payload: '' })
  })
})

describe('reply', () => {
  it('answers only commands with an id, as quiet as asked', () => {
    expect(reply({ i: '31' }, 'OK')).toBe('\x1b_Gi=31;OK\x1b\\')
    expect(reply({}, 'OK')).toBeNull()
    expect(reply({ i: '1', q: '1' }, 'OK')).toBeNull()
    expect(reply({ i: '1', q: '1' }, 'ENOENT:x')).toBe('\x1b_Gi=1;ENOENT:x\x1b\\')
    expect(reply({ i: '1', q: '2' }, 'ENOENT:x')).toBeNull()
  })
})

describe('readPlaceholder', () => {
  it('reads the row and column diacritics', () => {
    expect(readPlaceholder('\u{10EEEE}' + diacritic(2) + diacritic(40))).toEqual({
      row: 2, col: 40, idHigh: 0,
    })
    expect(readPlaceholder('\u{10EEEE}')).toEqual({ row: null, col: null, idHigh: 0 })
    expect(readPlaceholder('\u{10EEEE}' + diacritic(0) + diacritic(1) + diacritic(3))).toEqual({
      row: 0, col: 1, idHigh: 3,
    })
  })

  it('ignores other cells', () => {
    expect(readPlaceholder('a')).toBeUndefined()
    expect(readPlaceholder('')).toBeUndefined()
  })
})

describe('fitInBox', () => {
  it('fits and centres, keeping the shape', () => {
    // 200×100 into 10×10 cells of 10×20 px (100×200 px): width-bound.
    expect(fitInBox(200, 100, 10, 10, 10, 20)).toEqual({ x: 0, y: 75, w: 100, h: 50 })
    expect(fitInBox(100, 100, 4, 2, 10, 20)).toEqual({ x: 0, y: 0, w: 40, h: 40 })
  })
})

describe('PlaceholderConcealer', () => {
  const P = '\u{10EEEE}'
  const conceal = (chunks: string[]) => {
    const c = new PlaceholderConcealer()
    const decoder = new TextDecoder()
    const bytes = new TextEncoder().encode(chunks.join(''))
    let out = ''
    let at = 0
    for (const n of chunks.map((s) => new TextEncoder().encode(s).length)) {
      out += decoder.decode(c.push(bytes.subarray(at, at + n)), { stream: true })
      at += n
    }
    return out
  }

  it('conceals a row of placeholders up to the next ASCII byte', () => {
    const row = `\x1b[38;5;5m${P}${diacritic(0)}${diacritic(0)}${P}${diacritic(0)}${diacritic(1)}\x1b[39m\n`
    expect(conceal([row])).toBe(
      `\x1b[38;5;5m\x1b[8m${P}${diacritic(0)}${diacritic(0)}${P}${diacritic(0)}${diacritic(1)}\x1b[28m\x1b[39m\n`,
    )
  })

  it('leaves other text alone', () => {
    expect(conceal(['plain è 🙂 text'])).toBe('plain è 🙂 text')
  })

  it('finds a placeholder split across chunks', () => {
    const enc = new TextEncoder().encode(P)
    const c = new PlaceholderConcealer()
    const a = c.push(enc.subarray(0, 2))
    const b = c.push(Uint8Array.from([...enc.subarray(2), 0x0a]))
    expect(new TextDecoder().decode(Uint8Array.from([...a, ...b]))).toBe(`\x1b[8m${P}\x1b[28m\n`)
  })
})
