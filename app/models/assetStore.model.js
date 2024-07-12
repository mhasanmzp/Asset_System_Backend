module.exports = (sequelize, Sequelize) => {
  const AssetStore = sequelize.define('AssetStore', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    storeId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    storeName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
    }

  }, {
    timestamps: false,
  });
  AssetStore.sync({ alter: true });
  return AssetStore;
}