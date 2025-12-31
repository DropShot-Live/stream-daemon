import { z } from 'zod';

export const successMessageResponse = z.object({
  message: z.string()
});

export type SuccessMessageResponse = z.infer<typeof successMessageResponse>;
