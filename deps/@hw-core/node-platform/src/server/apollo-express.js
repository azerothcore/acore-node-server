import {
    GraphQLSchema,
    printSchema
} from 'graphql';
import {
    ApolloServer,
    mergeSchemas
} from 'apollo-server-express';

import sgs from "sequelize-graphql-schema/src/sequelize-graphql-schema";

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

import sgsConf from "./sgsConf"

import {
    verifyToken
} from "../libs/apiHelpers";

import appFactory from "./express.js";

import {
    noAuth
} from "../libs/sysUtil"

export default class HwApolloExpress {
    /**
     * 
     * @param {Object} conf 
     * @param {EventManager} evtMgr 
     */
    constructor(conf, evtMgr) {
        this.conf = conf;

        this.expressApp = appFactory(conf.express);

        this.sgsConf = sgsConf;

        this.evtMgr = evtMgr;

        this.schemas = []

        Object.freeze(this.expressApp)
        Object.freeze(this.evtMgr)
    }

    setSchemas(schemas) {
        this.schemas = schemas;
    }

    /**
     * 
     * @param {*} db 
     */
    initApolloServer(db) {
        this.evtMgr.emit(Events.before_apollo_init, this);

        var schemas = [...this.schemas];

        const autogenSchema = new GraphQLSchema(sgs(this.sgsConf).generateSchema(db.models));

        schemas.push(autogenSchema);

        var mergedSchema = mergeSchemas({
            schemas
        });

        const server = new ApolloServer({
            cors: true,
            schema: mergedSchema,
            context: async ({
                req
            }) => {
                var decoded = verifyToken(req);
                if (decoded) {
                    var user = await db.models.User.findOne({
                        where: {
                            id: decoded.id
                        }
                    });
                    //if(!user) throw new Error("Can't find user with id: "+decoded.id);
                    return {
                        user
                    };
                }

                return null;
            },
            formatError: error => {
                console.log(error)
                //delete error.extensions.exception;
                return error;
            },
        });



        server.applyMiddleware({
            app: this.expressApp
        });

        this.server = server;

        Object.freeze(this.server);

        this.evtMgr.emit(Events.after_apollo_init, this);
    }

    async runServer() {
        const conf = this.conf;
        this.evtMgr.emit(Events.before_server_start, this);

        this.expressApp.listen({
            port: conf.serverPort
        }, () => {
            if (noAuth) {
                console.log("NO AUTH ACTIVATED!")
            }
            console.log(`🚀 Server ready at http://localhost:${conf.serverPort}${this.server.graphqlPath}`)
            this.evtMgr.emit(Events.after_server_start, this);
        })
    }
}
