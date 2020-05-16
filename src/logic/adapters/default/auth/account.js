import Sequelize from 'sequelize';
import Mailer from '@/service/utils/mailer';
import {applyMiddlewares, validateEmail} from '@/service/helpers';
import bcrypt from 'bcryptjs';
import sha1 from 'sha1';
import jsonwebtoken from 'jsonwebtoken';
import {conf} from '@/conf';
import {
  syncWithGame,
  isPasswordValid,
  isUsernameValid,
  isEmailValid,
  normalizeCredentials,
} from '../Utils';
import {app} from '@/service/boot/express';
import ACL from '@/logic/ACL';
import {CustomErrors} from '@/logic/CustomErrors';

/**
 * @instance
 * @param dbId
 * @param dbVal
 * @param {Sequelize} sequelize
 * @param {Object.<string, Sequelize.Model>} models
 * @param {any} appModels heck fiex
 */
function dbAdapter(dbId, dbVal, sequelize, models, appModels) {
  const account = models[dbId]['account'];

  account.graphql = {
    attributes: {
      exclude: {
        // changed
        create: [],
        fetch: ['sha_pass_hash'],
      },
    },
    excludeMutations: ['create', 'destroy', 'update'],
    types: {
      newAccountOutput: {
        token: 'String',
        id: 'Int',
      },
      newAccountInput: {
        username: 'String!',
        email: 'String!',
        password: 'String!',
      },
      login: {
        wpToken: 'String',
        token: 'String',
        id: 'Int',
        gmlevel: 'Int',
        email: 'String',
      },
      loginInput: {
        username: 'String!',
        password: 'String!',
      },
      recovery: {
        message: 'String',
      },
      recoveryInput: {
        email: 'String!',
      },
      changePsw: {
        message: 'String',
      },
      changePswInput: {
        oldPass: 'String!',
        newPass: 'String!',
      },
      changeEmail: {
        message: 'String',
      },
      changeEmailInput: {
        newEmail: 'String!',
      },
      resendConf: {
        message: 'String',
      },
      resendConfInput: {
        email: 'String!',
      },
      getUsernameOutput: {
        username: 'String',
      },
      getUsernameInput: {
        id: 'Int!',
      },
    },
    before: {
      fetch: applyMiddlewares(
          ACL.isAllowed(ACL.roles.ROLE_USER, ACL.sameUser(null, 'id')),
      ),
    },
    queries: {
      getUsername: {
        output: 'getUsernameOutput',
        description: 'Get user name from id',
        input: 'getUsernameInput',
        resolver: async (obj, data, context /* , info*/) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          return {
            username: user.username,
          };
        },
      },
    },
    mutations: {
      newAccount: {
        output: 'newAccountOutput',
        description: 'Create a new account',
        input: 'newAccountInput',
        resolver: async (obj, data, context, info) => {
          // newAccountInput.username, newAccountInput.email, newAccountInput.password
          const signup = data.newAccountInput;
          // normalize Username and Password
          signup.username = normalizeCredentials(signup.username);
          signup.password = normalizeCredentials(signup.password);

          // check lengths
          isPasswordValid(signup.password);
          isUsernameValid(signup.username);
          isEmailValid(signup.email);

          // check if it's an email and from listed domains.
          if (!validateEmail(signup.email, ['gmail.com'])) {
            throw Error(CustomErrors.invalidEmail);
          }

          const username = await models[dbId]['account'].findOne({
            where: {
              username: signup.username,
            },
          });
          if (username) throw Error(CustomErrors.invalidUsername);
          const mail = await models[dbId]['account'].findOne({
            where: {
              email: signup.email,
            },
          });

          if (mail) throw Error(CustomErrors.invalidEmail);

          const pass = await sha1(signup.username + ':' + signup.password);

          const acc = await account.create({
            username: signup.username,
            sha_pass_hash: pass,
            email: signup.email,
            reg_mail: signup.email,
            joindate: new Date(),
            last_login: new Date(),
            locked: 1,
            last_ip: '127.0.0.1',
          });

          const activationToken = await sha1(acc.id + ':' + acc.email).replace(
              /[/.]/g,
              '',
          );

          syncWithGame(appModels, acc.id, '', activationToken);

          const _token = jsonwebtoken.sign(
              {
                id: acc.id,
              },
              conf.secret,
              {
                expiresIn: '30d',
              },
          );

          const email = new Mailer(conf.mailer);
          email.sendConfirmation(activationToken, acc.email, acc.id);

          return {
            id: acc.id,
            token: _token,
          };
        },
      },
      authorize: {
        output: 'login',
        description: 'Authorize an account',
        input: 'loginInput',
        resolver: async (source, data, context) => {
          const login = data.loginInput;
          const _wpToken = jsonwebtoken.sign(
              {
                username: data.loginInput.username,
                password: data.loginInput.password,
              },
              conf.wp_secret,
              {
                expiresIn: '30d',
              },
          );
          // normalize Username and Password
          login.username = normalizeCredentials(login.username);
          login.password = normalizeCredentials(login.password);

          const res = await models[dbId]['account'].findOne({
            attributes: ['id', 'email'],
            where: {
              username: login.username,
              sha_pass_hash: sha1(login.username + ':' + login.password),
            },
            include: [
              {
                attributes: ['gmlevel'],
                model: models[dbId]['account_access'],
                where: {
                  [Sequelize.Op.or]: [
                    {
                      RealmId: 1,
                    },
                    {
                      RealmId: -1,
                    },
                  ],
                },
                required: false,
              },
            ],
            raw: true,
          });

          if (!res) {
            const isEmail = login.username.match(
                /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i,
            );
            if (isEmail) {
              throw Error(CustomErrors.invalidLoginIsEmail);
            } else {
              const checkUsername = await models[dbId]['account'].findOne({
                attributes: ['id'],
                where: {
                  username: login.username,
                },
                include: [
                  {
                    attributes: ['gmlevel'],
                    model: models[dbId]['account_access'],
                    where: {
                      [Sequelize.Op.or]: [
                        {
                          RealmId: 1,
                        },
                        {
                          RealmId: -1,
                        },
                      ],
                    },
                    required: false,
                  },
                ],
                raw: true,
              });
              if (!checkUsername) {
                throw Error(CustomErrors.invalidLoginBadUsername);
              } else {
                throw Error(CustomErrors.invalidLoginBadPassword);
              }
            }
          }

          const _token = jsonwebtoken.sign(
              {
                id: res.id,
              },
              conf.secret,
              {
                expiresIn: '30d',
              },
          );

          return {
            id: res.id,
            gmlevel: res['account_accesses.gmlevel'] || 0,
            token: _token,
            wpToken: _wpToken,
            email: res.email,
          };
        },
      },
      recoverPassword: {
        // RECOVER PASSWORD MUTATION
        output: 'recovery',
        description: 'Recover user password from email',
        input: 'recoveryInput',
        resolver: async (obj, data, context, info) => {
          if (data.recoveryInput.email.length === 0) {
            throw Error(CustomErrors.invalidEmail);
          }
          const saltRounds = 8;

          const user = await account.findOne({
            where: {
              email: data.recoveryInput.email,
            },
            attributes: ['email', 'id'],
          });
          if (!user) throw Error(CustomErrors.invalidEmail);

          let userApp = await appModels.User.findOne({
            where: {
              id: user.id,
            },
            attributes: ['recoveryToken'],
          });

          if (!userApp) {
            userApp = syncWithGame(appModels, user.id, '', '');
          }

          userApp.recoveryToken = await bcrypt.hash(user.email, saltRounds); // hashes email token for activation
          userApp.recoveryToken = userApp.recoveryToken
              .replace(/[/.]/g, '')
              .substring(0, 60); // to prevent slashes in the activation url
          await appModels.User.update(
              {
                recoveryToken: userApp.recoveryToken,
              },
              {
                where: {
                  id: user.id,
                },
              },
          );

          const email = new Mailer(conf.mailer);
          email.sendRecovery(userApp.recoveryToken, user.email);

          return {
            message: 'Done',
          };
        },
      },
      changePassword: {
        // CHANGE PASSWORD MUTATION
        output: 'changePsw',
        description: 'Change Password',
        input: 'changePswInput',
        resolver: async (obj, data, context /* , info*/) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const change = data.changePswInput;

          // normalize
          change.newPass = normalizeCredentials(change.newPass);
          change.oldPass = normalizeCredentials(change.oldPass);
          user.username = normalizeCredentials(user.username);
          isPasswordValid(change.newPass);

          const oldPass = sha1(user.username + ':' + change.oldPass);
          if (oldPass !== user.sha_pass_hash) {
            throw Error(CustomErrors.wrongOldPass);
          }
          const newPass = sha1(user.username + ':' + change.newPass);
          await account.update(
              {
                sha_pass_hash: newPass,
                // we must reset following field because the game server uses an SRP6 protocolo
                // to handle authentication. So v and s must be regenerated by the server.
                v: 0,
                s: 0,
              },
              {
                where: {
                  id: user.id,
                },
              },
          );
          return {
            message: 'Done',
          };
        },
      },
      changeEmail: {
        // CHANGE Email MUTATION
        output: 'changeEmail',
        description: 'Change Email',
        input: 'changeEmailInput',
        resolver: async (obj, data, context, info) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const change = data.changeEmailInput;

          isEmailValid(change.newEmail);
          // check if it's an email and from listed domains.
          if (!validateEmail(change.newEmail, ['gmail.com'])) {
            throw Error(CustomErrors.invalidEmail);
          }

          await account.update(
              {
                email: change.newEmail,
                lock: 1,
              },
              {
                where: {
                  id: user.id,
                },
              },
          );

          const appUser = await appModels.User.findOne({
            where: {
              id: user.id,
            },
            attributes: ['recoveryToken'],
          });

          const activationToken = await sha1(
              user.id + ':' + change.newEmail,
          ).replace(/[/.]/g, '');

          if (appUser) {
            syncWithGame(
                appModels,
                user.id,
                appUser.recoveryToken,
                activationToken,
            );
          } else syncWithGame(appModels, user.id, '', activationToken);

          const email = new Mailer(conf.mailer);
          email.sendConfirmation(activationToken, change.newEmail, user.id);

          return {
            message: 'Done',
          };
        },
      },
      resendConfirmation: {
        // RESEND EMAIL TO CONFIRM ACCOUNT
        output: 'resendConf',
        description: 'Resend Confirmation',
        input: 'resendConfInput',
        resolver: async (obj, data, context, info) => {
          const user = context.user;
          if (!user) throw Error(CustomErrors.notSignedIn);

          const resend = data.resendConfInput;

          const userServer = await account.findOne({
            where: {
              id: user.id,
            },
            attributes: ['locked'],
          });
          if (!userServer) throw Error(CustomErrors.userNotFound);
          // if (userServer.locked === 0) throw Error(CustomErrors.alreadyActivated);

          const appUser = await appModels.User.findOne({
            where: {
              id: user.id,
            },
            attributes: ['recoveryToken'],
          });

          const activationToken = await sha1(
              user.id + ':' + resend.email,
          ).replace(/[/.]/g, '');
          if (appUser) {
            syncWithGame(
                appModels,
                user.id,
                appUser.recoveryToken,
                activationToken,
            );
          } else syncWithGame(appModels, user.id, '', activationToken);

          const emailer = new Mailer(conf.mailer);
          emailer.sendConfirmation(activationToken, resend.email, user.id);

          return {
            message: 'Done',
          };
        },
      },
    },
  };

  /* RELATION BETWEEN APP DB AND GAME DB (not working) error -> https://pastebin.com/hWS2LPqQ

        models[dbId]['account'].hasOne(appModels.User, {
            foreignKey: 'id'
        })

        appModels.User.belongsTo(models[dbId]['account'], {
            foreignKey: 'id'
        })

        */

  app.get('/pass_recover/:email/:token', async (req, res) => {
    // RECOVER PASSWORD NEW PASSWORD GENERATION
    let user;
    let newPass;
    try {
      user = await account.findOne({
        where: {
          email: req.params.email,
        },
        attributes: ['id', 'username', 'email'],
      });

      const recovery = await appModels.User.findOne({
        where: {
          id: user.id,
        },
        attributes: ['recoveryToken'],
      });

      if (!user) return res.send('Error 700');
      if (!recovery) return res.send('Error 701');
      if (req.params.token != recovery.recoveryToken) {
        return res.send('Error 702');
      }
      newPass = Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, '')
          .substr(0, 9);

      newPass = normalizeCredentials(newPass);
      user.username = normalizeCredentials(user.username);

      const pass = await sha1(user.username + ':' + newPass);

      await account.update(
          {
            sha_pass_hash: pass,
            v: 0,
            s: 0,
          },
          {
            where: {
              id: user.id,
            },
          },
      );

      await appModels.User.update(
          {
            recoveryToken: '',
          },
          {
            where: {
              id: user.id,
            },
          },
      );
    } catch (error) {
      console.log(error);
    }
    const email = new Mailer(conf.mailer);
    email.sendPassword(newPass, user.email);
    return res.send('A new temporary password has been sent to your email');
  });

  app.get('/activation/:id/:token', async (req, res) => {
    try {
      const user = await appModels.User.findOne({
        where: {
          id: req.params.id,
        },
        attributes: ['activationToken'],
      });
      if (!user) return res.send('Error 703');
      if (!user.activationToken) return res.send('Already actived!');
      if (req.params.token != user.activationToken) {
        return res.send('Error 704');
      }
      await appModels.User.update(
          {
            activationToken: '',
          },
          {
            where: {
              id: req.params.id,
            },
          },
      );
      // activate wow account too
      await account.update(
          {
            locked: 0,
          },
          {
            where: {
              id: req.params.id,
            },
          },
      );
    } catch (error) {
      console.log(error);
    }
    return res.send('User activated successfully');
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
