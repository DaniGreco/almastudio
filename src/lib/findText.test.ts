import { describe, expect, it } from 'vitest'

import { findRanges } from './findText'

function root(html: string) {
  const el = document.createElement('div')
  el.innerHTML = html
  return el
}

describe('findRanges', () => {
  it('finds every match, ignoring case', () => {
    const ranges = findRanges(root('<p>Cache the cache. CACHE!</p>'), 'cache')
    expect(ranges.map((r) => r.toString())).toEqual(['Cache', 'cache', 'CACHE'])
  })

  it('finds a match that runs across inline formatting', () => {
    const ranges = findRanges(root('<p>plain <strong>bold</strong> text</p>'), 'plain bold')
    expect(ranges).toHaveLength(1)
    expect(ranges[0].toString()).toBe('plain bold')
    expect(ranges[0].endContainer.parentElement?.tagName).toBe('STRONG')
  })

  it('does not overlap matches', () => {
    expect(findRanges(root('<p>aaaa</p>'), 'aa')).toHaveLength(2)
  })

  it('finds matches in later blocks', () => {
    const ranges = findRanges(root('<h1>Title</h1><p>one</p><ul><li>two one</li></ul>'), 'one')
    expect(ranges.map((r) => r.startContainer.parentElement?.tagName)).toEqual(['P', 'LI'])
  })

  it('finds nothing for an empty term', () => {
    expect(findRanges(root('<p>text</p>'), '')).toEqual([])
  })
})
