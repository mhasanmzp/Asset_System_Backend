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
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
  });
  AssetOem.sync({ alter: true });
  return AssetOem;
}