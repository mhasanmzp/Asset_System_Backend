module.exports = (sequelize, Sequelize) => {
    const taskComments = sequelize.define('TaskComments', {
        taskCommentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        taskComment: {
            type: Sequelize.STRING(1000)
        },
        createdAt: {
            type: Sequelize.DATE
        },
        employeeId: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false
        },
        taskId: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false
        },
        organisationId: {
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false,
    });
    taskComments.sync();
    return taskComments;
}