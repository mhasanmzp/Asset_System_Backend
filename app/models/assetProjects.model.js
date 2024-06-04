module.exports = (sequelize, Sequelize) => {
    const AssetProject = sequelize.define('AssetProject', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            projectId: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            projectName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.STRING
            },
            startDate: {
                type: Sequelize.DATE
            },
            endDate: {
                type: Sequelize.DATE
            }

        }, {
        timestamps: false,
    });
    AssetProject.sync({ alter: true });
    return AssetProject;
}