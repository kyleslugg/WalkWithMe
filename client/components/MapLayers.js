import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { Fill, Stroke, Style, Circle } from 'ol/style.js';

const layers = {};

const styles = {};

const sources = {};

//Define vector tile layer sources
sources.edges = new VectorTileSource({
  format: new MVT(),
  url: '/layers/edges/{z}/{x}/{y}.mvt'
});

sources.nodes = new VectorTileSource({
  format: new MVT(),
  url: '/layers/ways_vertices_pgr/{z}/{x}/{y}.mvt'
});

sources.nyccsl = new VectorTileSource({
  format: new MVT(),
  url: '/layers/nyccsl/{z}/{x}/{y}.mvt'
});

//Define vector tile layer styles

styles.edges = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 2
  })
});

styles.nodes = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: 'grey',
      width: 1
    }),
    fill: new Fill({
      color: 'blue'
    }),
    radius: 3
  })
});

styles.nyccsl = new Style({
  stroke: new Stroke({
    color: 'green',
    width: 4
  })
});

//Define Vector Layers

layers.edges = new VectorTileLayer({
  minZoom: 14,
  opacity: 0.5,
  source: sources.edges,
  style: styles.edges
});

layers.nodes = new VectorTileLayer({
  minZoom: 14,
  opacity: 0.5,
  source: sources.nodes,
  style: styles.nodes
});

layers.nyccsl = new VectorTileLayer({
  minZoom: 14,
  opacity: 0.5,
  source: sources.nyccsl,
  style: styles.nyccsl
});

export default layers;
