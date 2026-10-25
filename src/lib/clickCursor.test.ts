import { describe, expect, it } from 'vitest'

import { arrow, nextStep, promptRows, textEnd, type Cell, type RowReader } from './clickCursor'

/** A screen from lines of text; `~` marks dim text. Every character is one cell. */
function screen(lines: string[]): RowReader {
  const rows = lines.map((line): Cell[] => {
    let dim = false
    const cells: Cell[] = []
    for (const ch of line) {
      if (ch === '~') {
        dim = !dim
        continue
      }
      cells.push({ chars: ch, width: 1, dim })
    }
    while (cells.length < 40) cells.push({ chars: '', width: 1, dim: false })
    return cells
  })
  return (y) => rows[y]
}

const RULE = '─'.repeat(40)
const prompt = screen([
  'some output',
  RULE,
  '❯ first line',
  '  second',
  '  third line here',
  RULE,
  '  ⏵⏵ auto mode on',
])

const up = arrow('up', false)
const down = arrow('down', false)
const left = arrow('left', false)
const right = arrow('right', false)

describe('promptRows', () => {
  it('finds the lines between the rules around the caret', () => {
    expect(promptRows(prompt, 3)).toEqual({ first: 2, last: 4 })
  })

  it('is null outside a prompt', () => {
    expect(promptRows(screen(['$ ls', 'a b c']), 0)).toBeNull()
    expect(promptRows(screen([RULE, 'Do you want to proceed?', RULE]), 1)).toBeNull()
  })
})

describe('textEnd', () => {
  it('ignores dim placeholder text', () => {
    const read = screen(['❯ ~Try "write a test"~'])
    expect(textEnd(read(0)!)).toBe(2)
  })
})

describe('nextStep', () => {
  it('moves along the line in one go', () => {
    expect(nextStep(prompt, { x: 12, y: 2 }, { x: 4, y: 2 }, false)).toBe(left.repeat(8))
    expect(nextStep(prompt, { x: 2, y: 4 }, { x: 7, y: 4 }, false)).toBe(right.repeat(5))
  })

  it('stops at the end of the text and before the indent', () => {
    expect(nextStep(prompt, { x: 2, y: 3 }, { x: 30, y: 3 }, false)).toBe(right.repeat(6))
    expect(nextStep(prompt, { x: 5, y: 3 }, { x: 0, y: 3 }, false)).toBe(left.repeat(3))
  })

  it('takes rows one at a time', () => {
    expect(nextStep(prompt, { x: 5, y: 4 }, { x: 5, y: 2 }, false)).toBe(up)
    expect(nextStep(prompt, { x: 5, y: 2 }, { x: 5, y: 4 }, false)).toBe(down)
  })

  it('never goes up from the first line, which recalls history', () => {
    expect(nextStep(prompt, { x: 5, y: 2 }, { x: 5, y: 1 }, false)).toBe('')
  })

  it('does nothing for a click outside the prompt', () => {
    expect(nextStep(prompt, { x: 5, y: 3 }, { x: 5, y: 0 }, false)).toBe('')
    expect(nextStep(prompt, { x: 5, y: 3 }, { x: 5, y: 6 }, false)).toBe('')
  })

  it('is done once the caret is there', () => {
    expect(nextStep(prompt, { x: 5, y: 3 }, { x: 5, y: 3 }, false)).toBe('')
  })

  it('counts a wide character once', () => {
    const rows: Cell[][] = [
      [...RULE].map((chars) => ({ chars, width: 1, dim: false })),
      [
        { chars: '❯', width: 1, dim: false },
        { chars: ' ', width: 1, dim: false },
        { chars: '漢', width: 2, dim: false },
        { chars: '', width: 0, dim: false },
        { chars: 'a', width: 1, dim: false },
      ],
      [...RULE].map((chars) => ({ chars, width: 1, dim: false })),
    ]
    expect(nextStep((y) => rows[y], { x: 5, y: 1 }, { x: 2, y: 1 }, false)).toBe(left.repeat(2))
  })

  it('sends application cursor keys when asked for them', () => {
    expect(nextStep(prompt, { x: 3, y: 3 }, { x: 2, y: 3 }, true)).toBe('\x1bOD')
  })
})
