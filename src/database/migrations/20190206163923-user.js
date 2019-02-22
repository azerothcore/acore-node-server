'use strict';
export default {
    up: async (queryInterface, Sequelize) => {
        if (await global.sequelizeFirstStart(queryInterface)) return true;

        return [
            queryInterface.addColumn('Users', 'activationToken', Sequelize.STRING), //if we want to add more than 1 column we return an array of addcolumn()
        ];
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('Users', 'activationToken'); //if we want to remove more than 1 column we return an array of removecolumn()
    }
};