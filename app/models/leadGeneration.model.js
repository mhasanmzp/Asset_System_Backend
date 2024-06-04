const { DATE } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
    const leadGeneration = sequelize.define("leadGeneration", {
        leadId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        projectName: {
            type: Sequelize.STRING(50),
        },
        fullName: {
            type: Sequelize.STRING(100),
        },
        title: {
            type: Sequelize.STRING(100),
        },

        clientName: {
            type: Sequelize.STRING(100),
        },
        emailAddress: {
            type: Sequelize.STRING(50),
        },
        phoneNo: {
            type: Sequelize.STRING(20),
        },
        industry: {
            type: Sequelize.STRING(50),
        },
        companySize: {
            type: Sequelize.STRING(20),
        },
        story: {
            type: Sequelize.DATEONLY,
        },
        dress: {
            type: Sequelize.DATEONLY,
        },
        initialContactOwner: {
            type: Sequelize.STRING(50),
        },
        initialEmailDate: {
            type: Sequelize.DATEONLY,
        },
        initialEmailOwner: {
            type: Sequelize.STRING(50),
        },
        location: {
            type: Sequelize.STRING(50),
        },
        deal: {
            type: Sequelize.STRING(100),
        },
        otherPreference: {
            type: Sequelize.STRING(50),
        },
        websiteUrl: {
            type: Sequelize.STRING(1000),
        },
        clientHearAboutProducts: {
            type: Sequelize.STRING(100),
        },
        productsInterestedIn: {
            type: Sequelize.STRING(100),
        },
        startDateAndTimeline: {
            type: Sequelize.DATEONLY,
        },
        projectDescription: {
            type: Sequelize.STRING(1000),
        },
        decisionMakesContactDetails: {
            type: Sequelize.STRING(100),
        },
        preferedCommunicationChannel: {
            type: Sequelize.STRING(100),
        },
        followUpPreference: {
            type: Sequelize.STRING(100),
        },
        preSalesDemo: {
            type: Sequelize.JSON
        },
        preSalesDemoStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        preSales: {
            type: Sequelize.JSON
        },
        companyDetails: {
            type: Sequelize.JSON
        },
        preSalesStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        proposalPreparation: {
            type: Sequelize.JSON
        },
        proposalPreparationStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        mockSessionsInternal: {
            type: Sequelize.JSON
        },
        mockSessionsInternalStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },

        proposalSubmission: {
            type: Sequelize.JSON
        },
        proposalSubmissionStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        negotiation: {
            type: Sequelize.JSON
        },
        negotiationStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        mock_orals_sowDiscussion: {
            type: Sequelize.JSON
        },
        mock_orals_sowDiscussionStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        discussion: {
            type: Sequelize.JSON
        },
        discussionStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        updateBy: {
            type: Sequelize.STRING(50),

        },
        projectNameDescription: {
            type: Sequelize.STRING(50),

        },
        dateCommentsPreparation: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsresourceAllocation: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsprojectAwarded: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsmockoralssowDiscussion: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsNegotiation: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsProposalSubmission: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsMockSessionsInternal: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsProposalPreparation: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },

        dateCommentsPreSalesDemo: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },
        dateCommentsPreSales: {
            type: Sequelize.JSON,
            defaultValue: [] // Default value as an empty array
        },

        startDateAndTimeline1: {
            type: Sequelize.DATE,
        },
        comment: {
            type: Sequelize.STRING(255),

        },
        status: {
            type: Sequelize.STRING(30),
        },
        resourceAllocation: {
            type: Sequelize.JSON
        },
        resourceAllocationStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        projectAwarded: {
            type: Sequelize.JSON
        },
        projectAwardedStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        kick_offDone: {
            type: Sequelize.JSON
        },
        planning: {
            type: Sequelize.JSON
        },
        build: {
            type: Sequelize.JSON
        },
        testing: {
            type: Sequelize.JSON
        },
        training: {
            type: Sequelize.JSON
        },
        UAT: {
            type: Sequelize.JSON
        },
        goLive: {
            type: Sequelize.JSON
        },
        hypercare: {
            type: Sequelize.JSON
        },
        clientOnboardBy: {
            type: Sequelize.STRING(100),
        },
        companyName: {
            type: Sequelize.STRING(100),
        },
        clientOnboardDate: {
            type: Sequelize.DATEONLY,
        },
        clientStatus: {
            type: Sequelize.STRING(50),
            defaultValue: "New"
        },
        additionalComment: {
            type: Sequelize.STRING(1000)
        },
        organisationId: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        },
        startTime: {
            type: Sequelize.TIME // Define the type of the 'startTime' column
        },
        endTime: {
            type: Sequelize.TIME // Define the type of the 'endTime' column
        },
        estimatedHours: {
            type: Sequelize.FLOAT, // Define the type of the 'estimatedHours' column
            allowNull: true // Allow null as the default value
        },
        dateComments: {
            type: Sequelize.JSON,
            defaultValue: []
        },
        estimatedDealSize: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        actualDealSize: {
            type: Sequelize.INTEGER,
            defaultValue: 0

        },
        potentialLead: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        budgetInvested: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        allocatedEfforts: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        docsEfforts: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        opportunityOwner: {
            type: Sequelize.STRING,
        },
        drillEfforts: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        prepEfforts: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        totalEfforts: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        monthRevenue1: {
            type: Sequelize.STRING(50)
        },
        monthRevenue2: {
            type: Sequelize.STRING(50)
        },
        monthRevenue3: {
            type: Sequelize.STRING(50)
        },
        potentialCloseDate: {
            type: Sequelize.DATEONLY
        },
        q1: {
            type: Sequelize.STRING(50)
        },
        q2: {
            type: Sequelize.STRING(50)
        },
        q3: {
            type: Sequelize.STRING(50)
        },
        q4: {
            type: Sequelize.STRING(50)
        },
        revenueForMonth1: {
            type: Sequelize.INTEGER
        },
        revenueForMonth2: {
            type: Sequelize.INTEGER
        },
        revenueForMonth3: {
            type: Sequelize.INTEGER
        },
        quarter1: {
            type: Sequelize.INTEGER
        },
        quarter2: {
            type: Sequelize.INTEGER
        },
        quarter3: {
            type: Sequelize.INTEGER
        },
        quarter4: {
            type: Sequelize.INTEGER
        },
        leadType: {
            type: Sequelize.STRING,
        }

    }, {
        timestamps: true,
    });
    leadGeneration.sync()
    return leadGeneration;
}