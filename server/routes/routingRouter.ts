import path from 'path';
import { Request, Response, Router } from 'express';
import layerExtentsController from '../controllers/layerExtentsController.js';
import featureGroupController from '../controllers/featureGroupController.js';
import routingController from '../controllers/routingController.js';
const router = Router();

router.get(
  '/',
  routingController.formatEdgesNodes,
  (req: Request, res: Response) => {
    res.sendStatus(200);
  }
);

export default router;
