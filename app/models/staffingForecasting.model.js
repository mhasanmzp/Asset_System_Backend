module.exports = (sequelize, Sequelize) => {
    const StaffingForecasting = sequelize.define('StaffingForecasting', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true

        },
        roleId:{
            type:Sequelize.STRING,
        },
        team: {
            type: Sequelize.STRING,
        },
        proId: {//Just showing in the table not useful
            type: Sequelize.STRING,
        },
        projectId:{
           type:Sequelize.INTEGER 
        },
        projectName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        deliveryType: {
            type: Sequelize.STRING,
        },
        hoursType:{
            type:Sequelize.ENUM('Plan','Actual'),
        },
        resourceName: {//employee Name
            type: Sequelize.STRING,
        },
        employeeId:{
            type:Sequelize.INTEGER
        },
        roleName: {
            type: Sequelize.STRING,
        },
        costingLevel: {
            type: Sequelize.STRING
        },
        location: {
            type: Sequelize.STRING,
        },
        vlookupRole: {
            type: Sequelize.STRING,
        },
        totalCost: {
            type: Sequelize.STRING,
        },
        totalHours:{
            type:Sequelize.STRING
        }

    }, {
        timestamps: false,
    });
    StaffingForecasting.sync({ alter: true });
    return StaffingForecasting;
}