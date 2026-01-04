import { SupabaseService } from '../service/supabase.service';

/**
 * Scoreboard Real-time Listener
 * Listens to changes on the 'score_board' table in Supabase
 * Uses a single channel with event routing to separate handlers
 */
export class ScoreboardListener {
    private supabaseService: SupabaseService;
    private channelName = 'score_board-channel'; // Single channel

    constructor() {
        this.supabaseService = SupabaseService.getInstance();
    }

    /**
     * Start listening to scoreboard changes
     */
    public start(): void {
        console.log('🎯 Starting Scoreboard real-time listener...\n');

        // Single channel listening to ALL events
        this.supabaseService.subscribeToTable(
            this.channelName,
            'score_board',
            this.handleAllEvents.bind(this),
            '*', // Listen to all events
            'public'
        );

        console.log('✨ Real-time channel configured\n');
    }

    /**
     * Handle all events and route them accordingly
     */
    private handleAllEvents(payload: any): void {
        console.log('📡 Event received:', payload.eventType);

        switch (payload.eventType) {
            case 'INSERT':
                this.handleInsertEvent(payload);
                break;
            case 'UPDATE':
                this.handleUpdateEvent(payload);
                break;
            case 'DELETE':
                this.handleDeleteEvent(payload);
                break;
            default:
                console.log('❓ Unknown event type:', payload.eventType);
        }
    }

    /**
     * Handle INSERT events
     */
    private handleInsertEvent(payload: any): void {
        console.log('➕ INSERT event');
        console.log('   New record:', payload.new);
        this.handleInsert(payload.new);
    }

    /**
     * Handle UPDATE events
     */
    private handleUpdateEvent(payload: any): void {
        console.log('✏️  UPDATE event');
        console.log('   Old:', payload.old);
        console.log('   New:', payload.new);
        this.handleUpdate(payload.old, payload.new);
    }

    /**
     * Handle DELETE events
     */
    private handleDeleteEvent(payload: any): void {
        console.log('🗑️  DELETE event');
        console.log('   Deleted:', payload.old);
        this.handleDelete(payload.old);
    }

    /**
     * Business logic for INSERT events
     */
    private handleInsert(record: any): void {
        // Add your custom logic here
        // For example: send notification, update local cache, trigger webhook, etc.
        console.log('Processing new scoreboard record...');
        // TODO: Implement your business logic
    }

    /**
     * Business logic for UPDATE events
     */
    private handleUpdate(oldRecord: any, newRecord: any): void {
        // Add your custom logic here
        // For example: compare changes, send alerts, sync with other systems, etc.
        console.log('Processing scoreboard update...');
        // TODO: Implement your business logic
    }

    /**
     * Business logic for DELETE events
     */
    private handleDelete(record: any): void {
        // Add your custom logic here
        // For example: cleanup related data, send notifications, etc.
        console.log('Processing scoreboard deletion...');
        // TODO: Implement your business logic
    }

    /**
     * Stop listening to scoreboard changes
     */
    public async stop(): Promise<void> {
        console.log('🛑 Stopping Scoreboard listener...');
        await this.supabaseService.unsubscribe(this.channelName);
        console.log('✅ Channel unsubscribed');
    }
}
