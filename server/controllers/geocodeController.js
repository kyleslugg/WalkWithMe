import fetch from 'node-fetch';
const geocodeController = {};

const createError = (method, log, status, message = log) => {
  return {
    log: `Encountered error in geocodeController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

geocodeController.geocodeAddress = async function (req, res, next) {
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
            createError(
              'geocodeAddress',
              'Geocoder returns no results for provided query string',
              400
            )
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
          createError(
            'geocodeAddress',
            `Encountered error when calling geocode API: ${err}`,
            500
          )
        );
      });
  }
};

export default geocodeController;
