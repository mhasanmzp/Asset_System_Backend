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
            allowNull: false
        },
        quantity:{
            type:Sequelize.INTEGER
        },
        quantityUnit: {
            type: Sequelize.STRING,
            allowNull: false
        },
        inventoryStoreName: {
            type: Sequelize.STRING,
            allowNull: false
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
            allowNull: false
        },
        testingDate: {
            type: Sequelize.DATE,
        },
        purchaseDate: {
            type: Sequelize.DATE,
        },
        serialNumber: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.ENUM('RECEIVED', 'IN USE', 'MAINTENANCE','FAULTY', 'SCRAP', 'FAILED', 'IN_QUALITY_CHECK', 'IN_INVENTORY','REJECTED'),
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
            allowNull: false
        },
        warrantyEndDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        projectName:{
            type:Sequelize.STRING,
        },
        purchaseId:{
            type:Sequelize.STRING,
            required:true,
        }




    }, {
        timestamps: false,
    });
    AssetInventory.sync({ alter: true });
    return AssetInventory;
}