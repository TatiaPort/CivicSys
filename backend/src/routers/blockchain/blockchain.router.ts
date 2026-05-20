import { router , publicProcedure } from "../../trpc.js";

export const blockchainRouter = router({
    getBlockNumber: publicProcedure.query(async ({ ctx }) => {
        

        return { message: "¡Hola desde la Blockchain! El número del bloque actual es: 123456" };

    })
});
