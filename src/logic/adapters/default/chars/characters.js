import Sequelize from 'sequelize';
import ACL from '@/logic/ACL';
import {applyMiddlewares} from '@/service/helpers';

const RECOVER_CHAR_ACCOUNT = 5;

const Op = Sequelize.Op;

/**
 * @instance
 * @param dbId
 * @param dbVal
 * @param {Sequelize} sequelize
 * @param {any} models
 * @param {Object.<string, Sequelize.Model>} appModels
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  const characters = models[dbId]['characters'];
  const accountDbId = dbVal['accountDbId'];

  characters.associate = () => {
    characters.belongsTo(models[accountDbId].account, {
      as: 'charAccount',
      foreignKey: 'account',
      sourceKey: 'guid',
    });
    models[accountDbId].account.hasMany(characters, {
      foreignKey: 'account',
      targetKey: 'guid',
    });
  };

  characters.graphql = {
    types: {
      debugCharacterOutput: {
        result: 'Boolean',
      },
      debugCharacterInput: {
        name: 'String!', // is it found by name?
      },
      recoveryCharacterInput: {
        id: 'Int!', // Character.guid
      },
      recoveryCharacterOutput: {
        account: 'Int',
      },
      retreiveCharsInput: {
        id: 'Int!',
      },
      retreiveDisposedCharsInput: {
        id: 'Int!',
      },
      countPlayerInput: {
        searchFor: 'String',
      },
      countPlayerOutput: {
        count: 'Int',
      },
      getPlayersInput: {
        limit: 'Int',
        offset: 'Int',
        searchFor: 'String',
      },
      getPlayerOutput: {
        character: 'String',
      },
    },
    excludeMutations: ['delete', 'create'],
    before: {
      update: ACL.isAllowed(
          ACL.roles.ROLE_USER,
          ACL.sameUser('characters', 'account'),
      ),
      fetch: applyMiddlewares(
          ACL.handleHierarchy({
            [ACL.roles.ROLE_USER]: {
              public: {
                fields: ['guid', 'account', 'name', 'gender'],
                inclusive: true,
              },
              private: {
                isSameUser: {model: 'characters', field: 'account'}, // also grants access if you're admin
                fields: ['level'],
                inclusive: true,
              },
            },
          }),
          ACL.setLimit(100),
      ),
    },
    queries: {
      retreiveDisposedChars: {
        input: 'retreiveDisposedCharsInput',
        output: '[characters]',
        resolver: async (obj, data, context, info) => {
          await ACL.sameUser('retreiveDisposedCharsInput', 'id')(
              obj,
              data,
              context,
              info,
          );

          const chars = await characters.findAll({
            where: {
              deleteInfos_Account: data.retreiveDisposedCharsInput.id,
              account: RECOVER_CHAR_ACCOUNT,
            },
          });

          return chars;
        },
      },
      retreiveChars: {
        input: 'retreiveCharsInput',
        output: '[characters]',
        resolver: async (obj, data, context, info) => {
          await ACL.sameUser('retreiveCharsInput', 'id')(
              obj,
              data,
              context,
              info,
          );

          const chars = await characters.findAll({
            where: {
              account: data.retreiveCharsInput.id,
            },
          });

          return chars;
        },
      },
      countPlayer: {
        input: 'countPlayerInput',
        output: 'countPlayerOutput',
        resolver: async (obj, data, context, info) => {
          const charsCount = await characters.count({
            where: {
              name: Sequelize.where(
                  Sequelize.fn('lower', Sequelize.col('name')),
                  {
                    [Op.like]: '%' + data.countPlayerInput.searchFor + '%',
                  },
              ),
            },
          });

          return {
            count: charsCount,
          };
        },
      },
      getPlayers: {
        input: 'getPlayersInput',
        output: '[characters]',
        resolver: async (obj, data, context, info) => {
          if (!data.getPlayersInput.limit) data.getPlayersInput.limit = 0;
          if (!data.getPlayersInput.offset) data.getPlayersInput.offset = 0;
          const chars = await characters.findAll({
            where: {
              name: Sequelize.where(
                  Sequelize.fn('lower', Sequelize.col('name')),
                  {
                    [Op.like]: data.getPlayersInput.searchFor,
                  },
              ),
            },
            limit: data.getPlayersInput.limit,
            offset: data.getPlayersInput.offset,
            order: [
              ['totalKills', 'DESC'],
              ['level', 'DESC'],
              ['name', 'ASC'],
            ],
          });

          return chars;
        },
      },
    },
    mutations: {
      debugCharacter: {
        output: 'debugCharacterOutput',
        input: 'debugCharacterInput',
        resolver: async (obj, data, context, info) => {
          // TODO: debug character
          if (data.debugCharacterInput.name) {
            return {
              result: true,
            };
          }

          return {
            result: false,
          };
        },
      },

      recoveryCharacter: {
        output: 'recoveryCharacterOutput',
        description: 'Recover your character',
        input: 'recoveryCharacterInput',
        resolver: async (source, data, context, info) => {
          const user = context.user;

          if (!user) {
            // throw new Error(Errors.notSignedIn);
          }

          const charData = data.recoveryCharacterInput;

          const numAcc = await characters.count({
            where: {
              account: user.id,
            },
          });

          // if (numAcc === 10) throw new Error(Errors.tooManyAccounts);
          if (numAcc > 10) {
            throw new Error(
                'CRITICAL ERROR! TOO MANY ACCOUNT FOR USER-ID: ' + user.id,
            );
          }

          const charRes = await characters.findOne({
            where: {
              deleteInfos_Account: user.id,
              guid: charData.id,
              account: RECOVER_CHAR_ACCOUNT,
            },
          });

          if (!charRes) {
            // throw new Error(Errors.noCharSelected);
          }

          await charRes.update({
            account: charRes.deleteInfos_Account,
            deleteInfos_Account: null,
          });

          return {
            account: charRes.account,
          };
        },
      },
    },
  };
}

/**
 * @param model
 */
function schemaAdapter(model) {
  return null;
}

export {dbAdapter, schemaAdapter};
