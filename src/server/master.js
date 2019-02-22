import path from "path";
import Sequelize from 'sequelize/lib/sequelize.js';
import seqAutoImport from 'sequelize-auto-import';

import { seqHelpers } from "@hw-core/node-platform"

import {
    server
} from "./server";

const sequelize = seqHelpers.connFactory("@this/conf/database");

/** @type {Sequelize.Model[]} */
const models = seqAutoImport(sequelize, path.join(__dirname, "../system/entities"));

server.setDb({
    sequelize,
    models
});

server.run();
