module.exports = (sequelize, Sequelize) => {
  const AssetWarehouse = sequelize.define('AssetWarehouse', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    clientId:{
      type:Sequelize.INTEGER
    }

  }, {
    timestamps: false,
  });
  AssetWarehouse.sync({ alter: false });
  return AssetWarehouse;
}