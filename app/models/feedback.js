module.exports = (sequelize, Sequelize) => {
    const Feedback = sequelize.define('Feedback', {
        feedbackId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        feedback: {
            type: Sequelize.STRING(50)
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        date:{
            type:Sequelize.DATE
        }
    }, {
        timestamps: true,
    });
    Feedback.sync();
    return Feedback;
}