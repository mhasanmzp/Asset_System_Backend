module.exports = (sequelize, Sequelize) => {
    const ticket = sequelize.define('ticket', {
        ticketId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        userId: {
            type: Sequelize.INTEGER
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        employeeName: {
            type: Sequelize.STRING(255)
        },
        ticket_category: {
            type: Sequelize.STRING(255)
        },
        // attachment: {
        //     type : Sequelize.
        description: {
            type: Sequelize.STRING(500)
        },
        sdate: {
            type: Sequelize.DATE
        },
        edate: {
            type: Sequelize.DATE
        },
        comments: {
            type: Sequelize.STRING(255)
        },
        assigned: {
            type: Sequelize.STRING(50)
        },
        status:{
            type: Sequelize.STRING(255)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        getComments:{
            type: Sequelize.JSON,
            default:[]
        },
        assignedEmails: {
            type: Sequelize.JSON,
        }
    }, {
        timestamps: true,
    });
    ticket.sync();
    return ticket;
}