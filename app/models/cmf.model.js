module.exports = (sequelize, Sequelize) => {
    const cmf = sequelize.define("cmf", {
        // "projectId": {
        //     type: Sequelize.STRING(10),
        // },
        "clientLocation": {
            type: Sequelize.STRING(250),
        },
        "requestedBy": {
            type: Sequelize.STRING(150),
        },
        "department": {
            type: Sequelize.STRING(150),
        },
        "countryCode": {
            type: Sequelize.STRING(10),
        },
        "contact": {
            type: Sequelize.STRING(12),
        },
        filename:{
            type: Sequelize.STRING(50),
        },
        "requestType": {
            type: Sequelize.STRING(50),
        },
        "priority": {
            type: Sequelize.STRING(50),
        },
        "changeDesc": {
            type: Sequelize.STRING(50),
        },
        "benefit": {
            type: Sequelize.STRING(50),
        },
        "painArea": {
            type: Sequelize.STRING(50),
        },
        "userBenefited": {
            type: Sequelize.STRING(50),
        },
        "category": {
            type: Sequelize.STRING(50),
        },
        "resolutionType": {
            type: Sequelize.STRING(50),
        },
        "resolution": {
            type: Sequelize.STRING(50),
        },
        "recommendation": {
            type: Sequelize.STRING(50),
        },
        costTime: {
            type: Sequelize.STRING(20),
        },
        createdBy:{
            type: Sequelize.STRING(100),
        },
        createdId:{
            type: Sequelize.STRING(10),
        },
        crNo: {
            type: Sequelize.STRING(20),
            primaryKey: true,
        },
        projectName: {
            type: Sequelize.STRING(50),
        },
        // crDate: {
        //     type: Sequelize.DATEONLY,
        // },
        // crDescription: {
        //     type: Sequelize.STRING(255),
        // },
        // painArea: {
        //     type: Sequelize.STRING(100),
        // },
        // benefit: {
        //     type: Sequelize.STRING(100),
        // },
        // impactOfBenefit: {
        //     type: Sequelize.STRING(255),
        // },
        analysis: {
            type: Sequelize.STRING(100),
        },
        testing: {
            type: Sequelize.STRING(100),
        },
        total: {
            type: Sequelize.STRING(100),
        },
        reviewedBy: {
            type: Sequelize.STRING(100),
        },
        reviewedId: {
            type: Sequelize.STRING(10),
        },
        reviewedDate: {
            type: Sequelize.DATEONLY,
        },
        fwdForApproval: {
            type: Sequelize.STRING(100),
        },
        fwdDate: {
            type: Sequelize.DATEONLY,
        },
        closedDate: {
            type: Sequelize.DATEONLY,
        },
        approvedId:{
            type: Sequelize.STRING(10),
        },
        approvedBy: {
            type: Sequelize.STRING(100),
        },
        // approvedByCAB: {
        //     type: Sequelize.STRING(100),
        // },
        approvedDate: {
            type: Sequelize.DATEONLY,
        },
        status: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue:1
        }
    })

    cmf.sync({ alter: true });
    return cmf;
}