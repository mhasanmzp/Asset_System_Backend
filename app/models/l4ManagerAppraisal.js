module.exports = (sequelize, Sequelize) => {
    const L4Appraisal = sequelize.define('L4Appraisal', {
        appraisalId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        L4ManagerId: {
            type: Sequelize.INTEGER,
            required: true,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE
        },
        // L4FSQoW_1: {     //At level 2 FUNCTIONAL SKILLS Quality of Work Field-1-Accuracy, neatness and timeliness of work
        //     type:Sequelize.INTEGER
        // },
        // L4FSQoW_2: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSQoW_3: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSWH_1: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSWH_2: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSWH_3: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSWH_4: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSJK_1: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSJK_2: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSJK_3: {
        //     type:Sequelize.INTEGER
        // },
        // L4FSRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L4ISIR_1: {
        //     type:Sequelize.INTEGER
        // },
        // L4ISIR_2: {
        //     type:Sequelize.INTEGER
        // },
        // L4ISIR_3: {
        //     type:Sequelize.INTEGER
        // },
        // L4ISIR_4: {
        //     type:Sequelize.INTEGER
        // },
        // L4ISIR_5: {
        //     type:Sequelize.INTEGER
        // },
        // L4ISIRRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L4LSL_1:{
        //     type:Sequelize.INTEGER
        // },
        // L4LSL_2:{
        //     type:Sequelize.INTEGER
        // },
        // L4LSL_3:{
        //     type:Sequelize.INTEGER
        // },
        // L4LSLRemarks:{
        //     type:Sequelize.STRING(255)
        // },
        L4communicationSkill: {
            type: Sequelize.INTEGER
        },
        L4communicationSkillRemarks: {
            type: Sequelize.STRING(255)
        },
        L4interpersonalSkill: {
            type: Sequelize.INTEGER
        },
        L4interpersonalSkillRemarks: {
            type: Sequelize.STRING(255)
        },
        L4abilityToPlanTheWork: {
            type: Sequelize.INTEGER
        },
        L4abilityToPlanTheWorkRemarks: {
            type: Sequelize.STRING(255)
        },
        L4problemSolving: {
            type: Sequelize.INTEGER
        },
        L4problemSolvingRemarks: {
            type: Sequelize.STRING(255)
        },
        L4adaptability: {
            type: Sequelize.INTEGER
        },
        L4adaptabilityRemarks: {
            type: Sequelize.STRING(255)
        },
        L4willingnessToShoulderAdditional: {
            type: Sequelize.INTEGER
        },
        L4willingnessToShoulderAdditionalRemarks: {
            type: Sequelize.STRING(255)
        },
        L4commitmentToDoAPerfectJob: {
            type: Sequelize.INTEGER
        },
        L4commitmentToDoAPerfectJobRemarks: {
            type: Sequelize.STRING(255)
        },
        L4habitsAndManners: {
            type: Sequelize.INTEGER
        },
        L4habitsAndMannersRemarks: {
            type: Sequelize.STRING(255)
        },
        L4presentation: {
            type: Sequelize.INTEGER
        },
        L4presentationRemarks: {
            type: Sequelize.STRING(255)
        },
        L4punctuality: {
            type: Sequelize.INTEGER
        },
        L4punctualityRemarks: {
            type: Sequelize.STRING(255)
        },
        L4confidentialityOfInfo: {
            type: Sequelize.INTEGER
        },
        L4confidentialityOfInfoRemarks: {
            type: Sequelize.STRING(255)
        },
        L4trustworthiness: {
            type: Sequelize.INTEGER
        },
        L4trustworthinessRemarks: {
            type: Sequelize.STRING(255)
        },
        L4teamSpirit: {
            type: Sequelize.INTEGER
        },
        L4teamSpiritRemarks: {
            type: Sequelize.STRING(255)
        },
        L4relationshipWithColleagues: {
            type: Sequelize.INTEGER
        },
        L4relationshipWithColleaguesRemarks: {
            type: Sequelize.STRING(255)
        },
        L4decisionMaking: {
            type: Sequelize.INTEGER
        },
        L4decisionMakingRemarks: {
            type: Sequelize.STRING(255)
        },
        L4computerskills: {
            type: Sequelize.INTEGER
        },
        L4computerskillsRemarks: {
            type: Sequelize.STRING(255)
        },
        L4_ManagersOverallPercentage: {
            type: Sequelize.INTEGER
        },
        L4_ManagersOverallRating: {
            type: Sequelize.STRING(255)
        },
        L4_ManagersTotalScore: {
            type: Sequelize.INTEGER
        },
        isEditedByL4Manager: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }

    }, {
        timestamps: false,
    });
    L4Appraisal.sync({ alter: true });
    return L4Appraisal;
}