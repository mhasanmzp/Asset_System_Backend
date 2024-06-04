module.exports =  (sequelize, Sequelize) => {
    const Attendance = sequelize.define('Attendance', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        punchIn: {
            type: Sequelize.INTEGER
        },
        punchOut: {
            type: Sequelize.INTEGER
        },
        date: {
            type: Sequelize.DATEONLY
        },
        day: {
            type: Sequelize.INTEGER
        },
        month: {
            type: Sequelize.INTEGER
        },
        year: {
            type: Sequelize.INTEGER
        },
        totalWorkingHours:{
            type: Sequelize.FLOAT(40)
        },

    }, {
        timestamps: true,
    });
    Attendance.sync();
    return Attendance;
}