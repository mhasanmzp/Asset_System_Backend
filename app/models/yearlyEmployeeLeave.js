module.exports = (sequelize, Sequelize) => {
    const yearlyEmployeeLeaves = sequelize.define('yearly_employee_leaves', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER,
        },
        sick_leaves: {
            type: Sequelize.FLOAT,
        },
        paid_leaves: {
            type: Sequelize.FLOAT,
        },
        wfh: {
            type: Sequelize.FLOAT,
        },
        year: {
            type: Sequelize.INTEGER,
        },
        month: {
            type: Sequelize.INTEGER,
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        createdAt: {
            type: Sequelize.DATE,
            default:new Date()
        },
        updatedAt: {
            type: Sequelize.DATE,
            default:new Date()
        }
    });
    yearlyEmployeeLeaves.sync();
    return yearlyEmployeeLeaves;
}