import query from '../models/geodataModel.js';
import tableSpecs from '../models/tableSpecs.js';
import { Controller, JSON, MiddlewareErrorSpec } from '../../types.js';
import { Request, Response, NextFunction, RequestHandler } from 'express';
const { FEATURE_GROUPS } = tableSpecs;

const featureGroupController: Controller<RequestHandler> = {};

const formatGroupName = (name: String) => {
  return name.toLowerCase().replaceAll(/[^\w]+/gi, '_');
};

const createError = (options: MiddlewareErrorSpec) => {
  const { method, log, status, message } = options;
  return {
    log: `Encountered error in featureGroupController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

featureGroupController.getAllFeatureGroups = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const queryString = `select json_agg(s.geoms)
  // from (
  //   select st_asgeojson(t.*)::json as geoms
  //   from (select c.id, c.name, ST_Transform(c.geom, 3857) as geom
  //   from custom_feature_groups c
  //   ) t
  // ) s`;
  const queryString = 'select id, name, orig_name from custom_feature_groups';
  //FIXME: Solve PG typing
  //@ts-ignore
  query(queryString).then((response: JSON) => {
    //res.locals.allCustomFeatureGroups = response.rows[0].json_agg;
    res.locals.allCustomFeatureGroups = response.rows;
    return next();
  });
};

featureGroupController.getFeatureGroupByID = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const queryString = `SELECT st_asgeojson(t.*)::json as geoms 
  from (
    SELECT c.id, c.name, ST_Transform(c.geom, 3857) as geom 
    FROM custom_feature_groups c) t 
  where t.id = ${id}`;
  //FIXME: Solve PG typing
  //@ts-ignore
  query(queryString).then((response: { [s: string]: any }) => {
    if (response.rowCount === 0) {
      return next(
        createError({
          method: 'getFeatureGroupByID',
          log: 'No featuregroup found with provided ID',
          status: 400
        })
      );
    }
    res.locals.retrievedFeatureGroup = response.rows[0].geoms;
    return next();
  });
};

featureGroupController.saveFeatureGroup = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { groupName, featureIds, sourceTableId, idField } = req.body;
  console.log(req.body);
  if (!featureIds || !sourceTableId || !idField || groupName == '') {
    return next(
      createError({
        method: 'saveFeatureGroup',
        log: 'Request missing feature IDs, source table ID, or feature ID field',
        status: 400
      })
    );
  }
  const { table, geomColumn } = tableSpecs[sourceTableId.toUpperCase()];
  const formattedGroupName = formatGroupName(groupName);
  const queryString = `INSERT INTO ${
    FEATURE_GROUPS.table
  } (name, orig_name, geom)
  VALUES ('${formattedGroupName}', '${groupName}',
    ST_Collect(
      ARRAY( 
        SELECT ${geomColumn} 
        FROM ${table} t 
        WHERE t.${idField} in (${featureIds.join(', ')})
        )
      )
    ) RETURNING name, orig_name, id`;
  //FIXME: Solve PG typing
  //@ts-ignore
  query(queryString).then((result: { [s: string]: any }) => {
    res.locals.saveResult = result.rows[0];
    return next();
  });
};

export default featureGroupController;
