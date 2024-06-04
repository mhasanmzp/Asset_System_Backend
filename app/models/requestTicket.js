module.exports = (sequelize, Sequelize) => {
    const requestTicket = sequelize.define('requestTicket', {
        requestId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        projectId: {
            type: Sequelize.INTEGER
        },
        taskId: {
            type: Sequelize.INTEGER
        },
        taskName: {
            type: Sequelize.STRING(100)
        },
        requestdBy: {
            type: Sequelize.INTEGER
        },
        requestdate: {
            type: Sequelize.DATEONLY
        },
        approvedBy: {
            type: Sequelize.INTEGER
        },
        approverName: {
            type: Sequelize.STRING(50)
        },
        approvedDate: {
            type: Sequelize.DATEONLY
        },
        status: {
            type: Sequelize.INTEGER
        },
        requestComment:{
            type: Sequelize.STRING(100)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    requestTicket.sync();
    return requestTicket;
}