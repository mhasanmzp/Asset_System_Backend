module.exports = (sequelize, Sequelize) => {
    const WeeklyTargets = sequelize.define('WeeklyTargets', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        bdmId: {
            type: Sequelize.STRING, // Foreign key for the BDM table
        },
        weekStartDate: {
            type: Sequelize.DATEONLY,
        },
        weekEndDate: {
            type: Sequelize.DATEONLY,
        },
        weekNo: {
            type: Sequelize.INTEGER,
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
        managerId: {
            type: Sequelize.STRING, // Foreign key for the BDM table
        },
    }, {
        timestamps: false,
    });

    WeeklyTargets.sync({ alter: true });
    return WeeklyTargets;
};
