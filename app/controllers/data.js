const express = require("express");
const Sequelize = require("sequelize");
const _ = require("lodash");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../config/db.config.js");
const Op = Sequelize.Op;
const db = require("../../config/db.config.js");
const Employees = db.Employees;
const Organisation = db.organisation;
const Attendance = db.attendance;
const weeklyDashboard = db.weeklyDashboard;
// const Service = db.service;
// const Call = db.call;
// const Request = db.request;
// const httpRequest = require('request');
const cors = require("cors")({ origin: true });
const api_key = "key-a14dbfed56acf890771e7d1f3d372a82";
const domain = "mail.aftersale.in";
const mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

module.exports = function (app) {
  const apiRoutes = express.Router();

  apiRoutes.post("/employeeAttendance", (req, res) => {
    if (req.body.employeeID) {
      let year = req.body.year;
      let month = req.body.month;
      let numberOfDays = new Date(year, month, 0).getDate();
      let startDate = `${year}-${month}-01`;
      // //console.log(startDate)
      let endDate = `${year}-${month}-${numberOfDays}`;
      // //console.log(endDate)
      let empID = req.body.employeeID;
      sequelize
        .query(
          `SELECT *
    FROM Employees
    INNER JOIN Attendances ON ${empID} = Attendances.employeeId
    WHERE Attendances.date >='${startDate}'
    AND Attendances.date <='${endDate}'
    AND organisationId = '${req.body.organisationId}'`
        )
        .then(
          (re) => {
            res.send(re[0]);
          },
          (err) => {
            res.status(400).send(err);
          }
        );
    } else {
      res.send({ msg: "payload missing" });
    }
  });

  apiRoutes.post("/sendemail", (req, res) => {
    let subject = req.body.subject;
    let name = req.body.name;
    let email = req.body.email;
    let message = req.body.message;

    res.set("Access-Control-Allow-Origin", "*");
    res.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, GET, POST"
    );

    var data = {
      from: "Aftersale CRM <sales@aftersale.in>",
      to: "info@elvento.com",
      subject: "Aftersale CRM Form - " + subject,
      html: name + "<br>" + email + "<br>" + message, // html body
    };

    mailgun.messages().send(data, function (error, body) {
      res.send({ status: true });
    });
  });

  // apiRoutes.post('/createCustomer', function(req, res) {
  //   var options = {
  //     url: 'https://books.zoho.com/api/v3/contacts?organization_id=648777151',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //       'Authorization': 'Zoho-authtoken 0f7d951d5cda1d97721e22307200d34e'
  //     }
  //   };

  //   httpRequest(options, function(error, response, body) {
  //     if (!error && response.statusCode == 200) {
  //       var info = JSON.parse(body);
  //       //console.log(info + " info");
  //       res.send(info)
  //     }
  //   });

  // });

  apiRoutes.get("/", function (req, res) {
    res.send({ status: true });
  });

  // testReport();
  // function testReport() {
  //   let employeeIds = [
  //     141,
  //     135,
  //     140,
  //     255,
  //     281,
  //     142,
  //     139,
  //     134,
  //     147,
  //     143,
  //     254,
  //     138,
  //     278,
  //     304,
  //     305,
  //     297,
  //     293,
  //     294,
  //     303,
  //     295,
  //     353,
  //     357,
  //     354,
  //     173,
  //     352
  //   ];
  //   let startDate = "2023-05-15";
  //   let dueDate = "2023-05-19";

  //   let query = `SELECT *
  //   FROM Sprints
  //   where startDate = '${startDate}'`;

  //   // //console.log("query ", query);
  //   let utilizationData = [];
  //   let firstColumn = ['Resource Name'];
  //   let secondColumn = [' '];
  //   let allTasks = [];

  //   sequelize.query(`select firstName, lastName, employeeId from Employees where employeeId IN (${employeeIds.join(',')})`, {
  //     type: Sequelize.QueryTypes.SELECT
  //   }).then(employeesDetails => {

  // //console.log("employeesDetails ", employeesDetails[0])

  // sequelize.query(query, {
  //   type: Sequelize.QueryTypes.SELECT
  // }).then(sprintsData => {

  //       // sprintsData.forEach(sprint => {
  //       //   firstColumn.push(sprint.sprintName)
  //       // })
  //       // utilizationData.push(firstColumn);

  // sprintsData.forEach(sprint => {
  //   allTasks = allTasks.concat(sprint.tasks);
  //   // allTasks = sprint.tasks;
  // }, err => {
  // })

  //     sequelize.query(`select hours, employeeId, projectTaskId from Tasks where projectTaskId IN (${allTasks.join(',')})`, {
  //       type: Sequelize.QueryTypes.SELECT
  //     }).then(dsrData => {
  //       let grouped_dsrData = _.groupBy(dsrData, 'projectTaskId')

  //       sequelize.query(`SELECT
  //     ST.taskId,
  //     ST.projectId,
  //     ST.estimatedHours,
  //     ST.assignee,
  //     P.projectName
  // FROM
  //     StoryTasks ST
  // LEFT JOIN
  //     Projects P ON ST.projectId = P.projectId
  // WHERE
  //     ST.taskId IN (${allTasks.join(',')})`, {
  //         type: Sequelize.QueryTypes.SELECT
  //       }).then(tasksData => {
  // sprint.tasks = tasksData;

  // //console.log("tasksData ", tasksData)

  //           tasksData.forEach(task => {
  //             let sprint = sprintsData.filter(s => s.tasks.indexOf(task.taskId) > -1)[0];
  //             task.sprintName = sprint.sprintName;
  //           })

  //           sprintsData.forEach(sprint => {
  //             let projectName = tasksData.filter(t => t.projectId == sprint.projectId)[0].projectName;
  //             firstColumn.push(projectName)
  //           }, err => {
  //           })

  //           sprintsData.forEach(sprint => {
  //             allTasks = allTasks.concat(sprint.tasks);
  //             secondColumn.push(sprint.sprintName)
  //           }, err => {
  //           })

  // utilizationData.push(firstColumn);
  // utilizationData.push(secondColumn);

  // //console.log("tasksData ", tasksData[0]);

  //           let grouped_data = _.groupBy(tasksData, 'sprintName')
  //           let sprintNames = Object.keys(grouped_data);
  //           // //console.log("sprintNames ", sprintNames.length);

  //           // //console.log("grouped_dsrData ",grouped_dsrData)

  //           employeeIds.forEach(employee => {
  //             let newRow = [];
  //             let eData = employeesDetails.filter(t => t['employeeId'] == employee)[0];
  //             // //console.log("edata ", eData);
  //             newRow.push(eData['firstName'] + " " + eData['lastName']);

  //             sprintNames.forEach(sprintName => {
  //               let actualHours = 0;
  //               let estHours = 0;
  //               let employeeProjectTasks = grouped_data[sprintName].filter(task => task.assignee == employee);
  //               let ahrs = 0;
  //               employeeProjectTasks.forEach(task => {
  //                 // //console.log("task ", task);
  //                 estHours += task.estimatedHours;
  //                 let cTask = grouped_dsrData[task.taskId];
  //                 if (cTask)
  //                   cTask.forEach(t => {
  //                     ahrs += t.hours;
  //                   })
  //               });
  //               newRow.push(ahrs + " [" + estHours + "]");
  //             })

  //             utilizationData.push(newRow);

  //           })
  //           // //console.log("utilizationData ", utilizationData)

  //         });

  //       })
  //     }, err => {
  //     })

  //   })

  // }

  apiRoutes.post("/weeklyUtilization", (req, res) => {
    // console.log(req.body);
    let employeeIds = req.body.employeeId;
    let startDate = req.body.startDate;
    let dueDate = req.body.endDate;
    let endDate = req.body.endDate;
    
    let query = `SELECT *
    FROM Sprints
    where startDate = '${startDate}'
    And organisationId = '${req.body.user_organisationId}'`;
    // console.log({ query });

    // let query2 = `SELECT * FROM Tasks where projectId = 0 AND date BETWEEN '${startDate}' AND '${endDate}'`
    // //console.log("query ", query);
    let utilizationData = [];
    let firstColumn = ["Resource Name", "Total Actual [Planned]", "Others"];
    let secondColumn = [" ", " ", " "];
    let allTasks = [];

    sequelize
      .query(
        `select firstName, lastName, employeeId from Employees where employeeId IN (${employeeIds.join(
          ","
        )})`,
        {
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then(
        (employeesDetails) => {
          // console.log({ employeesDetails });
          // //console.log("employeesDetails ", employeesDetails[0])

          sequelize
            .query(query, {
              type: Sequelize.QueryTypes.SELECT,
            })
            .then(
              (sprintsData) => {
                // console.log("sprintsData ", sprintsData)
                // sprintsData.forEach(sprint => {
                //   firstColumn.push(sprint.sprintName)
                // })
                // utilizationData.push(firstColumn);

                sprintsData.forEach(
                  (sprint) => {
                    allTasks = allTasks.concat(sprint.tasks);
                    // allTasks = sprint.tasks;
                  },
                  (err) => {}
                );
                //SELECT hours, employeeId, projectTaskId

                // console.log("allTasks", allTasks)
                sequelize
                  .query(
                    `select hours, employeeId, projectTaskId from Tasks where projectTaskId IN (${allTasks.join(
                      ","
                    )})`,
                    {
                      type: Sequelize.QueryTypes.SELECT,
                    }
                  )
                  .then(
                    (dsrData) => {
                      let grouped_dsrData = _.groupBy(dsrData, "projectTaskId");
                      //console.log("grouped_dsrData",grouped_dsrData)
                      sequelize
                        .query(
                          `SELECT 
        ST.taskId,
        ST.projectId, 
        ST.estimatedHours, 
        ST.actualHours,
        ST.assignee, 
        P.projectName
    FROM 
        StoryTasks ST 
    LEFT JOIN 
        Projects P ON ST.projectId = P.projectId 
    WHERE 
        ST.taskId IN (${allTasks.join(",")})`,
                          {
                            type: Sequelize.QueryTypes.SELECT,
                          }
                        )
                        .then(async (tasksData) => {
                          // sprint.tasks = tasksData;

                          // //console.log("tasksData ", tasksData)

                          let projects = [];
                          let sprints = [];

                          tasksData.forEach((task) => {
                            let sprint = sprintsData.filter(
                              (s) => s.tasks.indexOf(task.taskId) > -1
                            )[0];
                            task.sprintName = sprint.sprintName;
                          });

                          sprintsData.forEach(
                            (sprint) => {
                              let project = tasksData.filter(
                                (t) => t.projectId == sprint.projectId
                              )[0];
                              if (project && project.projectName)
                                console.log({ project });
                              firstColumn.push(project.projectName);
                            },
                            (err) => {}
                          );

                          sprintsData.forEach(
                            (sprint) => {
                              allTasks = allTasks.concat(sprint.tasks);
                              console.log({ sprint });

                              secondColumn.push(sprint.sprintName);
                            },
                            (err) => {}
                          );
                          // //console.log("first column",firstColumn)
                          // //console.log("second column",secondColumn)
                          utilizationData.push(firstColumn);
                          utilizationData.push(secondColumn);

                          let grouped_data = _.groupBy(tasksData, "sprintName");
                          console.log({grouped_data})
                          let sprintNames = Object.keys(grouped_data);

                          // Assuming utilizationData is an array of arrays

                          for (const employee of employeeIds) {
                            let eData = employeesDetails.find(
                              (t) => t.employeeId === employee
                            );
                            let newRow = [];

                            if (eData && eData.firstName) {
                              newRow.push(
                                eData.firstName + " " + eData.lastName
                              );
                            }
                            // //console.log("name",eData.firstName+""+eData.lastName)
                            let tEstHours = 0;
                            let tAhrs = 0;

                            let othersData = await sequelize.query(
                              `SELECT * FROM Tasks WHERE employeeId='${employee}' AND projectId = 69 AND date BETWEEN '${startDate}' AND '${endDate}'`,
                              {
                                type: Sequelize.QueryTypes.SELECT,
                              }
                            );

                            if (othersData && othersData.length > 0) {
                              // //console.log("othersdata loop", eData.firstName, othersData);
                              let ohrs = 0;
                              let ophrs = 0;

                              for (const v of othersData) {
                                ohrs += v.hours;
                                tAhrs += v.hours;
                              }

                              if (ohrs > 0) {
                                newRow.push(ohrs + " [" + ophrs + "]");
                              } else {
                                newRow.push(" ");
                              }
                              // console.log({sprintsData});
                              for (const sprint of sprintsData) {
                                let sprintName = sprint.sprintName;
                                let actualHours = 0;
                                let estHours = 0;
                                let ahrs = 0;
                                if(sprintName == 'NA' || sprintName.length == 0){
                                  continue;
                                }
                                let employeeProjectTasks = grouped_data[
                                  sprintName
                                ].filter((task) => task.assignee === employee);
                                // //console.log("Sprintname", sprintName, "employeeprojecttasks", employeeProjectTasks, "name", eData.firstName + " " + eData.lastName);

                                for (const task of employeeProjectTasks) {
                                  estHours += task.estimatedHours;
                                  tEstHours += task.estimatedHours;
                                  let cTask = grouped_dsrData[task.taskId];

                                  if (cTask) {
                                    for (const t of cTask) {
                                      ahrs += t.hours;
                                      tAhrs += t.hours;
                                    }
                                  }
                                }

                                if (estHours > 0) {
                                  // //console.log("filleddatapushed======", "Sprintname", sprintName, "name", eData.firstName + " " + eData.lastName);
                                  newRow.push(ahrs + " [" + estHours + "]");
                                } else {
                                  // //console.log("empty data pushed", "name", eData.firstName + " " + eData.lastName);
                                  newRow.push(" ");
                                }
                              }

                              newRow.splice(
                                1,
                                0,
                                tAhrs + " [" + tEstHours + "]"
                              );
                              utilizationData.push(newRow);
                            } else {
                              newRow.push(" ");
                              for (const sprint of sprintsData) {
                                let sprintName = sprint.sprintName;
                                let actualHours = 0;
                                let estHours = 0;
                                let ahrs = 0;

                                let employeeProjectTasks = grouped_data[
                                  sprintName
                                ]
                                  ? grouped_data[sprintName].filter(
                                      (task) => task.assignee === employee
                                    )
                                  : [];
                                // //console.log("Sprintname", sprintName, "employeeprojecttasks", employeeProjectTasks, "name", eData.firstName + " " + eData.lastName);
                                for (const task of employeeProjectTasks) {
                                  estHours += task.estimatedHours;
                                  ahrs += task.actualHours;
                                  tEstHours += task.estimatedHours;
                                  tAhrs += task.actualHours;
                                  let cTask = grouped_dsrData[task.taskId];

                                  if (cTask) {
                                    for (const t of cTask) {
                                      ahrs += t.hours;
                                      tAhrs += t.hours;
                                    }
                                  }
                                }

                                if (estHours > 0) {
                                  // //console.log("filleddatapushed======", "Sprintname", sprintName, "name", eData.firstName + " " + eData.lastName);
                                  newRow.push(ahrs + " [" + estHours + "]");
                                } else {
                                  // //console.log("empty data pushed", "name", eData.firstName + " " + eData.lastName);
                                  newRow.push(" ");
                                }
                              }

                              newRow.splice(
                                1,
                                0,
                                tAhrs + " [" + tEstHours + "]"
                              );
                              utilizationData.push(newRow);
                            }
                          }

                          let newdata = [" "];

                          console.log("******", utilizationData);
                          for (let j = 1; j < utilizationData[0].length; j++) {
                            let totalHours = 0;
                            let totalEstHours = 0;
                            for (let i = 2; i < utilizationData.length; i++) {
                              let row = utilizationData[i];
                              let columnValue = row[j];
                              let regex = /([\d.]+)\s+\[([\d]+)\]/;
                              let matches = regex.exec(columnValue);

                              if (matches && matches.length === 3) {
                                let hours = parseFloat(matches[1]);
                                let estHours = parseInt(matches[2]);

                                totalHours += hours;
                                totalEstHours += estHours;
                              }
                            }
                            //console.log("data");
                            let totalRow = [`${totalHours} [${totalEstHours}]`];
                            newdata.push(totalRow);
                          }
                          let data11 = newdata.flat();
                          // //console.log("newdata",data11)
                          utilizationData.splice(2, 0, data11);
                          //console.log(utilizationData);
                          /////////////////////Modified by sachin.
                          let row2 = utilizationData.splice(1, 1).flat();
                          row2.splice(1, 1);
                          for (let i = 0; i < utilizationData.length; i++) {
                            let row = utilizationData[i];
                            let rowap = row.splice(1, 1);
                            const [totalActual, planned] = rowap[0].split(" [");
                            utilizationData[i].push(totalActual);
                            utilizationData[i].push(planned.slice(0, -1));
                          }
                          let totalRow = utilizationData.splice(1, 1);
                          utilizationData.splice(1, 0, row2);
                          utilizationData.push(...totalRow);
                          ////////////////untill here
                          res.send(utilizationData);
                        });
                    },
                    (err) => {
                      res.status(200).send({ msg: "No data found." });
                    }
                  );
              },
              (err) => {
                res.status(200).send({ msg: "No data found." });
              }
            );
        },
        (err) => {
          res.status(200).send({ msg: "No data found." });
        }
      );
  });

  // apiRoutes.post('/weeklyDashboard', async (req, res)=>{
  //   let salesMeeting = req.body.salesMeeting
  //   let issues = req.body.issues
  //   let risks = req.body.risks
  //   let overall_Sales_Support_Status = req.body.Overall_Sales_Support_Status
  //   let comments = req.body.comments
  //   let client_Facing_Total_Sales_Support_Meetings = req.body.client_Facing_Total_Sales_Support_Meetings
  //   let Sales_Pursuits_Status = req.body.Sales_Pursuits_Status
  //   let Sales_TB_Sheet_Followed = req.body.Sales_TB_Sheet_Followed
  //   let Net_New_Leads = req.body.Net_New_Leads
  //   let Sales_Pipeline = req.body.Sales_Pipeline
  //   let Cross_Selling = req.body.Cross_Selling
  //   let Existing_Clients_Status = req.body.Existing_Clients_Status
  //   let Clients_Reviewed_Covered = req.body.Clients_Reviewed_Covered
  //   let Weekly_Client_Feedback = req.body.Weekly_Client_Feedback
  //   let projectId = req.body.projectId

  //   let

  // })
  app.post("/CreateWeeklyDashbordData", async function (req, res, next) {
    // let array = req.body.array
    // let salesMeeting = req.body.salesMeeting
    // let issuesAndRisks = req.body.issuesAndRisks
    // let overall_Sales_Support_Status = req.body.overall_Sales_Support_Status
    // let comments = req.body.comments
    // let client_Facing_Total_Sales_Support_Meetings = req.body.client_Facing_Total_Sales_Support_Meetings
    // let Sales_Pursuits_Status = req.body.Sales_Pursuits_Status
    // let Sales_TB_Sheet_Followed = req.body.Sales_TB_Sheet_Followed
    // let Net_New_Leads = req.body.Net_New_Leads
    // let Sales_Pipeline = req.body.Sales_Pipeline
    // let Cross_Selling = req.body.Cross_Selling
    // let Existing_Clients_Status = req.body.Existing_Clients_Status
    // let Clients_Reviewed_Covered = req.body.Clients_Reviewed_Covered
    // let Weekly_Client_Feedback = req.body.Weekly_Client_Feedback
    // let projectId = req.body.projectId

    await weeklyDashboard.create(req.body).then(
      (resp) => {
        res.status(200).send({ code: 1, resp });
      },
      (err) => {
        res.status(401).send({ code: 0, err });
      }
    );

    var pdf = require("../middleware/weeklyDashboardTablePdf.js").create();
    pdf.pipe(res);
    pdf.end();
  });

  apiRoutes.post("/UpdateWeeklyDashbordData", async function (req, res) {
    await weeklyDashboard
      .update(req.body, {
        where: { weeklyDashboardId: req.body.weeklyDashboardId },
      })
      .then(
        (resp) => {
          res.status(200).send({ code: 1, resp });
        },
        (err) => {
          res.status(401).send({ code: 0, err });
        }
      );
  });

  apiRoutes.post("/getAllDashboardReport", async function (req, res) {
    await weeklyDashboard
      .findAll({
        where: {
          projectId: req.body.projectId,
          organisationId: req.body.user_organisationId,
        },
      })
      .then(
        (resp) => {
          res.status(200).send({ code: 0, resp });
        },
        (err) => {
          res.status(401).send({ code: 0, err });
        }
      );
  });

  apiRoutes.post("/deleteWeeklyDashboardRecord", async function (req, res) {
    await weeklyDashboard
      .destroy({ where: { weeklyDashboardId: req.body.weeklyDashboardId } })
      .then(
        (result) => {
          res.status(200).send({ msg: "Data Deleted" });
        },
        (error) => {
          res.status(401).send(error);
        }
      );
  });

  app.use("/", apiRoutes);
};
