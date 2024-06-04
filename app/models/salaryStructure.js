module.exports = (sequelize, Sequelize) => {
    const Call = sequelize.define('salarystructure', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            required: true,
            unique: true
        },
        uid: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        company: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        pincode: {
            type: Sequelize.STRING
        },
        contact: {
            type: Sequelize.STRING
        },
        address: {
            type: Sequelize.STRING
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,
        // your other configuration here
    });
    Call.sync();
    return Call;
}