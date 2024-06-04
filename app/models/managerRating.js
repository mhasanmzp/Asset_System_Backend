module.exports =  (sequelize, Sequelize) => {
    const managerRating = sequelize.define('managerRating', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER(50),
            primarykey:true
        },
        technicalReview: {
            type: Sequelize.INTEGER(20)
        },
        managerialReview: {
            type: Sequelize.INTEGER(20)
        },
        administrationReview: {
            type: Sequelize.INTEGER(20)
        },
        scoringReview: {
            type: Sequelize.INTEGER(20)
        },
        allProgressReview: {
            type: Sequelize.INTEGER(20)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        kraId:{
            type: Sequelize.INTEGER(20)
        },
        comments:{
            type:Sequelize.STRING(255)
        }
    }, {
        timestamps: false,
    });
    managerRating.sync();
    return managerRating;
}