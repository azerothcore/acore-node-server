import Sequelize from 'sequelize';
import '@this/src/defs/jsdoc';
// import {  applyMiddlewares} from '@hw-core/node-platform/src/libs/apiHelpers';
import ACL from '@this/src/system/ACL';

/**
 * @instance
 * @param dbId
 * @param dbVal
 * @param {Sequelize} sequelize
 * @param {Object.<string, Sequelize.Model>} models
 * @param {Object.<string, Sequelize.Model>} appModels
 */
function dbAdapter(dbId, dbVal, sequelize, models /* , appModels*/) {
  const accountAccess = models[dbId].accountAccess;
  accountAccess.graphql = {
    before: {
      create: ACL.isAllowed([ACL.roles.ROLE_SUPERADMIN]),
      delete: ACL.isAllowed([ACL.roles.ROLE_SUPERADMIN]),
      update: ACL.isAllowed([ACL.roles.ROLE_SUPERADMIN]),
      fetch: ACL.isAllowed(
          ACL.roles.ROLE_USER,
          ACL.sameUser('accountAccess', 'id'),
      ),
    },
  };

  models[dbId].account.hasMany(models[dbId].accountAccess, {
    foreignKey: 'id',
  });

  models[dbId].accountAccess.belongsTo(models[dbId].account, {
    foreignKey: 'id',
  });
}

/**
 * @param model
 */
function schemaAdapter(model) {
  /* const filter = (subtree) => {
        const newSelectionSet = {
            kind: Kind.SELECTION_SET,
            selections: subtree.selections.map(selection => {
                if (selection.name.value == "sha_pass_hash") {
                    throw new ForbiddenError('You cannot ask for password!');
                }

                return selection;
            })
        };
        return newSelectionSet;
    }

    model._graphschema = transformSchema(model._graphschema, [
        // Wrap document takes a subtree as an AST node
        new WrapQuery(
            ["account"], filter, result => result
        ),
        new WrapQuery(
            ["accounts"], filter, result => result
        ),
    ]);*/
}

export {dbAdapter, schemaAdapter};
