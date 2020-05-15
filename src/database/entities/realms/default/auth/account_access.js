/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('account_access', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    gmlevel: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
    },
    RealmID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '-1',
      primaryKey: true,
    },
  }, {
    tableName: 'account_access',
    timestamps: false,
  });
};
