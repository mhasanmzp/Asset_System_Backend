module.exports = (sequelize, Sequelize) => {// No use
    const AssetPurchase = sequelize.define('AssetPurchase', {
        purchaseId: {
            type: Sequelize.STRING,
            primaryKey: true
          },
          oemName:{
            type:Sequelize.STRING
          },
          categoriesName:{
            type:Sequelize.JSON
          },
          productsName:{
            type:Sequelize.JSON
          },
          purchaseDate: {
            type: Sequelize.DATE,
          },
          quantity:{
            type:Sequelize.INTEGER,
          },
          quantityUnits:{
            type:Sequelize.JSON,
          }
        }, {
        timestamps: false,
    });
    AssetPurchase.sync({ alter: true });
    return AssetPurchase;
}