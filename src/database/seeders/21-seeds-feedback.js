'use strict';

export default {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Feedbacks', [{
                id: 1,
                picture: 'pic',
                message: "mess",
                rating: '3.5',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 1,
                UserId: 1
            },
            {
                id: 2,
                picture: 'pic',
                message: "ok",
                rating: '5.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 2,
                UserId: 2
            },
            {
                id: 3,
                picture: 'pic',
                message: "bad",
                rating: '0.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 1,
                UserId: 3
            },
            {
                id: 4,
                picture: 'pic',
                message: "good",
                rating: '3.5',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 1,
                UserId: 2
            },
            {
                id: 5,
                picture: 'pic',
                message: "booo",
                rating: '2.5',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 3,
                UserId: 1
            },
            {
                id: 6,
                picture: 'pic',
                message: "mess",
                rating: '3.0',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 1,
                UserId: 1
            },
            {
                id: 7,
                picture: 'pic',
                message: "mess",
                rating: '3.5',
                createdAt: new Date(),
                updatedAt: new Date(),
                RecipeId: 3,
                UserId: 3
            }
        ], {
            updateOnDuplicate: ["picture", "message", "rating", "RecipeId",
                "UserId"
            ]
        });


    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .bulkDelete('Feedbacks', null, {})
    }
};