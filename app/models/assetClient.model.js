module.exports = (sequelize, Sequelize) => {
    const AssetClient = sequelize.define('AssetClient', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        clientId: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
        name: {
            type: Sequelize.STRING,
          },
          description: {
            type: Sequelize.STRING,
          }
  
    }, {
      timestamps: false,
    });
    AssetClient.sync({ alter: true });
    return AssetClient;
  }