import { Router } from 'express';
import { HelloController } from '../controller/hello.controller';
import { helloSchema } from '../validation/hello.schema';
import { validate } from '../validation/validate.middleware';

const router = Router();
const helloController = new HelloController();

router.get('/hello', validate(helloSchema, 'query'), helloController.getHello);

export default router;
