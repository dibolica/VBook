export default function chunkByChars(text, maxChars = 3000) {
  const chunks = []
  let i = 0
  while (i < text.length) {
    let end = Math.min(i + maxChars, text.length)
    if (end < text.length) {
      const slice = text.slice(i, end)
      const nl = slice.lastIndexOf('\n')
      const dot = slice.lastIndexOf('. ')
      const brk = Math.max(nl, dot)
      if (brk > 0 && brk > slice.length * 0.3) {
        end = i + brk + 1
      }
    }
    chunks.push(text.slice(i, end).trim())
    i = end
  }
  return chunks.filter(Boolean)
}
