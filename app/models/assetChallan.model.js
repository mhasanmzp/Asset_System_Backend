module.exports = (sequelize, Sequelize) => {
    const AssetChallan = sequelize.define('AssetChallan', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        challanId: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          challanType: {
            type: Sequelize.ENUM('inward', 'outward'),
            allowNull: false
          },
          categoryId: {
            type: Sequelize.INTEGER,
          },
          modelId: {
            type: Sequelize.INTEGER,
          },
          date: {
            type: Sequelize.DATE,
            allowNull: false
          },
          details: {
            type: Sequelize.TEXT
          }
  
    }, {
      timestamps: false,
    });
    AssetChallan.sync({ alter: true });
    return AssetChallan;
  }