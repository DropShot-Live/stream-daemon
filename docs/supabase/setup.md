# Supabase Real-time Integration Guide

This guide explains how to set up and use Supabase real-time database listeners in the Stream Daemon.

## 📋 Prerequisites

### What You Need from Supabase

To use Supabase real-time features, you need the following from your Supabase project:

1. **Supabase Project URL**
   - Go to: [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to: **Settings** → **API**
   - Copy the **Project URL** (format: `https://your-project-id.supabase.co`)

2. **Supabase Anon Key** (Public Key)
   - In the same **Settings** → **API** page
   - Copy the **anon** / **public** key
   - This key is safe to use in client-side applications

3. **Service Role Key** (Optional - for admin operations)
   - In the same **Settings** → **API** page
   - Copy the **service_role** key
   - ⚠️ **Keep this secret!** This key bypasses Row Level Security (RLS)

### Supabase Database Setup

#### 1. Create the `score-board` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the score-board table
CREATE TABLE IF NOT EXISTS public."score-board" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_red_score INTEGER DEFAULT 0,
  team_blue_score INTEGER DEFAULT 0,
  match_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_score_board_match_id ON public."score-board"(match_id);
CREATE INDEX idx_score_board_status ON public."score-board"(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_score_board_updated_at 
  BEFORE UPDATE ON public."score-board"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. Enable Real-time for the Table

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Find the `score_board` table
3. Enable **Real-time** for this table
4. Select which events to broadcast:
   - ✅ **INSERT** - New records
   - ✅ **UPDATE** - Modified records
   - ✅ **DELETE** - Deleted records

#### 3. ⚠️ IMPORTANT: Row Level Security (RLS) and Real-time Events

**By default, Supabase real-time only broadcasts DELETE events when RLS is enabled.**

To receive **INSERT** and **UPDATE** events, you have two options:

**Option A: Disable RLS (Simplest)**

```sql
-- Disable RLS to receive all events (INSERT, UPDATE, DELETE)
ALTER TABLE public."score_board" DISABLE ROW LEVEL SECURITY;
```

**Option B: Configure RLS Policies (More Secure)**

If you need RLS for security, create policies that allow the `anon` role to SELECT:

```sql
-- Enable RLS
ALTER TABLE public."score_board" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (required for real-time INSERT/UPDATE events)
CREATE POLICY "Allow anonymous read access"
  ON public."score_board"
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated write access"
  ON public."score_board"
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**Why does this happen?**
- Supabase real-time respects RLS policies
- DELETE events are always broadcast (for security reasons)
- INSERT/UPDATE events require SELECT permission for the `anon` role
- Without SELECT permission, the client can't "see" the new/updated data

**Quick Test:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'score_board';

-- If rowsecurity = true and you're not getting INSERT/UPDATE events,
-- you need to either disable RLS or add SELECT policies
```

## 🚀 Setup Instructions

### 1. Install Dependencies

The Supabase client has already been installed:

```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── config/
│   └── env.ts                    # Environment configuration with Supabase credentials
├── service/
│   └── supabase.service.ts       # Supabase client singleton and subscription manager
├── cron/
│   └── scoreboard.cron.ts        # Real-time listener for score-board table
└── index.ts                      # Application entry point
```

## 🎯 How It Works

### Architecture

1. **Singleton Pattern**: `SupabaseService` uses a singleton pattern to ensure only one Supabase client instance exists
2. **Channel Management**: Tracks all active real-time subscriptions
3. **Event Handling**: Processes INSERT, UPDATE, and DELETE events separately
4. **Graceful Shutdown**: Properly unsubscribes from all channels on application shutdown

### Real-time Flow

```
Supabase Database Change
         ↓
  Real-time Broadcast
         ↓
   Supabase Client
         ↓
  Channel Subscription
         ↓
  Event Handler (scoreboard.cron.ts)
         ↓
  Your Business Logic
```

## 💻 Usage Examples

### Basic Usage (Already Implemented)

The `ScoreboardCron` class is already set up and running:

```typescript
// Automatically starts when the application starts
// Listens to all events on the 'score-board' table
```

### Custom Event Handlers

Modify `src/cron/scoreboard.cron.ts` to add your business logic:

```typescript
private handleInsert(record: any): void {
  // Example: Send webhook notification
  console.log('New score recorded:', record);
  
  // Your custom logic here:
  // - Send notifications
  // - Update local cache
  // - Trigger external APIs
  // - Log to analytics
}

private handleUpdate(oldRecord: any, newRecord: any): void {
  // Example: Check if score changed
  if (oldRecord.team_red_score !== newRecord.team_red_score) {
    console.log('Red team scored!');
  }
  
  // Your custom logic here
}

private handleDelete(record: any): void {
  // Example: Cleanup related data
  console.log('Match deleted:', record.match_id);
  
  // Your custom logic here
}
```

### Creating Additional Listeners

To listen to other tables, create a new cron file:

```typescript
// src/cron/my-table.cron.ts
import { SupabaseService } from '../service/supabase.service';

export class MyTableCron {
  private supabaseService: SupabaseService;
  private channelName = 'my-table-listener';

  constructor() {
    this.supabaseService = SupabaseService.getInstance();
  }

  public start(): void {
    this.supabaseService.subscribeToTable(
      this.channelName,
      'my-table',
      this.handleChange.bind(this),
      '*', // or 'INSERT', 'UPDATE', 'DELETE'
      'public'
    );
  }

  private handleChange(payload: any): void {
    console.log('Change detected:', payload);
  }

  public async stop(): Promise<void> {
    await this.supabaseService.unsubscribe(this.channelName);
  }
}
```

Then add it to `src/index.ts`:

```typescript
import { MyTableCron } from './cron/my-table.cron';

const myTableCron = new MyTableCron();

server.app.listen(config.port, () => {
  // ...
  myTableCron.start();
});

process.on('SIGINT', async () => {
  await myTableCron.stop();
  // ...
});
```

### Listening to Specific Events Only

```typescript
// Listen to INSERT events only
this.supabaseService.subscribeToTable(
  'insert-only-channel',
  'score-board',
  this.handleInsert.bind(this),
  'INSERT', // Only INSERT events
  'public'
);

// Listen to UPDATE events only
this.supabaseService.subscribeToTable(
  'update-only-channel',
  'score-board',
  this.handleUpdate.bind(this),
  'UPDATE', // Only UPDATE events
  'public'
);
```

## 🧪 Testing

### Test the Real-time Connection

1. Start the daemon:
   ```bash
   npm run dev
   ```

2. You should see:
   ```
   ✅ Supabase client initialized
   Stream Daemon running on port 3000
   🎯 Starting Scoreboard real-time listener...
   ✅ Successfully subscribed to channel: scoreboard-listener
   ```

3. Insert a test record in Supabase SQL Editor:
   ```sql
   INSERT INTO public."score-board" (team_red_score, team_blue_score, match_id)
   VALUES (5, 3, 'test-match-001');
   ```

4. Check the daemon logs - you should see:
   ```
   📡 [scoreboard-listener] Change received: { event: 'INSERT', table: 'score-board', ... }
   🔔 Scoreboard change detected!
   ➕ New record inserted: { id: '...', team_red_score: 5, ... }
   ```

### Test Updates

```sql
UPDATE public."score-board"
SET team_red_score = 6
WHERE match_id = 'test-match-001';
```

### Test Deletes

```sql
DELETE FROM public."score-board"
WHERE match_id = 'test-match-001';
```

## 🔧 Advanced Configuration

### Rate Limiting

Adjust the events per second in `src/service/supabase.service.ts`:

```typescript
this.client = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // Adjust this value
      },
    },
  }
);
```

### Connection Monitoring

Check active channels:

```typescript
const supabase = SupabaseService.getInstance();
console.log('Active channels:', supabase.getActiveChannels());
console.log('Is active?', supabase.isChannelActive('scoreboard-listener'));
```

## 🐛 Troubleshooting

### Issue: "Warning: SUPABASE_URL and SUPABASE_ANON_KEY are required"

**Solution**: Make sure your `.env` file has the correct Supabase credentials.

### Issue: Channel subscription times out

**Possible causes**:
1. Real-time is not enabled for the table in Supabase dashboard
2. Network connectivity issues
3. Invalid Supabase credentials

**Solution**: 
- Check **Database** → **Replication** in Supabase dashboard
- Verify your credentials in `.env`
- Check your internet connection

### Issue: Not receiving events

**Possible causes**:
1. Row Level Security (RLS) is blocking the events
2. Table name is incorrect (note: use hyphens if your table name has them)
3. Real-time is not enabled for specific event types

**Solution**:
- Temporarily disable RLS to test: `ALTER TABLE "score-board" DISABLE ROW LEVEL SECURITY;`
- Verify table name matches exactly (case-sensitive)
- Check which events are enabled in Replication settings

### Issue: Events are delayed

**Possible causes**:
1. High database load
2. Network latency
3. Rate limiting

**Solution**:
- Check Supabase dashboard for performance metrics
- Increase `eventsPerSecond` if needed
- Consider upgrading your Supabase plan for better performance

## 📚 Additional Resources

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)

## 🎉 Summary

You now have a fully functional Supabase real-time listener that:
- ✅ Connects to your Supabase database
- ✅ Listens to changes on the `score-board` table
- ✅ Handles INSERT, UPDATE, and DELETE events
- ✅ Provides a clean architecture for adding more listeners
- ✅ Gracefully shuts down and cleans up subscriptions
