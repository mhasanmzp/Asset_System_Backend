const express = require("express");
const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const { QueryTypes } = require("sequelize");
const { sequelize, Teams } = require("../../config/db.config.js");
const Op = Sequelize.Op;
const smtp = require("../../config/main.js");
const db = require("../../config/db.config.js");
const ticket = db.ticket;
const Employees = db.Employees;
const ticketComments = db.ticketComments;
const cors = require("cors")({ origin: true });
const path = require("path");
var apiRoutes = express.Router();
var multer = require("multer");
const employeesModel = require("../models/employees.model.js");
const ejs = require('ejs');
const fs = require('fs');

module.exports = function (app) {
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

  // const storage = multer.diskStorage({
  //   destination: './images',
  //   filename: (req, file, cb) => {
  //       return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  //   }
  // })
  // const upload = multer({ storage: storage })

  // module.exports = function (app) {
  // const apiRoutes = express.Router();

  let transporter = nodemailer.createTransport(smtpConfig);

  transporter.verify(function (error, success) {
    if (error) {
      //console.log(error);
    } else {
      //console.log("Server is ready to take our messages");
    }
  });


  apiRoutes.post("/saveOrSubmitGrievance", async function (req, res) {

    // //console.log(req.file)

    let categories = {
      Management: [{ "employeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "employeeId": "344", "officialEmail": " akaushik1@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }],
      // Management: [{ "employeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "employeeId": "344", "officialEmail": " akaushik1@mckinsol.com" }],
      Attendence: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      Leaves: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      Payroll: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      Holidays: [{ "employeeId": "204", "officialEmail": " rajni@mckinsol.com" }, { "EmployeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }],
      Infrastructure: [{ "employeeId": "130", "officialEmail": " cawana@mckinsol.net" }, { "employeeId": "181", "officialEmail": "ssharma@mckinsol.com" }],
      salaryDeduction: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      IT: [{ "employeeId": "105", "officialEmail": "rahul.contractor@neuvays.com" }],
      Training: [{ "employeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }],
      resignation: [{}],
      // Others : [ {"employeeId":"394" , "officialEmail" : "svishwakarma@neuvays.com" }],
      // Others : [ {"employeeId":"394" , "officialEmail" : "svishwakarma@neuvays.com" },{"employeeId": "138", "officialEmail" : "hsingh@mckinsol.com"},{"employeeId": "141", "officialEmail" : " pvarshney@mckinsol.com"},{"employeeId":"389" , "officialEmail" : "mhasan@neuvays.com" } ],
      Others: [{ "employeeId": "204", "officialEmail": " rajni@mckinsol.com" }, { "EmployeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }, { "employeeId": "344", "officialEmail": " akaushik1@mckinsol.com" }]
    }

    sequelize
      .query(
        `SELECT * FROM Employees WHERE employeeId = ${req.body.employeeId} And organisationId = ${req.body.organisationId};`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (resp) => {
          // //console.log(resp)
          var employeeData = resp.find(
            (employeesModel) => employeesModel.employeeId
          );
          // //console.log(employeeData.officialEmail,employeeData.firstName,employeeData.lastName);

          function mailer(transporter, email, subject, message) {
            // //console.log(email, subject, message)
            transporter.sendMail({
              from: {
                name: "HR Portal",
                address: "support@timesofpeople.com",
              },
              to: email,
              subject: `${subject}`,
              html: htmlContent,
            });
          }

          let sdate = new Date;
          let edate = new Date;
          let ticket_category = req.body.ticket_category;
          let description = req.body.description;
          let assigned = req.body.assigned;
          let employeeId = req.body.employeeId;
          let ticketId = req.body.ticketId;
          let comments = req.body.comments;
          let employeeName = employeeData.firstName + " " + employeeData.lastName;

          const emailTemplatePath = 'mail2.ejs';
          const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
          // Compile the EJS template
          const compiledTemplate = ejs.compile(emailTemplate);
          // Render the template with dynamic data
          const htmlContent = compiledTemplate({ ticket_category, employeeName, employeeId, description });

          let ticketStatus;
          if (req.body.status == 0) {

            ticketStatus = "Draft";
          } else {
            ticketStatus = "New";
          }
          if (ticketId == null) {
            ticket
              .create({
                sdate: sdate ? "" + sdate : "",
                // edate: edate ? "" + edate : "",
                ticket_category: ticket_category,
                description: description ? "" + description : "",
                comments: "",
                employeeId: employeeId,
                assigned: assigned ? "" + assigned : "",
                status: ticketStatus,
                organisationId: 1,
                getComments: comments,
                employeeName: employeeName,
                assignedEmails: categories[req.body.ticket_category],
                organisationId : req.body.user_organisationId
              })
              .then(
                (resp) => {
                  // //console.log("ticket Id is...", resp.ticketId);
                  res.status(200).send(resp);
                  //for mail
                  if (ticketStatus == "New") {
                    sequelize
                      .query(
                        `SELECT * from Teams WHERE JSON_CONTAINS(users, '${employeeId}', '$');`,
                        {
                          type: Sequelize.QueryTypes.SELECT,
                        }
                      )
                      .then(
                        (teams) => {
                          // let managerEmails = [
                          //   "svishwakarma@neuvays.com",
                          //   "mhasan@neuvays.com",'hsingh@mckinsol.com',
                          // ];
                          let managerEmails = categories[req.body.ticket_category].map((a) => a.officialEmail);
                          //console.log("mail sent to...", managerEmails);

                          teams.forEach((team) => {
                            team["managers"].forEach((manager) => {
                              Employees.findOne({
                                where: { employeeId: manager, organisationId:req.body.user_organisationId },
                              }).then((e) => {
                                //console.log("Employees e ", e["officialEmail"]);
                                managerEmails.push(e["officialEmail"]);
                              });
                            });
                          });
                          let subject =
                            "New Ticket Created : Ticket Id - " + resp.ticketId;
                          let message = `New ${ticket_category} ticket received for ${employeeId}<br><br>  
                            Kindly handle it on the Mckinsol Portal<br>
                            Comment: ${comments} <br>
                            Date: ${sdate}<br>
                            Status: ${ticketStatus}<br>`;
                          mailer(transporter, managerEmails, subject, message);
                        },
                        (err) => {
                          //   res.status(400).send(err)
                        }
                      );
                  }
                },
                (err) => {
                  res.status(400).send(err);
                }
              );

            //console.log(" employeeId ", employeeId);

          } else {
            ticket
              .update(
                {
                  ticket_category: req.body.ticket_category,
                  description: req.body.description,
                  // comments: "test",
                  sdate: req.body.sdate,
                  status: ticketStatus,
                  edate: edate,
                  getComments: comments
                },
                {
                  where: {
                    ticketId: req.body.ticketId,
                  },
                }
              )
              .then(
                (c) => {
                  res.status(200).send(c);
                  // for mail
                  if (ticketStatus == "New") {
                    sequelize
                      .query(
                        `SELECT * from Teams WHERE JSON_CONTAINS(users, '${employeeId}', '$');`,
                        {
                          type: Sequelize.QueryTypes.SELECT,
                        }
                      )
                      .then(
                        (teams) => {
                          // let managerEmails = [
                          //   "svishwakarma@neuvays.com",
                          //   "mhasan@neuvays.com",'hsingh@mckinsol.com',
                          // ];
                          let managerEmails = categories[req.body.ticket_category].map((a) => a.officialEmail);
                          //console.log("mail sent to...", managerEmails);

                          teams.forEach((team) => {
                            team["managers"].forEach((manager) => {
                              Employees.findOne({
                                where: { employeeId: manager, organisationId:req.body.user_organisationId },
                              }).then((e) => {
                                //console.log("Employees e ", e["officialEmail"]);
                                managerEmails.push(e["officialEmail"]);
                              });
                            });
                          });
                          let subject =
                            "New Ticket Created : Ticket Id - " + ticketId;
                          let message = `New ${ticket_category} ticket received for ${employeeId}<br><br>  
                              Kindly handle it on the Mckinsol Portal<br>
                              Comment: ${comments} <br>
                              Date: ${sdate}<br>
                              Status: ${ticketStatus}<br>`;
                          mailer(transporter, managerEmails, subject, message);
                        },
                        (err) => {
                          //   res.status(400).send(err)
                        }
                      );
                  }
                },
                (error) => {
                  res.status(401).send(error);
                }
              );

          }
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  apiRoutes.post("/getGrievance", async function (req, res) {
    let empId = req.body.employeeId
    let offset = req.body.offset
    let status = req.body.status
    let query = `SELECT * FROM tickets WHERE employeeId = ${empId} And organisationId = '${req.body.user_organisationId}'`
    if (offset >= 0) {
      if(status == null)
      {
        query = query.concat(`order by createdAt desc limit 20 offset ${offset}`)
      }
      else{
        query = query.concat(`AND status = '${status}' order by createdAt desc limit 20 offset ${offset}`)
      }
    }
    else{
      query = query.concat(`order by createdAt desc`)
    }
    sequelize
      .query(
        query,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (resp) => {
          res.status(200).send(resp);
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  apiRoutes.post("/getAllNewGrievance", async function (req, res) {
    let empId = req.body.employeeId
    let offset = req.body.offset
    let status = req.body.status
    let query = `select * from tickets cross join json_table(assignedEmails,'$[*]' columns( data json path '$.employeeId')) as j
    where j.data = '${empId}' AND status != 'Draft'`
    if (offset >= 0) {
      if(status == null)
      {
        query = query.concat(`order by createdAt desc limit 20 offset ${offset};`)
      }
      else{
        query = query.concat(`AND status = '${status}' order by createdAt desc limit 20 offset ${offset};`)
      }
    }
    sequelize.query(query,
      {
        type: Sequelize.QueryTypes.SELECT
      }).then(teams => {
        res.status(200).send(teams)
      }), err => {
        res.status(400).send(err)
      }
  });

  // apiRoutes.post("/getAllNewGrievance", async function (req, res) {
  //   sequelize
  //     .query(
  //       `SELECT * FROM tickets WHERE status = "New" AND employeeId = ${req.body.employeeId};`,
  //       {
  //         type: Sequelize.QueryTypes.SELECT,
  //       }
  //     )
  //     .then(
  //       (resp) => {
  //         res.status(200).send(resp);
  //       },
  //       (err) => {
  //         res.status(400).send(err);
  //       }
  //     );
  // });

  apiRoutes.post("/getAllDraftGrievance", async function (req, res) {
    sequelize
      .query(
        `SELECT * FROM tickets WHERE status = "Draft" AND employeeId = ${req.body.employeeId};`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (resp) => {
          res.status(200).send(resp);
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  apiRoutes.post("/assignGrievance", async function (req, res) {
    let categories = {
      Management: [{ "employeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }],
      Attendence: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      Leaves: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      Payroll: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      Holidays: [{ "employeeId": "204", "officialEmail": " rajni@mckinsol.com" }, { "EmployeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }],
      Infrastructure: [{ "employeeId": "130", "officialEmail": " cawana@mckinsol.net" }, { "employeeId": "181", "officialEmail": "ssharma@mckinsol.com" }],
      salaryDeduction: [{ "employeeId": "201", "officialEmail": "pbhandari@mckinsol.com" }],
      IT: [{ "employeeId": "105", "officialEmail": "rahul.contractor@neuvays.com" }],
      Training: [{ "employeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }],
      resignation: [{}],
      // Others : [ {"employeeId":"394" , "officialEmail" : "svishwakarma@neuvays.com" }],
      // Others : [ {"employeeId":"394" , "officialEmail" : "svishwakarma@neuvays.com" },{"employeeId": "138", "officialEmail" : "hsingh@mckinsol.com"},{"employeeId": "141", "officialEmail" : " pvarshney@mckinsol.com"},{"employeeId":"389" , "officialEmail" : "mhasan@neuvays.com" } ],
      Others: [{ "employeeId": "204", "officialEmail": " rajni@mckinsol.com" }, { "EmployeeId": "354", "officialEmail": "asharma@mckinsol.com" }, { "EmployeeId": "183", "officialEmail": "gmishra@mckinsol.com." }, { "employeeId": "344", "officialEmail": " akaushik1@mckinsol.com" }]
    }
    let employeeId = req.body.employeeId;
    let ticket_category = req.body.ticket_category;
    let ticketId = req.body.ticketId;
    let description = req.body.description;
    let status = req.body.status;
    let edate = new Date;
    let comments = req.body.comments

    let lastComment = comments[comments.length - 1]
    if (lastComment != undefined) {
      var empMiddleware = await Employees.findOne({ where: { employeeId: req.body.employeeIdMiddleware, organisationId:req.body.user_organisationId } })
      lastComment.empName = empMiddleware.firstName + " " + empMiddleware.lastName
      lastComment.empId = req.body.employeeIdMiddleware
      var newComment = lastComment.comment

      //console.log("new comment..", newComment)
      // //console.log("comments after update...",comments)
    }
    if (newComment == null) {
      newComment = "N/A"
    }

    let employeeData = await Employees.findOne({ where: { employeeId: employeeId, organisationId:req.body.organisationId } })
    let employeeOfficialEmail = employeeData.officialEmail
    //console.log("employee email...", employeeOfficialEmail)

    // payload mandatory for this API if not provided then code for email makes API crashed :
    // employeeId
    // ticket_category
    // ticketId
    //description

    var empMiddleware = await Employees.findOne({ where: { employeeId: req.body.employeeIdMiddleware, organisationId:req.body.organisationId } })

    sequelize
      .query(
        `SELECT * FROM Employees WHERE employeeId = ${req.body.employeeId};`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (resp) => {
          // //console.log(resp)
          var employeeData = resp.find((employeesModel) => employeesModel.employeeId);
          // //console.log(employeeData.officialEmail,employeeData.firstName,employeeData.lastName);
          let employeeName = employeeData.firstName + " " + employeeData.lastName;

          var empMiddlewareName = empMiddleware.firstName + " " + empMiddleware.lastName
          //console.log("employeMiddlewareName : ", empMiddlewareName)

          function mailer(transporter, email, subject, message) {
            // //console.log(email, subject, message)
            transporter.sendMail({
              from: {
                name: "HR Portal",
                address: "support@timesofpeople.com",
              },
              to: email,
              subject: `${subject}`,
              html: htmlContent,
            });
          }

          const emailTemplatePath = "mail2.ejs";
          const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
          // Compile the EJS template
          const compiledTemplate = ejs.compile(emailTemplate);
          // Render the template with dynamic data
          const htmlContent = compiledTemplate({ ticket_category, employeeName, employeeId, description, status, newComment });

          ticket
            .update(
              {
                assigned: req.body.assigned,
                status: req.body.status,
                // getComments: req.body.comments,
                getComments: comments,
                description: req.body.description,
                edate: edate,
                ticket_category: req.body.ticket_category
              },
              { where: { ticketId: req.body.ticketId } }
            )
            .then(
              (c) => {
                res
                  .status(200)
                  .send({ message: "Record updated successfully!!" });

                sequelize
                  .query(
                    `SELECT * from Teams WHERE JSON_CONTAINS(users, '${employeeId}', '$');`,
                    {
                      type: Sequelize.QueryTypes.SELECT,
                    }
                  )
                  .then(
                    (teams) => {
                      // let managerEmails = [
                      //   "svishwakarma@neuvays.com",
                      //   "mhasan@neuvays.com",'hsingh@mckinsol.com',
                      // ];
                      let mEmails = categories[req.body.ticket_category].map((a) => a.officialEmail);
                      mEmails.push(employeeOfficialEmail)

                      let managerEmails = mEmails
                      //console.log("mail sent to...", managerEmails);

                      teams.forEach((team) => {
                        team["managers"].forEach((manager) => {
                          Employees.findOne({
                            where: { employeeId: manager, organisationId : req.body.user_organisationId },
                          }).then((e) => {
                            //console.log("Employees e ", e["officialEmail"]);
                            managerEmails.push(e["officialEmail"]);
                          });
                        });
                      });
                      let subject = "Ticket Updated by " + empMiddlewareName + " (Ticket Id - " + ticketId + ").";
                      let message = `New ${ticket_category} ticket received for ${employeeId}<br><br>  
                          Kindly handle it on the Mckinsol Portal<br>`;
                      mailer(transporter, managerEmails, subject, message);
                    },
                    (err) => {
                      //   res.status(400).send(err)
                    }
                  );
              },
              (error) => {
                res.status(401).send(error);
              }
            );
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  // apiRoutes.post("/assignGrievance", async function (req, res) {
  //   await ticket
  //     .update(
  //       {
  //         assigned: req.body.assigned,
  //         status: req.body.status,
  //       },
  //       { where: { ticketId: req.body.ticketId } }
  //     )
  //     .then(
  //       (c) => {
  //         res.status(200).send({ message: "Record updated successfully!!" });
  //       },
  //       (error) => {
  //         res.status(401).send(error);
  //       }
  //     );
  // });



  apiRoutes.post("/getTicket", async function (req, res) {
    sequelize
      .query(`SELECT * FROM tickets WHERE ticketId = ${req.body.ticketId}`, {
        type: Sequelize.QueryTypes.SELECT,
      })
      .then(
        (resp) => {
          res.status(200).send(resp);
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  apiRoutes.post("/createTicketComment", async function (req, res) {
    await ticketComments.create(req.body).then(
      (resp) => {
        res.status(200).send({ msg: "ticket Comment Created" });
      },
      (err) => {
        res.status(400).send(err);
      }
    );
  });

  apiRoutes.post("/getTicketComment", async function (req, res) {
    await ticketComments
      .findAll({ where: { ticketId: req.body.ticketId, organisationId:req.body.user_organisationId } })
      .then(
        (result) => {
          res.status(200).send(result);
        },
        (error) => {
          res.status(400).send(error);
        }
      );
  });


  apiRoutes.get("/testing", function (req, res) {
    res.send({ status: 201 });
  });

  apiRoutes.get("/", function (req, res) {
    res.send({ status: true });
  });
  app.use("/", apiRoutes);
};
// }
