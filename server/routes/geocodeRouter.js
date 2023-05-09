const path = require('path');
const express = require('express');
const geocodeController = require('../controllers/geocodeController.js');
const router = new express.Router();

router.get('/:queryString', geocodeController.geocodeAddress, (req, res) => {
  res
    .status(200)
    .header('Content-Type', 'application/json')
    .json(res.locals.latlong);
});

module.exports = router;
