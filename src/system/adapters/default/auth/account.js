/*
import {
    AuthenticationError,
    ForbiddenError
} from 'apollo-server';

import {
    transformSchema,
    WrapQuery,
} from "graphql-tools";

import {
    Kind
} from 'graphql/language';

import {
    ModelTypes,
} from "graphql-sequelize-crud";
*/

import {
    GraphQLString,
    GraphQLNonNull,
    GraphQLObjectType,
} from 'graphql';

import sha1 from 'sha1';

function dbAdapter(sequelize, models) {
    var account = models.account;

    account.graphql = {
        attributes: {
            exclude: { //changed
                create: [],
                fetch: ["sha_pass_hash"],
            }
        },
        types: {
            login: {
                token: "String",
                role: "Int",
                id: "Int"
            },
            loginInput: {
                username: 'String!',
                password: 'String!'
            },
            recovery: {
                message: "String"
            },
            recoveryInput: {
                email: 'String!'
            }
        },
        mutations: {
            authorize: {
                output: "login",
                description: "Authorize an account",
                input: "loginInput",
                resolver: async (source, data, context) => {
                    var login = data.loginInput;
                    const res = await models.account.findOne({
                        where: {
                            username: login.username,
                            sha_pass_hash: sha1(login.username.toUpperCase() + ":" + login.password.toUpperCase())
                        }
                    });

                    return res;
                },
            }
        },
        before: {
            create: async (obj, data) => {
                var account = data.account;
                account.sha_pass_hash = sha1(account.username.toUpperCase() + ":" + account.sha_pass_hash.toUpperCase())

                return Promise.resolve();
            }
        }
    }


    account.hasMany(models.account_access, {
        foreignKey: 'id'
    })

    models.account_access.belongsTo(account, {
        foreignKey: 'id'
    })
}


function schemaAdapter(model) {
    /*const filter = (subtree) => {
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

export {
    dbAdapter,
    schemaAdapter
}
