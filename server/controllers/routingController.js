//import d3 from 'd3';
import query from '../models/geodataModel.js';
import tableSpecs from '../models/tableSpecs.js';

//console.dir(test_data);
const formatEdgesNodes = 0;

const routingController = {};

routingController.formatEdgesNodes = async (req, res, next) => {
  const test_data = await query(
    'select t.edge_id, t.start_node, t.end_node from temp.bk_test t'
  );
  console.dir(test_data.rows);
  return next();
};

export default routingController;
