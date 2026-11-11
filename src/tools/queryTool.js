import { DynamicTool } from "@langchain/core/tools";
import { pool } from "../db/pool.js";

// Regex to catch dangerous SQL operations
const FORBIDDEN_KEYWORDS = /\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|COMMIT|ROLLBACK)\b/i;

export const runSqlQueryTool = new DynamicTool({
  name: "run_sql_query",
  description: "Executes a PostgreSQL SELECT query and returns the results. Input MUST be a valid SQL SELECT string.",
  func: async (sqlQuery) => {
    try {
      // 1. Safety Guard: Block mutations
      if (FORBIDDEN_KEYWORDS.test(sqlQuery)) {
        return "Error: Query rejected. Only SELECT queries are permitted for safety reasons.";
      }

      // 2. Execute Query
      const { rows } = await pool.query(sqlQuery);
      
      // 3. Context Window Guard: Limit returned payload
      const MAX_ROWS = 50;
      let resultString = JSON.stringify(rows.slice(0, MAX_ROWS));
      
      if (rows.length > MAX_ROWS) {
        resultString += `\n... (Result truncated. Total rows: ${rows.length})`;
      }

      // If no rows, inform the agent clearly
      if (rows.length === 0) {
        return "Query executed successfully, but returned 0 rows.";
      }

      return resultString;
    } catch (error) {
      // Return the exact error string so the LLM can self-correct its syntax
      return `Query execution failed: ${error.message}. Please rewrite the query and try again.`;
    }
  },
});