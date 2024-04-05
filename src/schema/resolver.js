import _ from "lodash";

const reserved = ["ObjectId", "String", "Date", "DateTime", "Number"];

export const resolver = async (object, context, graph) => {
  const resolvedFields = await resolveFields(object, context, graph);
  const resolvedIncludes = await resolveIncludes(object, context, graph);
  if (!resolvedFields && !resolvedIncludes) return null;

  return Object.assign(resolvedFields || {}, resolvedIncludes || {});
};
async function resolveIncludes(object, context, graph) {
  const {
    type,
    fields,
    info = { allTypes: {}, allResolvers: {} },
    depth = 0,
  } = graph;
  if (!object) return object;
  const serializedObj = {};
  const allResolvers = info.allResolvers[type];
  const { filteredInclude } = info;
  const schemaInclude = depth === 0 ? filteredInclude : fields;
  const resolvingInclude = filterIncludeKeys(
    schemaInclude,
    info.allTypes[type].include
  );

  await Promise.all(
    Object.keys(resolvingInclude).map(async (key) => {
      if (resolvingInclude[key] === undefined) return;

      const resolveFn = allResolvers[key] || defaultResolveFunction;
      const rawValue = await executeResolver(resolveFn, [
        object,
        context,
        { key },
      ]);

      if (depth >= 2 || rawValue === null || rawValue === undefined) {
        serializedObj[key] = rawValue;
        return;
      }

      // has many
      if (_.isArray(resolvingInclude[key]) && _.isArray(rawValue)) {
        if (
          filteredInclude !== undefined &&
          filteredInclude[key] === undefined &&
          depth === 0
        )
          return;
        let subFilterKeys = filteredInclude
          ? { fields: filteredInclude[key] }
          : {};

        if (rawValue.length === 0) {
          serializedObj[key] = [];
          return;
        }

        const [nestedSchema] = resolvingInclude[key];
        if (nestedSchema) {
          const refinedValue = await Promise.all(
            rawValue.map(async (value) => {
              return await resolver(value, context, {
                ...subFilterKeys,
                type: nestedSchema,
                info,
                depth: depth + 1,
              });
            })
          );
          serializedObj[key] = refinedValue;
        } else {
          serializedObj[key] = rawValue;
        }
        return;
      }

      // has one
      if (
        _.isString(resolvingInclude[key]) &&
        !reserved.includes(resolvingInclude[key])
      ) {
        if (
          filteredInclude !== undefined &&
          filteredInclude[key] === undefined &&
          depth === 0
        )
          return;
        let subFilterKeys = filteredInclude
          ? { fields: filteredInclude[key] }
          : {};
        if (depth >= 1) subFilterKeys = {};

        const nestedSchema = resolvingInclude[key];
        if (nestedSchema && info.allTypes[nestedSchema]) {
          const refinedValue = await resolver(rawValue, context, {
            ...subFilterKeys,
            type: nestedSchema,
            info,
            depth: depth + 1,
          });
          serializedObj[key] = refinedValue;
        } else {
          serializedObj[key] = rawValue;
        }
        return;
      }
    })
  );

  return serializedObj;
}

async function resolveFields(object, context, graph) {
  const {
    type,
    fields,
    info = { allTypes: {}, allResolvers: {} },
    depth = 0,
  } = graph;
  if (!object) return object;
  const serializedObj = {};
  const allResolvers = info.allResolvers[type];
  const { filteredFields } = info;
  const schemaFields = depth === 0 ? filteredFields : fields;
  const resolvingFields = filterKeys(schemaFields, info.allTypes[type].fields);

  await Promise.all(
    Object.keys(resolvingFields).map(async (key) => {
      if (resolvingFields[key] === undefined) return;

      const resolveFn = allResolvers[key] || defaultResolveFunction;
      const rawValue = await executeResolver(resolveFn, [
        object,
        context,
        { key },
      ]);

      if (depth >= 2 || rawValue === null || rawValue === undefined) {
        serializedObj[key] = rawValue;
        return;
      }

      if (_.isString(resolvingFields[key])) {
        serializedObj[key] = parsePrimitiveValue(
          rawValue,
          resolvingFields[key]
        );
        return serializedObj[key];
      }
    })
  );

  return serializedObj;
}
