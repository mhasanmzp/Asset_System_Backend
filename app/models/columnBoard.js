module.exports = (sequelize, Sequelize) => {
    const columnBoard = sequelize.define('columnBoard', {
        columnId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        boardId: {
            type: Sequelize.INTEGER
        },
        teamId: {
            type: Sequelize.INTEGER
        },
        projectId: {
            type: Sequelize.INTEGER
        },
        columnName: {
            type: Sequelize.STRING(50)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
    }, {
        timestamps: true,
    });
    columnBoard.sync();
    return columnBoard;
}