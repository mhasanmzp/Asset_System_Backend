module.exports =  (sequelize, Sequelize) => {
    const Organisation = sequelize.define('Organisation', {
        organisationId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        organisationName: {
            type: Sequelize.STRING(255)
        },
        organisationAddress: {
            type: Sequelize.JSON
        },
        organisationGST: {
            type: Sequelize.STRING(50)
        },
        organisationPAN: {
            type: Sequelize.STRING(50)
        },
        organisationBranch: {
            type: Sequelize.JSON
        },
        organisationEmail: {
            type: Sequelize.STRING(50)
        },
        organisationPhone: {
            type: Sequelize.STRING(10)
        },
        NumberofEmployee: {
            type: Sequelize.INTEGER(50)
        },
        enableOverTime: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        overTimeRate: {
            type: Sequelize.FLOAT
        },
        enablePFDeduction: {
            type: Sequelize.BOOLEAN
        },
        PFDeductionPercentage: {
            type: Sequelize.FLOAT
        },
        enableESIDeduction: {
            type: Sequelize.BOOLEAN
        },
        ESIDeductionPercentage: {
            type: Sequelize.FLOAT
        },
        sendAppraisalReminder: {
            type: Sequelize.BOOLEAN
        },
        appraisalDays: {
            type: Sequelize.INTEGER
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
    }, {
        timestamps: false,
    });
    
    Organisation.sync();
    return Organisation;
}