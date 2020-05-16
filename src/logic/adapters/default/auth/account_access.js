import Sequelize from 'sequelize';
// import {applyMiddlewares} from '@hw-core/node-platform/src/libs/apiHelpers';
import ACL from '@/logic/ACL';

/**
 * @instance
 * @param dbId
 * @param dbVal
 * @param {Sequelize} sequelize
 * @param {any} models
 */
function dbAdapter(dbId, dbVal, sequelize, models /* , appModels*/) {
  const accountAccess = models[dbId].account_access;
  accountAccess.graphql = {
    before: {
      create: ACL.isAllowed([ACL.roles.ROLE_SUPERADMIN]),
      delete: ACL.isAllowed([ACL.roles.ROLE_SUPERADMIN]),
      update: ACL.isAllowed([ACL.roles.ROLE_SUPERADMIN]),
      fetch: ACL.isAllowed(
          ACL.roles.ROLE_USER,
          ACL.sameUser('account_access', 'id'),
      ),
    },
  };

  models[dbId].account.hasMany(models[dbId].account_access, {
    foreignKey: 'id',
  });

  models[dbId].account_access.belongsTo(models[dbId].account, {
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
