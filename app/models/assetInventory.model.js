const { unique } = require("underscore");

module.exports = (sequelize, Sequelize) => {
    const AssetInventory = sequelize.define('AssetInventory', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true

        },
        organisationId:{
            type:Sequelize.INTEGER,
            default:1
        },
        categoryName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        oemName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        productName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        siteName: {
            type: Sequelize.STRING,
        },
        quantity:{
            type:Sequelize.INTEGER
        },
        quantityUnit: {
            type: Sequelize.STRING,
        },
        inventoryStoreName: {
            type: Sequelize.STRING,
        },
        storeLocation: {
            type: Sequelize.STRING
        },
        engineerName: {
            type: Sequelize.STRING,
        },
        testingResult: {
            type: Sequelize.ENUM('PASS', 'FAIL', 'PENDING'),
            default: 'PENDING',
        },
        testingDate: {
            type: Sequelize.DATE,
        },
        purchaseDate: {
            type: Sequelize.DATE,
        },
        serialNumber: {
            type: Sequelize.STRING,
            unique:true
        },
        status: {
            type: Sequelize.ENUM('RECEIVED', 'IN USE','FAULTY', 'SCRAP','IN STOCK','REJECTED','DELIVERED','RETURN TO OEM','RETURN TO SITE'),
            allowNull: false,
            default: 'RECEIVED'
        },
        warrantyPeriodMonths: {
            type: Sequelize.INTEGER,
        },
        siteInstallationDate: {
            type: Sequelize.DATE,
        },
        warrantyStartDate: {
            type: Sequelize.DATE,
        },
        warrantyEndDate: {
            type: Sequelize.DATE,
        },
        projectName:{
            type:Sequelize.STRING,
        },
        purchaseId:{
            type:Sequelize.STRING,
            required:true,
        },
        deliveryDate:{
            type:Sequelize.DATE
        },
        challanNumber:{
            type:Sequelize.STRING
        },
    }, {
        timestamps: false,
    });
    AssetInventory.sync({ alter: true });
    return AssetInventory;
}