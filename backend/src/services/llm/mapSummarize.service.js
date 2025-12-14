import openaiSvc from './openai.service.js'
import geminiSvc from './gemini.service.js'
import ollamaSvc from './ollama.service.js'
import pLimit from 'p-limit'
import { mapPromptSystem } from './prompts.js'
import logger from '../../utils/logger.js'

const limit = pLimit(2)

async function callAnyLLMForChunk(text) {
  // prefer OpenAI, then Gemini, then Ollama
  const messages = [
    { role: 'system', content: mapPromptSystem },
    { role: 'user', content: text }
  ]
  try {
    const r = await openaiSvc.chat(messages, 600)
    return r.choices?.[0]?.message?.content || ''
  } catch (e) {
    logger.warn('OpenAI failed for chunk, trying Gemini', e.message)
  }
  try {
    const r = await geminiSvc.chat(text)
    return r?.output || ''
  } catch (e) {
    logger.warn('Gemini failed for chunk, trying Ollama', e.message)
  }
  try {
    const r = await ollamaSvc.chat('vicuna', `${mapPromptSystem}\n\n${text}`)
    return r?.output || ''
  } catch (e) {
    logger.error('All LLMs failed', e)
    throw new Error('LLM failures')
  }
}

export default async function mapSummarize(chunks = []) {
  const tasks = chunks.map((c, i) => limit(async () => {
    const out = await callAnyLLMForChunk(c)
    // try to parse JSON; if fails return raw text in object
    try {
      const parsed = JSON.parse(out)
      return { idx: i, parsed, raw: out }
    } catch {
      return { idx: i, parsed: null, raw: out }
    }
  }))
  return Promise.all(tasks)
}
