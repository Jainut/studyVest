import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = env.frontendUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origem não permitida pelo CORS.'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

// 404 para rotas não mapeadas
app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
});

// Sempre por último: captura erros lançados em qualquer rota/controller
app.use(errorMiddleware);
