import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3333),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  aiProviderApiKey: process.env.AI_PROVIDER_API_KEY ?? '',
  aiProviderBaseUrl: (process.env.AI_PROVIDER_BASE_URL ?? 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  ),
  aiModel: process.env.AI_MODEL ?? 'gpt-4.1-mini',
};
