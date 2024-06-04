module.exports =  (sequelize, Sequelize) => {
    const logs = sequelize.define('logs', {
        logId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER(50),
        },
        logDetails: {
            type: Sequelize.STRING(200),
        },
        event: {
            type: Sequelize.STRING(50),
        },
        Date:{
            type: Sequelize.DATE
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    logs.sync();
    return logs;
}