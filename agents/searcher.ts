import {
  AgentOptions,
  ReactiveAgent,
  ModelType,
  when,
  ToolLike,
  toTool,
} from "@bazed-ai/bazed-af";
import moment from "moment";
import { z } from "zod";
import { searchTool } from "../tools/search";
import ReaderAgent from "./reader";

export interface SearcherAgentOptions extends AgentOptions {
  question: string;
}

export interface SearcherAgentState {
  counter: number;
  answer?: string;
  sources?: string[];
}

export interface SearcherAgentResult {
  answer: string;
  sources: string[];
}

const NoteSchema = z.object({
  note: z.string().describe("The note to make"),
});
type Note = z.infer<typeof NoteSchema>;

const AnswerSchema = z.object({
  answer: z.string().describe("The answer to the question"),
  sources: z
    .string()
    .array()
    .describe("The URLs of sources used to answer the question"),
});
type Answer = z.infer<typeof AnswerSchema>;

export default class SearcherAgent extends ReactiveAgent<
  SearcherAgentOptions,
  SearcherAgentState,
  SearcherAgentResult
> {
  model: ModelType = ModelType.GPT4Turbo;
  systemPrompt: string = `Your task is to answer the question posed by the user.
  In order to answer the question you must use the available tools to look up relevant information.
  You may search the web in any language that will help you answer the question better.
  Use queries that will help you gather the most relevant information.
  Give your answer in the language of the question.
  When asked for final answer and you don't have enough information just answer with justification.`;

  async input(options: SearcherAgentOptions): Promise<SearcherAgentState> {
    const search = searchTool(this.session.context["serp-api-key"]);
    const read = toTool(ReaderAgent as ToolLike);
    this.tools = [search, read];

    this.respond(`Current date: ${moment().format("DD/MM/YYYY HH:mm")}
    Question: ${options.question}`);

    return { counter: 0 };
  }

  @when("you want to make a note", NoteSchema)
  async note(
    { counter }: SearcherAgentState,
    _input: Note
  ): Promise<SearcherAgentState> {
    if (counter > 3) {
      this.respond("Please give your final answer.");
    } else {
      this.respond("Please continue.");
    }
    return { counter: counter + 1 };
  }

  @when("you want to give your final answer", AnswerSchema)
  async answer(
    state: SearcherAgentState,
    { answer, sources }: Answer
  ): Promise<SearcherAgentState> {
    this.stop();
    return { ...state, answer: answer, sources };
  }

  async output({
    answer,
    sources,
  }: SearcherAgentState): Promise<SearcherAgentResult> {
    return {
      answer: answer || "I don't know the answer.",
      sources: sources || [],
    };
  }
}
