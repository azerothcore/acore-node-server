'use strict';

export default {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Recipes', [{
            id: 1,
            name: 'chicken wings',
            estimatedTime:'30 ',          
            caloricIntake: '3000',
            chefNote: "note111",
            stepsDescription: '5',
            picture: '/upload/recipes/chicken_wings.png',
            prepreparationsteps: "steps",
            createdAt: new Date(),
            updatedAt: new Date(),
            IconId: 1
        },
        {
            id: 2,
            name: 'hot chicken wings',
            estimatedTime:'30 ',          
            caloricIntake: '4500',
            chefNote: "note2",
            stepsDescription: '5',
            picture: '/upload/recipes/hot_chicken_wings.png',
            prepreparationsteps: "steps",
            createdAt: new Date(),
            updatedAt: new Date(),
            IconId: 1
        },
        {
            id: 3,
            name: 'toast',
            estimatedTime:'5 ',          
            caloricIntake: '500',
            chefNote: "note3",
            stepsDescription: '3',
            picture: '/upload/recipes/toast.png',
            prepreparationsteps: "steps",
            createdAt: new Date(),
            updatedAt: new Date(),
            IconId: 2
        }
    ], {
            updateOnDuplicate:["name","estimatedTime","caloricIntake",
               "chefNote","stepsDescription","picture","prepreparationsteps" ]
        });


    },

    down: (queryInterface, Sequelize) => {
        return queryInterface
            .bulkDelete('Recipes', null, {})
    }
};

