module.exports = (sequelize, Sequelize) => {
    const L3Appraisal = sequelize.define('L3Appraisal', {
        appraisalId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        L3ManagerId: {
            type: Sequelize.INTEGER,
            required:true,
            allowNull:false
        },
        createdAt: {
            type: Sequelize.DATE
        },
        // L3FSQoW_1: {     //At level 2 FUNCTIONAL SKILLS Quality of Work Field-1-Accuracy, neatness and timeliness of work
        //     type:Sequelize.INTEGER
        // },
        // L3FSQoW_2: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSQoW_3: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSWH_1: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSWH_2: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSWH_3: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSWH_4: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSJK_1: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSJK_2: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSJK_3: {
        //     type:Sequelize.INTEGER
        // },
        // L3FSRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L3ISIR_1: {
        //     type:Sequelize.INTEGER
        // },
        // L3ISIR_2: {
        //     type:Sequelize.INTEGER
        // },
        // L3ISIR_3: {
        //     type:Sequelize.INTEGER
        // },
        // L3ISIR_4: {
        //     type:Sequelize.INTEGER
        // },
        // L3ISIR_5: {
        //     type:Sequelize.INTEGER
        // },
        // L3ISIRRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L3LSL_1:{
        //     type:Sequelize.INTEGER
        // },
        // L3LSL_2:{
        //     type:Sequelize.INTEGER
        // },
        // L3LSL_3:{
        //     type:Sequelize.INTEGER
        // },
        // L3LSLRemarks:{
        //     type:Sequelize.STRING(255)
        // },
        L3communicationSkill: {
            type:Sequelize.INTEGER
        },
        L3communicationSkillRemarks: {
            type:Sequelize.STRING(255)
        },
        L3interpersonalSkill: {
            type:Sequelize.INTEGER
        },
        L3interpersonalSkillRemarks: {
            type:Sequelize.STRING(255)
        },
        L3abilityToPlanTheWork: {
            type:Sequelize.INTEGER
        },
        L3abilityToPlanTheWorkRemarks: {
            type:Sequelize.STRING(255)
        },
        L3problemSolving: {
            type:Sequelize.INTEGER
        },
        L3problemSolvingRemarks: {
            type:Sequelize.STRING(255)
        },
        L3adaptability: {
            type:Sequelize.INTEGER
        },
        L3adaptabilityRemarks: {
            type:Sequelize.STRING(255)
        },
        L3willingnessToShoulderAdditional: {
            type:Sequelize.INTEGER
        },
        L3willingnessToShoulderAdditionalRemarks: {
            type:Sequelize.STRING(255)
        },
        L3commitmentToDoAPerfectJob: {
            type:Sequelize.INTEGER
        },
        L3commitmentToDoAPerfectJobRemarks: {
            type:Sequelize.STRING(255)
        },
        L3habitsAndManners: {
            type:Sequelize.INTEGER
        },
        L3habitsAndMannersRemarks: {
            type:Sequelize.STRING(255)
        },
        L3presentation: {
            type:Sequelize.INTEGER
        },
        L3presentationRemarks: {
            type:Sequelize.STRING(255)
        },
        L3punctuality: {
            type:Sequelize.INTEGER
        },
        L3punctualityRemarks: {
            type:Sequelize.STRING(255)
        },
        L3confidentialityOfInfo: {
            type:Sequelize.INTEGER
        },
        L3confidentialityOfInfoRemarks: {
            type:Sequelize.STRING(255)
        },
        L3trustworthiness: {
            type:Sequelize.INTEGER
        },
        L3trustworthinessRemarks: {
            type:Sequelize.STRING(255)
        },
        L3teamSpirit: {
            type:Sequelize.INTEGER
        },
        L3teamSpiritRemarks: {
            type:Sequelize.STRING(255)
        },
        L3relationshipWithColleagues: {
            type:Sequelize.INTEGER
        },
        L3relationshipWithColleaguesRemarks: {
            type:Sequelize.STRING(255)
        },
        L3decisionMaking: {
            type:Sequelize.INTEGER
        },
        L3decisionMakingRemarks: {
            type:Sequelize.STRING(255)
        },
        L3computerskills: {
            type:Sequelize.INTEGER
        },
        L3computerskillsRemarks: {
            type:Sequelize.STRING(255)
        },
        L3_ManagersOverallPercentage:{
            type: Sequelize.INTEGER
        },
        L3_ManagersOverallRating:{
            type: Sequelize.STRING(255)
        },
        L3_ManagersTotalScore:{
            type: Sequelize.INTEGER
        },
        isEditedByL3Manager:{
            type:Sequelize.BOOLEAN,
            defaultValue: false
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
        
    }, {
        timestamps: false,
    });
    L3Appraisal.sync({alter:true});
    return L3Appraisal;
}