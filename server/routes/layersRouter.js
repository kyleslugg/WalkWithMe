const path = require('path');
const express = require('express');
const layerExtentsController = require('../controllers/layerExtentsController');
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

module.exports = router;
