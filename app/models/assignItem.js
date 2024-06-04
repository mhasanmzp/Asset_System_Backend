module.exports = (sequelize, Sequelize) => {
    const assignItem = sequelize.define('assignItem', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeName: {
            type: Sequelize.STRING(50)
        },
        email: {
            type: Sequelize.STRING(50)
        },
        phone: {
            type: Sequelize.STRING(50)
        },
        designation: {
            type: Sequelize.STRING(50)
        },
        itemType: {
            type: Sequelize.STRING(50)
        },
        hostName: {
            type: Sequelize.STRING(50)
        },
        itemTypeId:{
            type : Sequelize.INTEGER
        },
        isReturnStatus: {
            type: Sequelize.INTEGER
        },
        organisationId:{
            type:Sequelize.INTEGER,
            defaultValue:1
        }
    });
    assignItem.sync();
    return assignItem;
}