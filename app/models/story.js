module.exports = (sequelize, Sequelize) => {
    const Story = sequelize.define('Story', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING(250)
        },
        description: {
            type: Sequelize.TEXT
        },
        status:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        start: {
            type: Sequelize.DATE
        },
        end: {
            type: Sequelize.DATE
        },
        progress: {
            type: Sequelize.INTEGER
        },
        reporter: {
            type: Sequelize.INTEGER
        },
        projectId: {
            type: Sequelize.INTEGER
        },
        epicId: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    Story.sync();
    return Story;
}