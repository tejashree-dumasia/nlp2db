# Natural Language Database Agent (Text-to-SQL)

An autonomous AI agent engineered to bridge the gap between non-technical stakeholders and relational data systems. Built using Node.js and LangChain.js, the agent translates conversational English questions into optimized PostgreSQL queries, executes them safely against a live database, and synthesizes the retrieved tabular data into clear, natural language summaries.

The system implements a ReAct (Reasoning + Acting) architecture with function calling. The agent autonomously inspects table schemas, formulates dialect-compliant SQL, executes queries via isolated read-only tools, and evaluates the returned data before composing a context-aware response.

## Tech Stack
*   **Runtime:** Node.js (ES Modules)
*   **AI Framework:** LangChain.js (@langchain/core, @langchain/google-genai)
*   **Architecture:** ReAct Framework (Thought → Action → Observation → Final Answer)
*   **Database:** PostgreSQL
*   **Database Client:** `pg` (node-postgres) with Connection Pooling
*   **Config:** `dotenv` for credential isolation

## Project Structure
```text
nlp2db-agent/
├── src/
│   ├── config/
│   │   └── env.js        # Environment validation
│   ├── db/
│   │   ├── pool.js       # PostgreSQL connection pool
│   │   └── seed.js       # Schema & Data initialization
│   ├── tools/            
│   │   ├── schemaTool.js # Retrieves table/column definitions
│   │   ├── queryTool.js  # Executes validated, read-only SQL
│   │   └── index.js      # Tool exporter
│   ├── agent/            
│   │   └── index.js      # Core ReAct Agent Orchestration
│   └── index.js          # CLI entry point
├── .env
├── .gitignore
└── package.json
```

## Setup Instructions

### 1. Prerequisites
*   Node.js v18+
*   Local PostgreSQL instance running

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure your credentials:
```env
# Database Config
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=nlp2db

# LLM Config (Google Gemini AI Studio Free Tier)
GOOGLE_API_KEY=your_gemini_api_key
```

### 4. Initialize Database
Ensure you have created an empty database named `nlp2db` in your local Postgres instance. Then, run the seed script to create the tables and insert sample data:
```bash
npm run seed
```

## Usage

Start the interactive CLI loop:
```bash
npm start
```

Once the agent boots up, you can ask natural language questions about your data, such as:
*   *"How many total users do we have in the database?"*
*   *"Who are our top 3 highest-spending customers?"*
*   *"What is the total revenue from completed orders?"*

## Safety & Safeguards
*   **Read-Only Execution:** The `run_sql_query` tool strictly parses incoming queries and blocks mutations (`DROP`, `DELETE`, `UPDATE`, `INSERT`).
*   **Context Window Protection:** Database results are truncated to a maximum of 50 rows to prevent overflowing the LLM's context window.
*   **Self-Correction:** If the generated SQL contains a syntax error, the raw PostgreSQL error is returned to the agent as an observation, allowing it to rewrite and retry the query autonomously.