const Sequelize = require("sequelize");

/**
 * This function is injected in global scope for sequelize-cli
 * allowing migrations to understand if it's the "first start"
 * checking for sync value in sequelizemeta table.
 * Using this function in your migration to return from migration
 * if sequelizeFirstStart returns true, we don't need migrations at first
 * start since the sync() method in server.js import all modules
 * at their last version automatically.
 * 
 * After first start ends the server.js will write the sync value
 * in table and next migration will be executed.
 * 
 * @param {Sequelize.queryInterface} queryInterface
 */
export const sequelizeFirstStart = async function (queryInterface) {
    let res = await queryInterface.sequelize.query("SELECT name FROM SequelizeMeta WHERE name='sync'", {
        type: queryInterface.sequelize.QueryTypes.SELECT
    });

    return res.length == 0;
}


export const removeOpAlias = function (confs) {
    for (let name in confs) {
        if (!confs[name].hasOwnProperty("operatorsAliases"))
            confs[name]["operatorsAliases"] = false;
    }
}

/**
 * @instance
 * @returns {Sequelize}
 */
export const connFactory = function (confPath) {
    const dbConf = require(confPath)[process.NODE_ENV || "development"];

    return new Sequelize(dbConf);
}

/**
 * 
 * @param {string} confPath this is the path of database conf file for sequelize
 */
export const bootCli = function (confPath) {
    global.sequelizeFirstStart = sequelizeFirstStart;

    var confs = require(confPath);

    removeOpAlias(confs);

    return confs;
}
