import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import scoreRouter from './router/score.router';
import { generateOpenApiDocs } from './config/swagger';

export class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.swagger();
  }

  private config(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());
  }

  private routes(): void {
    this.app.use('/score', scoreRouter);
  }

  private swagger(): void {
    const docs = generateOpenApiDocs();
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(docs));
  }
}
