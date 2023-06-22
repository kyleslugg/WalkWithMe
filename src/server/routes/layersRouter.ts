import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import layerExtentsController from '../controllers/layerExtentsController.js';
import featureGroupController from '../controllers/featureGroupController.js';
const router = Router();

router.get(
  '/:tableid/:z/:x/:y.mvt',
  layerExtentsController.getVectorTilesForCoords,
  (req: Request, res: Response) => {
    res
      .status(200)
      .set('Content-type', 'application/vnd.mapbox-vector-tile')
      .send(res.locals.pbf.st_asmvt);
  }
);

router.post(
  '/featuregroups',
  featureGroupController.saveFeatureGroup,
  (req: Request, res: Response) => {
    res
      .status(200)
      .set('Content-type', 'application/json')
      .json(res.locals.saveResult);
  }
);

router.get(
  '/featuregroups/:id',
  featureGroupController.getFeatureGroupByID,
  (req: Request, res: Response) => {
    res.status(200).json(res.locals.retrievedFeatureGroup);
  }
);

router.get(
  '/featuregroups',
  featureGroupController.getAllFeatureGroups,
  (req: Request, res: Response) => {
    console.log('Back in final middleware...');
    res.status(200).json(res.locals.allCustomFeatureGroups);
  }
);

export default router;
