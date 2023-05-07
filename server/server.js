const path = require('path');
const express = require('express');
const layersRouter = require('./routes/layersRouter');

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

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/styles.css', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../client/styles.css'));
});

app.get('/ol.css', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../client/ol.css'));
});

/**
 * Redirect to layers router if request for layer data comes in
 */
app.use('/layers', layersRouter);

// catch-all route handler for any requests to an unknown route
app.use((req, res) =>
  res.status(404).send("This is not the page you're looking for...")
);

/**
 * express error handler
 * @see https://expressjs.com/en/guide/error-handling.html#writing-error-handlers
 */

app.use((err, req, res, next) => {
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

module.exports = app;
