import { join } from 'path';
import express, { Request, Response, NextFunction, Router } from 'express';
import layersRouter from './routes/layersRouter.js';
import geocodeRouter from './routes/geocodeRouter.js';
import routingRouter from './routes/routingRouter.js';
import dotenv from 'dotenv';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config();

const app = express();

const PORT = 3000;

/**
 * handle parsing request body
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * handle requests for static files
 */
//app.use(express.static(path.resolve(__dirname, '../client')));

/**
 * Serve root path
 */

if (process.env.NODE_ENV === 'production') {
  app.get('/', (req: Request, res: Response) => {
    res.status(200).sendFile(join(__dirname, '../dist/index.html'));
  });
  app.use('/', express.static(join(__dirname, '../dist')));
} else {
  app.use('/', express.static(join(__dirname, '../client')));
  app.get('/', (req, res) => {
    res.status(200).sendFile(join(__dirname, '../client/index.html'));
  });
}

/**
 * Redirect to layers router if request for layer data comes in
 */
app.use('/layers', layersRouter);

/**
 * Redirect to routing router if routing-related request comes in
 */
app.use('/routes', routingRouter);

/**
 * Handle geolocation lookups from geocodeController

*/

app.use('/geocode', geocodeRouter);

// catch-all route handler for any requests to an unknown route
app.use((req: Request, res: Response) =>
  res.status(404).send("This is not the page you're looking for...")
);

/**
 * express error handler
 * @see https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
 */

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' }
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

/**
 * start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});

export default app;
