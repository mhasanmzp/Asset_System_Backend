module.exports = (sequelize, Sequelize) => {
    const ProjectMembers = sequelize.define('ProjectMembers', {
        id: {
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
        employeeId: {
            type: Sequelize.INTEGER
        },
        type: {
            type: Sequelize.STRING(50)
        },
        hoursAssign:{
            type:Sequelize.INTEGER
        },
        date:{
            type:Sequelize.DATEONLY
        },
        billable:{
            type:Sequelize.BOOLEAN,
            defaultValue: false
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: false,
    });
    ProjectMembers.sync();
    return ProjectMembers;
}