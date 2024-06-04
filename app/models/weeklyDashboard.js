module.exports = (sequelize, Sequelize) => {
    const weeklyDashboard = sequelize.define('weeklyDashboard', {
        weeklyDashboardId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        salesMeeting: {
            type: Sequelize.STRING(250),
        },
        issuesAndRisks: {
            type: Sequelize.STRING(250),
        },
        overall_Sales_Support_Status: {
            type: Sequelize.STRING(250),
        },
        comments: {
            type: Sequelize.STRING(250),
        },
        client_Facing_Total_Sales_Support_Meetings: {
            type: Sequelize.INTEGER,
        },
        Sales_Pursuits_Status: {
            type: Sequelize.STRING(250),
        },
        Sales_TB_Sheet_Followed: {
            type: Sequelize.INTEGER,
        },
        Net_New_Leads: {
            type: Sequelize.INTEGER,
        },
        Sales_Pipeline: {
            type: Sequelize.INTEGER,
        },
        Cross_Selling: {
            type: Sequelize.INTEGER,
        },
        Existing_Clients_Status: {
            type: Sequelize.STRING(200),
        },
        Clients_Reviewed_Covered: {
            type: Sequelize.STRING(200),
        },
        Weekly_Client_Feedback: {
            type: Sequelize.STRING(250),
        },
        projectId: {
            type: Sequelize.INTEGER,
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        isActive:{
            type:Sequelize.INTEGER
        }
    }, {
        timestamps: true,
    });
    weeklyDashboard.sync();
    return weeklyDashboard;
}