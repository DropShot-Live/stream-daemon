# Stream Daemon

A minimal, production-ready local edge daemon for Stream operations. It runs on a Linux machine, exposes a small HTTP API, runs background cron jobs, validates inputs, and can send data to a remote server.

## Features

- **HTTP API**: Exposes endpoints with validation using Zod.
- **Cron Jobs**: Background tasks scheduled with node-cron.
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
│  │  └─ hello.router.ts
│  ├─ validation/           // Zod schemas
│  │  └─ hello.schema.ts
│  ├─ controller/           // Request handlers
│  │  └─ hello.controller.ts
│  ├─ service/              // Business logic
│  │  └─ hello.service.ts
│  ├─ cron/                 // Scheduled tasks
│  │  └─ hello.cron.ts
│  └─ config/               // Configuration
│     └─ env.ts
├─ bin/
│  └─ stream-daemon.ts      // npx entry point
├─ package.json
├─ tsconfig.json
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
   This uses `ts-node` to run the server directly.

3. **Build and Run**:
   ```bash
   npm run build
   npm start
   ```

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
