module.exports = (sequelize, Sequelize) => {
    const atscvpool = sequelize.define('atscvpool', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING(50)
        },
        email: {
            type: Sequelize.STRING(50)
        },
        alternateEmail: {
            type: Sequelize.STRING(50)
        },
        dob: {
            type: Sequelize.DATEONLY
        },
        phone: {
            type: Sequelize.STRING(15)
        },
        otherPhone: {
            type: Sequelize.STRING(15)
        },
        gender: {
            type: Sequelize.STRING(50)
        },
        country: {
            type: Sequelize.STRING(50)
        },
        city: {
            type: Sequelize.STRING(50)
        },
        state: {
            type: Sequelize.STRING(50)
        },
        zipCode: {
            type: Sequelize.STRING(50)
        },
        currentSalary: {
            type: Sequelize.STRING(255)
        },
        exceptedSalary: {
            type: Sequelize.STRING(255)
        },
        primarySkill: {
            type: Sequelize.STRING(255)
        },
        secondarySkill: {
            type: Sequelize.STRING(255)
        },
        position: {
            type: Sequelize.STRING(255)
        },
        currentCompany: {
            type: Sequelize.STRING(255)
        },
        taxTerm: {
            type: Sequelize.STRING(255)
        },
        linkedURL: {
            type: Sequelize.STRING(255)
        },
        workAuth: {
            type: Sequelize.STRING(255)
        },
        expiry: {
            type: Sequelize.STRING(255)
        },
        yearExp: {
            type: Sequelize.INTEGER
        },
        monthExp: {
            type: Sequelize.INTEGER
        },
        source: {
            type: Sequelize.STRING(255)
        },
        clearance: {
            type: Sequelize.STRING(50)
        },
        employeerName: {
            type: Sequelize.STRING(50)
        },
        employeerEmail: {
            type: Sequelize.STRING(50)
        },
        employeerCurrentCompany: {
            type: Sequelize.STRING(50)
        },
        employeerComment: {
            type: Sequelize.STRING(50)
        },
        employeerPhone: {
            type: Sequelize.STRING(15)
        },
        educationDetail: {
            type: Sequelize.JSON
        },
        companyDetails:{
            type: Sequelize.JSON
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
    });
    atscvpool.sync();
    return atscvpool;
}