import { generateText, tool } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import z from "zod"
import dotenv from "dotenv"
dotenv.config()

// Buat instance OpenAI dengan konfigurasi dari environment
const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY || "",
  // Opsional: header tambahan jika diperlukan
})

// Definisikan tools yang akan digunakan oleh agen
const tools = {
  // Tambahkan tools di sini sesuai kebutuhan
  getCurrentTime: tool({
    description: "Get the current time",
    inputSchema: z.object({}),
    execute: async () => {
      const time = new Date().toISOString()
      console.log("Tool executed: getCurrentTime ->", time)
      return time
    },
  }),
}

// Fungsi untuk menjalankan agen
export async function runMyAgent(userInput: string) {
  const result = await generateText({
    // Gunakan model chat secara eksplisit
    model: openai.chat(process.env.OPENAI_MODEL || "gpt-4o-mini"),
    system: `You are a helpful assistant. When you use a tool, always respond with a clear message that includes the tool's result.`,
    prompt: userInput,
    tools,
  })

  // result.text berisi teks yang dihasilkan termasuk tool call
  return result.text
}

// Jika file dijalankan langsung, jalankan agen dengan input contoh
if (require.main === module) {
  console.log("Running agent with tool calling...")
  runMyAgent("Tell me the current time.")
    .then((res) => {
      console.log("Response:", res)
    })
    .catch((err) => {
      console.error("Error:", err)
    })
}
