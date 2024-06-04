module.exports = (sequelize, Sequelize) => {
    const EmpMang = sequelize.define('EmpMang', {
        employeeId: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false,
            primaryKey: true
        },
        L2ManagerId:{
            type:Sequelize.INTEGER,
            allowNull: true,
        },
        L3ManagerId:{
            type:Sequelize.INTEGER,
            allowNull: true,
        },
        L4ManagerId:{
            type:Sequelize.INTEGER,
            allowNull: true,
        },
        L5ManagerId:{
            type:Sequelize.INTEGER,
            allowNull: true,
        },
        hrId:{
            type:Sequelize.INTEGER,
            allowNull: true
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
        

    },{
        timestamps: false
      });
      EmpMang.sync({alter:true});
    return EmpMang;
}