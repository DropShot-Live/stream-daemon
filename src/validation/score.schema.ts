import { z } from 'zod';

export const scoreSchema = z.object({
  red_points: z.number(),
  blue_points: z.number(),
  red_games: z.number(),
  blue_games: z.number(),
  court_id: z.string().uuid(),
});

export type ScoreSchema = z.infer<typeof scoreSchema>;
