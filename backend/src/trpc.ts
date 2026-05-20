import { initTRPC, TRPCError } from '@trpc/server';

// Inicializar tRPC
const t = initTRPC.create();

// Exportar constructores principales
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Crear un procedimiento protegido (opcional, por si necesitas seguridad)
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  // Aquí validarías si el usuario tiene permiso (ejemplo: si viene token en el contexto)
  // Si no tiene permiso, lanzar error:
  // throw new TRPCError({ code: 'UNAUTHORIZED' });
  
  return next({ ctx });
});