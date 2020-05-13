import * as account from './account';
import * as accountAccess from './accountAccess';

/**
 * @param model
 */
function schemaAdapter(model) {
  account.schemaAdapter(model);
  accountAccess.schemaAdapter(model);
}

/**
 * @param dbId
 * @param dbVal
 * @param sequelize
 * @param models
 * @param appModels
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  account.dbAdapter(dbId, dbVal, sequelize, models, appModels);
  accountAccess.dbAdapter(dbId, dbVal, sequelize, models, appModels);
}

export {
  schemaAdapter,
  dbAdapter,
};
