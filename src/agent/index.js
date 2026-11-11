import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { agentTools } from "../tools/index.js";
import { config } from "../config/env.js";

// 1. Initialize Gemini with deterministic settings
const llm = new ChatGoogleGenerativeAI({
  apiKey: config.llm.googleApiKey,
  modelName: "gemini-3.8-flash", // The newest free-tier model for 2026
  temperature: 0,           
});

// ... The prompt and AgentExecutor code below remains completely unchanged!

// 2. Define the System Prompt
const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an expert PostgreSQL database assistant. 
Your job is to answer user questions by querying the database.

Follow these strict rules:
1. ALWAYS call the 'get_schema' tool first to understand the database structure.
2. Formulate a valid PostgreSQL SELECT query based on the explicit schema.
3. Call the 'run_sql_query' tool to execute your query.
4. If a query fails, analyze the error string and rewrite the query.
5. Once you have the data, synthesize it into a clear, concise natural language answer.

CRITICAL: DO NOT hallucinate column names. ONLY use tables and columns returned by get_schema.`],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"] // Injects the Thought->Action->Observation history
]);

// 3. Create the ReAct Tool Calling Agent
const agent = createToolCallingAgent({
  llm,
  tools: agentTools,
  prompt,
});

// 4. Create and export the Executor
export const dbAgentExecutor = new AgentExecutor({
  agent,
  tools: agentTools,
  verbose: true,     // Streams the internal monologue (Thought/Action/Observation) to the console
  maxIterations: 5,  // Fail-safe to prevent infinite loop hallucinations
});


