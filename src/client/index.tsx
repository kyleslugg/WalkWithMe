//http://project-osrm.org/docs/v5.24.0/api/?language=cURL#route-service
//Note -- max alternatives is 3

// const ORS_TOKEN = '5b3ce3597851110001cf62489e5404408e3a417fb63fe50dca96b4e4';

// const routeQueryURI = `http://router.project-osrm.org/route/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?overview=false&alternatives=3`;

// console.time('Request to OSRM');

// fetch(routeQueryURI).then((resp) => {
//   console.timeEnd('Request to OSRM');
//   console.dir(resp);
// });
import React from 'react';
import { createRoot } from 'react-dom/client';
//import { BrowserRouter } from 'react-router-dom';
import App from './App';

const mapCanvas = document.getElementById('map-canvas');
if (mapCanvas) {
  createRoot(mapCanvas).render(<App />);
}
