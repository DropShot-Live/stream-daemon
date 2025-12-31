import { Server } from './server';
import { config } from './config/env';
import { HelloCron } from './cron/hello.cron';

const server = new Server();
const helloCron = new HelloCron();

// Start server
server.app.listen(config.port, () => {
  console.log(`Stream Daemon running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  
  // Start cron jobs
  helloCron.start();
});
