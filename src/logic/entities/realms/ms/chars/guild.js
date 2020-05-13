/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('guild', {
    guildid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(24),
      allowNull: false,
      defaultValue: '',
    },
    leaderguid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    EmblemStyle: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    EmblemColor: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    BorderStyle: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    BorderColor: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    BackgroundColor: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    info: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
    },
    motd: {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: '',
    },
    createdate: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    BankMoney: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: '0',
    },
  }, {
    tableName: 'guild',
    timestamps: false,
  });
};
