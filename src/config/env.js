import dotenv from 'dotenv';

dotenv.config();

const requiredEnvs = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'OPENAI_API_KEY'
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.error(`[FATAL] Missing required environment variable: ${env}`);
    process.exit(1);
  }
}

export const config = {
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  llm: {
    googleApiKey: process.env.GOOGLE_API_KEY, // Changed from openaiApiKey
  }
};