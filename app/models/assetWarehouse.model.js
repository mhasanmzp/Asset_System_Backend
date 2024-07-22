module.exports = (sequelize, Sequelize) => {
  const AssetWarehouse = sequelize.define('AssetWarehouse', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    warehouseId:{
      type:Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    clientName:{
      type:Sequelize.STRING
    }

  }, {
    timestamps: false,
  });
  AssetWarehouse.sync({ alter: true });
  return AssetWarehouse;
}