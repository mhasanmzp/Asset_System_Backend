module.exports = (sequelize, Sequelize) => {
    const openPositions = sequelize.define('openPosition', {
        openPositionsId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        candidateName: {
            type: Sequelize.STRING(300)
        },
        closingDate: {
            type: Sequelize.STRING(300)
        },
        openingDate: {
            type: Sequelize.STRING(300)
        },
        jobDescription: {
            type: Sequelize.TEXT
        },
        joiningAvailability: {
            type: Sequelize.STRING(300)
        },
        positionName: {
            type: Sequelize.STRING(300)
        },
        shift: {
            type: Sequelize.STRING(300)
        },
        status: {
            type: Sequelize.STRING(300)
        },
        organisationId:{
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: true,
    });
    openPositions.sync();
    return openPositions;
}
