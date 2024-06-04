module.exports = (sequelize, Sequelize) => {
    const qualityDocument = sequelize.define('qualityDocument', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        filename: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          size:{
            type:Sequelize.INTEGER
        },
        createdBy:{
              type:Sequelize.STRING
        },
        documentName:{
          type:Sequelize.STRING
        },
        
        createdAt:{
          type:Sequelize.DATE
    },
    reviewedDate:{
      type:Sequelize.DATE
   },
    documentCode:{
  type:Sequelize.STRING
       },
          path: {
            type: Sequelize.STRING,
            allowNull: false,
          }
        }, {
            timestamps: false,
        });
        qualityDocument.sync();
        return qualityDocument;
    }