mod table_specs;
use table_specs;
use axum::extract::Path;
use axum_macros::debug_handler;

pub struct Tile {
  z: isize,
  x: isize,
  y: isize
}

#[debug_handler]
pub async fn get_layer(Path((tableid, x, y, z)): Path<(String, isize, isize, usize)>){

}