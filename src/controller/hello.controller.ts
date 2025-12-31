import { Request, Response } from 'express';
import { HelloService } from '../service/hello.service';

export class HelloController {
  private helloService: HelloService;

  constructor() {
    this.helloService = new HelloService();
  }

  public getHello = (req: Request, res: Response): void => {
    const message = this.helloService.getHelloMessage();
    res.json({ message });
  };
}
