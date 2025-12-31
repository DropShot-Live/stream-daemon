import { Router } from 'express';
import { ScoreController } from '../controller/score.controller';
import { validate } from '../validation/validate.middleware';
import { scoreSchema } from '../validation/score.schema';

const router = Router();
const scoreController = new ScoreController();

router.post('/', validate(scoreSchema, 'body'), scoreController.postScore);

export default router;
