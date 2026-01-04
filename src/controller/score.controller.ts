import { Request, Response } from 'express';
import { ScoreService } from '../service/score.service';
import { CreateScoreSchema, UpdateScoreSchema } from '../validation/score.schema';

export class ScoreController {
  private scoreService: ScoreService;

  constructor() {
    this.scoreService = new ScoreService();
  }

  /**
   * POST /score - Create a new score record
   */
  public createScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const scoreData: CreateScoreSchema = req.body;
      const result = await this.scoreService.createScore(scoreData);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error in createScore controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create score',
      });
    }
  };

  /**
   * PUT /score - Update an existing score record
   */
  public updateScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const scoreData: UpdateScoreSchema = req.body;
      const result = await this.scoreService.updateScore(scoreData);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in updateScore controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update score',
      });
    }
  };
}

