import {
    isAllowed,
    ROLES,
    sameUser
} from "@hw-core/node-platform/src/libs/apiHelpers";

/**
 * @instance
 * @param {Sequelize} sequelize 
 * @param {Sequelize} DataTypes 
 */
export default function (sequelize, DataTypes) {
    var UserRecipe = sequelize.define('UserRecipe', {

        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        done: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    });

    UserRecipe.associate = function (models) {
        //connection 1:n -> user to userRecipe
        models.User.hasMany(models.UserRecipe, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
        models.UserRecipe.belongsTo(models.User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

        //connection 1:n -> recipe to userRecipe
        models.Recipe.hasMany(models.UserRecipe, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
        models.UserRecipe.belongsTo(models.Recipe, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
    }

    UserRecipe.graphql = {
        before: {
            create: isAllowed([ROLES.ROLE_ADMIN]),
            update: isAllowed([ROLES.ROLE_ADMIN]),
            destroy: isAllowed([ROLES.ROLE_ADMIN]),
            fetch: isAllowed(
                [ROLES.ROLE_USER, ROLES.ROLE_ADMIN],
                sameUser(null, "UserId")
            ),
        }
    }

    return UserRecipe;
};