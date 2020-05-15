import * as characters from './characters';
import * as guild from './guild';

/**
 * @param model
 */
function schemaAdapter(model) {
  characters.schemaAdapter(model);
  guild.schemaAdapter(model);
}

/**
 * @param dbId
 * @param dbVal
 * @param sequelize
 * @param models
 * @param appModels
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  characters.dbAdapter(dbId, dbVal, sequelize, models, appModels);
  guild.dbAdapter(dbId, dbVal, sequelize, models, appModels);
}

export {
  schemaAdapter,
  dbAdapter,
};
