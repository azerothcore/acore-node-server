import {conf} from '@/conf';
import {models} from '@/database/index.js';
import {app} from './express.js';
import {seqHelper} from './sequelize.js';
import {GraphQLSchema} from 'graphql';
import {ApolloServer, mergeSchemas} from 'apollo-server-express';
import graphcraft from 'graphcraft';
import Mailer from '@/service/utils/mailer/';
import {verifyToken} from '@/service/helpers.js';
import realmsMgr from '@/logic/realmsMgr';

/**
 * start sequelize, apolloserver (graphql), express
 */
export async function boot() {
  await realmsMgr.load(models);

  seqHelper();

  const {generateSchema} = graphcraft();

  const schemas = (m) => {
    const schemas = [realmsMgr.mergedSchema];
    const autogenSchema = new GraphQLSchema(m);
    schemas.push(autogenSchema);
    const mergedSchema = mergeSchemas({
      schemas,
    });
    return mergedSchema;
  };

  generateSchema(models).then((graphqlmodels) => {
    const server = new ApolloServer({
      schema: schemas(graphqlmodels),
      context: async ({req}) => {
        const decoded = verifyToken(req, conf.secret);
        if (decoded) {
          const user = await models.User.findOne({
            where: {
              id: decoded.id,
            },
          });

          if (!user) throw new Error('User does not exists');
          return {
            user,
          };
        }

        return null;
      },
      engine: {
        rewriteError(err) {
          // Return `null` to avoid reporting `AuthenticationError`s
          if (err instanceof Error) {
            return err;
          }
          // All other errors will be reported.
          return err;
        },
      },
      formatError: (error) => {
        // error.message ? console.log("\x1b[31mERROR: " + error.message + "\x1b[0m") : console.log(error)
        // console.log(error);
        // delete error.extensions.exception;
        return error;
      },
    });
    server.applyMiddleware({app});

    app.listen({port: conf.port}, () =>
      console.log(
          `# Apollo Server ready at http://localhost:${conf.port}${server.graphqlPath}`,
      ),
    );

    Mailer.initialize(conf.mailer);
  });
}
