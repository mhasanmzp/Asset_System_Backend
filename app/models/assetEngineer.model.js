module.exports = (sequelize, Sequelize) => {
    const AssetEngineer = sequelize.define('AssetEngineer', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
          },
        engineerId: {
            type: Sequelize.INTEGER,
            primaryKey: true
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          phone: {
            type: Sequelize.STRING,
            allowNull: false
          },
          email: {
            type: Sequelize.STRING,
            allowNull: false
          },

        }, {
        timestamps: false,
    });
    AssetEngineer.sync({ alter: true });
    return AssetEngineer;
}