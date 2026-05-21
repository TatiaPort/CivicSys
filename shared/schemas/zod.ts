/**
 * shared/schemas — zod schemas para validación cross-stack.
 *
 * Estos schemas son la fuente de verdad de runtime. Si hay drift,
 * preferí cambiar zod primero y derivar el type de ahí.
 */

import { z } from "zod";

export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "address debe ser 0x + 40 hex");

export const DniSchema = z
  .string()
  .regex(/^\d{8}$/, "DNI debe tener 8 dígitos");

export const SupportedChainIdSchema = z.union([z.literal(31337), z.literal(57057)]);

export const ChoiceSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const CastVoteInputSchema = z.object({
  proposalId: z.bigint(),
  choice: ChoiceSchema,
  chainId: SupportedChainIdSchema,
});

export const RegisterCitizenInputSchema = z.object({
  dni: DniSchema,
  chainId: SupportedChainIdSchema,
});

export const ListReportsQuerySchema = z.object({
  proposalId: z.bigint().optional(),
  chainId: SupportedChainIdSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CastVoteInput = z.infer<typeof CastVoteInputSchema>;
export type RegisterCitizenInput = z.infer<typeof RegisterCitizenInputSchema>;
export type ListReportsQuery = z.infer<typeof ListReportsQuerySchema>;
