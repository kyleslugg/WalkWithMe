use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref TABLE_SPECS: HashMap<&'static str, TableSpec> = {
        let mut specs = HashMap::new();

        specs.insert(
            "TOPO_EDGES",
            TableSpec::new(
                "nyccsl_topo",
                "edge_data",
                "4326",
                "edge_id",
                "geom",
                "start_node, end_node",
            ),
        );

        specs.insert(
            "TOPO_NODES",
            TableSpec::new("nyccsl_topo", "node", "4326", "node_id", "geom", ""),
        );

        specs.insert(
            "EDGES",
            TableSpec::new(
                "public",
                "ways",
                "4326",
                "gid",
                "geom",
                "start_node, end_node",
            ),
        );

        specs.insert(
            "NODES",
            TableSpec::new(
                "public",
                "edge_data",
                "4326",
                "edge_id",
                "geom",
                "start_node, end_node",
            ),
        );
        return specs;
    };
}

#[derive(Default)]
pub struct TableSpec {
    schema: &'static str,
    tableid: &'static str,
    srid: &'static str,
    id_column: &'static str,
    geom_column: &'static str,
    attr_columns: &'static str,
}

impl TableSpec {
    fn new(
        schema: &'static str,
        tableid: &'static str,
        srid: &'static str,
        id_column: &'static str,
        geom_column: &'static str,
        attr_columns: &'static str,
    ) -> Self {
        Self {
            schema,
            tableid,
            srid,
            id_column,
            geom_column,
            attr_columns,
        }
    }
}
