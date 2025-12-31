import { Request, Response } from 'express';
import { ScoreService } from '../service/score.service';
import { ScoreSchema } from '../validation/score.schema';

export class ScoreController {
  private scoreService: ScoreService;

  constructor() {
    this.scoreService = new ScoreService();
  }

  public postScore = (req: Request, res: Response): void => {
    // The middleware has already validated the body is compatible with ScoreSchema
    const scoreData: ScoreSchema = req.body;
    const result = this.scoreService.processScore(scoreData);
    res.json(result);
  };
}
