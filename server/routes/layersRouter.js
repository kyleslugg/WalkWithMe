const path = require('path');
const express = require('express');
const mvtController = require('../controllers/mvtController');
const router = new express.Router();

router.get(
  '/:tableid/:z/:x/:y.mvt',
  mvtController.getTilesForCoords,
  (req, res) => {
    console.log('Back in final middleware...');
    res
      .status(200)
      .set('Content-type', 'application/vnd.mapbox-vector-tile')
      .send(res.locals.pbf.st_asmvt);
  }
);

module.exports = router;
