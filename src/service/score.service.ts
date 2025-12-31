import { ScoreSchema } from '../validation/score.schema';

export class ScoreService {
  public processScore(scoreData: ScoreSchema): object {
    console.log('Received score update:', scoreData);
    
    // For now, we just echo back the received data with a success message
    // In a real scenario, this might trigger overlays or save to state
    return {
      status: 'received',
      data: scoreData,
      timestamp: new Date().toISOString()
    };
  }
}
