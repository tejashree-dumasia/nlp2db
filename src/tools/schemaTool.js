import { DynamicTool } from "@langchain/core/tools";
import { pool } from "../db/pool.js";

export const getSchemaTool = new DynamicTool({
  name: "get_schema",
  description: "Returns the database schema, including table names, column names, and data types. Call this first to understand the database structure before writing SQL queries.",
  func: async () => {
    try {
      // Query PostgreSQL's standard information_schema to extract our custom tables
      const query = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `;
      
      const { rows } = await pool.query(query);
      
      // Group columns by table for a cleaner LLM context
      const schemaMap = rows.reduce((acc, row) => {
        if (!acc[row.table_name]) acc[row.table_name] = [];
        acc[row.table_name].push(`${row.column_name} (${row.data_type})`);
        return acc;
      }, {});

      let formattedSchema = "Database Schema:\n";
      for (const [table, columns] of Object.entries(schemaMap)) {
        formattedSchema += `- Table: ${table}\n  Columns: ${columns.join(", ")}\n`;
      }
      
      return formattedSchema;
    } catch (error) {
      return `Error retrieving schema: ${error.message}`;
    }
  },
});