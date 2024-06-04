module.exports = (sequelize, Sequelize) => {
    const Document = sequelize.define('Document', {
        documentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        date:{
            type:Sequelize.DATEONLY
        },
        filename:{
            type:Sequelize.STRING(50)
        },
        path: {
            type: Sequelize.STRING,
            allowNull: false,
          },
        projectId:{
            type:Sequelize.INTEGER
        },
        originalname:{
            type:Sequelize.STRING(50)
        },
        destination:{
            type:Sequelize.STRING(50)
        },
        createdBy:{
            type:Sequelize.STRING
      },
      createdAt:{
        type:Sequelize.DATE
  },
        size:{
            type:Sequelize.INTEGER
        },
        mimetype:{
            type:Sequelize.STRING(50)
        },
    }, {
        timestamps: false,
    });
    Document.sync();
    return Document;
}