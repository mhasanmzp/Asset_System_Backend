
module.exports = (sequelize, Sequelize) => {
    const Event = sequelize.define('Event', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      eventName: {
        type: Sequelize.STRING(250)
      },
      organisationId: {
        type: Sequelize.INTEGER
      }
    }, {
      timestamps: true
    });
  
    Event.sync();
    return Event;
}
  