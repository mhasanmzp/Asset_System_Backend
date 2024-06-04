module.exports = (sequelize, Sequelize) => {
    const clientDetails = sequelize.define('clientDetails', {
        clientId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        clientName:{
            type: Sequelize.STRING(50),
        },
        clientEmail:{
            type: Sequelize.STRING(50)
        },
        clientPassword:{
            type: Sequelize.STRING(50)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
    }, {
        timestamps: true,
    });
    clientDetails.sync();
    return clientDetails;
}