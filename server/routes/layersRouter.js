import path from 'path';
import { Router } from 'express';
import layerExtentsController from '../controllers/layerExtentsController.js';
import featureGroupController from '../controllers/featureGroupController.js';
const router = new Router();

router.get(
  '/:tableid/:z/:x/:y.mvt',
  layerExtentsController.getVectorTilesForCoords,
  (req, res) => {
    res
      .status(200)
      .set('Content-type', 'application/vnd.mapbox-vector-tile')
      .send(res.locals.pbf.st_asmvt);
  }
);

router.post(
  '/featuregroups',
  featureGroupController.saveFeatureGroup,
  (req, res) => {
    res
      .status(200)
      .set('Content-type', 'application/json')
      .json(res.locals.saveResult);
  }
);

router.get(
  '/featuregroups/:id',
  featureGroupController.getFeatureGroupByID,
  (req, res) => {
    res.status(200).json(res.locals.retrievedFeatureGroup);
  }
);

router.get(
  '/featuregroups',
  featureGroupController.getAllFeatureGroups,
  (req, res) => {
    console.log('Back in final middleware...');
    res.status(200).json(res.locals.allCustomFeatureGroups);
  }
);

export default router;
