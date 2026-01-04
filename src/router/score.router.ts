import { Router } from 'express';
import { ScoreController } from '../controller/score.controller';
import { validate } from '../validation/validate.middleware';
import { createScoreSchema, updateScoreSchema } from '../validation/score.schema';

const router = Router();
const scoreController = new ScoreController();

// POST /score - Create a new score record
router.post('/', validate(createScoreSchema, 'body'), scoreController.createScore);

// PUT /score - Update an existing score record
router.put('/', validate(updateScoreSchema, 'body'), scoreController.updateScore);

export default router;
