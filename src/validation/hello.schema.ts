import { z } from 'zod';

export const helloSchema = z.object({
  // No params required, but schema exists for validation layer pattern
});

export type HelloSchema = z.infer<typeof helloSchema>;
