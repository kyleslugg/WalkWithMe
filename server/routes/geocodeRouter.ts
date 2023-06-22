import path from 'path';
import { Router, Request, Response } from 'express';
import geocodeController from '../controllers/geocodeController.js';
const router = Router();

router.get(
  '/:queryString',
  geocodeController.geocodeAddress,
  (req: Request, res: Response) => {
    res
      .status(200)
      .header('Content-Type', 'application/json')
      .json(res.locals.latlong);
  }
);

export default router;
