module.exports = (sequelize, Sequelize) => {
    const board = sequelize.define('board', {
        boardId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        teamId: {
            type: Sequelize.INTEGER
        },
        boardName: {
            type: Sequelize.STRING(50)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
    }, {
        timestamps: true,
    });
    board.sync();
    return board;
}