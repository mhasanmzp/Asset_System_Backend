module.exports = (sequelize, Sequelize) => {
    const customer = sequelize.define('customer', {
        customerId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING(50)
        },
        lastName: {
            type: Sequelize.STRING(50)
        },
        companyName: {
            type: Sequelize.STRING(50)
        },
        phone: {
            type: Sequelize.STRING(50)
        },
        email: {
            type: Sequelize.STRING(50),
            required: true,
        },
        website: {
            type: Sequelize.STRING(50)
        },
        gstNumber: {
            type: Sequelize.STRING(50)
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        portalAccess: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        password: {
            type: Sequelize.STRING(50)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    customer.sync();
    return customer;
}