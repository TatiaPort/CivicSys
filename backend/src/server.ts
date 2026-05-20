// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routers/_app.js';
import { createContext } from './context/trpc.context.js';
import 'dotenv/config'; // Lee el archivo .env automáticamente

const app = express();
const PUERTO = process.env.PORT || 4000;

// 1. Configurar CORS (Darle permiso exclusivo a tu Frontend en Next.js)
app.use(
  cors({
    origin: 'http://localhost:3000', // URL donde correrá tu Next.js
    credentials: true, // Permitir envío de cookies/headers si es necesario
  })
);

// 2. Permitir que el servidor entienda cuerpos de peticiones en formato JSON
app.use(express.json());

// 3. Pegar la autopista de tRPC en la ruta '/trpc'
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: createContext, // Pasará la conexión de la Blockchain a los routers
  })
);

// 4. Encender el fuego del servidor Express
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor Express + tRPC corriendo en: http://localhost:${PUERTO}/trpc`);
});