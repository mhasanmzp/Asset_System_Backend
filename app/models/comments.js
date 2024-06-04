module.exports = (sequelize, Sequelize) => {
    const postComments = sequelize.define('postComments', {
        commentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        comment: {
            type: Sequelize.STRING(50)
        },
        date: {
            type: Sequelize.DATE
        },
        commentById: {
            type: Sequelize.INTEGER
        },
        postId: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }

    }, {
        timestamps: false,
    });
    postComments.sync();
    return postComments;
}