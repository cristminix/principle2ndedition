import { createTool } from "@mastra/core"
import z from "zod"

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
