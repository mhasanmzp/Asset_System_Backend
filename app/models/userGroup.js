module.exports = (sequelize, Sequelize) => {
    const userGroup = sequelize.define('userGroup', {
        userGroupId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        groupName: {
            type: Sequelize.STRING
        },
        modules: {
            type: Sequelize.JSON,
            defaultValue: {}
        },
        permissions: {
            type: Sequelize.JSON,
            defaultValue: {}
        },
        tabs:{
            type: Sequelize.JSON,
            defaultValue: {}
        }
    }, {
        timestamps: true,
    });
   

    userGroup.sync();
    return userGroup;
}