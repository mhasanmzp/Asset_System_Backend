module.exports = (sequelize, Sequelize) => {
    const HrAppraisalRatingAmount = sequelize.define('HrAppraisalRatingAmount', {
        departmentId: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: false,
        },
        designation: {
            type: Sequelize.STRING(250)
        },
        year:{
            type:Sequelize.STRING(500)
        },
        ExcellentAmount:{
            type:Sequelize.STRING(100)
        },
        VgoodAmount:{
            type:Sequelize.STRING(100)
        },
        GoodAmount:{
            type:Sequelize.STRING(100)
        },
        AverageAmount:{
            type:Sequelize.STRING(100)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }

    },{
        timestamps: false
      });
    HrAppraisalRatingAmount.sync({alter:true});
    return HrAppraisalRatingAmount;
}