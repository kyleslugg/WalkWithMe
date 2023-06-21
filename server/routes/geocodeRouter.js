import path from 'path';
import { Router } from 'express';
import geocodeController from '../controllers/geocodeController.js';
const router = new Router();

router.get('/:queryString', geocodeController.geocodeAddress, (req, res) => {
  res
    .status(200)
    .header('Content-Type', 'application/json')
    .json(res.locals.latlong);
});

export default router;
