import cron from 'node-cron';

export class HelloCron {
  public start(): void {
    cron.schedule('* * * * *', () => {
      console.log('[cron] hello world');
    });
  }
}
