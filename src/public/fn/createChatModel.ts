import { createOpenAI } from "@ai-sdk/openai"

export const createChatModel = (modelId: string | null = null) => {
  let realModelId = modelId ?? (process.env.OPENAI_MODEL || "gpt-4o-mini")
  const openai = createOpenAI({
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY || "",
    // Opsional: header tambahan jika diperlukan,
  })
  return openai.chat(realModelId)
}
