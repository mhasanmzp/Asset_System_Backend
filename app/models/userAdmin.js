module.exports =  (sequelize, Sequelize) => {
    const userAdmin = sequelize.define('user_admin', {
        adminId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING(255)
        },
        lastName: {
            type: Sequelize.STRING(255)
        },
        Email: {
            type: Sequelize.STRING(50),
            unique: true
        },
        image: {
            type: Sequelize.TEXT,
            default: 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
        },
        password: {
            type:Sequelize.STRING(255)
        },
        adminPhone: {
            type: Sequelize.STRING(10)
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
    }, {
        timestamps: false,
    });
    userAdmin.sync();
    return userAdmin;
}