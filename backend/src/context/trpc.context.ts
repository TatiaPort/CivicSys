// backend/src/context/trpcContext.ts
import * as trpcExpress from '@trpc/server/adapters/express';
import { blockchainService } from '../services/blockchain.service.js';

// 1. Definir qué cosas van a vivir dentro del contexto
export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  return {
    req, // Petición HTTP (por si necesitas leer headers más adelante)
    res, // Respuesta HTTP
    blockchain: blockchainService, // ¡Inyectamos el motor Blockchain aquí!
  };
};

// 2. Exportar el tipo del contexto para que tRPC sepa qué datos tiene disponibles
export type Context = Awaited<ReturnType<typeof createContext>>;