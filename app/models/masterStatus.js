module.exports = (sequelize, Sequelize) => {
    const Status = sequelize.define('Status', {
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        userId:{
            type: Sequelize.STRING,
            allowNull: false,
            
        }
      });
      Status.sync();
    return Status;
}