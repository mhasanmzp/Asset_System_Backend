module.exports = (sequelize, Sequelize) => {
    const Sprint = sequelize.define('Sprint', {
        sprintId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        projectId:{
            type: Sequelize.INTEGER,
            required: true
        },
        sprintName: {
            type: Sequelize.STRING(255)
        },
        sprintGoal: {
            type: Sequelize.STRING(255)
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0
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
        tasks: {
            type: Sequelize.JSON,
            defaultValue: []
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        releaseNumber:{
            type:Sequelize.STRING
        }
    }, {
        timestamps: true,
    });
    Sprint.sync();
    return Sprint;
}