module.exports = (sequelize, Sequelize) => {
    const L2Appraisal = sequelize.define('L2Appraisal', {
        appraisalId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        L2ManagerId: {
            type: Sequelize.INTEGER,
            required:true,
            allowNull:false
        },
        createdAt: {
            type: Sequelize.DATE
        },
        // L2FSQoW_1: {     //At level 2 FUNCTIONAL SKILLS Quality of Work Field-1-Accuracy, neatness and timeliness of work
        //     type:Sequelize.INTEGER
        // },
        // L2FSQoW_2: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSQoW_3: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSWH_1: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSWH_2: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSWH_3: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSWH_4: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSJK_1: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSJK_2: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSJK_3: {
        //     type:Sequelize.INTEGER
        // },
        // L2FSRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2ISIR_1: {
        //     type:Sequelize.INTEGER
        // },
        // L2ISIR_2: {
        //     type:Sequelize.INTEGER
        // },
        // L2ISIR_3: {
        //     type:Sequelize.INTEGER
        // },
        // L2ISIR_4: {
        //     type:Sequelize.INTEGER
        // },
        // L2ISIR_5: {
        //     type:Sequelize.INTEGER
        // },
        // L2ISIRRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2LSL_1:{
        //     type:Sequelize.INTEGER
        // },
        // L2LSL_2:{
        //     type:Sequelize.INTEGER
        // },
        // L2LSL_3:{
        //     type:Sequelize.INTEGER
        // },
        // L2LSLRemarks:{
        //     type:Sequelize.STRING(255)
        // },
        L2communicationSkill: {
            type:Sequelize.INTEGER
        },
        L2communicationSkillRemarks: {
            type:Sequelize.STRING(255)
        },
        L2interpersonalSkill: {
            type:Sequelize.INTEGER
        },
        L2interpersonalSkillRemarks: {
            type:Sequelize.STRING(255)
        },
        L2abilityToPlanTheWork: {
            type:Sequelize.INTEGER
        },
        L2abilityToPlanTheWorkRemarks: {
            type:Sequelize.STRING(255)
        },
        L2problemSolving: {
            type:Sequelize.INTEGER
        },
        L2problemSolvingRemarks: {
            type:Sequelize.STRING(255)
        },
        L2adaptability: {
            type:Sequelize.INTEGER
        },
        L2adaptabilityRemarks: {
            type:Sequelize.STRING(255)
        },
        L2willingnessToShoulderAdditional: {
            type:Sequelize.INTEGER
        },
        L2willingnessToShoulderAdditionalRemarks: {
            type:Sequelize.STRING(255)
        },
        L2commitmentToDoAPerfectJob: {
            type:Sequelize.INTEGER
        },
        L2commitmentToDoAPerfectJobRemarks: {
            type:Sequelize.STRING(255)
        },
        L2habitsAndManners: {
            type:Sequelize.INTEGER
        },
        L2habitsAndMannersRemarks: {
            type:Sequelize.STRING(255)
        },
        L2presentation: {
            type:Sequelize.INTEGER
        },
        L2presentationRemarks: {
            type:Sequelize.STRING(255)
        },
        L2punctuality: {
            type:Sequelize.INTEGER
        },
        L2punctualityRemarks: {
            type:Sequelize.STRING(255)
        },
        L2confidentialityOfInfo: {
            type:Sequelize.INTEGER
        },
        L2confidentialityOfInfoRemarks: {
            type:Sequelize.STRING(255)
        },
        L2trustworthiness: {
            type:Sequelize.INTEGER
        },
        L2trustworthinessRemarks: {
            type:Sequelize.STRING(255)
        },
        L2teamSpirit: {
            type:Sequelize.INTEGER
        },
        L2teamSpiritRemarks: {
            type:Sequelize.STRING(255)
        },
        L2relationshipWithColleagues: {
            type:Sequelize.INTEGER
        },
        L2relationshipWithColleaguesRemarks: {
            type:Sequelize.STRING(255)
        },
        L2decisionMaking: {
            type:Sequelize.INTEGER
        },
        L2decisionMakingRemarks: {
            type:Sequelize.STRING(255)
        },
        L2computerskills: {
            type:Sequelize.INTEGER
        },
        L2computerskillsRemarks: {
            type:Sequelize.STRING(255)
        },
        L2_ManagersOverallPercentage:{
            type: Sequelize.INTEGER
        },
        L2_ManagersOverallRating:{
            type: Sequelize.STRING(255)
        },
        L2_ManagersTotalScore:{
            type: Sequelize.INTEGER
        },
        isEditedByL2Manager:{
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
    L2Appraisal.sync({alter:true});
    return L2Appraisal;
}