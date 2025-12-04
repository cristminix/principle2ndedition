import { openai } from "@ai-sdk/openai"
import { Agent } from "@mastra/core/agent"
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

const getWeatherInfo = async (city: string) => {
  // Replace with an actual API call to a weather
  // service
  console.log(`Fetching weather for ${city}...`)
  // Example data structure
  return { temperature: 20, conditions: "Sunny" }
}

export const weatherTool = createTool({
  id: "Get Weather Information",
  description: "Fetches the current weather\ninformation for a given city",
  inputSchema: z.object({
    city: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    conditions: z.string(),
  }),
  execute: async ({ context: { city } }) => {
    console.log("Using tool to fetch weather\ninformation for", city)
    return await getWeatherInfo(city)
  },
})
// Example 1: Defining and exporting an Agent (from image40.png)
export const myAgent = new Agent({
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
})

// Use the agent (uncomment to execute)
const result = await myAgent.generate("What is the weather like?")
