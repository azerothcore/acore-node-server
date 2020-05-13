/**
 * @instance
 * @param {Sequelize} sequelize
 * @param {Sequelize} DataTypes
 */
export default function(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    activationToken: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    recoveryToken: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
  });

  return User;
}
