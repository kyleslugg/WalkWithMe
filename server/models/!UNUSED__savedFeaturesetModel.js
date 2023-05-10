const mongoose = require('mongoose');

const mongoURI =
  process.env.NODE_ENV === 'production'
    ? 'mongodb://localhost/walkingRoutesProd'
    : 'mongodb://localhost/walkingRoutesTest';

mongoose.connect(mongoURI);

const featuresetSchema = new mongoose.Schema({
  name: String,
  features: []
});
