import {config} from '@config';
import {sequelize, models} from './database/index.js';
import {app} from './express.js';
import {GraphQLSchema} from 'graphql';
import {ApolloServer} from 'apollo-server-express';
import graphcraft from 'graphcraft';
import Mailer from '@utils/mailer/';
import {verifyToken} from '@utils/helpers.js';

const {generateSchema} = graphcraft();

sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });

sequelize.sync();

generateSchema(models).then((graphqlmodels) => {
  const server = new ApolloServer({
    cors: true,
    schema: new GraphQLSchema(graphqlmodels),
    context: async ({req}) => {
      const decoded = verifyToken(req, config.secret);
      if (decoded) {
        const user = await models.User.findOne({
          where: {
            id: decoded.id,
          },
        });

        if (!user) throw new AuthenticationError('User does not exists');
        return {
          user,
        };
      }

      return null;
    },
    engine: {
      rewriteError(err) {
        // Return `null` to avoid reporting `AuthenticationError`s
        if (err instanceof AuthenticationError) {
          return err;
        }
        // All other errors will be reported.
        return err;
      },
    },
    formatError: (error) => {
      // error.message ? console.log("\x1b[31mERROR: " + error.message + "\x1b[0m") : console.log(error)
      console.log(error);
      // delete error.extensions.exception;
      return error;
    },
  });
  server.applyMiddleware({app});

  app.listen({port: config.port}, () =>
    console.log(
        `# Apollo Server ready at http://localhost:${config.port}${server.graphqlPath}`,
    ),
  );

  Mailer.initialize(config.mailer);

  // Mailer.getInstance().sendPassword("sd", "goldengabriele@gmail.com")
});
