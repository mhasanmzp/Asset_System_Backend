module.exports = (sequelize, Sequelize) => {
    const Epic = sequelize.define('Epic', {
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
        reporter: {
            type: Sequelize.INTEGER
        },
        progress: {
            type: Sequelize.INTEGER
        },
        projectId: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
        },
        epicManager:{
            type:Sequelize.JSON,
            defaultValue : null
        }
    }, {
        timestamps: true,
    });
    Epic.sync();
    return Epic;
}