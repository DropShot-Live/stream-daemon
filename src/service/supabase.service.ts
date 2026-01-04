import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { config } from '../config/env';

/**
 * Supabase Client Singleton
 * Manages the connection to Supabase and provides real-time subscription capabilities
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;
  private channels: Map<string, RealtimeChannel> = new Map();

  private constructor() {
    // Initialize Supabase client
    this.client = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        realtime: {
          params: {
            eventsPerSecond: 10, // Rate limiting for real-time events
          },
        },
      }
    );

    console.log('✅ Supabase client initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Get the Supabase client
   */
  public getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Subscribe to real-time changes on a table
   * @param channelName - Unique name for this channel
   * @param tableName - Name of the table to listen to
   * @param callback - Function to call when changes occur
   * @param event - Type of event to listen for ('INSERT', 'UPDATE', 'DELETE', or '*' for all)
   * @param schema - Database schema (default: 'public')
   */
  public subscribeToTable(
    channelName: string,
    tableName: string,
    callback: (payload: any) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
    schema: string = 'public'
  ): RealtimeChannel {
    // Check if channel already exists
    if (this.channels.has(channelName)) {
      console.warn(`⚠️  Channel '${channelName}' already exists. Unsubscribing old channel first.`);
      this.unsubscribe(channelName);
    }

    console.log(`🔧 Setting up channel: ${channelName}`);
    console.log(`   Table: ${schema}.${tableName}`);
    console.log(`   Event: ${event}`);

    // Create new channel
    const channel = this.client
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        { event, schema, table: tableName },
        (payload: any) => {
          console.log(`\n📡 [${channelName}] ===== CHANGE RECEIVED =====`);
          console.log(`   Timestamp: ${new Date().toISOString()}`);
          console.log(`   Event Type: ${payload.eventType}`);
          console.log(`   Table: ${payload.table}`);
          console.log(`   Schema: ${payload.schema}`);
          console.log(`   Full Payload:`, JSON.stringify(payload, null, 2));
          console.log(`========================================\n`);
          callback(payload);
        }
      )
      .subscribe((status, err) => {
        console.log(`\n📊 [${channelName}] Subscription status changed: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to channel: ${channelName}`);
          console.log(`   Listening for: ${event} events on ${schema}.${tableName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Error subscribing to channel: ${channelName}`);
          if (err) {
            console.error(`   Error details:`, err);
          }
        } else if (status === 'TIMED_OUT') {
          console.error(`⏱️  Subscription timed out for channel: ${channelName}`);
        } else if (status === 'CLOSED') {
          console.log(`🔌 Channel closed: ${channelName}`);
        } else {
          console.log(`📊 Channel status: ${status}`);
        }
      });

    // Store channel reference
    this.channels.set(channelName, channel);

    return channel;
  }

  /**
   * Unsubscribe from a channel
   * @param channelName - Name of the channel to unsubscribe from
   */
  public async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await this.client.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from channel: ${channelName}`);
    } else {
      console.warn(`⚠️  Channel '${channelName}' not found`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  public async unsubscribeAll(): Promise<void> {
    console.log(`🔌 Unsubscribing from ${this.channels.size} channels...`);
    await this.client.removeAllChannels();
    this.channels.clear();
    console.log('✅ All channels unsubscribed');
  }

  /**
   * Get all active channel names
   */
  public getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Check if a channel is active
   */
  public isChannelActive(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}
