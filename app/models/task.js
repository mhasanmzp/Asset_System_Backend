module.exports = (sequelize, Sequelize) => {
    const Tasks = sequelize.define('Tasks', {
        taskId: {
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
        date: {
            type: Sequelize.DATEONLY
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        columnId: {
            type: Sequelize.INTEGER
        },
        projectTaskId: {
            type: Sequelize.INTEGER
        },
        taskName: {
            type: Sequelize.STRING(255)
        },
        from: {
            type: Sequelize.BIGINT
        },
        to: {
            type: Sequelize.BIGINT
        },
        projectId: {
            type: Sequelize.INTEGER
        },
        projectName: {
            type: Sequelize.STRING(100)
        },
        teamId: {
            type: Sequelize.INTEGER
        },
        hours: {
            type: Sequelize.FLOAT
        },
        boardName: {
            type: Sequelize.STRING(100)
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        type:{
            type: Sequelize.STRING(50)
        },
        storyId:{
            type: Sequelize.INTEGER
        },
        rejectReason:{
            type: Sequelize.STRING(1000)
        },
        approverId:{
            type: Sequelize.INTEGER
        },
        approverName:{
            type: Sequelize.STRING(50)
        },
        approvedDate:{
            type: Sequelize.DATEONLY
        },
        order:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        billable:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        estimatedHours:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        estimatedCost:{
            type:Sequelize.INTEGER,
            defaultValue:0
        },
        actualCost:{
            type:Sequelize.INTEGER,
            defaultValue:0
        },
        isActive:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
    });
    Tasks.sync();
    return Tasks;
}