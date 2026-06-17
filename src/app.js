import { Hono } from 'hono';
import { cors } from 'hono/cors';
import reportRoutes from './routes/reportRoutes.js';
import ApiError from './utils/apiError.js';

const app = new Hono();

app.use('*', cors({
  origin: (origin, c) => {
    const configured = c.env?.CORS_ORIGIN || '*';
    if (configured === '*') return '*';

    const allowedOrigins = configured.split(',').map((value) => value.trim()).filter(Boolean);
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || origin;
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
  maxAge: 86400
}));

app.get('/health', (c) => {
  return c.json({ ok: true, service: 'siteurbe-api' });
});

app.route('/api/reports', reportRoutes);

app.notFound((c) => {
  return c.json({ error: 'Ruta no encontrada.' }, 404);
});

app.onError((error, c) => {
  const status = error instanceof ApiError ? error.status : 500;
  const body = {
    error: status >= 500 ? 'Error interno del servidor.' : error.message
  };

  if (error.details) {
    body.details = error.details;
  }

  if (status >= 500) {
    console.error(error);
  }

  return c.json(body, status);
});

export default app;

