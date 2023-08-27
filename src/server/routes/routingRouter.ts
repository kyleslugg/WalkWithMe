import path from 'path';
import { Request, Response, Router } from 'express';
import layerExtentsController from '../controllers/layerExtentsController.js';
import featureGroupController from '../controllers/featureGroupController.js';
import routingController from '../controllers/routingController.js';
const router = Router();

router.post(
  '/',
  routingController.generateRoute,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.pathGeoms);
  }
);

export default router;
