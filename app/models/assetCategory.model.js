module.exports = (sequelize, Sequelize) => {
  const AssetCategory = sequelize.define('AssetCategory', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    categoryId: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    }

  }, {
    timestamps: false,
  });
  AssetCategory.sync({ alter: false });
  return AssetCategory;
}