

use axum::{Json, extract::{Path}};
use serde::{Serialize, Deserialize, Deserializer, de};
use serde_json::{json, Value};
use reqwest::{Error, Client, header::{HeaderMap, HeaderName, HeaderValue}};
use std::{env, num::ParseFloatError};
use axum_macros::debug_handler;


//Error handling here is awful. Clean up after getting the shell working.

fn deserialize_to_f64<'de, D: Deserializer<'de>>(d: D) -> Result<f64, D::Error> {
  Ok(match Value::deserialize(d)? {
    Value::String(s) => s.parse().map_err(de::Error::custom)?,
    Value::Number(num) => num.as_f64().ok_or(de::Error::custom(""))?,
    _ => return Err(de::Error::custom(""))
  })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GeocoderResult {
  #[serde(deserialize_with = "deserialize_to_f64")]
  lat: f64,
  #[serde(deserialize_with = "deserialize_to_f64")]
  lon: f64,
}


async fn call_geocoder_api(queryString: String) -> GeocoderResult {
  let api_key: &'static str = dotenv!("GEOCODER_API_KEY");
  let request_url = format!("https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q={queryString}", queryString = &queryString);

  let mut headers = HeaderMap::new();
  headers.insert(HeaderName::from_static("x-rapidapi-key"), HeaderValue::from_static(api_key));
  headers.insert(HeaderName::from_static("x-rapidapi-host"), HeaderValue::from_static("forward-reverse-geocoding.p.rapidapi.com"));
  
  let response = Client::new().get(request_url).headers(headers).send().await.unwrap();
  let data = response.json::<Vec<GeocoderResult>>().await.unwrap().into_iter().next().unwrap();

  return data;


}

#[debug_handler]
pub async fn get_latlong(Path(queryString): Path<String>) -> Json<GeocoderResult> {
  let response: GeocoderResult = call_geocoder_api(queryString).await;
  println!("{:?}", response);
  return Json(response);
}

