module.exports = (sequelize, Sequelize) => {
    const roles = sequelize.define('roles', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            required: true,
            unique: true
        },
        roleName: {
            type: Sequelize.STRING
        },
        roleValue: {
            type: Sequelize.STRING
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        timestamps: true,
    });
    roles.sync();
    return roles;
}