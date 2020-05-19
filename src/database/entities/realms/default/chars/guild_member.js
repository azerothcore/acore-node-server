/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('guild_member', {
    guildid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
    },
    guid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    rank: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
    },
    pnote: {
      type: DataTypes.STRING(31),
      allowNull: false,
      defaultValue: '',
    },
    offnote: {
      type: DataTypes.STRING(31),
      allowNull: false,
      defaultValue: '',
    },
  }, {
    tableName: 'guild_member',
    timestamps: false,
  });
};
