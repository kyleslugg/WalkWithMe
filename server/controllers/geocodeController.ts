import fetch from 'node-fetch';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Controller, MiddlewareErrorSpec } from '../../types';
const geocodeController: Controller<RequestHandler> = {};

const createError = (errorSpec: MiddlewareErrorSpec) => {
  const { method, log, status, message } = errorSpec;
  return {
    log: `Encountered error in geocodeController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

geocodeController.geocodeAddress = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { queryString } = req.params;
  //console.log(process.env.GEOCODER_API_KEY);
  if (queryString) {
    //console.log(`Querying geocoder with query string ${queryString}`);
    fetch(
      `https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=${encodeURIComponent(
        queryString
      )}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.GEOCODER_API_KEY,
          'X-RapidAPI-Host': 'forward-reverse-geocoding.p.rapidapi.com'
        }
      }
    )
      .then((result) => {
        //console.log('Parsing geocoder response...');
        return result.json();
      })
      .then((data) => {
        //console.dir(data);
        if (!data[0]) {
          //console.log('No results from geocoder -- returning error.');
          return next(
            createError({
              method: 'geocodeAddress',
              log: 'Geocoder returns no results for provided query string',
              status: 400
            })
          );
        }
        res.locals.latlong = {
          latitude: Number(data[0].lat),
          longitude: Number(data[0].lon)
        };
        return next();
      })
      .catch((err) => {
        return next(
          createError({
            method: 'geocodeAddress',
            log: `Encountered error when calling geocode API: ${err}`,
            status: 500,
            message: 'Encountered error when calling geocode API'
          })
        );
      });
  }
};

export default geocodeController;
