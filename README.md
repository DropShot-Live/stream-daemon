<p align="center">
  <img src="./assets/stream-daemon.png" width="180" />
</p>

# Stream Daemon

A minimal, production-ready local edge daemon for Stream operations. It runs on a Linux machine, exposes a small HTTP API, runs background cron jobs, validates inputs, and can send data to a remote server.

## Features

- **HTTP API**: Exposes endpoints with validation using Zod.
- **Cron Jobs**: Background tasks scheduled with node-cron.
- **Supabase Real-time**: Listen to database changes in real-time.
- **Validation**: Strict input validation layer.
- **Modular Architecture**: Router -> Validation -> Controller -> Service.
- **No Database**: Lightweight, no ORM or DB required.

## Project Structure

```
stream-daemon/
├─ src/
│  ├─ index.ts              // App bootstrap
│  ├─ server.ts             // Express server setup
│  ├─ router/               // Route definitions
│  │  └─ score.router.ts
│  ├─ validation/           // Zod schemas
│  │  ├─ score.schema.ts
│  │  └─ validate.middleware.ts
│  ├─ controller/           // Request handlers
│  │  └─ score.controller.ts
│  ├─ service/              // Business logic
│  │  ├─ score.service.ts
│  │  └─ supabase.service.ts
│  ├─ listeners/            // Real-time event listeners
│  │  └─ scoreboard.listener.ts
│  ├─ cron/                 // Scheduled tasks
│  │  └─ hello.cron.ts
│  └─ config/               // Configuration
│     ├─ env.ts
│     └─ swagger.ts
├─ bin/
│  └─ stream-daemon.ts      // npx entry point
├─ package.json
├─ tsconfig.json
├─ nodemon.json
└─ README.md
```

## How to Run Locally

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run in Development Mode**:

   ```bash
   npm run dev
   ```

   This uses `nodemon` with `ts-node` to run the server and automatically restart on file changes.

3. **Build and Run**:
   ```bash
   npm run build
   npm start
   ```

## Development Features

### Auto-Restart with Nodemon

The development server uses nodemon to automatically restart when you make code changes:

- **Auto-restart**: Edit any `.ts` or `.json` file in `src/` and the server restarts automatically
- **Manual restart**: Type `rs` and press Enter in the terminal
- **Graceful shutdown**: Properly closes Supabase connections before restarting

See [NODEMON_GUIDE.md](./NODEMON_GUIDE.md) for configuration details.

## Supabase Real-time Setup

This daemon includes real-time database listening capabilities using Supabase.

**📖 Complete Guide**: [docs/supabase/setup.md](./docs/supabase/setup.md)

**Quick Setup:**

1. Get your Supabase URL and Anon Key from [Supabase Dashboard](https://app.supabase.com)
2. Copy `.env.example` to `.env` and add your credentials
3. Enable real-time for your `score_board` table in Supabase
4. **Important**: Disable RLS or add SELECT policies to receive INSERT/UPDATE events
5. Run the daemon - it will automatically connect and listen for changes!

## How to Run with npx

To execute the daemon as an NPM package:

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Execute via npx**:
   ```bash
   npx .
   ```
   (Or if published, `npx stream-daemon`)

## API Endpoints

### GET /hello

Returns a simple greeting.

**Response**:

```json
{
  "message": "Hello from Stream Daemon"
}
```

## Cron Jobs

- **Hello Cron**: Runs every minute and logs `[cron] hello world`.
