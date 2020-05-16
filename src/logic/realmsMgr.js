import fs from 'fs';
import path from 'path';
import {Sequelize} from 'sequelize';
import {GraphQLSchema} from 'graphql';

import sgs from 'sequelize-graphql-schema/src/sequelize-graphql-schema';

// import sgsConf from '@hw-core/node-platform/src/server/sgsConf';

import {
  mergeSchemas,
  transformSchema,
  RenameTypes,
  RenameRootFields,
} from 'graphql-tools';

import seqAutoImport from 'sequelize-auto-import';

import {conf} from '@/conf';

class RealmMgr {
  constructor() {
    this.models = {};
    this.dbs = {};
    this.schemas = [];
    this.mergedSchema;
  }

  async load(appModels) {
    const db = {};

    let directory;
    for (const realm of conf.realms) {
      for (const dbId of realm.dbconn) {
        /** @constant {string} */
        if (!this.models[dbId]) {
          const dbVal = conf.realm_databases[dbId];

          directory = dbVal.entities.replace('_', '/');
          const modelPath = path.resolve(
              __dirname + '/entities/realms/' + directory,
          );

          db[dbId] = new Sequelize(dbVal.name, dbVal.user, dbVal.pass, {
            dialect: dbVal.dialect || 'mysql',
            host: dbVal.host || 'localhost',
            port: dbVal.port || '3306',
            define: {
              timestamps: false,
            },
          });

          this.models[dbId] = seqAutoImport(db[dbId], modelPath, {
            exclude: dbVal.exclude,
            recursive: false,
            tableNameFormat: function(modelName) {
              return dbId + '_' + modelName;
            },
          });

          this.models[dbId]._sequelize = db[dbId];
        }
      }

      for (const dbId of realm.dbconn) {
        const dbVal = conf.realm_databases[dbId];
        const adaptersPath = path.resolve(
            __dirname +
            '/adapters/' +
            (dbVal.adapters ? dbVal.adapters.replace('_', '/') : directory) +
            '/index.js',
        );
        if (fs.existsSync(adaptersPath)) {
          const {dbAdapter /* , schemaAdapter */} = await import(
              adaptersPath,
          );

          dbAdapter(dbId, dbVal, db[dbId], this.models, appModels);
        }

        // HACK FIX
        // we need generateSchema before "associate()" to set default values for graphql models property
        // TODO: find a more elegant way
        this.models[dbId]._graphschema = new GraphQLSchema(
            sgs(/* sgsConf */).generateSchema(this.models[dbId]),
        );
      }

      let dbVal;
      for (const dbId of realm.dbconn) {
        /** @constant {string} */
        dbVal = conf.realm_databases[dbId];

        Object.keys(this.models[dbId]).forEach(
            (key) =>
              this.models[dbId][key].associate &&
            this.models[dbId][key].associate(),
        );
      }

      for (const [c, dbId] of realm.dbconn) {
        console.log(c, dbId);
        this.models[dbId]._graphschema = new GraphQLSchema(
            sgs(/* sgsConf*/).generateSchema(this.models[dbId]),
        );

        const adaptersPath = path.resolve(
            __dirname +
            '/adapters/' +
            (dbVal.adapters ? dbVal.adapters.replace('_', '/') : directory) +
            '/index.js',
        );
        if (fs.existsSync(adaptersPath)) {
          const {schemaAdapter /* , dbAdapter */} = await import(
              adaptersPath,
          );
          schemaAdapter(this.models[dbId]);
        }

        this.dbs[realm.name + '_' + c] = this.models[dbId];
      }
    }

    for (const [m] of this.dbs.entries()) {
      console.log(m);
      // avoid renaming for some shared types
      // PS maybe there's a better way
      const blackList = ['SequelizeJSON', 'Date', 'PageInfo'];

      const trasformedSchema = transformSchema(this.dbs[m]._graphschema, [
        new RenameTypes((name) => {
          return blackList.indexOf(name) < 0 ? `${m}_${name}` : name;
        }),
        new RenameRootFields((operation, name) => {
          return blackList.indexOf(name) < 0 ? `${m}_${name}` : name;
        }),
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
      schemas: this.schemas,
    });
  }
}

const sRealmMgr = new RealmMgr();

export default sRealmMgr;
