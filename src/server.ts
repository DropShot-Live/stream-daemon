import express from 'express';
import cors from 'cors';
import scoreRouter from './router/score.router';

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  private routes(): void {
    this.app.use('/score', scoreRouter);
  }
}
