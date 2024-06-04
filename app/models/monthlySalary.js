module.exports =  (sequelize, Sequelize) => {
    const MonthlySalary = sequelize.define('Monthly_Salary', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeID: {
            type: Sequelize.INTEGER(50),
            primarykey:true
        },
        month: {
            type: Sequelize.STRING(20)
        },
        year: {
            type: Sequelize.STRING(20)
        },
        date: {
            type: Sequelize.DATEONLY
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        totalWorkingDays: {
            type: Sequelize.INTEGER(20)
        },
        basicSalary: {
            type: Sequelize.FLOAT(40)
        },
        pfDeduction: {
            type: Sequelize.FLOAT(40)
        },
        esicDeduction:{
            type: Sequelize.FLOAT(40)
        },
        overallDeduction:{
            type: Sequelize.FLOAT(40)
        },
        overtimeHours:{
            type: Sequelize.FLOAT(40)
        },
        overtimeSalary:{
            type: Sequelize.FLOAT(40)
        },
        totalSalary:{
            type: Sequelize.FLOAT(40)
        },
        overAllDeductedSalary:{
            type: Sequelize.FLOAT(40)
        },
    }, {
        timestamps: false,
    });
    MonthlySalary.sync();
    return MonthlySalary;
}