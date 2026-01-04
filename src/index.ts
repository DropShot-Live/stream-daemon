import { Server } from './server';
import { config } from './config/env';
import { HelloCron } from './cron/hello.cron';
import { ScoreboardListener } from './listeners/scoreboard.listener';

const server = new Server();
const helloCron = new HelloCron();
const scoreboardListener = new ScoreboardListener();

// Start server
server.app.listen(config.port, () => {
  console.log(`Stream Daemon running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);

  // Start cron jobs
  helloCron.start();

  // Start Supabase real-time listener
  scoreboardListener.start();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await scoreboardListener.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await scoreboardListener.stop();
  process.exit(0);
});
