module.exports = (sequelize, Sequelize)=>{
    const leadAdmin = sequelize.define("leadAdmin",{
        assignId:{
            type:Sequelize.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        month: {
            type: Sequelize.STRING(20),
        },
        year: {
            type: Sequelize.STRING(20),
            defaultValue: new Date().getFullYear().toString()
        },
        fromDate: {
            type: Sequelize.STRING(20),
        },
        toDate:{
            type: Sequelize.STRING(20)
        },
        bdm:{
            type: Sequelize.STRING(50)
        },
        location:{
            type: Sequelize.STRING(1000)
        },
        target:{
            type: Sequelize.STRING(1000)
        },
        lob:{
            type: Sequelize.STRING(1000)
        },
        actual:{
            type: Sequelize.STRING(20)
        },
        actualLeads:{
            type:Sequelize.JSON,
            defaultValue:{leads : "NA"}
        },
        status:{
            type: Sequelize.STRING(20),
            defaultValue: 'New'
        },
        commonLeadId:{
            type: Sequelize.STRING(20)
        }
    }, {
        timestamps: true,
    });

    leadAdmin.sync();
    return leadAdmin;
}