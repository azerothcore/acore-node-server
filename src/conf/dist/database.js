export default {
  development: {
    username: 'root',
    password: 'database_dev',
    database: 'database_maelstrom',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    operatorsAliases: false,
  },
  production: {
    username: 'database_prod',
    password: 'database_prod',
    database: 'database_prod',
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    operatorsAliases: false,
  },
};
