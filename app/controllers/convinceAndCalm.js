const express = require("express");
const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const { QueryTypes } = require("sequelize");
const bodyParser = require("body-parser");
const { sequelize, Teams } = require("../../config/db.config.js");
const Op = Sequelize.Op;
const smtp = require("../../config/main.js");
const db = require("../../config/db.config.js");
const app = express();
const convinceAndCalm = db.convinceAndCalm;
const Employees = db.Employees;
//const cors = require("cors")({ origin: true });
const cors = require("cors");
const path = require("path");
var apiRoutes = express.Router();
var multer = require("multer");
const employeesModel = require("../models/employees.model.js");
const fs = require("fs");
const { error } = require("console");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

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

transporter.verify(function (error, success) {
  if (error) {
    //console.log(error);
  } else {
    //console.log("Server is ready to take our messages");
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

module.exports = function (app) {
  const apiRoutes = express.Router();

 apiRoutes.post("/createConvinceAndCalm", async function (req, res) {
    try {
      let employeeData = await Employees.findOne({
        where: { employeeId: req.body.employeeId, organisationId:req.body.user_organisationId },
      });

      var employeeOfficialEmail = employeeData.officialEmail;
      //console.log("employee email...", employeeOfficialEmail);

      let cdate = new Date();
      let udate = new Date();
      let employeeId = req.body.employeeId;
      let employeeName = `${employeeData.firstName} ${employeeData.lastName}`;
      let travelData = req.body.travelData;
      let totalAmount = 0;

      for (let i = 0; i < travelData.length; i++) {
        let amount = travelData[i].amount;
        let parsedAmount = parseInt(amount, 10);

        if (!isNaN(parsedAmount)) {
          totalAmount += parsedAmount;
        }
      }

      let managerResp = await sequelize.query(
        `SELECT managers from Teams WHERE JSON_CONTAINS(users, '${req.body.employeeId}', '$');`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      let employeeManagerData = managerResp;
      const idsToCheck = [201, 354];
      const allManagers = [];
      employeeManagerData.forEach((employee) => {
        allManagers.push(...employee.managers);
        let reportingmanager = allManagers;
        //console.log(reportingmanager);
      });
      idsToCheck.forEach((id) => {
        if (!allManagers.includes(id)) {
          allManagers.push(id);
        }
      });
      employeeManagerData = [{ managers: allManagers }];
      //console.log(employeeManagerData);

      let createdConvinceAndCalm = await convinceAndCalm.create({
        cdate: cdate,
        employeeId: employeeId,
        employeeName: employeeName,
        cdate: cdate,
        status: "New",
        totalAmount: totalAmount,
        travelData: travelData,
        employeeManagerData: employeeManagerData,
        organisationId: req.body.organisationId
      });
      //console.log(employeeManagerData);

      res.status(200).send(createdConvinceAndCalm);

      let teams = await sequelize.query(
        `SELECT * from Teams WHERE JSON_CONTAINS(users, '${employeeId}', '$');`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      let mEmails = ["vshukla@neuvays.com"];
      mEmails.push(employeeOfficialEmail);

      let managerEmails = mEmails;
      //console.log("mail sent to...", managerEmails);

      let subject = `New Convince and Calm application is Submitted by ${employeeName} !!`;
      let message = `New Convince and Calm application created by ${employeeName}.<br><br>  
                      Kindly check it on the Mckinsol Portal...<br><br>
                      Application Id : <b>${createdConvinceAndCalm.convinceAndCalm_Id}</b> <br>
                      Status : <b>New</b> <br>
                      Amount : Rs. <b>${totalAmount}</b> <br>
                      Created on Date : ${cdate}<br><br><br>
                      Thanks & regards<br>
                      <b>HR Portal</b>`;

      mailer(transporter, managerEmails, subject, message);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });

  apiRoutes.post("/getConvinceAndCalm", async function (req, res) {
    await convinceAndCalm
      .findAll({ where: { employeeId: req.body.employeeId, organisationId: req.body.user_organisationId } })
      .then(
        (resp) => {
          res.status(200).send(resp);
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  apiRoutes.post("/getManagerConvinceAndCalm", async function (req, res) {
    sequelize
      .query(
        `SELECT *
        FROM convinceAndCalms
        WHERE JSON_CONTAINS(
                employeeManagerData,
                JSON_ARRAY(JSON_OBJECT('managers', JSON_ARRAY(${req.body.employeeId}))),
                '$'
            );`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (resp) => {
          res.send(resp);
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });
  apiRoutes.post("/updateConvinceAndCalm", async function (req, res) {
    try {
      let udate = new Date();
      let employeeId = req.body.employeeId;
      let reason = req.body.reason || "N/A";
      let travelData = req.body.travelData;
      let totalAmount = 0;
      let isApprovedByAvp;
      let isApprovedByAvpcolor;
      let isApprovedByReportingManager;
      let isApprovedByReportingManagercolor;
     let isApprovedByReportingManager1

      
    for (let i = 0; i < travelData.length; i++) {
      let approvedAmount = parseInt(travelData[i].approvedAmount, 10);
      let amount = parseInt(travelData[i].amount, 10) || 0;
  
      if (isNaN(approvedAmount)) {
          // If approvedAmount is "NA" or not a valid number, use amount
          totalAmount += amount;
          //console.log(`Record ${i + 1}: approvedAmount=NA, amount=${amount}`);
      } else {
          // Otherwise, add both approvedAmount and amount
          totalAmount += approvedAmount;
          //console.log(`Record ${i + 1}: approvedAmount=${approvedAmount}`);
      }
  }
     

        let employee = await Employees.findOne({
          where: { employeeId: employeeId, organisationId:req.body.user_organisationId },
        });

        let employeeOfficialEmail = employee.officialEmail;
        //console.log("employee email...", employeeOfficialEmail);

        var empMiddleware = await Employees.findOne({
          where: { employeeId: req.body.employeeIdMiddleware, organisationId: req.body.user_organisationId },
        });

        let resp = await sequelize.query(
          `SELECT * FROM Employees WHERE employeeId = ${req.body.employeeId};`,
          {
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        let existingEmployee = resp.find(
          (employeesModel) => employeesModel.employeeId
        );

        let employeeName =
          existingEmployee.firstName + " " + existingEmployee.lastName;

        let empMiddlewareName =
          empMiddleware.firstName + " " + empMiddleware.lastName;
        //console.log("employeMiddlewareName : ", empMiddlewareName);
        Status = req.body.status;
        //console.log(Status, "iuiu");
        //console.log("2");
        // Assuming status is part of the request

        //let isApprovedByReportingManager = false;

        
        // //console.log(isApprovedByReportingManager)
        try {
          //let isApprovedByReportingManager = false;
          //   let isApprovedByAvp = false;
          /*if (isApprovedByAvp == true) isApprovedByAvp = true;
          else {
            isApprovedByAvp = false;
          }
          isApprovedByAvpcolor = "";
          isApprovedByReportingManagercolor = "";
          if (isApprovedByReportingManager == true)
            isApprovedByReportingManager = true;
          else isApprovedByReportingManager = false;*/

          //console.log(req.body.employeeId, "hello");
      
          
          /*try{
        (isApprovedByAvp==true)?isApprovedByAvp= true:isApprovedByAvp=false;
        //console.log(isApprovedByAvp);

          (isApprovedByReportingManager==true)?isApprovedByReportingManager=true:isApprovedByReportingManager=false;
          //console.log(isApprovedByReportingManager);
          }catch{
            //console.log(error);
          }*/
          try {
            
            // Your existing code...
        
            // Modify the conditions inside the try block
            isApprovedByAvp = ((req.body.isApprovedByAvp == true) ? true : false);
            //console.log(isApprovedByAvp);
        
           //isApprovedByReportingManager1= ((req.body.isApprovedByReportingManager==true)?true : false);
           isApprovedByReportingManager1=req.body.isApprovedByReportingManager||false;
           //console.log(req.body.isApprovedByReportingManager);
            //console.log(isApprovedByReportingManager1);
            isApprovedByReportingManager=isApprovedByReportingManager1;
            //console.log(isApprovedByReportingManager);
            isApprovedByAvpcolor=(req.body.isApprovedByAvpcolor?(req.body.isApprovedByAvpcolor):isApprovedByAvpcolor="");
           isApprovedByReportingManagercolor= (req.body.isApprovedByReportingManagercolor?(req.body.isApprovedByReportingManagercolor):isApprovedByReportingManagercolor="");
        //console.log(isApprovedByReportingManagercolor);
        } catch (error) {
            console.error("Error:", error);
        }
        /*try {
          // Fetch data from the database based on the calm id
          const calmAndConvienceData = await CalmAndConvience.findOne({
              where: { calmId: req.body.calmId },
          });
      
          if (calmAndConvienceData) {
              // Extract relevant information from the fetched data
              const isApprovedByAvpFromDB = calmAndConvienceData.isApprovedByAvp;
              const isApprovedByReportingManagerFromDB = calmAndConvienceData.isApprovedByReportingManager;
      
              // Set values based on the fetched data
              isApprovedByAvp = (isApprovedByAvpFromDB== true) ? true : false;
              isApprovedByReportingManager = (isApprovedByReportingManagerFromDB==true) ? true : false;
      
              // Continue with the rest of your code...
          } else {
              // Handle the case where no data is found for the given calm id
              console.error('CalmAndConvience data not found for calm id:', req.body.calmId);
              res.status(404).json({ message: 'CalmAndConvience data not found' });
              return;
          }*/
      
        

          if (Status === "Approved" && req.body.employeeId == 354||Status =="Inprogress" ){
            isApprovedByAvp = true;
            isApprovedByAvpcolor = "success";
            //console.log(isApprovedByAvp, "hello Avp");
          } else if (Status === "Rejected" && req.body.employeeId == 354) {
          /*try {
                isApprovedByAvp =  isEmployeeAvpApprovalRequired(req.body.convinceAndCalm_Id);
            } catch (error) {
                console.error("Error:", error);
                
            }*/
            isApprovedByAvp = true;
            isApprovedByAvpcolor = "danger";
            //console.log(isApprovedByAvp, "helloavp");
          } else if ((Status === "Approved" && req.body.employeeId != 354)) {
            isApprovedByReportingManager = true;
            isApprovedByReportingManagercolor = "success";
            Status= "Inprogress";

            //console.log(isApprovedByReportingManager, "hello maneger");
            //console.log("1");
            //console.log(isApprovedByReportingManagercolor, "color");
            //console.log("2");
          } else if(Status === "Rejected" && req.body.employeeId != 354){
            isApprovedByReportingManager = true;
            isApprovedByReportingManagercolor = "danger";

            //console.log(isApprovedByReportingManager, "hello maneger");
            //console.log(isApprovedByReportingManagercolor);
          }
        } catch {
          //console.log(error);
        }

        function mailer(transporter, email, subject, message) {
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
        //console.log(totalAmount, "total amount");
      //  //console.log(isApprovedByAvp);
       // //console.log(isApprovedByReportingManager);
if((isApprovedByAvp==true&&isApprovedByReportingManager==true)||(isApprovedByAvp==true)){
        let updatedConvinceAndCalm = await convinceAndCalm.update(
          {
            status:req.body.status,
            udate: udate,
            reason: reason,
            travelData: travelData,
            totalAmount: totalAmount,
            isApprovedByReportingManager: isApprovedByReportingManager,
            isApprovedByAvp: isApprovedByAvp,
            isApprovedByReportingManagercolor:
              isApprovedByReportingManagercolor,
            isApprovedByAvpcolor: isApprovedByAvpcolor,
            organisationId:req.body.organisationId
          },
          { where: { convinceAndCalm_Id: req.body.convinceAndCalm_Id } }
        );
        res.status(200).json({ updatedConvinceAndCalm });
        return;
}
else if(isApprovedByReportingManager&&(isApprovedByAvp!=true&&isApprovedByReportingManagercolor=="success")){
var updatedConvinceAndCalm = await convinceAndCalm.update(
  {
    status:"In-progress",
    udate: udate,
    reason: reason,
    travelData: travelData,
    totalAmount: totalAmount,
    isApprovedByReportingManager: isApprovedByReportingManager,
    //isApprovedByAvp: isApprovedByAvp,
    isApprovedByReportingManagercolor:
      isApprovedByReportingManagercolor,
    //isApprovedByAvpcolor: isApprovedByAvpcolor,
    organisationId:req.body.organisationId

  },
  { where: { convinceAndCalm_Id: req.body.convinceAndCalm_Id } }
  
);
res.status(200).json({ updatedConvinceAndCalm });
      return;
}
else if(isApprovedByReportingManager&&(isApprovedByAvp!=true&&isApprovedByReportingManagercolor=="danger")){
  var updatedConvinceAndCalm = await convinceAndCalm.update(
    {
      status:req.body.status,
      udate: udate,
      reason: reason,
      travelData: travelData,
      totalAmount: totalAmount,
      isApprovedByReportingManager: isApprovedByReportingManager,
      //isApprovedByAvp: isApprovedByAvp,
      isApprovedByReportingManagercolor:
        isApprovedByReportingManagercolor,
        organisationId:req.body.organisationId

      //isApprovedByAvpcolor: isApprovedByAvpcolor,
    },
    { where: { convinceAndCalm_Id: req.body.convinceAndCalm_Id } }
    
  );
    res.status(200).json({ updatedConvinceAndCalm });
          return;
         // //console.log(status)
  }
        /* let isApprovedByReportingManager = false;
      if(status=="approved")
        if (isReportingManagerApprovalRequired(req.body.employeeId, req.body.convinceAndCalm_Id)) {
          let managerResp = await sequelize.query(
            `SELECT managers from Teams WHERE JSON_CONTAINS(users, '${req.body.employeeId}', '$');`,
            {
              type: Sequelize.QueryTypes.SELECT,
            }
          );
      
          let employeeManagerData = managerResp;
           isApprovedByReportingManager = true;
        }
        if( isApprovedByReportingManager = true){
        let isApprovedByEmployee354 = false;
        if (employeeId === 354 && isEmployee354ApprovalRequired(req.body.convinceAndCalm_Id&& status=="approved")) 

            isApprovedByEmployee354 = true;
        }
      }*/

        let teams = await sequelize.query(
          `SELECT * from Teams WHERE JSON_CONTAINS(users, '${employeeId}', '$');`,
          {
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        let mEmails = ["svishwakarma@neuvays.com"];
        mEmails.push(employeeOfficialEmail);

        let managerEmails = mEmails;
        //console.log("mail sent to...", managerEmails);

        let subject = `Status Updated - Convince and Calm application by ${empMiddlewareName} !!`;
        let message = `Convince and Calm application created by ${employeeName} is now updated by ${empMiddlewareName}.<br><br>
                        Kindly check it on the Mckinsol Portal...<br><br>
                        Application Id : <b>${req.body.convinceAndCalm_Id}</b> <br>
                        Status : <b>${req.body.status}</b> <br>
                        Reason : ${reason} <br>
                        Updated on Date : ${udate}<br><br><br>
                        Thanks & regards,<br>
                        <b>HR Portal</b>`;
        mailer(transporter, managerEmails, subject, message);
      }
     catch (error) {
      console.error("Error:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  });
 
  apiRoutes.post("/getAllConvinceAndCalm", async function (req, res) {
    await convinceAndCalm.findAll({where:{organisationId:req.body.user_organisationId}}).then(
      (resp) => {
        res.status(200).send(resp);
      },
      (err) => {
        res.status(400).send(err);
      }
    );
  });

  app.use("/", apiRoutes);
};
