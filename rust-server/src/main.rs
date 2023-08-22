use axum::{routing::get, Router};

mod geocoding;
use geocoding::get_latlong;

mod layers;
use layers::get_layer;

#[macro_use]
extern crate dotenv_codegen;

#[tokio::main]
async fn main(){
    let app = Router::new()
        .route("/geocode/:queryString", get(get_latlong))
        .route("/layers/:tableid/:z/:x/:y.mvt", get(get_layer));

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
