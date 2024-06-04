module.exports = (sequelize, Sequelize) => {
    const AssetMovement = sequelize.define('AssetMovement', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        movementId: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          itemId: {
            type: Sequelize.INTEGER,
          },
          fromLocation: {
            type: Sequelize.STRING,
          },
          toLocation: {
            type: Sequelize.STRING,
          },
          date: {
            type: Sequelize.DATE,
            allowNull: false
          },
          siteId:{
            type:Sequelize.INTEGER,
            allowNull:false
          }
  
    }, {
      timestamps: false,
    });
    AssetMovement.sync({ alter: false });
    return AssetMovement;
  }