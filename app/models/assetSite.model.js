module.exports = (sequelize, Sequelize) => {
    const AssetSite = sequelize.define('AssetSite', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        siteId: {
            type: Sequelize.STRING,
            primaryKey: true
          },
          siteName: {
            type: Sequelize.STRING,
            allowNull: false
          },
          sitePhone:{
            type:Sequelize.STRING
          },
          siteEmail:{
            type:Sequelize.STRING
          },
          location: {
            type: Sequelize.STRING,
          }
  
    }, {
      timestamps: false,
    });
    AssetSite.sync({ alter: true });
    return AssetSite;
  }