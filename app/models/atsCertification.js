module.exports = (sequelize, Sequelize) => {
    const atsCertification = sequelize.define('atsCertification', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        certificateName: {
            type: Sequelize.STRING(255)
        },
        documentType: {
            type: Sequelize.STRING(255)
        },
        completionYear: {
            type: Sequelize.DATEONLY
        },
        resumeId: {
            type: Sequelize.INTEGER
        },
        filename: {
            type: Sequelize.STRING(255)
        },
        mimetype: {
            type: Sequelize.STRING(50)
        },
        size: {
            type: Sequelize.STRING(50)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        path: {
            type: Sequelize.STRING(50)
        },
    });
    atsCertification.sync();
    return atsCertification;
}