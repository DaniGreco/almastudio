// Find-in-page for rendered content, such as the Markdown preview.

/**
 * Every case-insensitive match of `term` in the text under `root`. The text is
 * read as one string, so a match may run across inline formatting, as in
 * "plain **bold**".
 */
export function findRanges(root: Node, term: string): Range[] {
  const needle = term.toLowerCase()
  if (!needle) return []
  const nodes: Text[] = []
  const starts: number[] = []
  let text = ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push(n as Text)
    starts.push(text.length)
    text += (n as Text).data
  }
  const haystack = text.toLowerCase()
  const ranges: Range[] = []
  // The node holding character `at`, searched from `from` onwards.
  const locate = (at: number, from: number) => {
    let i = from
    while (i + 1 < nodes.length && starts[i + 1] <= at) i++
    return i
  }
  let node = 0
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + needle.length)) {
    node = locate(at, node)
    const end = locate(at + needle.length - 1, node)
    const range = document.createRange()
    range.setStart(nodes[node], at - starts[node])
    range.setEnd(nodes[end], at + needle.length - starts[end])
    ranges.push(range)
  }
  return ranges
}
