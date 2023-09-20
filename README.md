# WalkWithMe

## _Be Open to the Unexpected_

WalkWithMe is a route planner based on [POSTGIS](https://postgis.net/) and [OpenLayers](https://openlayers.org/) that is tailored to neighborhood walking paths. Coverage is currently limited to New York City, but can be expanded to additional locations with the use of OpenStreetMap feature extracts and/or locally maintained street grid geodata.

### The Latest:
__Walk routing is available now__. To use, please pass the `--recurse-submodules` flag when cloning this repository, which will load the [Speedicycle](https://github.com/StrideStreets/speedicycle) binary (and source code, for optional experimentation). The component for saving user-defined paths has been removed temporarily in preparation for an upcoming release, but can be included with alterations to the component tree in `App.tsx` and will be restored in coming releases.

## Overview

<img align="right" src="assets/frontend.png" height="400px">
WalkWithMe consists of two modules, which may be adapted and used independently. The first is a streamlined, extensible web map interface built using custom React components wrapping portion of the OpenLayers web mapping API (in particular, specialized components for map layers and layer groups). At present, this interface includes save-and-load functionality for user-defined walking paths -- or, if additional layers are added as described below, arbitrary groupings of vector features of any type.

### Backend: Express, PostGIS, and the Mapbox Vector Tile specification

All geodata -- including prepackaged base maps from OpenStreetMap and custom vector and/or raster datasets -- are obtained from a lightweight server built in Express.js, which in turn takes advantage of the geodata storage and processing capabilities of PostGIS (the geospatial extension to PostgreSQL).

#### Server Structure
**Note: Migration to [RustyMVT](https://github.com/kyleslugg/RustyMVT) is in progress**

The primary task of the WalkWithMe server is to, when provided with web map coordinates conformant to the [MapBox Vector Tile](https://docs.mapbox.com/data/tilesets/guides/vector-tiles-introduction/) specification, retrieve, process, and appropriately package underlying vector data for a particular area of the earth's surface. (In this application, the most relevant vector sources represent roads or other paths.) This is accomplished in three steps, contained within the `layerExtentsController` module:

1. Coordinates representing the web map's zoom level and the local `x` and `y` position of the corresponding map tile are converted to absolute geographic coordinates in the WGS 84 Pseudo-Mercator projection, known colloquially as the "Web Mercator" projection. This is accomplished through a call to PostGIS' [ST_TileEnvelope](https://postgis.net/docs/en/ST_TileEnvelope.html) and ST_MakeEnvelope methods.
2. Via a query to the underlying Postgres/PostGIS database, all features within these bounds are selected from the relevant layer. These features are converted to the Vector Tile format using PostGIS' [ST_AsMVTGeom](https://postgis.net/docs/en/ST_AsMVTGeom.html) method.
3. Results of this query are packaged as a ProtoBuf for easy transfer to the frontend, where they are consumed by OpenLayers' Vector Tile API.

Saving and retrieval of user-defined feature groups is handled through more conventional means, using the GeoJSON specification.

The generation of fixed-length walking routes from a node selected on the frontend is handled through the `routingController` module and subroutines, which function by:
1. Retrieving streets as nodes and edges within a certain distance of the starting node from the PostGIS database;
2. Processing those features into the DIMACS format required by Speedicycle;
3. Calling the Speedicycle binary; and
4. Processing the resulting path into a set of GeoJSON features using PostGIS.

The resulting features are then loaded on the frontend, in the same manner as user-defined features.


#### PostGIS Setup

While a more detailed guide to database setup is in the works, major points to note and suggested resources are as follows:

1. The PostGIS Project itself provides a [comprehensive guide](https://postgis.net/docs/en/index.html) to installing and enabling geospatial capabilities in PostgreSQL. This should be the first stop for anyone interested in making use of this repository.
2. Geodata are available from a variety of sources, which vary depending on the geographic area of interest. Many cities maintain their own public geodatasets, such as the [New York City Street Centerlines](https://data.cityofnewyork.us/City-Government/NYC-Street-Centerline-CSCL-/exjm-f27b) data used in this application.
3. OpenStreetMap provides a dizzying array of feature data, including user-submitted place-of-interest data. The following tools are particularly useful when extracting subsets of those data for personal use:
   1. The [osmconvert](https://wiki.openstreetmap.org/wiki/Osmconvert) command line tool allows filtering of OSM extracts by geographic extent, feature type, and numerous other attributes, as well as conversion between commonly used data types.
   2. The [osmfilter](https://wiki.openstreetmap.org/wiki/Osmfilter) tool extends `osmconvert`'s attribute-based filtering capabilities.
   3. The incomparable [Tristram Gräbener](https://github.com/Tristramg)'s [osm4routing](https://github.com/Tristramg/osm4routing) tool is indispensable when converting OSM data to topological formats useful for path routing.

### Development Roadmap

As noted above, the selection, saving, and loading of user-defined paths has been removed temporarily in favor of the autorouting component in preparation for an upcoming UI redesign. This functionality will be restored in coming releases.

Up next is:
1. The deployment of a sample database and frontend using NYC Street Centerlines. The present version will be deployed first, followed by the updated UI when ready.
2. Replacement of the current TypeScript backend with my Rust-based map vector tile server [RustyMVT](https://github.com/kyleslugg/RustyMVT), to improve performance and integration with Speedicycle.
3. Elimination of the disk IO operations associated with routing calls, in tandem with the development of additional IO formats in Speedicycle.

Within the next month, ownership of this project may be transferred to (or shared with) Stride, the organization that I have created to centralize my geospatial tooling. Additional updates to come.


### In Conclusion...

Although this remains a work in progress, I hope that the MVT server, in particular, can be useful to those of you working on similar applications. Any thoughts, comments, questions, or suggestions are more than welcome -- please submit an issue above, or reach out via my [LinkedIn](https://www.linkedin.com/in/kyle-slugg/) or [personal website](https://kyleslugg.co/). My thanks; good luck; and happy mapping!
