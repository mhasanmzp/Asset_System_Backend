module.exports = (sequelize, Sequelize) => {
    const Reports = sequelize.define('Reports', {
        reportId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        projectId: {
            type: Sequelize.INTEGER
        },
        total: {
            type: Sequelize.INTEGER
        },
        open: {
            type: Sequelize.INTEGER
        },
        closed: {
            type: Sequelize.INTEGER
        },
        toDoReOpened: {
            type: Sequelize.INTEGER
        },
        toDoOnHold: {
            type: Sequelize.INTEGER
        },
        toDoNotStarted: {
            type: Sequelize.INTEGER
        },
        inProgress: {
            type: Sequelize.INTEGER
        },
        testing: {
            type: Sequelize.INTEGER
        },
        closedToday: {
            type: Sequelize.INTEGER
        },
        openedToday: {
            type: Sequelize.INTEGER
        },
        pendingsixtyDaysTask: {
            type: Sequelize.INTEGER
        },
        pendingsevenDaysTask: {
            type: Sequelize.INTEGER
        },
        pendingThirtyDaysTask: {
            type: Sequelize.INTEGER
        },
        pendingNintyDaysTasks: {
            type: Sequelize.INTEGER
        },
        closedBugsinSevenDays: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    Reports.sync();
    return Reports;
}