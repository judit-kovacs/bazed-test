import {
  AgentOptions,
  OneShotAgent,
  ModelType,
  countTokens,
  pricing,
  isTool,
} from "@bazed-ai/bazed-af";
import { convert } from "html-to-text";
import { z } from "zod";

const readWebsite = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const html = await response.text();
  const text = convert(html);
  return text;
};

export interface ReaderAgentOptions extends AgentOptions {
  prompt: string;
  url: string;
}

const Options = z.object({
  prompt: z.string().describe("The prompt to ask"),
  url: z.string().url().describe("The url to read"),
});

export interface ReaderAgentResult {
  answer: string;
}

const Result = z.object({
  answer: z.string().describe("The answer to the question"),
});

@isTool("read", "Reads a website and returns the summary", Options, Result)
export default class ReaderAgent extends OneShotAgent<
  ReaderAgentOptions,
  ReaderAgentResult
> {
  model: ModelType = ModelType.GPT35Turbo;
  systemPrompt = `Your task is to answer a question solely based on the supplied source text. 
  If the answer cannot be found in the source text you MUST state that you don't know the answer.`;

  async input(): Promise<string> {
    let text = await readWebsite(this.options.url);

    while (countTokens(text) > pricing[this.model].contextSize)
      text = text.slice(0, -(text.length / 10));

    return `Question: ${this.options.prompt}\n\nSource text:\n\n${text}`;
  }

  async output(answer: string): Promise<ReaderAgentResult> {
    return { answer };
  }
}
