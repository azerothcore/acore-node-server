import fs from 'fs';
import path from "path";
import Sequelize from 'sequelize';
import {
    GraphQLSchema
} from 'graphql';

import sgs from "sequelize-graphql-schema/src/sequelize-graphql-schema";

import sgsConf from "@hw-core/node-platform/src/server/sgsConf"

import {
    mergeSchemas,
    transformSchema,
    RenameTypes,
    RenameRootFields
} from "graphql-tools";

import seqAutoImport from "sequelize-auto-import"

import config from "@this/conf/conf.js";

class realmMgr {
    constructor() {
        this.models = {};
        this.dbs = {};
        this.schemas = [];
        this.mergedSchema;
    }

    load() {
        var db = {};

        for (const r in config.realms) {
            const realm = config.realms[r];
            for (const c in realm.dbconn) {
                /** @const {string} */
                const dbId = realm.dbconn[c];
                const dbAlias = c;

                if (!this.models[dbId]) {
                    var dbVal = config.realm_databases[dbId];

                    const directory = dbId.replace("_", "/");
                    const modelPath = path.resolve(__dirname + "/entities/realms/" + directory);

                    db[dbId] = new Sequelize(dbVal.name, dbVal.user, dbVal.pass, {
                        dialect: dbVal.dialect || "mysql",
                        host: dbVal.host || "localhost",
                        port: dbVal.port || "3306",
                        define: {
                            timestamps: false
                        }
                    });

                    this.models[dbId] = seqAutoImport(db[dbId], modelPath, {
                        exclude: dbVal.exclude,
                        recursive: false,
                        /*tableNameFormat: function (modelName) {
                            return dbId+"_"+modelName;
                        }*/
                    });

                    this.models[dbId]._sequelize = db[dbId];

                    const adaptersPath = path.resolve(__dirname + "/adapters/" + (dbVal.adapters ? dbVal.adapters.replace("_", "/") : directory) + "/index.js")
                    if (fs.existsSync(adaptersPath)) {
                        const {
                            dbAdapter,
                            schemaAdapter
                        } = require(adaptersPath);

                        dbAdapter(db[dbId], this.models[dbId]);

                        this.models[dbId]._graphschema = new GraphQLSchema(sgs(sgsConf).generateSchema(this.models[dbId]));

                        schemaAdapter(this.models[dbId]);
                    } else {
                        this.models[dbId]._graphschema = new GraphQLSchema(sgs(sgsConf).generateSchema(this.models[dbId]));
                    }
                }

                this.dbs[realm.name + "_" + dbAlias] = this.models[dbId];
            }
        }

        for (const m in this.dbs) {
            const trasformedSchema = transformSchema(this.dbs[m]._graphschema, [
                new RenameTypes((name) => `${m}_${name}`),
                new RenameRootFields((operation, name) => `${m}_${name}`),
            ]);

            this.schemas.push(trasformedSchema);
        }

        const linkTypeDefs = `
            type Root {
                _: Boolean
            }
        `;

        this.schemas.push(linkTypeDefs);

        this.mergedSchema = mergeSchemas({
            schemas: this.schemas
        });
    }
}

const sRealmMgr = new realmMgr();

export default sRealmMgr;
