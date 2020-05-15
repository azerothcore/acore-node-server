/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('guild_rank', {
    guildid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
    },
    rid: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    rname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '',
    },
    rights: {
      type: DataTypes.INTEGER(8).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    BankMoneyPerDay: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
  }, {
    tableName: 'guild_rank',
    timestamps: false,
  });
};
