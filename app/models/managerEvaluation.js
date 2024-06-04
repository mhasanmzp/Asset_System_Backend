module.exports = (sequelize, Sequelize) => {
    const ManagerEvaluation = sequelize.define('ManagerEvaluation', {
        appraisalId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            required: true,
            unique: true,
            allowNull: false,
        },
        ManagerId: {
            type: Sequelize.INTEGER,
            required:true,
            allowNull:true
        },
        createdAt: {
            type: Sequelize.DATE
        },
        FSQoW1: {     //At level 2 FUNCTIONAL SKILLS Quality of Work Field-1-Accuracy, neatness and timeliness of work
            type:Sequelize.INTEGER
        },
        FSQoW2: {
            type:Sequelize.INTEGER
        },
        FSQoW3: {
            type:Sequelize.INTEGER
        },
        FSWH1: {
            type:Sequelize.INTEGER
        },
        FSWH2: {
            type:Sequelize.INTEGER
        },
        FSWH3: {
            type:Sequelize.INTEGER
        },
        FSWH4: {
            type:Sequelize.INTEGER
        },
        FSJK1: {
            type:Sequelize.INTEGER
        },
        FSJK2: {
            type:Sequelize.INTEGER
        },
        FSJK3: {
            type:Sequelize.INTEGER
        },
        FSRemarks: {
            type:Sequelize.STRING(255)
        },
        ISIR1: {
            type:Sequelize.INTEGER
        },
        ISIR2: {
            type:Sequelize.INTEGER
        },
        ISIR3: {
            type:Sequelize.INTEGER
        },
        ISIR4: {
            type:Sequelize.INTEGER
        },
        ISIR5: {
            type:Sequelize.INTEGER
        },
        ISIRRemarks: {
            type:Sequelize.STRING(255)
        },
        LSL1:{
            type:Sequelize.INTEGER
        },
        LSL2:{
            type:Sequelize.INTEGER
        },
        LSL3:{
            type:Sequelize.INTEGER
        },
        LSLRemarks:{
            type:Sequelize.STRING(255)
        },
        lastLevelMaxMarks:{
            type: Sequelize.INTEGER
        },
        lastLevelScoredMarks:{
            type: Sequelize.INTEGER
        },
        managersOverallPercentage:{
            type: Sequelize.INTEGER
        },
        managersOverallRating:{
            type: Sequelize.STRING(255)
        },
        managersTotalScore:{
            type: Sequelize.INTEGER
        },
        isEditedByManager:{
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
    ManagerEvaluation.sync({alter:true});
    return ManagerEvaluation;
}