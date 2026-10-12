import { describe, expect, it } from 'vitest'
import { DEFAULT_TERMINAL_FONT, quoteFamily, settingFamily, terminalFontStack } from './fonts'

describe('settingFamily', () => {
  it('reads a single family, quoted or not', () => {
    expect(settingFamily('"JetBrains Mono"')).toBe('JetBrains Mono')
    expect(settingFamily("'Fira Code'")).toBe('Fira Code')
    expect(settingFamily('Menlo')).toBe('Menlo')
  })

  it('round-trips quoteFamily', () => {
    for (const f of ['Iosevka Term', 'Odd "Name"', 'Back\\slash']) {
      expect(settingFamily(quoteFamily(f))).toBe(f)
    }
  })

  it('has no single family for an empty setting or a list', () => {
    expect(settingFamily('  ')).toBeNull()
    expect(settingFamily("'Fira Code', Menlo")).toBeNull()
  })
})

describe('terminalFontStack', () => {
  it('falls back to the default stack', () => {
    expect(terminalFontStack('')).toBe(DEFAULT_TERMINAL_FONT)
    expect(terminalFontStack('"Menlo"')).toBe(`"Menlo", ${DEFAULT_TERMINAL_FONT}`)
  })
})
