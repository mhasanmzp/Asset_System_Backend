module.exports = (sequelize, Sequelize) => {// No use
    const AssetPurchase = sequelize.define('AssetPurchase', {
        purchaseId: {
            type: Sequelize.STRING,
            primaryKey: true
          },
          oemName:{
            type:Sequelize.STRING
          },
          categoryName:{
            type:Sequelize.STRING
          },
          productName:{
            type:Sequelize.STRING
          },
          purchaseDate: {
            type: Sequelize.DATE,
          },
          quantity:{
            type:Sequelize.INTEGER,
          },
          quantityUnit:{
            type:Sequelize.STRING,
          }
        }, {
        timestamps: false,
    });
    AssetPurchase.sync({ alter: true });
    return AssetPurchase;
}