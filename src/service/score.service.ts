import { SuccessMessageResponse } from 'src/validation/generic.schema';
import { ScoreSchema } from '../validation/score.schema';

export class ScoreService {
  public processScore(scoreData: ScoreSchema): SuccessMessageResponse {
    console.log('Received score update:', scoreData);
    
    // For now, we just echo back the received data with a success message
    // In a real scenario, this might trigger overlays or save to state
    return {
      message: 'received',
    };
  }
}
