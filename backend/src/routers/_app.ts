// backend/src/routers/_app.ts
import { router } from '../trpc.js';
import { blockchainRouter } from './blockchain/blockchain.router.js';

export const appRouter = router({
  // Aquí偏 acoplamos las rutas de la cadena
  blockchain: blockchainRouter,
  
  // Si en el futuro creas un router de usuarios, lo pegarías aquí abajo:
  // auth: authRouter,
});

// ¡MUY IMPORTANTE!: Exportar solo el TIPO del router. 
// Esto es lo que usará Next.js para tener autocompletado mágico sin empaquetar código del backend.
export type AppRouter = typeof appRouter;