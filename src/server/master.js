import path from "path";
import Sequelize from 'sequelize/lib/sequelize.js';
import seqAutoImport from 'sequelize-auto-import';

import { seqHelpers } from "@hw-core/node-platform"

import {
    server
} from "./server";

import sRealmMgr from "@this/src/system/realmsMgr"

const sequelize = seqHelpers.connFactory("@this/conf/database");

/** @type {Sequelize.Model[]} */
const models = seqAutoImport(sequelize, path.join(__dirname, "../system/entities/app"),{
    recursive: true
});

sRealmMgr.load();

server.hwApolloServer.setSchemas([sRealmMgr.mergedSchema]);

server.setDb({
    sequelize,
    models
});

server.run(true);
