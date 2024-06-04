module.exports = (sequelize, Sequelize) => {
    const StoryTasks = sequelize.define('StoryTasks', {
        taskId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        assignee: {
            type: Sequelize.INTEGER
        },
        assignor: {
            type: Sequelize.INTEGER
        },
        estimatedHours: {
            type: Sequelize.FLOAT,
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
        priority: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        taskName: {
            type: Sequelize.TEXT
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
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        storyId:{
            type: Sequelize.INTEGER
        },
        order:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        description:{
            type: Sequelize.TEXT
        },
        reporter:{
            type: Sequelize.INTEGER
        },
        tester:{
            type: Sequelize.INTEGER
        },
        startDate:{
            type: Sequelize.DATEONLY
        },
        dueDate:{
            type: Sequelize.DATEONLY
        },
        completionDate:{
            type: Sequelize.DATE
        },
        taskType:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        projectTaskNumber:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        reOpened:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        onHold:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        actualHours:{
            type: Sequelize.FLOAT,
            defaultValue: 0
        },
        extraHours:{
            type: Sequelize.FLOAT,
            defaultValue: 0
        },
        testingEstimatedHours:{
            type: Sequelize.FLOAT,
            defaultValue: 0
        },
        testingActualHours:{
            type: Sequelize.FLOAT,
            defaultValue: 0
        },
        testCaseData:{
            type: Sequelize.JSON,
        },
        testingStartDate:{
            type: Sequelize.DATE
        },
        testingDueDate:{
            type: Sequelize.DATE
        },
        category:{
            type: Sequelize.INTEGER
        },
        testingDescription: {
            type: Sequelize.TEXT
        },
        totalHoursSpent: {
            type: Sequelize.FLOAT
        },
        actualStartDate:{
            type: Sequelize.DATEONLY
        },
        actualDueDate:{
            type: Sequelize.DATEONLY
        },
        fileName:{
            type: Sequelize.STRING,
        },
        updatedBy:{
            type: Sequelize.INTEGER,
            defaultValue: null
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        createType:{
            type: Sequelize.STRING,
            defaultValue: "task"
        },
        feasibilityStatus:{
            type: Sequelize.STRING,
            defaultValue: "Feasible"
        },
        feasibilityReason:{
            type: Sequelize.STRING,
        },
    }, {
        timestamps: true,
    });
    StoryTasks.sync();
    return StoryTasks;
}