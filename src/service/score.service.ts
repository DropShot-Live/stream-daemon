import { SupabaseService } from './supabase.service';
import { CreateScoreSchema, UpdateScoreSchema } from '../validation/score.schema';

export class ScoreService {
  private supabaseService: SupabaseService;

  constructor() {
    this.supabaseService = SupabaseService.getInstance();
  }

  /**
   * Insert a new score record into the score_board table
   */
  public async createScore(scoreData: CreateScoreSchema): Promise<any> {
    console.log('📝 Creating new score record:', scoreData);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('score_board')
      .insert([
        {
          court_id: scoreData.court_id,
          team_A_score: scoreData.team_A_score,
          team_B_score: scoreData.team_B_score,
        },
      ])
      .select();

    if (error) {
      console.error('❌ Error creating score:', error);
      throw new Error(`Failed to create score: ${error.message}`);
    }

    console.log('✅ Score created successfully:', data);
    return {
      success: true,
      message: 'Score created successfully',
      data: data[0],
    };
  }

  /**
   * Update an existing score record in the score_board table by court_id
   */
  public async updateScore(scoreData: UpdateScoreSchema): Promise<any> {
    console.log('✏️  Updating score record for court_id:', scoreData.court_id);

    // Build update object with only provided fields
    const updateData: any = {};
    if (scoreData.team_A_score !== undefined) updateData.team_A_score = scoreData.team_A_score;
    if (scoreData.team_B_score !== undefined) updateData.team_B_score = scoreData.team_B_score;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('score_board')
      .update(updateData)
      .eq('court_id', scoreData.court_id)
      .select();

    if (error) {
      console.error('❌ Error updating score:', error);
      throw new Error(`Failed to update score: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(`No score found for court_id ${scoreData.court_id}`);
    }

    console.log('✅ Score updated successfully:', data);
    return {
      success: true,
      message: 'Score updated successfully',
      data: data[0],
    };
  }
}
