import path from 'path';
import { Router } from 'express';
import layerExtentsController from '../controllers/layerExtentsController.js';
import featureGroupController from '../controllers/featureGroupController.js';
import routingController from '../controllers/routingController.ts';
const router = new Router();

router.get('/', routingController.formatEdgesNodes, (req, res) => {
  res.sendStatus(200);
});

export default router;
