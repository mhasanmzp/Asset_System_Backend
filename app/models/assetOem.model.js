module.exports = (sequelize, Sequelize) => {
  const AssetOem = sequelize.define('AssetOem', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    oemId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    oemName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    }
  }, {
    timestamps: false,
  });
  AssetOem.sync({ alter: true });
  return AssetOem;
}