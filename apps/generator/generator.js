import path from "path"
import fse from "fs-extra";
import Sequelize from 'sequelize';
import SequelizeAuto from 'sequelize-auto';

import config from "@this/conf/conf";


var db = {};
var models = {};
var dbs = {};

for (const r in config.realms) {
    const realm = config.realms[r];
    for (const c in realm.dbconn) {
        /** @const {string} */
        const dbId = realm.dbconn[c];
        const dbVal = config.realm_databases[dbId];
        // transform underscore separator in directory separator
        const modelPath = path.resolve(__dirname + "/../../src/system/entities/realms/" + dbId.replace("_","/"));

        var opts = {
            host: dbVal.host || "localhost",
            port: dbVal.port || "3306",
            dialect: dbVal.dialect || 'mysql',
            directory: modelPath , // prevents the program from writing to disk
            additional: {
                timestamps: false
            }
        };

        if (dbVal.include)
            opts.tables = dbVal.include.map(v => v.replace(/\.[^/.]+$/, ""));
        else
            opts.skipTables = dbVal.exclude.map(v => v.replace(/\.[^/.]+$/, ""));

        var auto = new SequelizeAuto(dbVal.name, dbVal.user, dbVal.pass, opts);

        auto.run(function (err) {
            if (err) throw err;

            if (!models[dbId]) {
                db[dbId] = new Sequelize(dbVal.name, dbVal.user, dbVal.pass, {
                    dialect: dbVal.dialect || "mysql",
                    host: dbVal.host || "localhost",
                    port: dbVal.port || "3306",
                    define: {
                        timestamps: false
                    }
                });

                models[dbId] = require('sequelize-auto-import')(db[dbId], modelPath, {
                    exclude: dbVal.exclude,
                    recursive: false,
                    /*tableNameFormat: function (modelName) {
                        return dbId+"_"+modelName;
                    }*/
                });

                models[dbId]._sequelize = db[dbId];
            }
        });
    }
}