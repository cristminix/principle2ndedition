import { Agent } from "@mastra/core/agent"
import { z } from "zod"
import dotenv from "dotenv"
import { createChatModel } from "../public/fn/createChatModel"
dotenv.config()

const main = async () => {
  const myAgent = new Agent({
    name: "My Agent",
    instructions: "You are a helpful assistant. Always respond with a valid JSON object that matches the provided schema.",
    model: createChatModel(),
  })

  const mySchema = z.object({
    definition: z.string(),
    examples: z.array(z.string()),
  })

  const response = await myAgent.generate("Define machine learning and give examples.", {
    output: mySchema,
  })

  console.log(response.object)
}
main().catch(console.error)
