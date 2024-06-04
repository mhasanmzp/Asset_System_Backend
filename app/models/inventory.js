module.exports = (sequelize, Sequelize) => {
    const inventory = sequelize.define('inventory', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        itemType: {
            type: Sequelize.STRING(50)
        },
        companyBrand: {
            type: Sequelize.STRING(50)
        },
        serialnumber: {
            type:Sequelize.STRING(50)
        },
        modelNumber: {
            type: Sequelize.STRING(50)
        },
        hostName: {
            type: Sequelize.STRING(50)
        },
        dateofpurchase: {
            type: Sequelize.DATEONLY
        },
        orderNumber: {
            type: Sequelize.STRING(50)
        },
        dateofIssue: {
            type: Sequelize.DATEONLY
        },
        ram: {
            type: Sequelize.INTEGER
        },
        systemPassword: {
            type: Sequelize.STRING(50)
        },
        uniqueId: {
            type: Sequelize.STRING(50)
        },
        pin: {
            type: Sequelize.STRING(50)
        },
        accessories: {
            type: Sequelize.STRING(50)
        },
        warrantyPeriod: {
            type: Sequelize.STRING(50)
        },
        workingStatus: {
            type: Sequelize.STRING(50)
        },
        adminPassword: {
            type: Sequelize.STRING(50)
        },
        isReturn:{
            type:Sequelize.STRING(50)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    });
    inventory.sync();
    return inventory;
}