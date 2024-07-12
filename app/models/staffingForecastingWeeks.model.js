module.exports = (sequelize, Sequelize) => {
    const StaffingForecastingWeeks = sequelize.define('StaffingForecastingWeeks', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true

        },
        projectId:{
           type:Sequelize.INTEGER 
        },
        employeeId:{
            type:Sequelize.INTEGER
        },
        weekStartDate:{
            type:Sequelize.DATE
        },
        weekEndDate:{
            type:Sequelize.DATE
        },
        estimatedCost: {
            type: Sequelize.STRING,
        },
        
    }, {
        timestamps: false,
    });
    StaffingForecastingWeeks.sync({ alter: true });
    return StaffingForecastingWeeks;
}