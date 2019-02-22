'use strict';

import {
    cryptPass
} from "@this/src/system/apiHelpers"

export default {
    up: async (queryInterface, Sequelize) => {
        const {hash, pass} = await cryptPass("password")

        return queryInterface.bulkInsert('Users', [{
            id: 1,
            name: "Administrator",
            password: pass,
            hash,
            email: "admin@admin.com",
            gender:"male",
            age:"24",
            weight: '90.0',
            height: '194.0',
            picture: null,
            role: '1',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 2,
            name: "Joe",
            password: pass,
            hash,
            email: "joe@joe.com",
            gender:"male",
            age:"23",
            weight: '60.0',
            height: '175.0',
            picture: null,
            role:'0',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 3,
            name: "Tiffany",
            password: pass,
            hash,
            email: "ma@ma.net",
            gender:"female",
            age:"18",
            weight: '60.0',
            height: '170.0',
            picture: null,
            role:'0',
            createdAt: new Date(),
            updatedAt: new Date()
        }], {
            updateOnDuplicate:["name","password","hash","email","gender",
                "age","weight","height","picture"]
        });


    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .bulkDelete('Users', null, {})
    }
};

