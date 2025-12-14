import openaiSvc from './openai.service.js'
import geminiSvc from './gemini.service.js'
import ollamaSvc from './ollama.service.js'
import { reducePromptSystem } from './prompts.js'
import logger from '../../utils/logger.js'

async function callReduceLLM(combined, maxScenes = 8) {
  const system = reducePromptSystem(maxScenes)
  const messages = [{ role: 'system', content: system }, { role: 'user', content: combined }]
  try {
    const r = await openaiSvc.chat(messages, 1200)
    return r.choices?.[0]?.message?.content || ''
  } catch (e) {
    logger.warn('OpenAI reduce failed, trying Gemini', e.message)
  }
  try {
    const r = await geminiSvc.chat(combined)
    return r?.output || ''
  } catch (e) {
    logger.warn('Gemini reduce failed, trying Ollama', e.message)
  }
  try {
    const r = await ollamaSvc.chat('vicuna', `${system}\n\n${combined}`)
    return r?.output || ''
  } catch (e) {
    logger.error('All reduce LLMs failed', e)
    throw new Error('LLM reduce failures')
  }
}

export default async function reduceSummarize(chunkSummaries = [], maxScenes = 8) {
  const combined = chunkSummaries.map((c, i) => `--- CHUNK ${i} ---\n${c.raw || JSON.stringify(c.parsed || {})}`).join('\n')
  const out = await callReduceLLM(combined, maxScenes)
  try {
    return JSON.parse(out)
  } catch {
    // attempt to force model to reformat
    const reformatSystem = 'Output valid JSON only with the expected structure.'
    const messages = [{ role: 'system', content: reformatSystem }, { role: 'user', content: out }]
    const r = await openaiSvc.chat(messages, 1000).catch(() => null)
    const txt = r?.choices?.[0]?.message?.content || out
    try { return JSON.parse(txt) } catch (e) { return { error: 'parse_failed', raw: txt } }
  }
}
