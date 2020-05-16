import {Sequelize} from 'sequelize';
import path from 'path';
import {dbConf} from '@/conf';
import seqAutoImport from 'sequelize-auto-import';

const db =
  process.env.NODE_ENV === 'production' ?
    dbConf.production :
    dbConf.development;

const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  port: db.port,
  dialect: db.dialect,
});

const models = seqAutoImport(
    sequelize,
    path.join(__dirname, './entities/app'),
    {
      recursive: true,
      associate: true,
    },
);

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export {sequelize, models};
