/*
 *
 * NODE INTERNALS
 *
 */
import {
    execSync
} from 'child_process';

import path from "path"

/*
 *
 * INSTALLED MODULES
 *
 */

import Sequelize from "sequelize"

/**
 * @typedef {Object} DBObj
 * @property modules
 */

/*
 *
 * PROJECT DEPS
 *
 */

import "../defs"

import {
    EventManager,
    Events
} from "../platform/EventManager"

import {
    getDirectories
} from "../libs/fs"

import * as sysUtil from "../libs/sysUtil"

import HwApolloServer from "./apollo-express";


export default class Server {
    /**
     * 
     * @param {Object} conf 
     * @param {string} name 
     */
    constructor(conf, name = "hw-node-platform") {
        this.conf = conf;

        this.evtMgr = new EventManager(Events, name)

        this.hwApolloServer = new HwApolloServer(conf, this.evtMgr);
        /**@type {Db} */
        this.db = null;

        Object.freeze(this.evtMgr);
        //Object.freeze(this.hwApolloServer)
    }

    /**
     * 
     * @param {Db} db 
     */
    setDb(db) {
        this.db = db;
    }

    /**
     * LOAD MODULES
     */
    loadModules() {
        var exclude = this.conf.modules && this.conf.modules.exclude ? this.conf.modules.exclude : []
        getDirectories(path.resolve(this.conf.modulePath || "./modules/"), (d) => {
            return exclude.indexOf(d) < 0
        }).forEach(file => {
            require(file)();
        });
    }

    async dbSync() {
        const db = this.db;

        const stdout = execSync("npm run db:migrate", {
            shell: true
        });

        if (stdout) {
            console.log(stdout.toString());
        }

        await db.sequelize.sync();

        // this is needed for migration
        // we've to save the information about db sync = first start
        await db.sequelize.getQueryInterface().upsert("SequelizeMeta", {
                name: "sync"
            }, {
                name: "sync"
            }, {
                name: "sync"
            },
            db.sequelize.define('SequelizeMeta', {
                name: {
                    type: Sequelize.STRING,
                    primaryKey: true,
                    allowNull: false
                }
            }), {});
    }

    async runServer(withApollo = true) {
        if (withApollo)
            this.hwApolloServer.initApolloServer(this.db);

        this.hwApolloServer.runServer();
    }

    async run(withApollo = true, withSync = true) {
        const conf = this.conf;
        this.loadModules();

        this.evtMgr.emit(Events.before_init);

        if (sysUtil.onlyDbSync) {
            await this.dbSync(this.db);
            console.log("DB Sync completed!")
            process.exit(0);
            this.evtMgr.emit(Events.after_init, this);
        } else {
            if (withSync)
                await this.dbSync(this.db);

            this.evtMgr.emit(Events.after_init, this);
            this.runServer(withApollo);
        }
    }
}
