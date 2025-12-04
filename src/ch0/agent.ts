import { streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import z from "zod"

// Definisikan tools yang akan digunakan oleh agen
const tools = {
  // Tambahkan tools di sini sesuai kebutuhan
  getCurrentTime: tool({
    description: "Get the current time",
    inputSchema: z.object({}),
    execute: async () => {
      return new Date().toISOString()
    },
  }),
}

// Fungsi untuk menjalankan agen
export async function runMyAgent(userInput: string) {
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    prompt: userInput,
    tools,
  })

  // Kembalikan hasil dalam format yang sesuai
  const text = await result.textStream.getReader()
  let response = ""

  while (true) {
    const { done, value } = await text.read()
    if (done) break
    response += value
  }

  return response
}
