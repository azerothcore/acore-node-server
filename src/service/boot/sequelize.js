import {sequelize} from '@/database/index.js';

/**
 *
 */
export function seqHelper() {
  sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });

  sequelize.sync();
}
