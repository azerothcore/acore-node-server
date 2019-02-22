/**
 * @instance
 * @param {Sequelize} sequelize 
 * @param {Sequelize} DataTypes 
 */
export default function (sequelize, DataTypes) {

    var Info = sequelize.define('Info', { });

    return Info;
}