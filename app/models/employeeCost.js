module.exports = (sequelize, DataTypes) => {
    const EmployeeCost = sequelize.define('EmployeeCost', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        
        monthFields: {
            type: DataTypes.JSON, // Store the monthFields array as JSON
            allowNull: false,
            defaultValue:[]
        }
    }, {
        timestamps: false
    });

    EmployeeCost.sync(); 

    return EmployeeCost;
};

