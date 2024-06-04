module.exports = (sequelize, Sequelize) => {
    const Teams = sequelize.define('Teams', {
        teamId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        teamName: {
            type: Sequelize.STRING(50)
        },
        users: {
            type: Sequelize.JSON,
            defaultValue: []
        },
        managers: {
            type: Sequelize.JSON,
            defaultValue: []
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: false,
    });
    Teams.sync();
    return Teams;
}