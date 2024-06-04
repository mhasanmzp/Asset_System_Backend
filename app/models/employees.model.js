const { STRING } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const Employees = sequelize.define('Employees', {
        employeeId: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            // required: true,
            // unique: true,
            // allowNull: false,
        },
        personalEmail: {
            type: Sequelize.STRING(50)
        },
        officialEmail: {
            type: Sequelize.STRING(50),
            unique: true
        },
        officialEmailPassword: {
            type: Sequelize.STRING(50)
        },
        permissions: {
            type: Sequelize.JSON
        },
        firstName: {
            type: Sequelize.STRING(255)
        },
        middleName: {
            type: Sequelize.STRING(255)
        },
        lastName: {
            type: Sequelize.STRING(255)
        },
        image: {
            type: Sequelize.TEXT,
            default: 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
        },
        phoneNo: {
            type: Sequelize.STRING(20)
        },
        imageExists: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        presentAddress: {
            type: Sequelize.STRING(255)
        },
        permanentAddress: {
            type: Sequelize.STRING(255)
        },
        panNumber: {
            type: Sequelize.STRING(20)
        },
        adharNumber: {
            type: Sequelize.STRING(20)
        },
        gender: {
            type: Sequelize.STRING(10)
        },
        DOJ: {
            type: Sequelize.DATEONLY
        },
        DOB: {
            type: Sequelize.DATEONLY
        },
        employeeType: {
            type: Sequelize.STRING(50)
        },
        fatherName: {
            type: Sequelize.STRING(50)
        },
        spouseName: {
            type: Sequelize.STRING(50)
        },
        emergencyContactName: {
            type: Sequelize.STRING(50)
        },
        emergencyContactNumber: {
            type: Sequelize.STRING(50)
        },
        location: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        biometricId: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        companyName: {
            type: Sequelize.STRING(50)
        },
        companyBranch: {
            type: Sequelize.STRING(50)
        },
        isActive: {
            type: Sequelize.BOOLEAN
        },
        apperisalDays: {
            type: Sequelize.STRING(150)
        },
        basicSalary: {
            type: Sequelize.FLOAT
        },
        totalSalary: {
            type: Sequelize.FLOAT
        },
        hashedEmail:{
            type:Sequelize.STRING(255)
        },
        password:{
            type:Sequelize.STRING(255)
        },
        designation:{
            type:Sequelize.STRING(255)
        },
        departmentId: {
            type: Sequelize.INTEGER
        },
        userGroup: {
            type: Sequelize.JSON
        },
        positionName: {
            type: Sequelize.STRING(255)
        },
        fedID: {
            type: Sequelize.STRING(255)
        },
        taxTerm: {
            type: Sequelize.STRING(255)
        },
        corporationName: {
            type: Sequelize.STRING(255)
        },
        pocName: {
            type: Sequelize.STRING(255)
        },
        clientName: {
            type: Sequelize.STRING(255)
        },
        roles:{
            type:Sequelize.INTEGER
        },
        constHour:{
            type: Sequelize.FLOAT
        },
        hoursDay:{
            type: Sequelize.FLOAT
        },
        costRate:{
            type: Sequelize.FLOAT,
            defaultValue : 1
        }
    }, {
        timestamps: false,
    });
  /*  Employees.belongsToMany(sequelize.models.UserGroup, {
        through: 'EmployeeUserGroup',
        foreignKey: 'employeeId',
        otherKey: 'userGroupId'
    });*/


    Employees.sync();
    return Employees;
}