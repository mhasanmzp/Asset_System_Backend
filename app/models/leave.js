module.exports = (sequelize, Sequelize) => {
    const leave = sequelize.define('leave', {
        leaveId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        
        sdate: {
            type: Sequelize.DATEONLY
        },
        edate: {
            type: Sequelize.DATEONLY
        },
        leaveType: {
            type: Sequelize.STRING(255)
        },
        days: {
            type: Sequelize.STRING(255)
        },
        reason: {
            type: Sequelize.STRING(255)
        },
        certificate:{
            type: Sequelize.TEXT
        },
        status:{
            type: Sequelize.STRING(255)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    leave.sync();
    return leave;
}