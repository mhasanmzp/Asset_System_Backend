const moment = require("moment");
const express = require("express");
const apiRoutes = express.Router();
const multer = require("multer");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const smtp = require("../../config/main.js");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
//const { Op, sequelize, leadAdmin } = db.leadAdmin;
let uemail;

let smtpAuth = {
  user: smtp.smtpuser,
  pass: smtp.smtppass,
};
let smtpConfig = {
  host: smtp.smtphost,
  port: smtp.smtpport,
  secure: false,
  auth: smtpAuth,
  //auth:cram_md5
};

let transporter = nodemailer.createTransport(smtpConfig);

const storage = multer.diskStorage({
  destination: "./images/",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });

transporter.verify(function (error, success) {
  if (error) {
    //console.log(error);
  } else {
    //console.log('Server is ready to take our messages');
  }
});

function mailer(transporter, email, subject, message) {
  // //console.log(email, subject, message)
  transporter.sendMail({
    from: {
      name: "HR Portal",
      address: "support@timesofpeople.com",
    },
    to: email,
    subject: `${subject}`,
    html: `${message}`,
  });
}

const db = require("../../config/db.config");
//console.log(db);
const cmf = db.cmf;
const Employees = db.Employees;
const leadGeneration = db.leadGeneration;
const leadAdmin = db.leadAdmin;
const Event = db.Event;
module.exports = (app) => {
  apiRoutes.post("/getCmfRecords", (req, res) => {
    try {
      cmf
        .findAll({
          where: {
            [Op.or]: [
              { createdId: req.body.employeeIdMiddleware },
              { reviewedId: req.body.employeeIdMiddleware },
              { approvedId: req.body.employeeIdMiddleware },
            ],
            organisationId: req.body.user_organisationId,
          },
          order: [["createdAt", "DESC"]],
        })
        .then(
          (data) => {
            res.status(200).send({ data });
          },
          (err) => {
            res.status(400).send({ err });
          }
        );
    } catch (e) {
      //console.log(e);
    }
  });
  apiRoutes.post("/addEvent", async (req, res) => {
    try {
      const { eventName, organization } = req.body; // Access the eventName array and organization from the body
      if (!eventName || !organization) {
        return res.status(400).send({ message: "Event name array and organization ID are required." });
      }

      // Iterate over eventName array and create a new event for each entry
      const events = await Promise.all(eventName.map(eventObj =>
        Event.create({
          eventName: eventObj.eventName,
          organisationId: organization // Using the singular organization ID for all events
        })
      ));

      res.status(201).send(events); // Send all newly created event objects as response
    } catch (error) {
      res.status(400).send(error);
    }
  })
  apiRoutes.post("/eventList", async (req, res) => {
    try {
      const { organisationId } = req.body;
      if (!organisationId) {
        return res.status(400).send({ message: "Organization ID is required" });
      }

      // Fetch events and sort them alphabetically by eventName
      const events = await Event.findAll({
        where: { organisationId },
        order: [['eventName', 'ASC']]  // Sorts by eventName in ascending order
      });

      res.status(200).send(events);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  apiRoutes.post("/createCmf", upload.single("file"), async (req, res) => {
    if (req.body.crNo) {
      let data = req.file;
      if (data) {
        req.body.fileName = data.filename;
      }
      // const currentDate = new Date();
      // const formattedDate = currentDate.toLocaleDateString();
      if (req.body.status == "Rejected") {
        req.body.closedDate = moment().format();
      } else {
        if (req.body.frwForReview) {
          let employeeData = await Employees.findOne({
            where: {
              employeeId: req.body.frwForReview.slice(0, 3),
              organisationId: req.body.user_organisationId,
            },
          });
          let subject = `Pending Review for CRf : ${req.body.crNo}`;
          let message = `
                    Hello ${employeeData.firstName}
                    <br>
    
                    You have recieved a review request for the CRF : ${req.body.crNo}.
                    <br>
    
                    Visit your CRF section at Hr-Portal Dashboad.
                    <br>
                    <br>
                    Thanks and regards,
                    <br>
                    Times Of People
                    `;
          mailer(transporter, employeeData.officialEmail, subject, message);
          req.body.reviewedId = req.body.frwForReview.slice(0, 3);
          req.body.reviewedBy = req.body.frwForReview.slice(4);
          req.body.reviewedDate = moment().format();
        }

        if (req.body.fwdForApproval) {
          let employeeData = await Employees.findOne({
            where: {
              employeeId: req.body.fwdForApproval.slice(0, 3),
              organisationId: req.body.user_organisationId,
            },
          });
          let subject = `Pending Approval of CRF : ${req.body.crNo}`;
          let message = `
                    Hello ${employeeData.firstName}
                    <br>
    
                    You have recieved a approval request for the CRF : ${req.body.crNo}.
                    <br>
    
                    Visit your CRF section at Hr-Portal Dashboad.
                    <br>
                    <br>
                    Thanks and regards,
                    <br>
                    Times Of People
                    `;
          mailer(transporter, employeeData.officialEmail, subject, message);
          req.body.approvedId = req.body.fwdForApproval.slice(0, 3);
          req.body.approvedBy = req.body.fwdForApproval.slice(4);
          req.body.approvedDate = moment().format();
        }
        if (req.body.status == "Approved") {
          req.body.closedDate = moment().format();
        }
      }
      // //console.log(req.body);
      cmf
        .update(req.body, {
          where: {
            crNo: req.body.crNo,
            organisationId: req.body.organisationId,
          },
        })
        .then(
          (result) => {
            res.status(200).send({ msg: "Details Updated!" });
          },
          (error) => {
            res.status(401).send(error);
          }
        );
    } else {
      let employeeData = await Employees.findOne({
        where: {
          employeeId: req.body.employeeIdMiddleware,
          organisationId: req.body.user_organisationId,
        },
      });

      req.body.createdBy = `${employeeData.firstName} ${employeeData.lastName}`;
      req.body.createdId = req.body.employeeIdMiddleware;
      //console.log(req.body);
      const today = new Date();
      const inToday = today.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      let num;
      const formattedDate = new Date(inToday);
      const result = await cmf.findOne({
        where: {
          crNo: {
            [Sequelize.Op.startsWith]: req.body.projectName.slice(0, 2),
          },
          organisationId: req.body.user_organisationId,
        },
        order: [["createdAt", "DESC"]],
        attributes: ["crNo"],
        limit: 1,
      });
      // //console.log({result});
      if (result) {
        num = (
          parseInt(result.crNo.slice(result.crNo.length - 3)) + 1
        ).toString();
        //console.log(num);
      } else {
        num = "1";
      }
      req.body.crNo = req.body.projectName
        .slice(0, 2)
        .concat((formattedDate.getMonth() + 1).toString().padStart(2, "0"))
        .concat(formattedDate.getFullYear())
        .concat(num.padStart(3, "0"));
      //console.log(req.body.crNo);
      cmf.create(req.body).then(
        (data) => {
          res.status(200).send({ data });
        },
        (err) => {
          res.status(400).send({ err });
        }
      );
    }
  });
  apiRoutes.get("/getleadGenerations", (req, res) => {
    try {
      const whereCondition = req.body.user_organisationId
        ? { organisationId: req.body.user_organisationId }
        : {};
  
      leadGeneration
        .findAll({
          where: whereCondition,
          order: [["createdAt", "DESC"]],
        })
        .then((data) => {
          // Format date for each item in the data array
          data.forEach((item) => {
            if (item.potentialCloseDate && item.potentialCloseDate instanceof Date) {
              item.potentialCloseDate = item.potentialCloseDate.toISOString().split('T')[0];
            }
          });
          res.status(200).send({ data });
        })
        .catch((err) => {
          console.error("Error fetching lead data", err);
          res.status(400).send({ error: "Error fetching lead data" });
        });
    } catch (error) {
      console.error("Error reading data", error);
      res.status(400).json({ error: "Error reading data" });
    }
  });





  apiRoutes.post("/createLeadGeneration", async (req, res) => {
    try {
      let existingLead = null;


      if (req.body.leadId) {
        existingLead = await leadGeneration.findOne({
          where: { leadId: req.body.leadId }
        });
      }

      if (existingLead) {

        await existingLead.update(req.body);
      } else {

        existingLead = await leadGeneration.create(req.body);
      }


      const user = await Employees.findOne({
        where: { employeeId: req.body.employeeId },
      });


      const userName = user ? `${user.firstName} ${user.lastName}` : "Unknown User";
      const companyName = req.body.companyDetails && req.body.companyDetails[0] ? req.body.companyDetails[0].companyName : "No Company";
      const userEmail = user ? user.officialEmail : null;

      if (!userEmail) {
        throw new Error("User email not found");
      }


      const subject = "Lead Generation Updates";
      const message = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lead Generation Updates</title>
        <style>
          /* Styles for the email body */
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
        
          /* Container for the email content */
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
        
          /* Heading styles */
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }
        
          /* Paragraph styles */
          p {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
          }
        
          /* List styles */
          ul {
            color: #555;
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 20px;
            padding-left: 20px;
          }
        
          /* Footer styles */
          footer {
            text-align: center;
            margin-top: 20px;
            color: #777;
            font-size: 14px;
          }
        </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #007bff;">Lead Generation Updates</h1>
            <p>Dear Sir,</p>
            <p>On Project of ${companyName} is ${existingLead ? 'updated' : 'created'} by (${userName}). Please open the Times of People for details.</p>
            <ul>
              <li>Project ID: <b>${req.body.leadId}</b></li>
              <li>BDM: <b>${userName}</b></li>
            </ul>
            <p>Thank you!</p>
            <footer>
              HR Portal<br>
              <span style="font-size: 12px;">This is an automated email, please do not reply.</span>
            </footer>
          </div>
        </body>
        </html>`;


      const transporter = nodemailer.createTransport({
        host: smtp.smtphost,
        port: smtp.smtpport,
        secure: false,
        auth: {
          user: smtp.smtpuser,
          pass: smtp.smtppass,
        },
      });


      const emailRecipients = [userEmail, "gmishra@mckinsol.com"];


      transporter.sendMail(
        {
          from: {
            name: "HR Portal",
            address: "support@timesofpeople.com",
          },
          to: emailRecipients,
          subject: subject,
          html: message,
        },
        (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        }
      );

      res.status(200).json({ message: `${existingLead ? 'Updated' : 'Created'} lead successfully`, data: existingLead || req.body });
    } catch (error) {
      console.error("Error creating/updating lead generation:", error);
      res.status(400).json({ status: "200", error: error.message || error });
    }
  });

apiRoutes.post('/upcomingEvents', async (req, res) => {
    try {
      // Function to convert attribute names into more readable format
      const getReadableFieldName = (fieldName) => {
        if (fieldName.startsWith('dateComments')) {
          return fieldName.replace('dateComments', '');
        }
        return fieldName;
      };
      // Function to determine the current quarter
      const getCurrentQuarter = (date) => {
        const month = date.getMonth() + 1;
        if (month >= 1 && month <= 3) return 1;
        if (month >= 4 && month <= 6) return 2;
        if (month >= 7 && month <= 9) return 3;
        if (month >= 10 && month <= 12) return 4;
      };
      // Function to get the months in the current quarter
      const getQuarterMonths = (quarter) => {
        const quarters = {
          1: ["January", "February", "March"],
          2: ["April", "May", "June"],
          3: ["July", "August", "September"],
          4: ["October", "November", "December"]
        };
        return quarters[quarter];
      };
      // Function to check if a month is within the current quarter
      const isMonthInCurrentQuarter = (month, currentQuarter) => {
        const quarters = {
          1: [1, 2, 3],
          2: [4, 5, 6],
          3: [7, 8, 9],
          4: [10, 11, 12]
        };
        return quarters[currentQuarter].includes(month);
      };
      const today = new Date();
      const filterMonth = req.body.month || req.body.month2 || req.body.month3 || req.body.month4; // Expecting month in numeric format (1-12)
      let endDate;
      if (filterMonth) {
        // Set date range to the specified month only
        const startOfMonth = new Date(today.getFullYear(), filterMonth - 1, 1);
        endDate = new Date(today.getFullYear(), filterMonth, 0); // Last day of the specified month
        today.setTime(startOfMonth.getTime()); // Set today to the start of the month
      } else {
        // Default range to the next four months
        endDate = new Date();
        endDate.setMonth(today.getMonth() + 4);
      }
      const leads = await leadGeneration.findAll({
        attributes: [
          'companyDetails',
          'dateCommentsPreparation',
          'dateCommentsresourceAllocation',
          'dateCommentsprojectAwarded',
          'dateCommentsmockoralssowDiscussion',
          'dateCommentsNegotiation',
          'dateCommentsProposalSubmission',
          'dateCommentsMockSessionsInternal',
          'dateCommentsProposalPreparation',
          'dateCommentsPreSalesDemo',
          'dateCommentsPreSales',
          'monthRevenue1',
          'monthRevenue2',
          'monthRevenue3',
          'potentialCloseDate',
          'q1',
          'q2',
          'q3',
          'q4',
          'revenueForMonth1',
          'revenueForMonth2',
          'revenueForMonth3',
          'quarter1',
          'quarter2',
          'quarter3',
          'quarter4'
        ]
      });
      let upcomingEvents = [];
      const currentQuarter = getCurrentQuarter(today);
      const quarterMonths = getQuarterMonths(currentQuarter);
      // Process each lead
      leads.forEach(lead => {
        const companyInfo = lead.companyDetails && lead.companyDetails.length > 0 ? lead.companyDetails[0] : { companyName: "No Company" };
        Object.keys(lead.toJSON()).forEach(key => {
          if (key.startsWith('dateComments')) {
            const dateComments = lead[key];
            dateComments.forEach(comment => {
              if (comment.startDateAndTimeline1) {
                const eventDate = new Date(comment.startDateAndTimeline1);
                if (eventDate >= today && eventDate <= endDate) {
                  let event = {
                    leadId: lead.leadId,
                    field: getReadableFieldName(key),
                    comment: comment.comment,
                    eventId: comment.eventId,
                    eventNames: comment.eventNames,
                    eventStatus: comment.eventStatus,
                    salesPerson: comment.salesPerson,
                    companyName: companyInfo.companyName,
                    startDate: comment.startDateAndTimeline1,
                    duration: comment.duration,
                    date: eventDate,
                    monthRevenue1: "",
                    monthRevenue2: "",
                    monthRevenue3: "",
                    revenueForMonth1: 0,
                    revenueForMonth2: 0,
                    revenueForMonth3: 0
                  };
                  // Add quarter-specific fields
                  if (currentQuarter === 1) {
                    event.q1 = lead.q1;
                    event.quarter1 = lead.quarter1;
                  } else if (currentQuarter === 2) {
                    event.q2 = lead.q2;
                    event.quarter2 = lead.quarter2;
                  } else if (currentQuarter === 3) {
                    event.q3 = lead.q3;
                    event.quarter3 = lead.quarter3;
                  } else if (currentQuarter === 4) {
                    event.q4 = lead.q4;
                    event.quarter4 = lead.quarter4;
                  }
                  // Add month-specific revenue fields if they lie in the current quarter
                  const months = { "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12 };
                  const currentQuarterMonths = quarterMonths.map(month => months[month]);
                  let monthData = {};
                  [lead.monthRevenue1, lead.monthRevenue2, lead.monthRevenue3].forEach((month, index) => {
                    if (isMonthInCurrentQuarter(months[month], currentQuarter)) {
                      monthData[month] = lead[`revenueForMonth${index + 1}`];
                    }
                  });
                  // Ensure all quarter months are included in the response
                  quarterMonths.forEach((month, index) => {
                    event[`monthRevenue${index + 1}`] = month;
                    event[`revenueForMonth${index + 1}`] = monthData[month] || 0;
                  });
                  upcomingEvents.push(event);
                }
              }
            });
          }
        });
      });
      // Sort events by the nearest upcoming date
      upcomingEvents.sort((a, b) => a.date - b.date);
      if (upcomingEvents.length > 0) {
        res.status(200).json({ status: 200, message: "Upcoming events fetched successfully.", data: upcomingEvents });
      } else {
        res.json({ message: "No upcoming events found." });
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Error fetching data", error: error.message || error });
    }
  });


  /*apiRoutes.post('/updateLeadGeneration', async (req, res) => {
    try {
        const leadId = req.body.leadId;
        console.log(leadId); 
        if (!leadId) {
            return res.status(400).json({ error: 'Lead ID is required' });
        }

        const lead = await leadGeneration.findOne({ where: { leadId: leadId } });
        if (!lead) {
            return res.status(400).json({ error: 'Lead not found' });
        }

        const { dateCommentsPreparation, dateCommentsresourceAllocation, dateCommentsprojectAwarded, dateCommentsmockoralssowDiscussion, dateCommentsNegotiation, dateCommentsProposalSubmission, dateCommentsMockSessionsInternal, dateCommentsProposalPreparation, dateCommentsPreSalesDemo, dateCommentsPreSales, companyDetails } = req.body;

        // Transform eventStatus based on its value
        const updatedDateCommentsPreSales = req.body.dateCommentsPreSales.map(comment => {
            return {
                ...comment,
                eventStatus: comment.eventStatus ? 'complete' : 'incomplete' // Transforming eventStatus
            };
        });

        const updatedDateComments = updatedDateCommentsPreSales.map(dateCommentPreSales => ({
            dateCommentsPreSales: [dateCommentPreSales]
        }));

        // Append existing dateComments to the updatedDateComments array
        if (lead.dateComments) {
            updatedDateComments.push(...lead.dateComments);
        }

        const updatedLead = await leadGeneration.update({
            dateComments: updatedDateComments,
            companyDetails: companyDetails,
            // Include other fields you want to update here
        }, {
            where: { leadId: leadId }
        });

        return res.status(200).json({ status: '200', data:req.body });
    } catch (error) {
        console.error('Error updating lead generation:', error);
        res.status(400).json({ error: 'Failed to update lead generation' });
    }
});*/
  app.post("/updateLeadGeneration", async (req, res) => {
    try {
      const leadId = req.body.leadId;
      if (!leadId) {
        return res.status(400).json({ error: "Lead ID is required" });
      }

      const {
        preSalesStatus,
        preSalesDemoStatus,
        mock_orals_sowDiscussionStatus,
        mockSessionsInternalStatus,
        proposalSubmissionStatus,
        negotiationStatus,
        proposalPreparationStatus,
        resourceAllocationStatus,
        projectAwardedStatus,
        dateCommentsPreparation,
        dateCommentsresourceAllocation,
        dateCommentsprojectAwarded,
        dateCommentsmockoralssowDiscussion,
        dateCommentsNegotiation,
        dateCommentsProposalSubmission,
        dateCommentsMockSessionsInternal,
        dateCommentsProposalPreparation,
        dateCommentsPreSalesDemo,
        dateCommentsPreSales,
      } = req.body;

      const lead = await leadGeneration.findOne({ where: { leadId: leadId } });


      const [numUpdated] = await leadGeneration.update(
        {
          preSalesStatus,
          preSalesDemoStatus,
          mock_orals_sowDiscussionStatus,
          mockSessionsInternalStatus,
          proposalSubmissionStatus,
          negotiationStatus,
          proposalPreparationStatus,
          resourceAllocationStatus,
          projectAwardedStatus,
          dateCommentsPreparation: lead.dateCommentsPreparation.concat(
            dateCommentsPreparation || []
          ),
          dateCommentsresourceAllocation:
            lead.dateCommentsresourceAllocation.concat(
              dateCommentsresourceAllocation || []
            ),
          dateCommentsprojectAwarded: lead.dateCommentsprojectAwarded.concat(
            dateCommentsprojectAwarded || []
          ),
          dateCommentsmockoralssowDiscussion:
            lead.dateCommentsmockoralssowDiscussion.concat(
              dateCommentsmockoralssowDiscussion || []
            ),
          dateCommentsNegotiation: lead.dateCommentsNegotiation.concat(
            dateCommentsNegotiation || []
          ),
          dateCommentsProposalSubmission:
            lead.dateCommentsProposalSubmission.concat(
              dateCommentsProposalSubmission || []
            ),
          dateCommentsMockSessionsInternal:
            lead.dateCommentsMockSessionsInternal.concat(
              dateCommentsMockSessionsInternal || []
            ),
          dateCommentsProposalPreparation:
            lead.dateCommentsProposalPreparation.concat(
              dateCommentsProposalPreparation || []
            ),
          dateCommentsPreSalesDemo: lead.dateCommentsPreSalesDemo.concat(
            dateCommentsPreSalesDemo || []
          ),
          dateCommentsPreSales: lead.dateCommentsPreSales.concat(
            dateCommentsPreSales || []
          ),
        },
        { where: { leadId: leadId } }
      );

      const user = await Employees.findOne({
        where: { employeeId: req.body.employeeId },
      });
      console.log(user);
      const userEmail = user.officialEmail;

      if (numUpdated === 1) {

        const dateCommentsTypes = [
          "dateCommentsPreparation",
          "dateCommentsresourceAllocation",
          "dateCommentsprojectAwarded",
          "dateCommentsmockoralssowDiscussion",
          "dateCommentsNegotiation",
          "dateCommentsProposalSubmission",
          "dateCommentsMockSessionsInternal",
          "dateCommentsProposalPreparation",
          "dateCommentsPreSalesDemo",
          "dateCommentsPreSales",
        ];

        for (const commentType of dateCommentsTypes) {
          if (req.body[commentType]) {
            await sendReminderEmail(req.body, commentType, userEmail);
          }
        }


        const subject = "Lead Generation Updates";
        let formattedComments = "";
        let discussionKey = "";


        for (const commentType of dateCommentsTypes) {
          if (req.body[commentType]) {
            discussionKey = commentType;
            break;
          }
        }

        if (discussionKey) {
          formattedComments = req.body[discussionKey]
            .map((comment) => {
              return `<li>Event ID: ${comment.eventId}, Comment: ${comment.comment}, Duration: ${comment.duration}</li>`;
            })
            .join("");
        }


        // Remove "Event ID:" from formattedComments
        const commentsWithoutEventId = formattedComments.replace(/Event\s+ID\s*:/g, '');

        // Use commentsWithoutEventId in the email template
        const message = `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lead Generation Updates</title>
            <style>
              /* Styles for the email body */
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }
            
              /* Container for the email content */
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
            
              /* Heading styles */
              h1 {
                color: #333;
                text-align: center;
                margin-bottom: 20px;
              }
            
              /* Paragraph styles */
              p {
                color: #555;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
              }
            
              /* List styles */
              ul {
                color: #555;
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
                padding-left: 20px;
              }
            
              /* Footer styles */
              footer {
                text-align: center;
                margin-top: 20px;
                color: #777;
                font-size: 14px;
              }
            </style>
            </head>
            <body>
              <div class="container">
                <h1 style="color: #007bff;">Lead Generation Updates</h1>
                <p>Dear Sir,</p>
                <p>Discussion comments:</p>
                <ul>${commentsWithoutEventId}</ul>
                <p>Date: ${new Date().toDateString()}</p>
                <p>The lead generation has been updated. Please review the changes.</p>
                <p>Thank you!</p>
                <footer>
                  HR Portal<br>
                  <span style="font-size: 12px;">This is an automated email, please do not reply.</span>
                </footer>
              </div>
            </body>
            </html>`;


        // Set up transporter with SMTP configuration
        const transporter = nodemailer.createTransport({
          host: smtp.smtphost,
          port: smtp.smtpport,
          secure: false,
          auth: {
            user: smtp.smtpuser,
            pass: smtp.smtppass,
          },
        });

        // Specify the email address
        const emailRecipients = [userEmail];

        // Send email using the transporter
        transporter.sendMail(
          {
            from: {
              name: "HR Portal",
              address: "support@timesofpeople.com",
            },
            to: emailRecipients,
            subject: subject,
            html: message,
          },
          (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
            } else {
              console.log("Email sent:", info.response);
            }
          }
        );

        return res.status(200).json({ status: "200", data: req.body });
      } else {
        return res.status(400).json({ status: "400", error: "Lead not found" });
      }
    } catch (error) {
      console.error("Error updating lead generation:", error);
      return res
        .status(400)
        .json({ error: "Failed to update lead generation" });
    }
  });

  async function sendReminderEmail(data, commentType, userEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.smtphost,
        port: smtp.smtpport,
        secure: false,
        auth: {
          user: smtp.smtpuser,
          pass: smtp.smtppass,
        },
      });
      console.log(data);

      const today = new Date();
      const startDateAndTimeline1 = data[commentType][0].startDateAndTimeline1;
      const startDate = new Date(startDateAndTimeline1);
      console.log(startDate);

      // Adjust date parsing to ensure correct interpretation
      const oneDayBeforeStartDate = new Date(startDate.getTime() - 86400000); // 86400000 milliseconds = 1 day
      const oneDayAfterStartDate = new Date(startDate.getTime() + 86400000); // 86400000 milliseconds = 1 day
      console.log(oneDayBeforeStartDate);
      console.log(oneDayAfterStartDate);
      if (!isNaN(startDate.getTime())) {
        if (today >= oneDayBeforeStartDate || today <= oneDayAfterStartDate) {
          // console.log("4");
          const emailRecipients = [
            // userEmail,
            //"gmishra@mckinsol.com",
            "vshukla@neuvays.com",
          ];

          const subject = " Lead Generation Alert";
          let formattedComments = "";

          if (commentType && data[commentType]) {
            formattedComments = data[commentType]
              .map((comment) => {
                return `<li> Comment: ${comment.comment}, Duration: ${comment.duration}</li>`;
              })
              .join("");
          }
          const commentsWithoutEventId = formattedComments.replace(/Event\s+ID\s*:/g, '');

          const message = `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reminder for Lead Generation</title>
                    <style>
                      /* Styles for the email body */
                      body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                      }
                    
                      /* Container for the email content */
                      .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #fff;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      }
                    
                      /* Heading styles */
                      h1 {
                        color: #333;
                        text-align: center;
                        margin-bottom: 20px;
                      }
                    
                      /* Paragraph styles */
                      p {
                        color: #555;
                        font-size: 16px;
                        line-height: 1.5;
                        margin-bottom: 20px;
                      }
                    
                      /* List styles */
                      ul {
                        color: #555;
                        font-size: 16px;
                        line-height: 1.5;
                        margin-bottom: 20px;
                        padding-left: 20px;
                      }
                    
                      /* Footer styles */
                      footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #777;
                        font-size: 14px;
                      }
                    </style>
                    </head>
                    <body>
                      <div class="container">
                        <h1 style="color: #007bff;">Lead Generation Alert</h1>
                        <p>Dear Sir,</p>
                        <p>Discussion comments:</p>
                        <ul>${commentsWithoutEventId}</ul>
                        <p>Date: ${new Date().toDateString()}</p>
                        <p>This is a reminder for the upcoming lead generation event.</p>
                        <p>Thank you!</p>
                        <footer>
                          HR Portal<br>
                          <span style="font-size: 12px;">This is an automated email, please do not reply.</span>
                        </footer>
                      </div>
                    </body>
                    </html>`;

          await transporter.sendMail({
            from: {
              name: "HR Portal",
              address: "support@timesofpeople.com",
            },
            to: emailRecipients,
            subject: subject,
            html: message,
          });
          // console.log("hi");

          console.log("Reminder email sent successfully");
        } else {
          //console.log("fyr");
        }
      } else {
        console.error("Invalid start date:", data.startDateAndTimeline1);
      }
    } catch (error) {
      console.error("Error sending reminder email:", error);
    }
  }

  apiRoutes.post("/updateEventData", async (req, res) => {
    try {
      const leadId = req.body.leadId;
      const eventId = req.body.eventId;
      const eventStatus = req.body.eventStatus;
      const eventName = req.body.eventName;

      console.log(leadId);
      console.log(eventId);
      console.log(eventStatus);
      console.log(eventName);

      if (!leadId || !eventId || !eventStatus || !eventName) {
        return res
          .status(400)
          .json({
            error:
              "Lead ID, event ID, event status, and event name are required",
          });
      }

      const lead = await leadGeneration.findOne({ where: { leadId: leadId } });

      const eventNameToField = {
        preSales: "dateCommentsPreSales",
        preSalesDemo: "dateCommentsPreSalesDemo",
        mock_orals_sowDiscussion: "dateCommentsmockoralssowDiscussion",
        proposalPreparation: "dateCommentsProposalPreparation",
        resourceAllocation: "dateCommentsresourceAllocation",
        projectAwarded: "dateCommentsprojectAwarded",
        negotiation: "dateCommentsNegotiation",
        proposalSubmission: "dateCommentsProposalSubmission",
        mockSessionsInternal: "dateCommentsMockSessionsInternal",
      };

      const fieldName = eventNameToField[eventName];

      if (!fieldName) {
        return res.status(400).json({ error: "Invalid event name" });
      }

      console.log(fieldName);

      const existingDateComments = lead[fieldName] || [];
      console.log(existingDateComments);

      const eventIndex = existingDateComments.findIndex(
        (item) => item.eventId == eventId
      );

      console.log(eventIndex);

      if (eventIndex === -1) {
        return res
          .status(400)
          .json({ error: "Event ID not found for the specified lead" });
      }

      existingDateComments[eventIndex].eventStatus = eventStatus;

      const [numUpdated] = await leadGeneration.update(
        {
          [fieldName]: existingDateComments,
        },
        { where: { leadId: leadId } }
      );

      console.log(existingDateComments);

      if (numUpdated === 1) {
        return res
          .status(200)
          .json({ status: "200", data: existingDateComments });
      } else {
        return res.status(400).json({ status: "400", error: "Lead not found" });
      }
    } catch (error) {
      console.error("Error updating event data:", error);
      res.status(400).json({ error: "Failed to update event data" });
    }
  });
  /*apiRoutes.get('/downloadLeadGenerationsPDF', async (req, res) => {
    try {
        let data;
        if (!req.body.user_organisationId) {
            data = await leadGeneration.findAll({
                order: [['createdAt', 'DESC']]
            });
        } else {
            data = await leadGeneration.findAll({
                where: { organisationId: req.body.user_organisationId },
                order: [['createdAt', 'DESC']]
            });
        }

        // Generate PDF
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, 'leadGenerations.pdf');
        const stream = fs.createWriteStream(filePath);

        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }

        doc.pipe(stream);

        // Table headers
        const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Organization', 'Created At'];

        // Set up table column widths
        const columnWidths = [100, 100, 150, 100, 150, 150];

        // Draw table headers
        drawRow(doc, headers, columnWidths);

        // Populate table with lead generation data
        data.forEach(lead => {
            const rowData = [
                lead.id?.toString() || '', // Use optional chaining and provide a default value
                lead.name || '',
                lead.email || '',
                lead.phone || '',
                lead.organization || '',
                lead.createdAt?.toString() || '' // Use optional chaining and provide a default value
            ];
            drawRow(doc, rowData, columnWidths);
        });

        doc.end();

        stream.on('finish', () => {
            res.status(200).download(filePath);
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Function to draw a row in the table
function drawRow(doc, rowData, columnWidths) {
    let y = doc.y;
    rowData.forEach((cell, i) => {
        doc
            .fontSize(10)
            .text(cell, doc.x + 10, y, {
                width: columnWidths[i],
                align: 'left'
            });
        doc.x += columnWidths[i];
    });
    doc.x = 50;
    doc.y += 20;
}


// Function to draw a row in the table
function drawRow(doc, rowData, columnWidths) {
    let y = doc.y;
    rowData.forEach((cell, i) => {
        doc
            .fontSize(10)
            .text(cell, doc.x + 10, y, {
                width: columnWidths[i],
                align: 'left'
            });
        doc.x += columnWidths[i];
    });
    doc.x = 50;
    doc.y += 20;
}
*/

  // apiRoutes.post('/assignLeadRequests', async (req, res) => {
  //     try {
  //         console.log("test log")
  //         const assignedLead = await leadAdmin.create(req.body);
  //         res.status(200).json({message : "Lead request assigned successfully !", data: assignedLead });
  //     } catch (error) {
  //         res.status(400).json({error:error });
  //     }
  // });

  apiRoutes.post("/getLeadGenerationsByFilter", async (req, res) => {
    try {
      const { companyName, fromDate, toDate } = req.body;
      if (companyName) {
        // Search by company name
        const data = await leadGeneration.findAll({
          where: {
            'companyDetails': {
              [Op.not]: null, // Check if companyDetails is not null
              [Op.and]: [
                Sequelize.literal(`JSON_CONTAINS(companyDetails, '[{"companyName": "${companyName}"}]')`) // Check if companyDetails contains an object with the specified companyName
              ]
            }
          },
          order: [["createdAt", "DESC"]],
        });
        // Format date for each item in the data array
        data.forEach((item) => {
          if (item.potentialCloseDate && item.potentialCloseDate instanceof Date) {
            item.potentialCloseDate = item.potentialCloseDate.toISOString().split('T')[0];
          }
        });
        res.status(200).send({ data });
      } else if (fromDate && toDate) {
        // Search by date range
        const data = await leadGeneration.findAll({
          where: {
            createdAt: {
              [Op.between]: [fromDate, toDate]
            }
          },
          order: [["createdAt", "DESC"]],
        });
        // Format date for each item in the data array
        data.forEach((item) => {
          if (item.potentialCloseDate && item.potentialCloseDate instanceof Date) {
            item.potentialCloseDate = item.potentialCloseDate.toISOString().split('T')[0];
          }
        });
        res.status(200).send({ data });
      } else {
        res.status(400).send({ error: "Invalid request. Please provide companyName or fromDate and toDate." });
      }
    } catch (error) {
      console.error("Error reading data", error);
      res.status(400).json({ error: "Error reading data" });
    }
  });

  apiRoutes.post("/assignLeadRequests", async (req, res) => {
    try {
      if (new Date(req.body.toDate) <= new Date(req.body.fromDate)) {
        return res
          .status(400)
          .json({ error: "To date must be greater than from date" });
      }

      let timestamp = new Date().getTime() + "";
      let requestNo = timestamp.substr(timestamp.length - 10);
      let bulkLeadData = [];

      req.body.repeatingFields.forEach((p) => {
        bulkLeadData.push({
          month: req.body.month,
          fromDate: req.body.fromDate,
          toDate: req.body.toDate,
          commonLeadId: requestNo,
          bdm: p.bdm,
          location: p.location,
          target: p.target,
          lob: p.lob,
        });
      });

      console.log("data", bulkLeadData);
      const assignedLead = await leadAdmin.bulkCreate(bulkLeadData);
      res
        .status(200)
        .json({
          message: "Lead request assigned successfully!",
          data: assignedLead,
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  apiRoutes.post("/getassignedLeadRequests", (req, res) => {
    let payload = [
      { employeeId: 426, firstName: "Somil Agarwal" },
      { employeeId: 189, firstName: "Santosh Kumar" },
      { employeeId: 416, firstName: "Sam" },
      { employeeId: 183, firstName: "Gaurav Mishra" },
      { employeeId: 354, firstName: "Ashish Sharma" },
      { employeeId: 203, firstName: "Anurag Varshney" },
    ];
    const filteredPayload = payload.filter(
      (empId) => empId.employeeId === req.body.employeeId
    );
    console.log(filteredPayload.length);
    if ([183, 354].includes(req.body.employeeId)) {
      leadAdmin
        .findAll({
          order: [["assignId", "DESC"]],
        })
        .then(
          (data) => {
            res.status(200).send({ results: data });
          },
          (err) => {
            res.status(400).send({ error: err });
          }
        );
    } else {
      if (filteredPayload.length > 0) {
        leadAdmin
          .findAll({
            where: { bdm: filteredPayload[0].firstName },
          })
          .then(
            (data) => {
              res.status(200).send({ results: data });
            },
            (err) => {
              res.status(400).send({ error: err });
            }
          );
      } else {
        res.send({ Message: "Data not available for requested employeeId!" });
      }
    }
  });
  apiRoutes.post('/getFilteredAssignedLeadRequests', (req, res) => {
    try {
      let queryData = {
        fromDate: {
          [Op.gte]: req.body.fromDate
        },
        toDate: {
          [Op.lte]: req.body.toDate
        }
      };

      if (req.body.bdm != '' && req.body.bdm != null) {
        queryData.bdm = req.body.bdm;
      }
      if (req.body.lob != '' && req.body.lob != null) {
        queryData.lob = req.body.lob;
      }
      if (req.body.location != '' && req.body.location != null) {
        queryData.location = req.body.location;
      }

      console.log("queryData", queryData);

      leadAdmin.findAll({
        where: queryData,
        order: [
          [Sequelize.literal('MONTH(fromDate)'), 'ASC']
        ]
      }).then(data => {
        res.status(200).send({ results: data });
      }).catch(err => {
        console.error('Error fetching lead requests:', err);
        res.status(500).send({ error: 'Failed to fetch lead requests' });
      });
    } catch (error) {
      console.error('Error in getFilteredAssignedLeadRequests:', error);
      res.status(500).send({ error: 'Internal server error' });
    }

  });
  apiRoutes.post("/getAssignedLeadRequestsForWeek", (req, res) => {
    const { employeeId } = req.body;
    let payload = [

      { employeeId: 426, firstName: "Somil Agarwal" },
      { employeeId: 189, firstName: "Santosh Kumar" },
      { employeeId: 416, firstName: "Sam" },
      { employeeId: 183, firstName: "Gaurav Mishra" },
      { employeeId: 354, firstName: "Ashish Sharma" },
      { employeeId: 203, firstName: "Anurag Varshney" },
    ];

    // Get the start and end date of the current week
    const currentDate = new Date();
    const firstDayOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())); // Sunday
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6); // Saturday

    // Check if the employeeId exists in the payload
    const filteredPayload = payload.filter((emp) => emp.employeeId == employeeId);

    // If the employeeId exists in the payload
    if (filteredPayload.length > 0) {
      // Query database for data within the current week for the specified employeeId
      leadAdmin.findAll({
        where: {
          bdm: filteredPayload[0].firstName, // Assuming `firstName` is the field in leadAdmin table
          createdAt: {
            [Op.between]: [firstDayOfWeek, lastDayOfWeek]
          }
        },
        order: [["createdAt", "DESC"]]
      }).then(
        (data) => {
          if (data.length > 0) {
            // Extract relevant data and add unique IDs to leads
            const results = data.map((lead) => {
              const actualLeads = lead.dataValues.actualLeads;
              const leads = actualLeads && actualLeads.leads && Array.isArray(actualLeads.leads)
                ? actualLeads.leads.map((leadItem, index) => ({ id: index + 1, ...leadItem }))
                : [];
              return {
                ...lead.dataValues,
                actualLeads: {
                  leads: leads
                }
              };
            });

            res.status(200).send({ results: results });
          } else {
            res.send({ Message: "No data available for the requested employee in the current week!" });
          }
        },
        (err) => {
          res.status(400).send({ error: err });
        }
      );
    } else {
      // If the employeeId doesn't exist in the payload, return an error
      res.send({ Message: "No data available for the requested employee in the current week!" });
    }
  });



  apiRoutes.post('/updateAssignedLead', async (req, res) => {
    try {
      const assignId = req.body.assignId;
      const leadFields = req.body.leadFields;

      if (!assignId || !leadFields) {
        return res.status(400).json({ status: 400, message: 'Fill all the mandatory fields!' });
      }

      let actualData = await leadAdmin.findOne({ where: { assignId } });
      if (!actualData) {

        actualData = await leadAdmin.create({ assignId, status: 'Completed', actualLeads: { leads: [] }, actual: 0 });
      }

      if (actualData.actualLeads.leads == "NA") {
        actualData.actualLeads.leads = [];
      }


      actualData.actualLeads.leads = actualData.actualLeads.leads.concat(leadFields);

      await leadAdmin.update(
        {
          status: 'Completed',
          actualLeads: actualData.actualLeads,
          actual: actualData.actualLeads.leads.length,
        },
        { where: { assignId } }
      );

      return res.status(200).json({ status: 200, message: 'Assigned Lead Completed!' });
    } catch (error) {
      console.error('Error updating assigned lead:', error);
      return res.status(500).json({ status: 500, error: 'Internal server error!' });
    }
  });


  apiRoutes.post("/deleteEvent", async (req,res) =>{
    try {
      const { id } = req.body;
      if ( !id) {
          return res.status(400).send({ message: "Event name array and organization ID are required." });
      }
      const event = await Event.findByPk(id);
      await event.destroy();
      res.status(200).send({ message: 'Event deleted successfully.' });
  } catch (error) {
      res.status(400).send(error);
  }
  })
  apiRoutes.post('/updateEvent', async (req, res) => {
    try {
      const { id, eventName, organization } = req.body;
      if (!id || !eventName || !organization) {
        return res.status(400).send({ message: 'Event ID, event name, and organization ID are required.' });
      }
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).send({ message: 'Event not found.' });
      }
      event.eventName = eventName;
      event.organisationId = organization;
      await event.save();
      res.status(200).send(event);
    } catch (error) {
      res.status(400).send(error);
    }
  })









  apiRoutes.post("/listOfCompletedLeads", (req, res) => {
    try {
      leadAdmin
        .findAll({
          where: { status: "Completed" },
        })
        .then(
          (data) => {
            const newArray = data.map((obj) => obj["actualLeads"]);
            const mergedArray = [];
            newArray.forEach((k) => {
              if (Array.isArray(k.leads)) { // Check if k has a leads property that is an array
                mergedArray.push(...k.leads); // Spread the leads array into mergedArray
              } else {
                console.error("Expected an array in leads property, found:", k);
              }
            });

            function removeDuplicates(array, property) {
              const seen = new Set();
              return array.filter((item) => {
                const value = item[property];
                if (!seen.has(value)) {
                  seen.add(value);
                  return true;
                }
                return false;
              });
            }

            // Remove duplicates based on the 'detail' property
            const uniqueArray = removeDuplicates(mergedArray, "detail");

            // Sort the array alphabetically by the 'detail' property
            uniqueArray.sort((a, b) => {
              if (a.detail < b.detail) return -1;
              if (a.detail > b.detail) return 1;
              return 0;
            });

            res.status(200).send({ results: uniqueArray });
          },
          (err) => {
            res.status(400).send({ error: err });
          }
        );
    } catch (e) {
      res.status(400).json({ error: e });
    }
  });


  apiRoutes.post("/bdmLists", (req, res) => {
    let payload = [
      { employeeId: 426, firstName: "Somil Agarwal" },
      { employeeId: 189, firstName: "Santosh Kumar" },
      { employeeId: 416, firstName: "Sam" },
      { employeeId: 183, firstName: "Gaurav Mishra" },
      { employeeId: 354, firstName: "Ashish Sharma" },
      { employeeId: 207, firstName: "Manali Naik" },
      { employeeId: 203, firstName: "Anurag Varshney" },
    ];
    res.send({ results: payload });
  });

  app.use("/", apiRoutes);
};
