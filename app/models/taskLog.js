module.exports = (sequelize, Sequelize) => {
    const taskLog = sequelize.define('taskLog', {
        taskLogId:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        taskId: {
            type: Sequelize.INTEGER
        },
        createdBy:{
            type: Sequelize.INTEGER
        },
        assigner:{
            type: Sequelize.INTEGER
        },
        assignee:{
            type: Sequelize.INTEGER
        },
        updatedBy: {
            type: Sequelize.INTEGER
        },
        updateData: {
            type: Sequelize.JSON
        },
        organisationId:{
            type: Sequelize.INTEGER
        },
    },
    {
        timestamps: true,
    });
    taskLog.sync({alter:true});
    return taskLog;
}