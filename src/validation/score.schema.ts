import { z } from 'zod';

// Schema for creating a new score record
export const createScoreSchema = z.object({
  court_id: z.number().int().positive(),
  team_A_score: z.string(),
  team_B_score: z.string(),
});

// Schema for updating an existing score record by court_id
export const updateScoreSchema = z.object({
  court_id: z.number().int().positive(),
  team_A_score: z.string().optional(),
  team_B_score: z.string().optional(),
}).refine(
  (data) => data.team_A_score !== undefined || data.team_B_score !== undefined,
  {
    message: "At least one score (team_A_score or team_B_score) must be provided",
  }
);

export type CreateScoreSchema = z.infer<typeof createScoreSchema>;
export type UpdateScoreSchema = z.infer<typeof updateScoreSchema>;
