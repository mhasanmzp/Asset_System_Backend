module.exports = (sequelize, Sequelize) => {
    const AssetModel = sequelize.define('AssetModel', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        modelId: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
        name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          description: {
            type: Sequelize.STRING,
            allowNull: true
          },
          categoryId: {
            type: Sequelize.INTEGER,
          }
  
    }, {
      timestamps: false,
    });
    AssetModel.sync({ alter: true });
    return AssetModel;
  }