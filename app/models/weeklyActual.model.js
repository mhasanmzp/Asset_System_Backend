module.exports = (sequelize, Sequelize) => {
    const WeeklyActuals = sequelize.define('WeeklyActuals', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        targetId: {
            type: Sequelize.INTEGER, // Foreign key for the WeeklyTargets table
        },
        weekNo : {
            type: Sequelize.INTEGER
        },
        emailCampaigns: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        qualifiedLeads: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        clientMeetings: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        demos: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        poc: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        closures: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
    }, {
        timestamps: false,
    });

    WeeklyActuals.sync({ alter: true });
    return WeeklyActuals;
};
