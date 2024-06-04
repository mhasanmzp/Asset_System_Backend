module.exports = (sequelize, Sequelize) => {
    const kra = sequelize.define('kra', {
        kraId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER
        },
        TotalScore: {
            type: Sequelize.INTEGER
        },
        Designation: {
            type: Sequelize.STRING(50)
        },
        employeeName: {
            type: Sequelize.STRING(255)
        },
        Division: {
            type: Sequelize.STRING(50)
        },
        CarrierLevel: {
            type: Sequelize.STRING(50)
        },
        ManagerName: {
            type: Sequelize.STRING(50)
        },
        Department: {
            type: Sequelize.STRING(50)
        },
        JoiningDate: {
            type: Sequelize.DATE
        },
        ReviewPeriod: {
            type: Sequelize.STRING(255)
        },
        EvaluationPurpose: {
            type: Sequelize.STRING(255)
        },
        TechnicalSkill: {
            type: Sequelize.JSON
        },
        AdministrationSkill: {
            type: Sequelize.JSON
        },
        ManagerialSkill: {
            type: Sequelize.JSON
        },
        AllProgress: {
            type: Sequelize.JSON
        },
        ScoringSystem: {
            type: Sequelize.JSON
        },
        Recommendation: {
            type: Sequelize.STRING(255)
        },
        Comment: {
            type: Sequelize.STRING(255)
        },
        DirectorName: {
            type: Sequelize.STRING(255)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        },
        month:{
            type: Sequelize.STRING(255)
        },
        year:{
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: true,
    });
    kra.sync();
    return kra;
}