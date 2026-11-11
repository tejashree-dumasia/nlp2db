import { getSchemaTool } from './schemaTool.js';
import { runSqlQueryTool } from './queryTool.js';



export const agentTools = [getSchemaTool, runSqlQueryTool];