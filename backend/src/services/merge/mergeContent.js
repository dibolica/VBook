import clean from './cleanText.js'

function dedupeParagraphs(text) {
  const paras = text.split('\n').map(p => p.trim()).filter(Boolean)
  const out = []
  for (const p of paras) {
    const norm = p.toLowerCase()
    if (!out.some(o => o.toLowerCase().includes(norm) || norm.includes(o.toLowerCase()))) {
      out.push(p)
    }
  }
  return out.join('\n\n')
}

export default function mergeContent(google = {}, gutenberg = {}, wiki = {}) {
  if (gutenberg && gutenberg.found && gutenberg.text) {
    const extras = [google.snippet, wiki.extract].filter(Boolean).join('\n\n')
    const raw = gutenberg.text + '\n\n' + extras
    return dedupeParagraphs(clean(raw))
  }
  const parts = []
  if (google && google.found && google.snippet) parts.push(google.snippet)
  if (wiki && wiki.found && wiki.extract) parts.push(wiki.extract)
  return dedupeParagraphs(clean(parts.join('\n\n')))
}
