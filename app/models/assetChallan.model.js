module.exports = (sequelize, Sequelize) => {
    const AssetChallan = sequelize.define('AssetChallan', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        challanId: {
            type: Sequelize.STRING,
            primaryKey: true
          },
          challanNumber:{
            type:Sequelize.STRING
          },
          challanType: {
            type: Sequelize.ENUM('INWARD', 'OUTWARD'),
            allowNull: false
          },
          categoriesName: {
            type: Sequelize.JSON,
          },
          productsName: {
            type: Sequelize.JSON,
          },
          date: {
            type: Sequelize.DATE,
            allowNull: false
          },
          details: {
            type: Sequelize.TEXT
          },
          purchaseId:{
            type:Sequelize.STRING
          },
          challanPdf:{
            type:Sequelize.BLOB('long')
          }
  
    }, {
      timestamps: false,
    });
    AssetChallan.sync({ alter: true });
    return AssetChallan;
  }