import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';

const mapCanvas = document.getElementById('map-canvas');
if (mapCanvas) {
  createRoot(mapCanvas).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}
