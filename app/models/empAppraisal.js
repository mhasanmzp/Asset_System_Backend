module.exports = (sequelize, Sequelize) => {
    const EmpAppraisal = sequelize.define('EmpAppraisal', {
        appraisalId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        employeeId: {
            type: Sequelize.INTEGER,
            required:true,
            allowNull:false
        },
        createdAt: {
            type: Sequelize.DATE
        },
        communicationSkill: {
            type:Sequelize.INTEGER
        },
        communicationSkillRemarks: {
            type:Sequelize.STRING(255)
        },
        interpersonalSkill: {
            type:Sequelize.INTEGER
        },
        interpersonalSkillRemarks: {
            type:Sequelize.STRING(255)
        },
        abilityToPlanTheWork: {
            type:Sequelize.INTEGER
        },
        abilityToPlanTheWorkRemarks: {
            type:Sequelize.STRING(255)
        },
        problemSolving: {
            type:Sequelize.INTEGER
        },
        problemSolvingRemarks: {
            type:Sequelize.STRING(255)
        },
        adaptability: {
            type:Sequelize.INTEGER
        },
        adaptabilityRemarks: {
            type:Sequelize.STRING(255)
        },
        willingnessToShoulderAdditional: {
            type:Sequelize.INTEGER
        },
        willingnessToShoulderAdditionalRemarks: {
            type:Sequelize.STRING(255)
        },
        commitmentToDoAPerfectJob: {
            type:Sequelize.INTEGER
        },
        commitmentToDoAPerfectJobRemarks: {
            type:Sequelize.STRING(255)
        },
        habitsAndManners: {
            type:Sequelize.INTEGER
        },
        habitsAndMannersRemarks: {
            type:Sequelize.STRING(255)
        },
        presentation: {
            type:Sequelize.INTEGER
        },
        presentationRemarks: {
            type:Sequelize.STRING(255)
        },
        punctuality: {
            type:Sequelize.INTEGER
        },
        punctualityRemarks: {
            type:Sequelize.STRING(255)
        },
        confidentialityOfInfo: {
            type:Sequelize.INTEGER
        },
        confidentialityOfInfoRemarks: {
            type:Sequelize.STRING(255)
        },
        trustworthiness: {
            type:Sequelize.INTEGER
        },
        trustworthinessRemarks: {
            type:Sequelize.STRING(255)
        },
        teamSpirit: {
            type:Sequelize.INTEGER
        },
        teamSpiritRemarks: {
            type:Sequelize.STRING(255)
        },
        relationshipWithColleagues: {
            type:Sequelize.INTEGER
        },
        relationshipWithColleaguesRemarks: {
            type:Sequelize.STRING(255)
        },
        decisionMaking: {
            type:Sequelize.INTEGER
        },
        decisionMakingRemarks: {
            type:Sequelize.STRING(255)
        },
        computerskills: {
            type:Sequelize.INTEGER
        },
        computerskillsRemarks: {
            type:Sequelize.STRING(255)
        },
        // L2communicationSkill: {
        //     type:Sequelize.INTEGER
        // },
        // L2communicationSkillRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2interpersonalSkill: {
        //     type:Sequelize.INTEGER
        // },
        // L2interpersonalSkillRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2abilityToPlanTheWork: {
        //     type:Sequelize.INTEGER
        // },
        // L2abilityToPlanTheWorkRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2problemSolving: {
        //     type:Sequelize.INTEGER
        // },
        // L2problemSolvingRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2adaptability: {
        //     type:Sequelize.INTEGER
        // },
        // L2adaptabilityRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2willingnessToShoulderAdditional: {
        //     type:Sequelize.INTEGER
        // },
        // L2willingnessToShoulderAdditionalRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2commitmentToDoAPerfectJob: {
        //     type:Sequelize.INTEGER
        // },
        // L2commitmentToDoAPerfectJobRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2habitsAndManners: {
        //     type:Sequelize.INTEGER
        // },
        // L2habitsAndMannersRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2presentation: {
        //     type:Sequelize.INTEGER
        // },
        // L2presentationRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2punctuality: {
        //     type:Sequelize.INTEGER
        // },
        // L2punctualityRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2confidentialityOfInfo: {
        //     type:Sequelize.INTEGER
        // },
        // L2confidentialityOfInfoRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2trustworthiness: {
        //     type:Sequelize.INTEGER
        // },
        // L2trustworthinessRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2teamSpirit: {
        //     type:Sequelize.INTEGER
        // },
        // L2teamSpiritRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2relationshipWithColleagues: {
        //     type:Sequelize.INTEGER
        // },
        // L2relationshipWithColleaguesRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2decisionMaking: {
        //     type:Sequelize.INTEGER
        // },
        // L2decisionMakingRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        // L2computerskills: {
        //     type:Sequelize.INTEGER
        // },
        // L2computerskillsRemarks: {
        //     type:Sequelize.STRING(255)
        // },
        status:{
            type: Sequelize.STRING(255)
        },
        employeeOverallPercentage:{
            type: Sequelize.INTEGER
        },
        // L2OP:{
        //     type: Sequelize.INTEGER
        // },
        employeeOverallRating:{
            type: Sequelize.STRING(255)
        },
        // L2OR:{
        //     type: Sequelize.STRING(255)
        // },
        employeeTotalScore:{
            type: Sequelize.INTEGER
        },
        // L2TS:{
        //     type: Sequelize.INTEGER
        // },
        isEditedByEmp:{
            type:Sequelize.BOOLEAN,
            defaultValue: false
        },
        // isEditedByL2:{
        //     type:Sequelize.BOOLEAN,
        //     defaultValue: false
        // },
        assignedL2Manager: {
            type:Sequelize.INTEGER
        },
        assignedL3Manager: {
            type:Sequelize.INTEGER
        },
        assignedL4Manager: {
            type:Sequelize.INTEGER
        },
        assignedL5Manager: {
            type:Sequelize.INTEGER
        },
        hrId:{
            type:Sequelize.INTEGER,
            allowNull: true
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
        
    }, {
        timestamps: false,
    });
    EmpAppraisal.sync({alter:true});
    return EmpAppraisal;
}