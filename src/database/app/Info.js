/**
 * @instance
 * @param {Sequelize} sequelize
 * @param {Sequelize} DataTypes
 */
export default function(sequelize, DataTypes) {
  const Info = sequelize.define('Info', { });

  return Info;
}
