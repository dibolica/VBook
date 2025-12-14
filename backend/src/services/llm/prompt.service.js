export const mapPromptSystem = `You are an expert scriptwriter. For the text provided produce:
1) A concise list of 5-8 bullet point summaries (each 8-25 words).
2) Up to 3 short scene ideas (title + 1-2 sentence visual description).
Return JSON: {"bullets":[...],"scenes":[{"title":"...","desc":"..."}]}`

export const reducePromptSystem = (maxScenes = 8) => `You are a senior editor. Combine chunk-level outputs into an ordered script of up to ${maxScenes} scenes. For each scene produce:
- sceneIndex
- title
- narration (20-40 words)
- visualPrompt (concise prompt for a text->video generator)
- mood
Return valid JSON only: { "scenes":[ ... ] }`
