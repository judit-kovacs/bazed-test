import { FunctionTool } from "@bazed-ai/bazed-af";
import { getJson } from "serpapi";
import { z } from "zod";

const SearchArgs = z.object({
    query: z.string().describe("The query to search for")
})

const SearchResult = z.object({
    title: z.string().describe("The title of the result"),
    link: z.string().describe("The link of the result"),
    snippet: z.string().describe("The snippet of the result"),
}).array().describe("The search result")

export const searchTool = (apiKey: string) => new FunctionTool(
    "search",
    "Searches for a query on Google", 
    SearchArgs,
    SearchResult, 
    async (_agent, { query }) => {
        const result = await getJson({
            q: query,
            api_key: apiKey,
        })

        return result.organic_results.map((result: {title: any; link: any; snippet: any;}) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet
        }))
    }
)