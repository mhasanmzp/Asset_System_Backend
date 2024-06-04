module.exports = (sequelize, Sequelize) => {
  const holidays = sequelize.define(
    "holidays",
    {
      holidayId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        required: true,
        allowNull: false,
      },
      event: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      dayOfWeek: {
        type: Sequelize.STRING(50),
      },
      holidayType: {
        type: Sequelize.STRING(200),
      },
      forTeam: {
        type: Sequelize.STRING(200),
      },
      applicableForTeam: {
        type: Sequelize.JSON,
        default: [],
      },
      organisationId: {
        type: Sequelize.INTEGER,
        defaultValue:1
      },
    },
    { timestamps: true }
  );
  holidays.sync();
  
  return holidays;
};
