const path = require('path');
const express = require('express');
const layerExtentsController = require('../controllers/layerExtentsController');
const featureGroupController = require('../controllers/featureGroupController');
const router = new express.Router();

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

module.exports = router;
