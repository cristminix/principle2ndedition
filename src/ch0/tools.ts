import { Agent } from "@mastra/core/agent"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"
import dotenv from "dotenv"
import { createChatModel } from "../public/fn/createChatModel"
import { weatherTool } from "../public/fn/weatherTool"
dotenv.config()

const main = async () => {
  const myAgent = new Agent({
    name: "My Agent",
    instructions: "You are a helpful assistant.",
    model: createChatModel(),
    tools: [weatherTool],
  })

  // Use the agent (uncomment to execute)
  const result = await myAgent.generate("What is the weather ub nyc like?")
  console.log(result.text)
}
main().catch(console.error)
