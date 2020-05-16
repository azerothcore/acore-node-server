module.exports = function(sequelize, DataTypes) {
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
};
