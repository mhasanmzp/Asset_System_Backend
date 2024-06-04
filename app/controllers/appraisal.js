const express = require("express");
const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const { QueryTypes } = require("sequelize");
const { sequelize, Teams } = require("../../config/db.config.js");
const Op = Sequelize.Op;
const smtp = require("../../config/main.js");
const db = require("../../config/db.config.js");
// const appraisal = db.appraisal;
const empAppraisal = db.empAppraisal;
const L2Appraisal = db.L2Appraisal;
const L3Appraisal = db.L3Appraisal;
const L4Appraisal = db.L4Appraisal;
const Manager = db.ManagerEvaluation;
const department = db.department;
const Employees = db.Employees;
const empMang = db.empMan;
const hrAmount = db.hrAppraisalPerRatingAmount;
const EmployeesModel = require("../models/employees.model.js");
const cors = require("cors")({ origin: true });
const path = require("path");
var apiRoutes = express.Router();
var multer = require("multer");
const ejs = require('ejs');
const fs = require('fs');
const { differenceInMonths, max, getYear } = require('date-fns');
const { isNull, concat, entries } = require("lodash");
const { map } = require("async");
const { v4: uuidv4 } = require('uuid');
const { log, Console } = require("console");

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
  }
  let transporter = nodemailer.createTransport(smtpConfig);
  transporter.verify(function (error, success) {
    if (error) {
      //console.log(error);
    } else {
      //console.log("Server is ready to take our messages");
    }
  });

  apiRoutes.post("/hrResponse", async (req, res) => {
    try {


      // //console.log("req.body::::::", req.body);
      const flag = req.body.flag;
      if (flag == 1) {
        empAppraisal.update({ status: "Completed" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
          res.json({ "message": "Appraisal process completed successfully" }).status(200);
          // //console.log("Status updated successfully");
        }).catch((err) => {
          // //console.log(err);
        })
      }
      else {
        empAppraisal.update({ status: "Appraisal Rejected" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
          res.status(400).json({ "message": "Appraisal process has been rejected" });
          // //console.log("Status updated successfully");
        }).catch((err) => {
          // //console.log(err);
        })
      }
    }
    catch (e) {
      res.status(400).json(e);
    }

  });

  apiRoutes.post("/oldmanagersEvaluation", async (req, res) => {//old
    try {
      // //console.log("Payload::::::::", req.body);
      const id = req.body.employeeId;//Manager Id who is filling the evaluation form.
      const date = new Date();
      // //console.log(id);
      const appraisalId = parseInt(req.body.appraisalId);
      // //console.log(appraisalId);
      const appraisalDetails = await empAppraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['employeeId', 'isEditedByEmp'] });
      // //console.log(appraisalDetails);
      const empFlag = appraisalDetails.isEditedByEmp;
      // const L2EmpFlag = appraisalDetails.isEditedByL2;
      let L2Flag;
      let L3Flag;
      let L4Flag;
      const empMangDetails = await empMang.findOne({
        where: {
          employeeId: appraisalDetails.employeeId, organisationId: req.body.organisationId
        }, raw: true
      });
      // //console.log(empMangDetails);
      const L2Manager = empMangDetails.L2ManagerId;
      const L3Manager = empMangDetails.L3ManagerId;
      const L4Manager = empMangDetails.L4ManagerId;
      const L5Manager = empMangDetails.L5ManagerId;
      // //console.log("L3Manager:::", L3Manager);
      if (id == L2Manager || id == L3Manager || id == L4Manager || id == L5Manager) {
        if (empFlag == 0) {
          res.status(400).json({
            "message": "Employee Self evaluation is not yet filled by the employee"
          });
        }
        else {
          if (id == L2Manager) {
            let check;
            await L2Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL2Manager'] }).then((data) => {
              check = data.isEditedByL2Manager
            }).catch((err) => {
              // //console.log(err);
            })
            if (check == 1) {
              res.status(400).json({ "message": "Form already submitted by manager not allowed to re-submit" });
            }
            else {
              // //console.log("req.body:::", req.body)
              const flag = req.body.flag;


              const updateData = {
                L2communicationSkill: req.body.communicationSkill,
                L2communicationSkillRemarks: req.body.communicationSkillRemarks,
                L2interpersonalSkill: req.body.interpersonalSkill,
                L2interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
                L2abilityToPlanTheWork: req.body.abilityToPlanTheWork,
                L2abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
                L2problemSolving: req.body.problemSolving,
                L2problemSolvingRemarks: req.body.problemSolvingRemarks,
                L2adaptability: req.body.adaptability,
                L2adaptabilityRemarks: req.body.adaptabilityRemarks,
                L2willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
                L2willingnessToShoulderAdditionalRemarks: req.body.willingnessToShoulderAdditionalRemarks,
                L2commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
                L2commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
                L2habitsAndManners: req.body.habitsAndManners,
                L2habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
                L2presentation: req.body.presentation,
                L2presentationRemarks: req.body.presentationRemarks,
                L2punctuality: req.body.punctuality,
                L2punctualityRemarks: req.body.punctualityRemarks,
                L2confidentialityOfInfo: req.body.confidentialityOfInfo,
                L2confidentialityOfInfoRemarks: req.body.confidentialityOfInfoRemarks,
                L2trustworthiness: req.body.trustworthiness,
                L2trustworthinessRemarks: req.body.trustworthinessRemarks,
                L2teamSpirit: req.body.teamSpirit,
                L2teamSpiritRemarks: req.body.teamSpiritRemarks,
                L2relationshipWithColleagues: req.body.relationshipWithColleagues,
                L2relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
                L2decisionMaking: req.body.decisionMaking,
                L2decisionMakingRemarks: req.body.decisionMakingRemarks,
                L2computerskills: req.body.computerskills,
                L2computerskillsRemarks: req.body.computerskillsRemarks
                // Add more fields as needed
              };

              const updateCondition = {
                // Define the condition based on which records should be updated
                // For example, to update records with id = 1:
                appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
              };

              L2Appraisal.update(updateData, {
                where: updateCondition,
              })
                .then((data) => {
                  // //console.log("Updated Successfully");
                  // res.send("Updated Successfully").status(200)
                })
                .catch(error => {
                  console.error('Error updating records:', error);
                  // res.send(error).status(400);
                });

              // const sum = parseInt(req.body.sum);
              const sum = req.body.communicationSkill + req.body.interpersonalSkill + req.body.abilityToPlanTheWork + req.body.problemSolving + req.body.adaptability + req.body.willingnessToShoulderAdditional + req.body.commitmentToDoAPerfectJob + req.body.habitsAndManners + req.body.presentation + req.body.punctuality + req.body.confidentialityOfInfo + req.body.trustworthiness + req.body.teamSpirit + req.body.relationshipWithColleagues + req.body.decisionMaking + req.body.computerskills;

              // //console.log(sum);
              // //console.log(empEvaSum);
              const percentage = Math.floor(sum / 80 * 100);
              // //console.log("Overall Percentage::::::::", percentage);
              // //console.log("sum+emEvaSum.L2TS::::::::", sum + empEvaSum.L2TS);

              L2Appraisal.update({ L2_ManagersOverallPercentage: percentage, L2_ManagersTotalScore: sum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                // //console.log("percentage updated successfully");
              }).catch((err) => {
                // //console.log(err);
              });

              let overallRating;
              if (1 <= percentage && percentage <= 25) {
                overallRating = "Average";
              } else if (26 <= percentage && percentage <= 50) {
                overallRating = "Good";
              } else if (51 <= percentage && percentage <= 75) {
                overallRating = "Very Good";
              } else if (76 <= percentage && percentage <= 100) {
                overallRating = "Excellent";
              }
              // //console.log("OverallRating::::::::::", overallRating);
              L2Appraisal.update({ L2_ManagersOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                // L2Flag =1;
                // //console.log("rating updated successfully");
              }).catch((err) => {
                // //console.log(err);
              })

              if (flag == 1) {
                L2Appraisal.update({ isEditedByL2Manager: true }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // L2Flag =1;
                  // //console.log("flag has been updated successfully");
                }).catch((err) => {
                  // //console.log(err);
                })
                empAppraisal.update({ status: "Forwarded to Level-3- Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // //console.log("Status updated successfully in empAppraisal");
                }).catch((err) => {
                  // //console.log(err);
                });
                // //console.log("isnull():::::", isNull(L3Manager));

                if (isNull(L3Manager)) {//Checking whether is there any further level for evaluation or not for an employee. 
                  // //console.log(":::::::::::::::::Here:::::::::::::::::")
                  empAppraisal.update({ status: "Forwarded to Last Level Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    // //console.log("Status updated successfully l3 is null");

                    Manager.update({
                      lastLevelMaxMarks: 80, lastLevelScoredMarks: sum
                    }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } })
                      .then((data) => {
                        // //console.log("Created Successfully in L5Appraisals");
                        // res.send("Updated Successfully").status(200)
                      })
                      .catch(error => {
                        // console.error('Error creating records in L5Appraisals:', error);
                        // res.json({ "message": error }).status(400);
                      });
                  }).catch((err) => {
                    // //console.log(err);
                  });
                }
              }

              res.json({ "message": overallRating }).status(200);
            }


          }
          if (id == L3Manager) {
            await L2Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL2manager'] }).then((data) => {
              // //console.log("Here at L2Flag data::::::", data)
              L2Flag = data.isEditedByL2manager;
              // //console.log("L2Flag::::", L2Flag)
            }).catch((err) => {
              // //console.log(err);
            });
            if (L2Flag == 0) {
              res.json({ "message": "Level 2 Evaluation is not done yet", "status": 400 });
            }
            else {
              let check;
              await L3Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL3Manager'] }).then((data) => {
                check = data.isEditedByL3Manager
              }).catch((err) => {
                // //console.log(err);
              })
              if (check == 1) {
                res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
              }
              else {
                let flag = req.body.flag;


                const updateData = {
                  L3communicationSkill: req.body.communicationSkill,
                  L3communicationSkillRemarks: req.body.communicationSkillRemarks,
                  L3interpersonalSkill: req.body.interpersonalSkill,
                  L3interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
                  L3abilityToPlanTheWork: req.body.abilityToPlanTheWork,
                  L3abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
                  L3problemSolving: req.body.problemSolving,
                  L3problemSolvingRemarks: req.body.problemSolvingRemarks,
                  L3adaptability: req.body.adaptability,
                  L3adaptabilityRemarks: req.body.adaptabilityRemarks,
                  L3willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
                  L3willingnessToShoulderAdditionalRemarks: req.body.willingnessToShoulderAdditionalRemarks,
                  L3commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
                  L3commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
                  L3habitsAndManners: req.body.habitsAndManners,
                  L3habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
                  L3presentation: req.body.presentation,
                  L3presentationRemarks: req.body.presentationRemarks,
                  L3punctuality: req.body.punctuality,
                  L3punctualityRemarks: req.body.punctualityRemarks,
                  L3confidentialityOfInfo: req.body.confidentialityOfInfo,
                  L3confidentialityOfInfoRemarks: req.body.confidentialityOfInfoRemarks,
                  L3trustworthiness: req.body.trustworthiness,
                  L3trustworthinessRemarks: req.body.trustworthinessRemarks,
                  L3teamSpirit: req.body.teamSpirit,
                  L3teamSpiritRemarks: req.body.teamSpiritRemarks,
                  L3relationshipWithColleagues: req.body.relationshipWithColleagues,
                  L3relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
                  L3decisionMaking: req.body.decisionMaking,
                  L3decisionMakingRemarks: req.body.decisionMakingRemarks,
                  L3computerskills: req.body.computerskills,
                  L3computerskillsRemarks: req.body.computerskillsRemarks
                  // Add more fields as needed
                };

                const updateCondition = {
                  // Define the condition based on which records should be updated
                  // For example, to update records with id = 1:
                  appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
                };

                L3Appraisal.update(updateData, {
                  where: updateCondition,
                })
                  .then((data) => {
                    //console.log("Updated Successfully");
                    // res.send("Updated Successfully").status(200)
                  })
                  .catch(error => {
                    console.error('Error updating records:', error);
                    // res.send(error).status(400);
                  });

                // const sum = parseInt(req.body.sum);
                const sum = req.body.communicationSkill + req.body.interpersonalSkill + req.body.abilityToPlanTheWork + req.body.problemSolving + req.body.adaptability + req.body.willingnessToShoulderAdditional + req.body.commitmentToDoAPerfectJob + req.body.habitsAndManners + req.body.presentation + req.body.punctuality + req.body.confidentialityOfInfo + req.body.trustworthiness + req.body.teamSpirit + req.body.relationshipWithColleagues + req.body.decisionMaking + req.body.computerskills;

                //console.log(sum);
                const lastSum = await L2Appraisal.findOne({
                  where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true,
                  attributes: ['L2_ManagersTotalScore'/* add more fields as needed */]
                });
                //console.log(lastSum);
                //console.log(lastSum.L2_ManagersTotalScore);
                const finalSum = sum + lastSum.L2_ManagersTotalScore;
                //console.log("FinalSum:::::", finalSum);
                const percentage = Math.floor(finalSum / 160 * 100);//total marks at level 3  is 260 which is 80 from level 1 and 90 from level 2 and 90 from level 3 .
                //console.log("Overall Percentage::::::::", percentage);


                L3Appraisal.update({ L3_ManagersOverallPercentage: percentage, L3_ManagersTotalScore: finalSum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  //console.log("percentage updated successfully");
                }).catch((err) => {
                  //console.log(err);
                })

                let overallRating;
                if (1 <= percentage && percentage <= 25) {
                  overallRating = "Average";
                } else if (26 <= percentage && percentage <= 50) {
                  overallRating = "Good";
                } else if (51 <= percentage && percentage <= 75) {
                  overallRating = "Very Good";
                } else if (76 <= percentage && percentage <= 100) {
                  overallRating = "Excellent";
                }
                //console.log("OverallRating::::::::::", overallRating);

                L3Appraisal.update({ L3_ManagersOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // L3Flag =1;
                  //console.log("rating updated successfully");
                }).catch((err) => {
                  //console.log(err);
                });
                if (flag == 1) {
                  L3Appraisal.update({ isEditedByL3Manager: true }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    // L3Flag =1;
                    //console.log("rating updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });
                  empAppraisal.update({ status: "Forwarded to Level-4- Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    //console.log("Status updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });

                  if (isNull(L4Manager)) {
                    empAppraisal.update({ status: "Forwarded to Last Level Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                      //console.log("Status updated successfully");

                      Manager.update({
                        lastLevelMaxMarks: 160, lastLevelScoredMarks: finalSum
                      }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } })
                        .then((data) => {
                          //console.log("Created Successfully in L5Appraisals");
                          // res.send("Updated Successfully").status(200)
                        })
                        .catch(error => {
                          console.error('Error creating records in L5Appraisals:', error);
                          // res.json({ "message": error }).status(400);
                        });
                    }).catch((err) => {
                      //console.log(err);
                    });
                  }
                }


                res.json({ "message": overallRating }).status(200);
              }

            }
          }
          if (id == L4Manager) {
            let data = await L3Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL3Manager'] });

            L3Flag = data.isEditedByL3Manager;
            if (L3Flag == 0) {
              res.json({ "message": "Level 3 Evaluation is not done yet", "status": 400 });
            }
            else {
              let check;
              await L4Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL4Manager'] }).then((data) => {
                check = data.isEditedByL4Manager
              }).catch((err) => {
                //console.log(err);
              })
              if (check == 1) {
                res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
              }
              else {
                const flag = req.body.flag;


                const updateData = {
                  L4communicationSkill: req.body.communicationSkill,
                  L4communicationSkillRemarks: req.body.communicationSkillRemarks,
                  L4interpersonalSkill: req.body.interpersonalSkill,
                  L4interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
                  L4abilityToPlanTheWork: req.body.abilityToPlanTheWork,
                  L4abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
                  L4problemSolving: req.body.problemSolving,
                  L4problemSolvingRemarks: req.body.problemSolvingRemarks,
                  L4adaptability: req.body.adaptability,
                  L4adaptabilityRemarks: req.body.adaptabilityRemarks,
                  L4willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
                  L4willingnessToShoulderAdditionalRemarks: req.bodywillingnessToShoulderAdditionalRemarks,
                  L4commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
                  L4commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
                  L4habitsAndManners: req.body.habitsAndManners,
                  L4habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
                  L4presentation: req.body.presentation,
                  L4presentationRemarks: req.body.presentationRemarks,
                  L4punctuality: req.body.punctuality,
                  L4punctualityRemarks: req.body.punctualityRemarks,
                  L4confidentialityOfInfo: req.body.confidentialityOfInfo,
                  L4confidentialityOfInfoRemarks: req.body.confidentialityOfInfoRemarks,
                  L4trustworthiness: req.body.trustworthiness,
                  L4trustworthinessRemarks: req.body.trustworthinessRemarks,
                  L4teamSpirit: req.body.teamSpirit,
                  L4teamSpiritRemarks: req.body.teamSpiritRemarks,
                  L4relationshipWithColleagues: req.body.relationshipWithColleagues,
                  L4relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
                  L4decisionMaking: req.body.decisionMaking,
                  L4decisionMakingRemarks: req.body.decisionMakingRemarks,
                  L4computerskills: req.body.computerskills,
                  L4computerskillsRemarks: req.body.computerskillsRemarks
                  // Add more fields as needed
                };

                const updateCondition = {
                  // Define the condition based on which records should be updated
                  // For example, to update records with id = 1:
                  appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
                };

                L4Appraisal.update(updateData, {
                  where: updateCondition,
                })
                  .then((data) => {
                    //console.log("Updated Successfully");
                    // res.send("Updated Successfully").status(200)
                  })
                  .catch(error => {
                    console.error('Error updating records:', error);
                    // res.send(error).status(400);
                  });

                // const sum = parseInt(req.body.sum);
                const sum = req.body.communicationSkill + req.body.interpersonalSkill + req.body.abilityToPlanTheWork + req.body.problemSolving + req.body.adaptability + req.body.willingnessToShoulderAdditional + req.body.commitmentToDoAPerfectJob + req.body.habitsAndManners + req.body.presentation + req.body.punctuality + req.body.confidentialityOfInfo + req.body.trustworthiness + req.body.teamSpirit + req.body.relationshipWithColleagues + req.body.decisionMaking + req.body.computerskills;

                //console.log(sum);
                const lastSum = L3Appraisal.findOne({
                  where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true,
                  attributes: ['L3_ManagersTotalScore'/* add more fields as needed */]
                });
                // //console.log(sum);
                //console.log(lastSum.L3_ManagersTotalScore);
                const finalSum = sum + lastSum.L3_ManagersTotalScore;
                const percentage = Math.floor(finalSum / 240 * 100);//total marks at level 3  is 260 which is 80 from level 1 and 90 from level 2 and 90 from level 3 .
                //console.log("Overall Percentage::::::::", percentage);


                L4Appraisal.update({ L4_ManagersOverallPercentage: percentage, L4_ManagersTotalScore: finalSum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  //console.log("percentage updated successfully");
                }).catch((err) => {
                  //console.log(err);
                })

                let overallRating;
                if (1 <= percentage && percentage <= 25) {
                  overallRating = "Average";
                } else if (26 <= percentage && percentage <= 50) {
                  overallRating = "Good";
                } else if (51 <= percentage && percentage <= 75) {
                  overallRating = "Very Good";
                } else if (76 <= percentage && percentage <= 100) {
                  overallRating = "Excellent";
                }
                //console.log("OverallRating::::::::::", overallRating);

                L4Appraisal.update({ L4_ManagersOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // L4Flag =1;
                  //console.log("rating updated successfully");
                }).catch((err) => {
                  //console.log(err);
                });

                if (flag == 1) {
                  L4Appraisal.update({ isEditedByL4Manager: true }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    // L4Flag =1;
                    //console.log("rating updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });
                  empAppraisal.update({ status: "Forwarded to Last Level Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    //console.log("Status updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });
                  Manager.update({
                    lastLevelMaxMarks: 240, lastLevelScoredMarks: finalSum
                  }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } })
                    .then((data) => {
                      //console.log("Created Successfully in L5Appraisals");
                      // res.send("Updated Successfully").status(200)
                    })
                    .catch(error => {
                      console.error('Error creating records in L5Appraisals:', error);
                      // res.json({ "message": error }).status(400);
                    });
                }


                res.json({ "message": overallRating }).status(200);

              }
            }
          }
          // if (id == L5Manager) {
          //   try {
          //     //console.log("::::::::::::here::::::::::");

          //     const [l2Data,l3Data,l4Data,managerData] = await Promise.all([
          //       L2Appraisal.findAll({ where: { appraisalId: req.body.appraisalId }, raw: true, attributes: ['isEditedByL4Manager'] }),
          //       L3Appraisal.findAll({ where: { appraisalId: req.body.appraisalId }, raw: true, attributes: ['isEditedByL4Manager'] }),
          //       L4Appraisal.findAll({ where: { appraisalId: req.body.appraisalId }, raw: true, attributes: ['isEditedByL4Manager'] }),
          //       Manager.findOne({ where: { appraisalId: req.body.appraisalId }, raw: true, attributes: ['isEditedByManager'] }),
          //     ]);

          //     let L4Flag = l4Data.length === 0 ? 1 : l4Data[0].isEditedByL4Manager;
          //     //console.log("L4Flag::::", L4Flag);

          //     if (L4Flag === 0) {
          //       res.json({ "message": "Level 4 Evaluation is not done yet", "status": 400 });
          //     } else {
          //       //console.log("heressssssssssssssssssss");

          //       let check = managerData.isEditedByManager;
          //       //console.log("check::::::", check);

          //       if (check === 1) {
          //         res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
          //       } else {
          //         const updateData = {
          //           appraisalId: appraisalId,
          //           ManagerId: id,
          //           createdAt: date,
          //           FSQoW_1: req.body.FSQoW1,
          //           FSQoW_2: req.body.FSQoW2,
          //           FSQoW_3: req.body.FSQoW3,
          //           FSWH_1: req.body.FSWH1,
          //           FSWH_2: req.body.FSWH2,
          //           FSWH_3: req.body.FSWH3,
          //           FSWH_4: req.body.FSWH4,
          //           FSJK_1: req.body.FSJK1,
          //           FSJK_2: req.body.FSJK2,
          //           FSJK_3: req.body.FSJK3,
          //           FSRemarks: req.body.FSRemarks,
          //           ISIR_1: req.body.ISIR1,
          //           ISIR_2: req.body.ISIR2,
          //           ISIR_3: req.body.ISIR3,
          //           ISIR_4: req.body.ISIR4,
          //           ISIR_5: req.body.ISIR5,
          //           ISIRRemarks: req.body.ISIRRemarks,
          //           LSL_1: req.body.LSL1,
          //           LSL_2: req.body.LSL2,
          //           LSL_3: req.body.LSL3,
          //           LSLRemarks: req.body.LSLRemarks,
          //         }

          //         await Manager.update(updateData, { where: { appraisalId: req.body.appraisalId } });

          //         const sum = req.body.FSQoW1 + req.body.FSQoW2 + req.body.FSQoW3 + req.body.FSWH1 + req.body.FSWH2 + req.body.FSWH3 + req.body.FSWH4 + req.body.FSJK1 + req.body.FSJK2 + req.body.FSJK3 + req.body.ISIR1 + req.body.ISIR2 + req.body.ISIR3 + req.body.ISIR4 + req.body.ISIR5 + req.body.LSL1 + req.body.LSL2 + req.body.LSL3;

          //         const lastLevel = await Manager.findOne({
          //           where: { appraisalId: req.body.appraisalId },
          //           raw: true,
          //           attributes: ['lastLevelMaxMarks', 'lastLevelScoredMarks'],
          //         });

          //         //console.log("LastLevel:::::", lastLevel);

          //         const finalSum = sum + lastLevel.lastLevelScoredMarks;
          //         //console.log(sum);
          //         //console.log(finalSum);

          //         const percentage = Math.floor(finalSum / (90 + lastLevel.lastLevelMaxMarks) * 100);
          //         //console.log("Overall Percentage::::::::", percentage);

          //         await Manager.update(
          //           { managersOverallPercentage: percentage, managersTotalScore: finalSum },
          //           { where: { appraisalId: req.body.appraisalId } }
          //         );

          //         let overallRating;

          //         if (1 <= percentage && percentage <= 25) {
          //           overallRating = "Average";
          //         } else if (26 <= percentage && percentage <= 50) {
          //           overallRating = "Good";
          //         } else if (51 <= percentage && percentage <= 75) {
          //           overallRating = "Very Good";
          //         } else if (76 <= percentage && percentage <= 100) {
          //           overallRating = "Excellent";
          //         }

          //         //console.log("OverallRating::::::::::", overallRating);
          //         const flag = req.body.flag;
          //         if (flag == 1) {



          //           await Manager.update(
          //             { managersOverallRating: overallRating, isEditedByManager: true },
          //             { where: { appraisalId: req.body.appraisalId } }
          //           );

          //           await empAppraisal.update({ status: "Sent to HR" }, { where: { appraisalId: req.body.appraisalId } });
          //         }

          //         res.json({ "message": overallRating }).status(200);
          //       }
          //     }
          //   } catch (error) {
          //     console.error('Error:', error);
          //     res.status(500).json({ "message": "Internal Server Error" });
          //   }
          // }
          if (id == L5Manager) {
            try {
              //console.log("::::::::::::here::::::::::");

              const [l2Data, l3Data, l4Data, managerData] = await Promise.all([
                L2Appraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL2Manager'] }),
                L3Appraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL3Manager'] }),
                L4Appraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL4Manager'] }),
                Manager.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByManager'] }),
              ]);

              let L2Flag = l2Data.length === 0 ? 1 : l2Data[0].isEditedByL2Manager;
              let L3Flag = l3Data.length === 0 ? 1 : l3Data[0].isEditedByL3Manager;
              let L4Flag = l4Data.length === 0 ? 1 : l4Data[0].isEditedByL4Manager;

              //console.log("L2Flag::::", L2Flag);
              //console.log("L3Flag::::", L3Flag);
              //console.log("L4Flag::::", L4Flag);

              if (L2Flag === 0) {
                res.json({ "message": "Level 2 Evaluation is not done yet", "status": 400 });
              } else if (L3Flag === 0) {
                res.json({ "message": "Level 3 Evaluation is not done yet", "status": 400 });
              } else if (L4Flag === 0) {
                res.json({ "message": "Level 4 Evaluation is not done yet", "status": 400 });
              } else {
                //console.log("heressssssssssssssssssss");

                let check = managerData.isEditedByManager;
                //console.log("check::::::", check);

                if (check === 1) {
                  res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
                } else {
                  const updateData = {
                    appraisalId: appraisalId,
                    ManagerId: id,
                    createdAt: date,
                    FSQoW_1: req.body.FSQoW1,
                    FSQoW_2: req.body.FSQoW2,
                    FSQoW_3: req.body.FSQoW3,
                    FSWH_1: req.body.FSWH1,
                    FSWH_2: req.body.FSWH2,
                    FSWH_3: req.body.FSWH3,
                    FSWH_4: req.body.FSWH4,
                    FSJK_1: req.body.FSJK1,
                    FSJK_2: req.body.FSJK2,
                    FSJK_3: req.body.FSJK3,
                    FSRemarks: req.body.FSRemarks,
                    ISIR_1: req.body.ISIR1,
                    ISIR_2: req.body.ISIR2,
                    ISIR_3: req.body.ISIR3,
                    ISIR_4: req.body.ISIR4,
                    ISIR_5: req.body.ISIR5,
                    ISIRRemarks: req.body.ISIRRemarks,
                    LSL_1: req.body.LSL1,
                    LSL_2: req.body.LSL2,
                    LSL_3: req.body.LSL3,
                    LSLRemarks: req.body.LSLRemarks,
                  }

                  await Manager.update(updateData, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } });

                  const sum = req.body.FSQoW1 + req.body.FSQoW2 + req.body.FSQoW3 + req.body.FSWH1 + req.body.FSWH2 + req.body.FSWH3 + req.body.FSWH4 + req.body.FSJK1 + req.body.FSJK2 + req.body.FSJK3 + req.body.ISIR1 + req.body.ISIR2 + req.body.ISIR3 + req.body.ISIR4 + req.body.ISIR5 + req.body.LSL1 + req.body.LSL2 + req.body.LSL3;

                  const lastLevel = await Manager.findOne({
                    where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId },
                    raw: true,
                    attributes: ['lastLevelMaxMarks', 'lastLevelScoredMarks'],
                  });

                  //console.log("LastLevel:::::", lastLevel);

                  const finalSum = sum + lastLevel.lastLevelScoredMarks;
                  //console.log(sum);
                  //console.log(finalSum);

                  const percentage = Math.floor(finalSum / (90 + lastLevel.lastLevelMaxMarks) * 100);
                  //console.log("Overall Percentage::::::::", percentage);

                  await Manager.update(
                    { managersOverallPercentage: percentage, managersTotalScore: finalSum },
                    { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }
                  );

                  let overallRating;

                  if (1 <= percentage && percentage <= 25) {
                    overallRating = "Average";
                  } else if (26 <= percentage && percentage <= 50) {
                    overallRating = "Good";
                  } else if (51 <= percentage && percentage <= 75) {
                    overallRating = "Very Good";
                  } else if (76 <= percentage && percentage <= 100) {
                    overallRating = "Excellent";
                  }

                  //console.log("OverallRating::::::::::", overallRating);
                  const flag = req.body.flag;
                  if (flag == 1) {



                    await Manager.update(
                      { managersOverallRating: overallRating, isEditedByManager: true },
                      { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }
                    );

                    await empAppraisal.update({ status: "Sent to HR" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } });
                  }

                  res.json({ "message": overallRating }).status(200);
                }
              }
            } catch (error) {
              console.error('Error:', error);
              res.status(500).json({ "message": "Internal Server Error" });
            }
          }

        }
      }
      else {
        res.status(400).json({ "message": "You are not in the manager list for this employee" })
        //console.log("You are not in the manager list");
      }
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/managersEvaluation", async (req, res) => {//Updated/New
    try {
      //console.log("Payload::::::::", req.body);
      const formType = req.body.formType;
      const id = req.body.employeeId;//Manager Id who is filling the evaluation form.
      const date = new Date();
      //console.log(id);
      const appraisalId = parseInt(req.body.appraisalId);
      //console.log(appraisalId);
      const appraisalDetails = await empAppraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['employeeId', 'isEditedByEmp'] });
      //console.log(appraisalDetails);
      const empFlag = appraisalDetails.isEditedByEmp;
      let L2Flag;
      let L3Flag;
      let L4Flag;
      const empMangDetails = await empMang.findOne({ where: { employeeId: appraisalDetails.employeeId, organisationId: req.body.organisationId }, raw: true });
      //console.log(empMangDetails);
      const L2Manager = empMangDetails.L2ManagerId;
      //console.log("L2Manager::", L2Manager);
      const L3Manager = empMangDetails.L3ManagerId;
      //console.log("L3Manager::", L3Manager);
      const L4Manager = empMangDetails.L4ManagerId;
      //console.log("L4Manager::", L4Manager);
      const L5Manager = empMangDetails.L5ManagerId;
      //console.log("L5Manager::", L5Manager);

      let topManager;

      if (empMangDetails.L5ManagerId !== null) {
        topManager = empMangDetails.L5ManagerId;
      } else if (empMangDetails.L4ManagerId !== null) {
        topManager = empMangDetails.L4ManagerId;
      } else if (empMangDetails.L3ManagerId !== null) {
        topManager = empMangDetails.L3ManagerId;
      } else if (empMangDetails.L2ManagerId !== null) {
        topManager = empMangDetails.L2ManagerId;
      } else {
        topManager = null;
      }

      //console.log("Top Manager:", topManager);

      // //console.log("L3Manager:::", L3Manager);
      if (id == L2Manager || id == L3Manager || id == L4Manager || id == L5Manager) {
        if (empFlag == 0) {
          res.status(400).json({
            "message": "Employee Self evaluation is not yet filled by the employee"
          });
        }
        else {
          if (id == L2Manager && formType == "employeeEvaluation") {
            let check;
            await L2Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL2Manager'] }).then((data) => {
              check = data.isEditedByL2Manager
            }).catch((err) => {
              //console.log(err);
            })
            if (check == 1) {
              res.status(400).json({ "message": "Form already submitted by manager not allowed to re-submit" });
            }
            else {
              //console.log("req.body:::", req.body)
              const flag = req.body.flag;


              const updateData = {
                L2communicationSkill: req.body.communicationSkill,
                L2communicationSkillRemarks: req.body.communicationSkillRemarks,
                L2interpersonalSkill: req.body.interpersonalSkill,
                L2interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
                L2abilityToPlanTheWork: req.body.abilityToPlanTheWork,
                L2abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
                L2problemSolving: req.body.problemSolving,
                L2problemSolvingRemarks: req.body.problemSolvingRemarks,
                L2adaptability: req.body.adaptability,
                L2adaptabilityRemarks: req.body.adaptabilityRemarks,
                L2willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
                L2willingnessToShoulderAdditionalRemarks: req.body.willingnessToShoulderAdditionalRemarks,
                L2commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
                L2commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
                L2habitsAndManners: req.body.habitsAndManners,
                L2habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
                L2presentation: req.body.presentation,
                L2presentationRemarks: req.body.presentationRemarks,
                L2punctuality: req.body.punctuality,
                L2punctualityRemarks: req.body.punctualityRemarks,
                L2confidentialityOfInfo: req.body.confidentialityOfInfo,
                L2confidentialityOfInfoRemarks: req.body.confidentialityOfInfoRemarks,
                L2trustworthiness: req.body.trustworthiness,
                L2trustworthinessRemarks: req.body.trustworthinessRemarks,
                L2teamSpirit: req.body.teamSpirit,
                L2teamSpiritRemarks: req.body.teamSpiritRemarks,
                L2relationshipWithColleagues: req.body.relationshipWithColleagues,
                L2relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
                L2decisionMaking: req.body.decisionMaking,
                L2decisionMakingRemarks: req.body.decisionMakingRemarks,
                L2computerskills: req.body.computerskills,
                L2computerskillsRemarks: req.body.computerskillsRemarks
                // Add more fields as needed
              };

              const updateCondition = {
                // Define the condition based on which records should be updated
                // For example, to update records with id = 1:
                appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
              };

              L2Appraisal.update(updateData, {
                where: updateCondition,
              })
                .then((data) => {
                  //console.log("Updated Successfully");
                  // res.send("Updated Successfully").status(200)
                })
                .catch(error => {
                  console.error('Error updating records:', error);
                  // res.send(error).status(400);
                });

              // const sum = parseInt(req.body.sum);
              const sum =
                parseInt(req.body.communicationSkill) +
                parseInt(req.body.interpersonalSkill) +
                parseInt(req.body.abilityToPlanTheWork) +
                parseInt(req.body.problemSolving) +
                parseInt(req.body.adaptability) +
                parseInt(req.body.willingnessToShoulderAdditional) +
                parseInt(req.body.commitmentToDoAPerfectJob) +
                parseInt(req.body.habitsAndManners) +
                parseInt(req.body.presentation) +
                parseInt(req.body.punctuality) +
                parseInt(req.body.confidentialityOfInfo) +
                parseInt(req.body.trustworthiness) +
                parseInt(req.body.teamSpirit) +
                parseInt(req.body.relationshipWithColleagues) +
                parseInt(req.body.decisionMaking) +
                parseInt(req.body.computerskills);


              //console.log(sum);
              // //console.log(empEvaSum);
              const percentage = Math.floor(sum / 80 * 100);
              //console.log("Overall Percentage::::::::", percentage);
              // //console.log("sum+emEvaSum.L2TS::::::::", sum + empEvaSum.L2TS);

              L2Appraisal.update({ L2_ManagersOverallPercentage: percentage, L2_ManagersTotalScore: sum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                //console.log("percentage updated successfully");
              }).catch((err) => {
                //console.log(err);
              });

              let overallRating;
              if (1 <= percentage && percentage <= 25) {
                overallRating = "Average";
              } else if (26 <= percentage && percentage <= 50) {
                overallRating = "Good";
              } else if (51 <= percentage && percentage <= 75) {
                overallRating = "Very Good";
              } else if (76 <= percentage && percentage <= 100) {
                overallRating = "Excellent";
              }
              //console.log("OverallRating::::::::::", overallRating);
              L2Appraisal.update({ L2_ManagersOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                // L2Flag =1;
                //console.log("rating updated successfully");
              }).catch((err) => {
                //console.log(err);
              })

              if (flag == 1) {
                L2Appraisal.update({ isEditedByL2Manager: true }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // L2Flag =1;
                  //console.log("flag has been updated successfully");
                }).catch((err) => {
                  //console.log(err);
                })
                empAppraisal.update({ status: "Forwarded to Level-3- Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  //console.log("Status updated successfully in empAppraisal");
                }).catch((err) => {
                  //console.log(err);
                });
                //console.log("isnull():::::", isNull(L3Manager));

                if (isNull(L3Manager)) {//Checking whether is there any further level for evaluation or not for an employee. 
                  //console.log(":::::::::::::::::Here:::::::::::::::::")
                  empAppraisal.update({ status: "Forwarded to Last Level Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    //console.log("Status updated successfully l3 is null");

                    Manager.update({
                      lastLevelMaxMarks: 80, lastLevelScoredMarks: sum
                    }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } })
                      .then((data) => {
                        //console.log("Created Successfully in L5Appraisals");
                        // res.send("Updated Successfully").status(200)
                      })
                      .catch(error => {
                        console.error('Error creating records in L5Appraisals:', error);
                        // res.json({ "message": error }).status(400);
                      });
                  }).catch((err) => {
                    //console.log(err);
                  });
                }
              }

              res.json({ "message": overallRating }).status(200);
            }


          }
          if (id == L3Manager && formType == "employeeEvaluation" && !(id == topManager)) {
            await L2Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL2manager'] }).then((data) => {
              //console.log("Here at L2Flag data::::::", data)
              L2Flag = data.isEditedByL2manager;
              //console.log("L2Flag::::", L2Flag)
            }).catch((err) => {
              //console.log(err);
            });
            if (L2Flag == 0) {
              res.status(400).json({ "message": "Level 2 Evaluation is not done yet" });
            }
            else {
              let check;
              await L3Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL3Manager'] }).then((data) => {
                check = data.isEditedByL3Manager
              }).catch((err) => {
                //console.log(err);
              })
              if (check == 1) {
                res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
              }
              else {
                let flag = req.body.flag;


                const updateData = {
                  L3communicationSkill: req.body.communicationSkill,
                  L3communicationSkillRemarks: req.body.communicationSkillRemarks,
                  L3interpersonalSkill: req.body.interpersonalSkill,
                  L3interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
                  L3abilityToPlanTheWork: req.body.abilityToPlanTheWork,
                  L3abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
                  L3problemSolving: req.body.problemSolving,
                  L3problemSolvingRemarks: req.body.problemSolvingRemarks,
                  L3adaptability: req.body.adaptability,
                  L3adaptabilityRemarks: req.body.adaptabilityRemarks,
                  L3willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
                  L3willingnessToShoulderAdditionalRemarks: req.body.willingnessToShoulderAdditionalRemarks,
                  L3commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
                  L3commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
                  L3habitsAndManners: req.body.habitsAndManners,
                  L3habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
                  L3presentation: req.body.presentation,
                  L3presentationRemarks: req.body.presentationRemarks,
                  L3punctuality: req.body.punctuality,
                  L3punctualityRemarks: req.body.punctualityRemarks,
                  L3confidentialityOfInfo: req.body.confidentialityOfInfo,
                  L3confidentialityOfInfoRemarks: req.body.confidentialityOfInfoRemarks,
                  L3trustworthiness: req.body.trustworthiness,
                  L3trustworthinessRemarks: req.body.trustworthinessRemarks,
                  L3teamSpirit: req.body.teamSpirit,
                  L3teamSpiritRemarks: req.body.teamSpiritRemarks,
                  L3relationshipWithColleagues: req.body.relationshipWithColleagues,
                  L3relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
                  L3decisionMaking: req.body.decisionMaking,
                  L3decisionMakingRemarks: req.body.decisionMakingRemarks,
                  L3computerskills: req.body.computerskills,
                  L3computerskillsRemarks: req.body.computerskillsRemarks
                  // Add more fields as needed
                };

                const updateCondition = {
                  // Define the condition based on which records should be updated
                  // For example, to update records with id = 1:
                  appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
                };

                L3Appraisal.update(updateData, {
                  where: updateCondition,
                })
                  .then((data) => {
                    //console.log("Updated Successfully");
                    // res.send("Updated Successfully").status(200)
                  })
                  .catch(error => {
                    console.error('Error updating records:', error);
                    // res.send(error).status(400);
                  });

                // const sum = parseInt(req.body.sum);
                const sum =
                  parseInt(req.body.communicationSkill) +
                  parseInt(req.body.interpersonalSkill) +
                  parseInt(req.body.abilityToPlanTheWork) +
                  parseInt(req.body.problemSolving) +
                  parseInt(req.body.adaptability) +
                  parseInt(req.body.willingnessToShoulderAdditional) +
                  parseInt(req.body.commitmentToDoAPerfectJob) +
                  parseInt(req.body.habitsAndManners) +
                  parseInt(req.body.presentation) +
                  parseInt(req.body.punctuality) +
                  parseInt(req.body.confidentialityOfInfo) +
                  parseInt(req.body.trustworthiness) +
                  parseInt(req.body.teamSpirit) +
                  parseInt(req.body.relationshipWithColleagues) +
                  parseInt(req.body.decisionMaking) +
                  parseInt(req.body.computerskills);

                //console.log(sum);
                const lastSum = await L2Appraisal.findOne({
                  where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true,
                  attributes: ['L2_ManagersTotalScore'/* add more fields as needed */]
                });
                //console.log(lastSum);
                //console.log(lastSum.L2_ManagersTotalScore);
                const finalSum = sum + lastSum.L2_ManagersTotalScore;
                //console.log("FinalSum:::::", finalSum);
                const percentage = Math.floor(finalSum / 160 * 100);//total marks at level 3  is 260 which is 80 from level 1 and 90 from level 2 and 90 from level 3 .
                //console.log("Overall Percentage::::::::", percentage);


                L3Appraisal.update({ L3_ManagersOverallPercentage: percentage, L3_ManagersTotalScore: finalSum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  //console.log("percentage updated successfully");
                }).catch((err) => {
                  //console.log(err);
                })

                let overallRating;
                if (1 <= percentage && percentage <= 25) {
                  overallRating = "Average";
                } else if (26 <= percentage && percentage <= 50) {
                  overallRating = "Good";
                } else if (51 <= percentage && percentage <= 75) {
                  overallRating = "Very Good";
                } else if (76 <= percentage && percentage <= 100) {
                  overallRating = "Excellent";
                }
                //console.log("OverallRating::::::::::", overallRating);

                L3Appraisal.update({ L3_ManagersOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // L3Flag =1;
                  //console.log("rating updated successfully");
                }).catch((err) => {
                  //console.log(err);
                });
                if (flag == 1) {
                  L3Appraisal.update({ isEditedByL3Manager: true }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    // L3Flag =1;
                    //console.log("rating updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });
                  empAppraisal.update({ status: "Forwarded to Level-4- Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    //console.log("Status updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });

                  if (isNull(L4Manager)) {
                    empAppraisal.update({ status: "Forwarded to Last Level Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                      //console.log("Status updated successfully");

                      Manager.update({
                        lastLevelMaxMarks: 160, lastLevelScoredMarks: finalSum
                      }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } })
                        .then((data) => {
                          //console.log("Created Successfully in L5Appraisals");
                          // res.send("Updated Successfully").status(200)
                        })
                        .catch(error => {
                          console.error('Error creating records in L5Appraisals:', error);
                          // res.json({ "message": error }).status(400);
                        });
                    }).catch((err) => {
                      //console.log(err);
                    });
                  }
                }


                res.json({ "message": overallRating }).status(200);
              }

            }
          }
          if (id == L4Manager && formType == "employeeEvaluation" && !(id == topManager)) {
            let data = await L3Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL3Manager'] });

            L3Flag = data.isEditedByL3Manager;
            if (L3Flag == 0) {
              res.status(400).json({ "message": "Level 3 Evaluation is not done yet" });
            }
            else {
              let check;
              await L4Appraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL4Manager'] }).then((data) => {
                check = data.isEditedByL4Manager
              }).catch((err) => {
                //console.log(err);
              })
              if (check == 1) {
                res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
              }
              else {
                const flag = req.body.flag;


                const updateData = {
                  L4communicationSkill: req.body.communicationSkill,
                  L4communicationSkillRemarks: req.body.communicationSkillRemarks,
                  L4interpersonalSkill: req.body.interpersonalSkill,
                  L4interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
                  L4abilityToPlanTheWork: req.body.abilityToPlanTheWork,
                  L4abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
                  L4problemSolving: req.body.problemSolving,
                  L4problemSolvingRemarks: req.body.problemSolvingRemarks,
                  L4adaptability: req.body.adaptability,
                  L4adaptabilityRemarks: req.body.adaptabilityRemarks,
                  L4willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
                  L4willingnessToShoulderAdditionalRemarks: req.body.willingnessToShoulderAdditionalRemarks,
                  L4commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
                  L4commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
                  L4habitsAndManners: req.body.habitsAndManners,
                  L4habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
                  L4presentation: req.body.presentation,
                  L4presentationRemarks: req.body.presentationRemarks,
                  L4punctuality: req.body.punctuality,
                  L4punctualityRemarks: req.body.punctualityRemarks,
                  L4confidentialityOfInfo: req.body.confidentialityOfInfo,
                  L4confidentialityOfInfoRemarks: req.body.confidentialityOfInfoRemarks,
                  L4trustworthiness: req.body.trustworthiness,
                  L4trustworthinessRemarks: req.body.trustworthinessRemarks,
                  L4teamSpirit: req.body.teamSpirit,
                  L4teamSpiritRemarks: req.body.teamSpiritRemarks,
                  L4relationshipWithColleagues: req.body.relationshipWithColleagues,
                  L4relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
                  L4decisionMaking: req.body.decisionMaking,
                  L4decisionMakingRemarks: req.body.decisionMakingRemarks,
                  L4computerskills: req.body.computerskills,
                  L4computerskillsRemarks: req.body.computerskillsRemarks
                  // Add more fields as needed
                };

                const updateCondition = {
                  appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
                };

                L4Appraisal.update(updateData, {
                  where: updateCondition,
                })
                  .then((data) => {
                    //console.log("Updated Successfully");
                    // res.send("Updated Successfully").status(200)
                  })
                  .catch(error => {
                    console.error('Error updating records:', error);
                    // res.send(error).status(400);
                  });

                // const sum = parseInt(req.body.sum);
                const sum =
                  parseInt(req.body.communicationSkill) +
                  parseInt(req.body.interpersonalSkill) +
                  parseInt(req.body.abilityToPlanTheWork) +
                  parseInt(req.body.problemSolving) +
                  parseInt(req.body.adaptability) +
                  parseInt(req.body.willingnessToShoulderAdditional) +
                  parseInt(req.body.commitmentToDoAPerfectJob) +
                  parseInt(req.body.habitsAndManners) +
                  parseInt(req.body.presentation) +
                  parseInt(req.body.punctuality) +
                  parseInt(req.body.confidentialityOfInfo) +
                  parseInt(req.body.trustworthiness) +
                  parseInt(req.body.teamSpirit) +
                  parseInt(req.body.relationshipWithColleagues) +
                  parseInt(req.body.decisionMaking) +
                  parseInt(req.body.computerskills);


                //console.log("sum::::", sum);
                const lastSum = await L3Appraisal.findOne({
                  where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true,
                  attributes: ['L3_ManagersTotalScore'/* add more fields as needed */]
                });
                //console.log("lastSum::::", lastSum);
                //console.log("last SUM:::::", lastSum.L3_ManagersTotalScore);
                const finalSum = sum + lastSum.L3_ManagersTotalScore;
                //console.log("finalSum::::", finalSum);
                const percentage = Math.floor(finalSum / 240 * 100);//total marks at level 3  is 260 which is 80 from level 1 and 90 from level 2 and 90 from level 3 .
                //console.log("Overall Percentage::::::::", percentage);


                L4Appraisal.update({ L4_ManagersOverallPercentage: percentage, L4_ManagersTotalScore: finalSum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  //console.log("percentage updated successfully");
                }).catch((err) => {
                  //console.log(err);
                })

                let overallRating;
                if (1 <= percentage && percentage <= 25) {
                  overallRating = "Average";
                } else if (26 <= percentage && percentage <= 50) {
                  overallRating = "Good";
                } else if (51 <= percentage && percentage <= 75) {
                  overallRating = "Very Good";
                } else if (76 <= percentage && percentage <= 100) {
                  overallRating = "Excellent";
                }
                //console.log("OverallRating::::::::::", overallRating);

                L4Appraisal.update({ L4_ManagersOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                  // L4Flag =1;
                  //console.log("rating updated successfully");
                }).catch((err) => {
                  //console.log(err);
                });

                if (flag == 1) {
                  L4Appraisal.update({ isEditedByL4Manager: true }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    // L4Flag =1;
                    //console.log("rating updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });
                  empAppraisal.update({ status: "Forwarded to Last Level Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
                    //console.log("Status updated successfully");
                  }).catch((err) => {
                    //console.log(err);
                  });
                  Manager.update({
                    lastLevelMaxMarks: 240, lastLevelScoredMarks: finalSum
                  }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } })
                    .then((data) => {
                      //console.log("Created Successfully in L5Appraisals");
                      // res.send("Updated Successfully").status(200)
                    })
                    .catch(error => {
                      console.error('Error creating records in L5Appraisals:', error);
                      // res.json({ "message": error }).status(400);
                    });
                }


                res.json({ "message": overallRating }).status(200);

              }
            }
          }
          if (id == topManager && formType == "managerEvaluation") {
            try {
              //console.log("::::::::::::here::::::::::");

              const [l2Data, l3Data, l4Data, managerData] = await Promise.all([
                L2Appraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL2Manager'] }),
                L3Appraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL3Manager'] }),
                L4Appraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByL4Manager'] }),
                Manager.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByManager'] }),
              ]);

              let L2Flag = l2Data.length === 0 ? 1 : l2Data[0].isEditedByL2Manager;
              let L3Flag = l3Data.length === 0 ? 1 : l3Data[0].isEditedByL3Manager;
              let L4Flag = l4Data.length === 0 ? 1 : l4Data[0].isEditedByL4Manager;

              //console.log("L2Flag::::", L2Flag);
              //console.log("L3Flag::::", L3Flag);
              //console.log("L4Flag::::", L4Flag);

              if (L2Flag === 0) {
                res.status(400).json({ "message": "Level 2 Evaluation is not done yet" });
              } else if (L3Flag === 0) {
                res.status(400).json({ "message": "Level 3 Evaluation is not done yet" });
              } else if (L4Flag === 0) {
                res.status(400).json({ "message": "Level 4 Evaluation is not done yet" });
              } else {
                let check = managerData.isEditedByManager;
                //console.log("check::::::", check);

                if (check === 1) {
                  res.status(400).json({ "message": "Form already submitted by the manager not allowed to re-submit" });
                } else {
                  //console.log("here::::::::::::");
                  const updateData = {
                    appraisalId: appraisalId,
                    ManagerId: id,
                    createdAt: date,
                    FSQoW1: req.body.FSQoW1,
                    FSQoW2: req.body.FSQoW2,
                    FSQoW3: req.body.FSQoW3,
                    FSWH1: req.body.FSWH1,
                    FSWH2: req.body.FSWH2,
                    FSWH3: req.body.FSWH3,
                    FSWH4: req.body.FSWH4,
                    FSJK1: req.body.FSJK1,
                    FSJK2: req.body.FSJK2,
                    FSJK3: req.body.FSJK3,
                    FSRemarks: req.body.FSRemarks,
                    ISIR1: req.body.ISIR1,
                    ISIR2: req.body.ISIR2,
                    ISIR3: req.body.ISIR3,
                    ISIR4: req.body.ISIR4,
                    ISIR5: req.body.ISIR5,
                    ISIRRemarks: req.body.ISIRRemarks,
                    LSL1: req.body.LSL1,
                    LSL2: req.body.LSL2,
                    LSL3: req.body.LSL3,
                    LSLRemarks: req.body.LSLRemarks,
                  }

                  await Manager.update(updateData, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } });

                  const sum =
                    parseInt(req.body.FSQoW1) +
                    parseInt(req.body.FSQoW2) +
                    parseInt(req.body.FSQoW3) +
                    parseInt(req.body.FSWH1) +
                    parseInt(req.body.FSWH2) +
                    parseInt(req.body.FSWH3) +
                    parseInt(req.body.FSWH4) +
                    parseInt(req.body.FSJK1) +
                    parseInt(req.body.FSJK2) +
                    parseInt(req.body.FSJK3) +
                    parseInt(req.body.ISIR1) +
                    parseInt(req.body.ISIR2) +
                    parseInt(req.body.ISIR3) +
                    parseInt(req.body.ISIR4) +
                    parseInt(req.body.ISIR5) +
                    parseInt(req.body.LSL1) +
                    parseInt(req.body.LSL2) +
                    parseInt(req.body.LSL3);


                  const lastLevel = await Manager.findOne({
                    where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId },
                    raw: true,
                    attributes: ['lastLevelMaxMarks', 'lastLevelScoredMarks'],
                  });

                  //console.log("LastLevel:::::", lastLevel);

                  const finalSum = sum + lastLevel.lastLevelScoredMarks;
                  //console.log(sum);
                  //console.log(finalSum);

                  const percentage = Math.floor(finalSum / (90 + lastLevel.lastLevelMaxMarks) * 100);
                  //console.log("Overall Percentage::::::::", percentage);

                  await Manager.update(
                    { managersOverallPercentage: percentage, managersTotalScore: finalSum },
                    { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }
                  );

                  let overallRating;

                  if (1 <= percentage && percentage <= 25) {
                    overallRating = "Average";
                  } else if (26 <= percentage && percentage <= 50) {
                    overallRating = "Good";
                  } else if (51 <= percentage && percentage <= 75) {
                    overallRating = "Very Good";
                  } else if (76 <= percentage && percentage <= 100) {
                    overallRating = "Excellent";
                  }

                  //console.log("OverallRating::::::::::", overallRating);
                  const flag = req.body.flag;
                  if (flag == 1) {
                    await Manager.update(
                      { managersOverallRating: overallRating, isEditedByManager: true },
                      { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }
                    );

                    await empAppraisal.update({ status: "Sent to HR" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } });
                  }

                  res.json({ "message": overallRating }).status(200);
                }
              }
            } catch (error) {
              console.error('Error:', error);
              res.status(500).json({ "message": "Internal Server Error" });
            }
          }

        }
      }
      else {
        res.status(400).json({ "message": "You are not in the manager list for this employee" })
        //console.log("You are not in the manager list");
      }
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/automaticAmount", async (req, res) => {//This api is used when the hr sees final rating at level 5 and amount get automatically generated ***UPDATED ACCORDING TO NEW DATABASE
    try {
      const info = await empAppraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['status'] });
      //console.log("status::::", info.status);
      if (info.status == "Sent to HR") {
        //console.log(req.body.appraisalId);
        const aDetails = await Manager.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true });
        const date = new Date;
        const organisationId = req.body.organisationId
        //console.log("date::::::::", date);
        const cYear = date.getFullYear();
        //console.log("Current Year::::", cYear);
        const rawQuery = `SELECT ExcellentAmount,VgoodAmount,GoodAmount,AverageAmount FROM (Employees AS E INNER JOIN EmpAppraisals AS A ON E.employeeId = A.employeeId)INNER JOIN HrAppraisalRatingAmounts AS H ON E.departmentId = H.departmentId WHERE E.organisationId = ${req.body.organisationId} AND A.appraisalId=${req.body.appraisalId} AND E.designation = H.designation AND H.year=${cYear}`;
        const OverallRating = aDetails.managersOverallRating;
        //console.log(OverallRating);

        sequelize.query(rawQuery, {
          type: Sequelize.QueryTypes.SELECT,
        }).then((data) => {
          //console.log(data);
          if (OverallRating == "Excellent") {
            res.json({ "data": data[0].ExcellentAmount });
          } else if (OverallRating == "Very Good") {
            res.json({ "data": data[0].VgoodAmount });
          } else if (OverallRating == "Good") {
            res.json({ "data": data[0].GoodAmount });
          } else if (OverallRating == "Average") {
            res.json({ "data": data[0].AverageAmount });
          };
        }).catch((err) => {
          //console.log(err);
          // res.send(err).status(400);
        })
      }
      else {
        res.status(400).json({ "message": "Evaluation is not completed at all levels" });
      }
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }

  });

  apiRoutes.post("/anAppraisalDetailsOfEmpEval", async (req, res) => {
    try {
      // console.log("This Endpoint::anAppraisalDetailsOfEmpEval:::::::::::::::",req.body)
      const employeeId = Number(req.body.employeeId);
      const details = await empAppraisal.findAll({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true });
      // console.log("details",details)
      const L2Manager = details[0].assignedL2Manager;
      const L3Manager = details[0].assignedL3Manager;
      const L4Manager = details[0].assignedL4Manager;
      const L5Manager = details[0].assignedL5Manager;
      // console.log("L2Manager",L2Manager)
      // console.log("L3Manager",L3Manager)
      // console.log("L4Manager",L4Manager)
      // console.log("L5Manager",L5Manager)
      switch (employeeId) {
        case L2Manager:
          details[0]["isL2Manager"] = true
          details[0]["isL3Manager"] = false
          details[0]["isL4Manager"] = false
          details[0]["isL5Manager"] = false
          break;
        case L3Manager:
          details[0]["isL2Manager"] = false
          details[0]["isL3Manager"] = true
          details[0]["isL4Manager"] = false
          details[0]["isL5Manager"] = false
          break;
        case L4Manager:
          details[0]["isL2Manager"] = false
          details[0]["isL3Manager"] = false
          details[0]["isL4Manager"] = true
          details[0]["isL5Manager"] = false
          break;
        case L5Manager:
          details[0]["isL2Manager"] = false
          details[0]["isL3Manager"] = false
          details[0]["isL4Manager"] = false
          details[0]["isL5Manager"] = true
          break;
        default:
          details[0]["isL2Manager"] = false
          details[0]["isL3Manager"] = false
          details[0]["isL4Manager"] = false
          details[0]["isL5Manager"] = false
          break;
      }
      console.log("data", details);
      res.json({ "data": details[0] }).status(200);
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  // apiRoutes.post("/anAppraisalDetailsOfEmpEval1", async (req, res) => {
  //   //console.log("*********************************AnAppraisalDetailsOfEmpEval")
  //   try {
  //     const employeeId = parseInt(req.body.employeeId);
  //     const details = await empAppraisal.findAll({ where: { appraisalId: req.body.appraisalId }, raw: true });

  //     // Check if any details were found
  //     if (details.length === 0) {
  //       return res.status(404).json({ "message": "No details found for the given appraisalId" });
  //     }
  //     const L2Manager = details[0].assignedL2Manager;
  //     const L3Manager = details[0].assignedL3Manager;
  //     const L4Manager = details[0].assignedL4Manager;
  //     const L5Manager = details[0].assignedL5Manager;

  //     switch (employeeId) {
  //       case L2Manager:
  //         details[0]["isL2Manager"] = true;
  //         details[0]["isL3Manager"] = false;
  //         details[0]["isL4Manager"] = false;
  //         details[0]["isL5Manager"] = false;
  //         break;
  //       case L3Manager:
  //         details[0]["isL2Manager"] = false;
  //         details[0]["isL3Manager"] = true;
  //         details[0]["isL4Manager"] = false;
  //         details[0]["isL5Manager"] = false;
  //         break;
  //       case L4Manager:
  //         details[0]["isL2Manager"] = false;
  //         details[0]["isL3Manager"] = false;
  //         details[0]["isL4Manager"] = true;
  //         details[0]["isL5Manager"] = false;
  //         break;
  //       case L5Manager:
  //         details[0]["isL2Manager"] = false;
  //         details[0]["isL3Manager"] = false;
  //         details[0]["isL4Manager"] = false;
  //         details[0]["isL5Manager"] = true;
  //         break;
  //       default:
  //         details[0]["isL2Manager"] = false;
  //         details[0]["isL3Manager"] = false;
  //         details[0]["isL4Manager"] = false;
  //         details[0]["isL5Manager"] = false;
  //         break;
  //     }
  //     //console.log(details, "consoling the results");
  //     // return false
  //     // res.send(details[0]);
  //     res.status(200).send(details[0]);
  //   }
  //   catch (err) {
  //     res.status(500).json({ "message": err.message });
  //   }
  // });


  apiRoutes.post("/hrRatingAmountStorage", async (req, res) => {
    try {
      //console.log("req.body::::::", req.body);
      const date = new Date();
      const year = date.getFullYear()
      const info = await hrAmount.findOne({ where: { departmentId: req.body.departmentId, designation: req.body.designation, year: year, organisationId: req.body.organisationId }, raw: true });
      if (info) {
        res.status(400).json({ "message": "Entry already exist for the respective department,designation and year" });
      }
      else {
        const depInfo = await department.findOne({ where: { id: req.body.departmentId, organisationId: req.body.organisationId }, raw: true });
        //console.log(depInfo);
        const depId = depInfo.id;

        hrAmount.create({ departmentId: req.body.departmentId, designation: req.body.designation, year: year, ExcellentAmount: req.body.excellentAmount, VgoodAmount: req.body.vgoodAmount, GoodAmount: req.body.goodAmount, AverageAmount: req.body.averageAmount }).then((data) => {
          // //console.log("Entry created",data);
          res.json({ "message": "Entries Created" }).status(200);
        }).catch((err) => {
          //console.log(err);
          // res.send(err).status(400);
        })
      }
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/hrRatingAmountUpdate", async (req, res) => {
    try {
      //console.log("req.body::::::", req.body);
      const date = new Date();
      const year = date.getFullYear();
      let entries = [];
      entries = req.body.entries;
      //console.log("Entries:::::", entries, "length::::", entries.length);
      for (i = 0; i < entries.length; i++) {
        //console.log("Entry::::", entries[i]);
        hrAmount.update({ ExcellentAmount: entries[i].excellentAmount, VgoodAmount: entries[i].vgoodAmount, GoodAmount: entries[i].goodAmount, AverageAmount: entries[i].averageAmount }, { where: { departmentId: entries[i].departmentId, designation: entries[i].designation, year: year, organisationId: req.body.organisationId } }).then((data) => {
          // res.json({"message":"Entries Updated Successfully"}).status(400);
          //console.log("Entries Updated Successfully for entries index value:", i);

        }).catch((e) => {
          //console.log(e);
        })
      }
      res.status(200).json({ "message": "Entries Updated Successfully" });
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/hrRatingAmountInfo", async (req, res) => {
    try {
      console.log("req.body::::::", req.body);
      const rawQuery = `SELECT H.id AS serialNumber, D.name AS departmentName,D.id AS departmentId,H.designation, H.ExcellentAmount,H.VgoodAmount,H.GoodAmount,H.AverageAmount FROM HrAppraisalRatingAmounts AS H INNER JOIN Departments AS D ON H.departmentId = D.id`;


      sequelize.query(rawQuery, {
        type: Sequelize.QueryTypes.SELECT,
      }).then((data) => {
        //console.log(data);
        res.json({ "message": data }).status(200);
      }).catch((err) => {
        //console.log(err);
        // res.json({ "message": err }).status(400);
      });
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/allAppraisalInfoOfAnEmp", async (req, res) => {//for the employee main screen 
    //console.log("*******************************allAppraisalInfoOfAnE")
    try {
      const id = req.body.employeeId;
      const rawQuery = `SELECT CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,designation,A.appraisalId,A.createdAt,A.status,E.officialEmail FROM Employees AS E INNER JOIN EmpAppraisals AS A ON E.employeeId = A.employeeId WHERE E.organisationId = ${req.body.organisationId} and A.employeeId = ${id}`;

      sequelize.query(rawQuery, {
        type: Sequelize.QueryTypes.SELECT,
      }).then((data) => {
        res.status(200).json({ data });
      }).catch((err) => {
        // res.send(err).status(400);
      })
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/employeeEvaluation", async (req, res) => { //to fill entries in the employee self evaluation form***UPDATED ACCORDING TO NEW DATABASE***
    try {
      const flag = req.body.flag;//0 if draft and 1 if submit
      let flagCheck = await empAppraisal.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true, attributes: ['isEditedByEmp', 'status'] });
      console.log(flagCheck);
      if (flagCheck.isEditedByEmp || flagCheck.status == "Forwarded to the Level-2- Manager") {
        res.status(400).json({
          "message": "Form already edited by employee, Not allowed to re-edit the form"
        });
      }
      else {
        console.log("HERE:::::::")
        let L2Manager;
        let L3Manager;
        let L4Manager;
        let L5Manager;
        let hr;
        const managers = await empMang.findOne({
          where: { employeeId: req.body.employeeId, organisationId: req.body.organisationId }, raw: true
        });
        //console.log("managers::::", managers)
        L2Manager = managers.L2ManagerId;
        L3Manager = managers.L3ManagerId;
        L4Manager = managers.L4ManagerId;
        L5Manager = managers.L5ManagerId;
        hr = managers.hrId;
        let L2ManagerFlag;
        let L3ManagerFlag;
        let L4ManagerFlag;
        let L5ManagerFlag;
        L2ManagerFlag = await L2Appraisal.findAll({
          where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true
        })
        L3ManagerFlag = await L2Appraisal.findAll({
          where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true
        })
        L4ManagerFlag = await L3Appraisal.findAll({
          where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true
        })
        L5ManagerFlag = await Manager.findAll({
          where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true
        })
        console.log("L2manager::::::", L2ManagerFlag.length);
        console.log("L3manager::::::", L3ManagerFlag.length);
        console.log("L4manager::::::", L4ManagerFlag.length);
        console.log("L5manager::::::", L5ManagerFlag.length);
        //console.log("hrId::::::", hr);
        let topManager;

        if (L5Manager !== null) {
          topManager = L5Manager;
        } else if (L4Manager !== null) {
          topManager = L4Manager;
        } else if (L3Manager !== null) {
          topManager = L3Manager;
        } else if (L2Manager !== null) {
          topManager = L2Manager;
        } else {
          topManager = null;
        }
        empAppraisal.update(
          { assignedL2Manager: L2Manager, assignedL3Manager: L3Manager, assignedL4Manager: L4Manager, assignedL5Manager: L5Manager, hrId: hr },
          { where: { employeeId: req.body.employeeId, organisationId: req.body.organisationId } }
        ).then((data) => {
          //console.log("Entries created in empAppraisal");
        })

        if (L2ManagerFlag.length == 0) {
          // Send email to L2Manager
          Employees.findOne({
            attributes: ['officialEmail'],
            where: { employeeId: L2Manager, organisationId: req.body.organisationId },
            raw: true
          }).then((l2ManagerDetails) => {
            if (l2ManagerDetails) {
              const l2ManagerEmail = l2ManagerDetails.officialEmail;
              const htmlFilePath = path.join('Mails/mangAppMail.ejs');
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              let mailOptions = {
                from: 'support@timesofpeople.com',
                to: l2ManagerEmail,
                subject: 'You Have Been Assigned as an Evaluator',
                text: `Dear Manager,\n\nYou have been assigned as an evaluator for an employee. Please review the employee's evaluation.\n\nRegards,\Mckinsol Consulting Inc.`,
                html: htmlContent,
              };
              //console.log(l2ManagerEmail);
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  //console.log(error);
                } else {
                  //console.log('Email sent to ' + l2ManagerEmail);
                }
              });
            }
          }).catch((err) => {
            console.log("Error finding L2 Manager details: ", err);
          });
          //Creating a row in L2Appraisal Table ///////////
          await L2Appraisal.create({ appraisalId: req.body.appraisalId, L2ManagerId: L2Manager }).then((data) => {
            //console.log("Enteries created successfully in L2Appraisal Table")
          }).catch((err) => {
            console.log(err);
          });
        }

        if (L3ManagerFlag.length == 0) {
          // Send email to L3Manager
          Employees.findOne({
            attributes: ['officialEmail'],
            where: { employeeId: L3Manager, organisationId: req.body.organisationId },
            raw: true
          }).then((l3ManagerDetails) => {
            if (l3ManagerDetails) {
              const l3ManagerEmail = l3ManagerDetails.officialEmail;
              const htmlFilePath = path.join('Mails/mangAppMail.ejs');
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              let mailOptions = {
                from: 'support@timesofpeople.com',
                to: l3ManagerEmail,
                subject: 'You Have Been Assigned as an Evaluator',
                text: `Dear Manager,\n\nYou have been assigned as an evaluator for an employee. Please review the employee's evaluation.\n\nRegards,\Mckinsol Consulting Inc.`,
                html: htmlContent,
              };
              //console.log(l3ManagerEmail);
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent to ' + l3ManagerEmail);
                }
              });
            }
          }).catch((err) => {
            console.log("Error finding L3 Manager details: ", err);
          });
          //Creating a row in L3Appraisal Table////////
          if (!(isNull(L3Manager)) && !(L3Manager === topManager)) {
            await L3Appraisal.create({ appraisalId: req.body.appraisalId, L3ManagerId: L3Manager }).then((data) => {
              console.log("Enteries created successfully in L3Appraisal Table")
            }).catch((err) => {
              console.log(err);
            });
          }
        }

        if (L4ManagerFlag.length == 0) {
          // Send email to L4Manager
          Employees.findOne({
            attributes: ['officialEmail'],
            where: { employeeId: L4Manager, organisationId: req.body.organisationId },
            raw: true
          }).then((l4ManagerDetails) => {
            if (l4ManagerDetails) {
              const l4ManagerEmail = l4ManagerDetails.officialEmail;
              const htmlFilePath = path.join('Mails/mangAppMail.ejs');
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              let mailOptions = {
                from: 'support@timesofpeople.com',
                to: l4ManagerEmail,
                subject: 'You Have Been Assigned as an Evaluator',
                text: `Dear Manager,\n\nYou have been assigned as an evaluator for an employee. Please review the employee's evaluation.\n\nRegards,\Mckinsol Consulting Inc.`,
                html: htmlContent,
              };
              //console.log(l4ManagerEmail);
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent to ' + l4ManagerEmail);
                }
              });
            }
          }).catch((err) => {
            console.log("Error finding L4 Manager details: ", err);
          });
          ////Creating a row in L4Appraisal Table///////////
          if (!(isNull(L4Manager)) && !(L4Manager === topManager)) {
            await L4Appraisal.create({ appraisalId: req.body.appraisalId, L4ManagerId: L4Manager }).then((data) => { //console.log("Entries created successfully in L4Appraisal Table") }).catch((err) => {
              //console.log(err);
            });
          }
        }
        if (L5ManagerFlag.length == 0) {
          // Send email to L5Manager
          Employees.findOne({
            attributes: ['officialEmail'],
            where: { employeeId: L5Manager, organisationId: req.body.organisationId },
            raw: true
          }).then((l5ManagerDetails) => {
            if (l5ManagerDetails) {
              const l5ManagerEmail = l5ManagerDetails.officialEmail;
              const htmlFilePath = path.join('Mails/mangAppMail.ejs');
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              let mailOptions = {
                from: 'support@timesofpeople.com',
                to: l5ManagerEmail,
                subject: 'You Have Been Assigned as an Evaluator',
                text: `Dear Manager,\n\nYou have been assigned as an evaluator for an employee. Please review the employee's evaluation.\n\nRegards,\Mckinsol Consulting Inc.`,
                html: htmlContent,
              };
              //console.log(l5ManagerEmail);
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent to ' + l5ManagerEmail);
                }
              });
            }
          }).catch((err) => {
            console.log("Error finding L5 Manager details: ", err);
          });
          ////Creating a row in Manager Table///////////
          await Manager.create({ appraisalId: req.body.appraisalId }).then((data) => { //console.log("Enteries created successfully in Manager Table") }).catch((err) => {
            //console.log(err);
          });
        }

        const updateData = {
          communicationSkill: req.body.communicationSkill,
          communicationSkillRemarks: req.body.communicationSkillRemarks,
          interpersonalSkill: req.body.interpersonalSkill,
          interpersonalSkillRemarks: req.body.interpersonalSkillRemarks,
          abilityToPlanTheWork: req.body.abilityToPlanTheWork,
          abilityToPlanTheWorkRemarks: req.body.abilityToPlanTheWorkRemarks,
          problemSolving: req.body.problemSolving,
          problemSolvingRemarks: req.body.problemSolvingRemarks,
          adaptability: req.body.adaptability,
          adaptabilityRemarks: req.body.adaptabilityRemarks,
          willingnessToShoulderAdditional: req.body.willingnessToShoulderAdditional,
          willingnessToShoulderAdditionalRemarks: req.body.willingnessToShoulderAdditionalRemarks,
          commitmentToDoAPerfectJob: req.body.commitmentToDoAPerfectJob,
          commitmentToDoAPerfectJobRemarks: req.body.commitmentToDoAPerfectJobRemarks,
          habitsAndManners: req.body.habitsAndManners,
          habitsAndMannersRemarks: req.body.habitsAndMannersRemarks,
          presentation: req.body.presentation,
          presentationRemarks: req.body.presentationRemarks,
          punctuality: req.body.punctuality,
          punctualityRemarks: req.body.punctualityRemarks,
          confidentialityOfInfo: req.body.confidentialityOfInfo,
          confidentialityOfInfoRemarks: req.body.commitmentToDoAPerfectJobRemarks,
          trustworthiness: req.body.trustworthiness,
          trustworthinessRemarks: req.body.trustworthinessRemarks,
          teamSpirit: req.body.teamSpirit,
          teamSpiritRemarks: req.body.teamSpiritRemarks,
          relationshipWithColleagues: req.body.relationshipWithColleagues,
          relationshipWithColleaguesRemarks: req.body.relationshipWithColleaguesRemarks,
          decisionMaking: req.body.decisionMaking,
          decisionMakingRemarks: req.body.decisionMakingRemarks,
          computerskills: req.body.computerskills,
          computerskillsRemarks: req.body.computerskillsRemarks
          // Add more fields as needed further for more traits.
        };

        const updateCondition = {
          appraisalId: req.body.appraisalId, organisationId: req.body.organisationId
        };
        empAppraisal.update(updateData, {
          where: updateCondition,
        })
          .then((data) => {
            //console.log("Updated Successfully");

          })
          .catch(error => {
            console.error('Error updating records:', error);

          });

        const sum = parseInt(req.body.communicationSkill) +
          parseInt(req.body.interpersonalSkill) +
          parseInt(req.body.abilityToPlanTheWork) +
          parseInt(req.body.problemSolving) +
          parseInt(req.body.adaptability) +
          parseInt(req.body.willingnessToShoulderAdditional) +
          parseInt(req.body.commitmentToDoAPerfectJob) +
          parseInt(req.body.habitsAndManners) +
          parseInt(req.body.presentation) +
          parseInt(req.body.punctuality) +
          parseInt(req.body.confidentialityOfInfo) +
          parseInt(req.body.trustworthiness) +
          parseInt(req.body.teamSpirit) +
          parseInt(req.body.relationshipWithColleagues) +
          parseInt(req.body.decisionMaking) +
          parseInt(req.body.computerskills);

        //console.log(sum);

        const percentage = Math.floor(sum / 80 * 100);//the total of all 16 fields is 16*5=80
        console.log("Overall Percentage::::::::", percentage);
        empAppraisal.update({ employeeOverallPercentage: percentage, employeeTotalScore: sum }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
          //console.log("percentage updated successfully");
        }).catch((err) => {
          //console.log(err);
        })
        let overallRating;
        if (1 <= percentage && percentage <= 25) {
          overallRating = "Average";
        } else if (26 <= percentage && percentage <= 50) {
          overallRating = "Good";
        } else if (51 <= percentage && percentage <= 75) {
          overallRating = "Very Good";
        } else if (76 <= percentage && percentage <= 100) {
          overallRating = "Excellent";
        }
        console.log("OverallRating::::::::::", overallRating);
        empAppraisal.update({ employeeOverallRating: overallRating }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
          console.log("rating updated successfully");
        }).catch((err) => {
          //console.log(err);
        })
        if (flag == 1) {   //it means submit button has been pressed.
          empAppraisal.update({ isEditedByEmp: true, status: "Forwarded to the Level-2- Manager" }, { where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId } }).then((data) => {
            //console.log("rating updated successfully");
          }).catch((err) => {
            //console.log(err);
          });
        }
        res.json({ "Message": overallRating }).status(200);
      }
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/initiateAppraisal", async (req, res) => {
    try {
      //console.log("req.body::::", req.body);
      const entries = req.body.entries;
      const hrId = req.body.employeeId;
      //console.log("hrId::::", hrId);
      const date = new Date();
      const year = date.getFullYear();
      for (i = 0; i < entries.length; i++) {
        const managerInfo = await empMang.findAll({ where: { employeeId: entries[i].employeeId, organisationId: req.body.organisationId }, raw: true });
        const empInfo = await Employees.findOne({ where: { employeeId: entries[i].employeeId, organisationId: req.body.organisationId }, raw: true, attributes: ['departmentId', 'designation', 'firstName', 'lastName'] });
        const amountInfo = await hrAmount.findAll({ where: { departmentId: empInfo.departmentId, designation: empInfo.designation, year: year, organisationId: req.body.organisationId }, raw: true });
        //console.log(managerInfo);
        //console.log(empInfo);
        //console.log(amountInfo);

        if (managerInfo.length == 0) {
          //console.log(`Worflow setup is missing for ${empInfo.firstName} ${empInfo.lastName}`)
          res.status(400).json({ "message": `Workflow is missing for ${empInfo.firstName} ${empInfo.lastName}` });
          return
        }
        if (amountInfo.length == 0) {
          //console.log(`Approved Amount per slab setup is missing for ${empInfo.firstName} ${empInfo.lastName}`)
          res.status(400).json({ "message": `Approved amount per slab setup is missing for the designation ${empInfo.designation} for the year ${year}` });
          return
        }

      }
      for (let i = 0; i < entries.length; i++) {
        const randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
        //console.log("Random appraisalId for index value", i, "::::", randomSixDigitNumber);
        await empAppraisal.create({ appraisalId: randomSixDigitNumber, employeeId: entries[i].employeeId, createdAt: date, status: "Initiated", hrId: hrId });
        const employee = await Employees.findOne({
          where: {
            employeeId: entries[i].employeeId, organisationId: req.body.organisationId
          },
          attributes: ['officialEmail']
        });
        if (employee && employee.officialEmail) {
          // Setup email data
          const htmlFilePath = path.join('Mails/empAppMail.ejs');
          const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
          const mailOptions = {
            from: 'support@timesofpeople.com',
            to: employee.officialEmail,
            subject: 'Appraisal Initiated Appraisal ID : ' + res.appraisalId,
            text: 'Your appraisal has been initiated',
            html: htmlContent,
          };          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              //console.log('Error sending email:', error);
            } else {
              //console.log('Email sent to ::::', employee.officialEmail);
              //console.log('Email sent:', info.response);
            }
          });
        } else {
          //console.log('Employee email not found or invalid');
        }
      }
      res.status(200).json({ "message": "Entries Created" });
    } catch (err) {
      //console.log(err);
      res.status(400).json({ "message": err });
    }
  });


  // apiRoutes.post("/hrMainScreen", async (req, res) => {//for hr main screen in progress tab 
  //   try {
  //     const rawQuery = 'SELECT E.employeeId,CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,E.designation,D.name AS department,A.appraisalId,A.createdAt,A.status FROM (hrportal.Employees AS E INNER JOIN hrportal.EmpAppraisals AS A ON E.employeeId = A.employeeId )INNER JOIN hrportal.Departments AS D ON E.departmentId = D.id';

  //     sequelize.query(rawQuery, {
  //       type: Sequelize.QueryTypes.SELECT,
  //     }).then((data) => {
  //       //console.log(data);
  //       res.json({ "data": data }).status(200);
  //     }).catch((err) => {
  //       //console.log(err);
  //       // res.send(err).status(400);
  //     })
  //   }
  //   catch (err) {
  //     res.status(400).json({ "message": err });
  //   }
  // });

  // apiRoutes.post("/completedAppraisals", async (req, res) => {// for hr main screen in completed tab
  //   const id = req.body.id;
  //   const rawQuery = `SELECT E.employeeId,E.firstname,E.lastName,E.designation,D.name AS departmentName,A.appraisalId,A.createdAt,A.status FROM ((hrportal.Employees AS E INNER JOIN hrportal.appraisals AS A ON E.employeeId = A.employeeId )INNER JOIN hrportal.Departments AS D ON E.departmentId = D.id) WHERE A.status="Completed" AND E.employeeId=${id} `;

  //   sequelize.query(rawQuery, {
  //     type: Sequelize.QueryTypes.SELECT,
  //   }).then((data) => {
  //     //console.log(data);
  //     res.send(data).status(200);
  //   }).catch((err) => {
  //     //console.log(err);
  //     res.send(err).status(400);
  //   })
  // });

  // apiRoutes.post("/employeeList", async (req, res) => {// to show the list of all eligible Employees
  //   // //console.log(req.body);
  //   const depInfo = await department.findOne({ where: { name: `${req.body.name}` }, raw: true });
  //   // //console.log(depInfo);
  //   const depId = depInfo.id;
  //   // //console.log(depId);
  //   const employeeInfo = await Employees.findAll({
  //     where: { departmentId: `${depId}` }, raw: true,
  //     attributes: ['employeeId', 'firstName', 'lastname', 'designation' /* add more fields as needed */]
  //   });
  //   // //console.log("employee Information:",employeeInfo);
  //   // const appraisalInfo = await appraisal.findAll({where:{employeeId:294},raw:true,attributes:['appraisalId','employeeId']});
  //   // //console.log("appraisalInfo",appraisalInfo);
  //   for (let i = 0; i < employeeInfo.length; i++) {
  //     const appraisalInfo = await appraisal.findAll({ where: { employeeId: employeeInfo[i].employeeId }, raw: true, attributes: ['appraisalId', 'employeeId', 'createdAt'] });
  //     // //console.log(appraisalInfo);
  //     if (appraisalInfo.length == 0) {
  //       employeeInfo[i]["flag"] = 0;//here it means no appraisal has been found for this particular employee
  //     }
  //     else {
  //       let dateArray = [];
  //       for (let j = 0; j < appraisalInfo.length; j++) {
  //         dateArray.push(appraisalInfo[j]["createdAt"]);
  //       }
  //       // //console.log(dateArray);
  //       let latestDate = max(dateArray);
  //       let todayDate = new Date;
  //       // //console.log(latestDate,todayDate);
  //       const monthDifference = differenceInMonths(todayDate, latestDate);
  //       // //console.log(monthDifference);
  //       if (monthDifference < 12) {
  //         employeeInfo[i]["flag"] = 1;
  //       }
  //       else {
  //         employeeInfo[i]["flag"] = 0;//Here it means that the last appraisal of this employee happend before 12 months
  //       }


  //     }


  //   }

  //   res.send(employeeInfo).status(200);
  // });

  // apiRoutes.post("/empList", async (req, res) => {// ''''''New One''''''to show the list of all Employees with updated table for a department
  //   try {


  //     //console.log(req.body);
  //     let depId = req.body.departmentId;
  //     if (depId != null) {
  //       let employeeInfo;
  //       await Employees.findAll({
  //         where: { departmentId: `${depId}` }, raw: true,
  //         attributes: ['employeeId', [sequelize.literal('CONCAT(firstname, " ", lastName)'), 'employeeName'], 'designation',  /* add more fields as needed */]
  //       }).then((data) => {
  //         employeeInfo = data;
  //       }).catch((err) => {
  //         //console.log(err);
  //         // res.send(err).status(400)
  //       });
  //       //console.log("employee Information::::::", employeeInfo);
  //       // const appraisalInfo = await appraisal.findAll({where:{employeeId:294},raw:true,attributes:['appraisalId','employeeId']});
  //       // //console.log("appraisalInfo",appraisalInfo);
  //       for (let i = 0; i < employeeInfo.length; i++) {
  //         const appraisalInfo = await empAppraisal.findAll({ where: { employeeId: employeeInfo[i].employeeId }, raw: true, attributes: ['appraisalId', 'employeeId', 'createdAt'] });
  //         // //console.log(appraisalInfo);

  //         if (appraisalInfo.length == 0) {//here it means no appraisal has been found for this particular employee
  //           let lastDate = new Date('2023-01-01');
  //           let dueDate = new Date('2024-01-01');
  //           employeeInfo[i]["flag"] = 0;
  //           employeeInfo[i]["lastAppraisalDate"] = lastDate;
  //           employeeInfo[i]["dueDate"] = dueDate;
  //         }
  //         else {
  //           let dateArray = [];
  //           for (let j = 0; j < appraisalInfo.length; j++) {
  //             dateArray.push(appraisalInfo[j]["createdAt"]);
  //           }
  //           // //console.log(dateArray);
  //           let latestDate = max(dateArray);
  //           let lastAppraisalDate = latestDate;
  //           // //console.log("lastAppraisaldate:::::",lastAppraisalDate);
  //           let dueDate = new Date(lastAppraisalDate);
  //           dueDate.setDate(dueDate.getDate() + 365);
  //           // //console.log("dueDate:::::::",dueDate);
  //           let todayDate = new Date;
  //           // //console.log(latestDate,todayDate);
  //           const monthDifference = differenceInMonths(todayDate, latestDate);
  //           // //console.log(monthDifference);
  //           if (monthDifference < 12) {
  //             employeeInfo[i]["flag"] = 1;
  //             employeeInfo[i]["lastAppraisalDate"] = lastAppraisalDate;
  //             employeeInfo[i]["dueDate"] = dueDate;

  //           }
  //           else {
  //             employeeInfo[i]["flag"] = 0;//Here it means that the last appraisal of this employee happend before 12 months and the employee is eligible for the appraisal
  //             employeeInfo[i]["lastAppraisalDate"] = lastAppraisalDate;
  //             employeeInfo[i]["dueDate"] = dueDate;
  //           }


  //         }


  //       }

  //       res.json({ "data": employeeInfo }).status(200);
  //     }
  //     else{

  //     }
  //     // else{
  //     //   res.send("Payload is not correct");
  //     // }
  //   }
  //   catch (err) {
  //     res.status(400).json({ "message": err });
  //   }
  // });

  apiRoutes.post("/empList", async (req, res) => {
    try {
      //console.log(req.body);
      let depId = req.body.departmentId;
      let employeeInfo;

      if (depId != null) {
        employeeInfo = await Employees.findAll({
          where: { departmentId: depId, isActive: 1, organisationId: req.body.organisationId },
          raw: true,
          attributes: ['employeeId', [sequelize.literal('CONCAT(firstname, " ", lastName)'), 'employeeName'], 'designation']
        });
      } else {
        employeeInfo = await Employees.findAll({
          where: { isActive: 1, organisationId: req.body.organisationId },
          raw: true,
          attributes: ['employeeId', [sequelize.literal('CONCAT(firstname, " ", lastName)'), 'employeeName'], 'designation']
        });
      }

      // //console.log("employee Information::::::", employeeInfo);

      for (let i = 0; i < employeeInfo.length; i++) {
        const appraisalInfo = await empAppraisal.findAll({
          where: { employeeId: employeeInfo[i].employeeId, organisationId: req.body.organisationId },
          raw: true,
          attributes: ['appraisalId', 'employeeId', 'createdAt']
        });

        if (appraisalInfo.length == 0) {
          let lastDate = new Date('2023-01-01');
          let dueDate = new Date('2024-01-01');
          employeeInfo[i]["flag"] = 0;
          employeeInfo[i]["lastAppraisalDate"] = lastDate;
          employeeInfo[i]["dueDate"] = dueDate;
        } else {
          let dateArray = appraisalInfo.map(info => info.createdAt);
          let latestDate = max(dateArray);
          let lastAppraisalDate = latestDate;
          let dueDate = new Date(lastAppraisalDate);
          dueDate.setDate(dueDate.getDate() + 365);
          let todayDate = new Date;
          const monthDifference = differenceInMonths(todayDate, latestDate);

          if (monthDifference < 12) {
            employeeInfo[i]["flag"] = 1;
            employeeInfo[i]["lastAppraisalDate"] = lastAppraisalDate;
            employeeInfo[i]["dueDate"] = dueDate;
          } else {
            employeeInfo[i]["flag"] = 0;
            employeeInfo[i]["lastAppraisalDate"] = lastAppraisalDate;
            employeeInfo[i]["dueDate"] = dueDate;
          }
        }
      }

      res.json({ "data": employeeInfo }).status(200);
    } catch (err) {
      //console.log(err);
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/Departments", async (req, res) => {// to show all the Departments
    try {


      // //console.log("hit............");
      let depInfo = await department.findAll({ raw: true });
      //console.log(depInfo);
      res.json({ "data": depInfo }).status(200);
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post("/lastAppraisalOfEmpInfoByManager", async (req, res) => {
    try {
      let lastAppraisalInfo = [];


      const empId = req.body.empId;//Employee id whose information we want to fetch for last appraisal.
      const info = await empAppraisal.findAll({ where: { employeeId: empId, status: "Completed", organisationId: req.body.organisationId }, raw: true, attributes: ['appraisalId', 'employeeId', 'createdAt'] });
      //console.log(info);
      const dates = [];
      for (let i = 0; i < info.length; i++) {
        dates.push(info[i].createdAt)

      }
      //console.log("Dates Array::::::", dates);

      const latestDate = max(dates);
      //console.log("latest date:::::::::", latestDate);

      const lastAppraisalInfoByEmp = await empAppraisal.findAll({ where: { employeeId: empId, createdAt: latestDate, organisationId: req.body.organisationId }, raw: true });
      //console.log("Latest Appraisal Details:::::::::", lastAppraisalInfoByEmp);
      lastAppraisalInfo["employeeForm"] = lastAppraisalInfoByEmp;

      const assignedManager = await empMang.findOne({ where: { employeeId: empId, organisationId: req.body.organisationId }, raw: true });

      //console.log("Managers::::", assignedManager);

      const L2Manager = assignedManager.L2ManagerId;
      //console.log("L2Manager:::", L2Manager)
      const L3Manager = assignedManager.L3ManagerId;
      //console.log("L3Manager:::", L3Manager)
      const L4Manager = assignedManager.L4ManagerId;
      //console.log("L4Manager:::", L4Manager)
      const L5Manager = assignedManager.L5ManagerId;
      //console.log("L5Manager:::", L5Manager)
      //console.log("appraisalID::::::", lastAppraisalInfoByEmp[0].appraisalId);

      await L2Appraisal.findOne({ where: { appraisalId: lastAppraisalInfoByEmp[0].appraisalId, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        lastAppraisalInfo["L2Form"] = data;
      }).catch((err) => {
        //console.log(err);
        // res.send(err);
      })

      await L3Appraisal.findOne({ where: { appraisalId: lastAppraisalInfoByEmp.appraisalId, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        lastAppraisalInfo["L3Form"] = data;
      }).catch((err) => {
        //console.log(err);
        // res.send(err);
      })

      await L4Appraisal.findOne({ where: { appraisalId: lastAppraisalInfoByEmp.appraisalId, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        lastAppraisalInfo["L4Form"] = data;
      }).catch((err) => {
        //console.log(err);
        // res.send(err);
      })

      await Manager.findOne({ where: { appraisalId: lastAppraisalInfoByEmp.appraisalId, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        lastAppraisalInfo["lastLevel"] = data;
      }).catch((err) => {
        //console.log(err);
        // res.send(err);
      })


      //console.log("details filled by manager:::::::", lastAppraisalInfo);

      // const result = [lastAppraisalInfoByEmp[0], lastAppraisalInfoByMan];
      //console.log("result:::::::::::", lastAppraisalInfo);


      res.json(lastAppraisalInfo);//It is used to send last form filled at level1 and (level 2 or 3 or 4 or 5)
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }

  });

  apiRoutes.post("/empOverallRating", async (req, res) => {
    try {


      const id = req.body.employeeId;
      await empAppraisal.findOne({ where: { employeeId: id, status: "In Progress", organisationId: req.body.organisationId }, raw: true, attributes: ['employeeOverallRating'] }).then((data) => {
        //console.log(data);
        res.json({ "data": data.employeeOverallRating }).status(200);
      }).catch((err) => {
        //console.log(err);
        res.status(400).json({ "message": err });
      });
    }
    catch (err) {
      res.status(400).json(err);
    }
  });

  apiRoutes.post("/OldappraisalListL2L3L4L5", async (req, res) => {//For manager main screen to show appraisals alloted to him/her

    try {
      const id = req.body.employeeId;//manager's id fetched from req.body
      // Fetch all appraisal records for the specified assignedL2Manager or assignedL3Manager or assignedL4Manager or or assignedL5Manager
      //console.log("id:::::", id)
      const rawQuery = `SELECT CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,designation,A.appraisalId,A.createdAt,A.status,A.employeeId,D.name AS department FROM (Employees AS E INNER JOIN EmpAppraisals AS A ON E.employeeId = A.employeeId)INNER JOIN Departments AS D ON D.id = E.departmentId  WHERE A.assignedL2Manager = ${id} OR A.assignedL3Manager = ${id} OR A.assignedL4Manager = ${id} OR A.assignedL5Manager = ${id} AND E.organisationId= ${req.body.organisationId} `;

      sequelize.query(rawQuery, {
        type: Sequelize.QueryTypes.SELECT,
      }).then((data) => {
        //console.log(data);
        res.json({ "data": data }).status(200);
      }).catch((err) => {
        //console.log(err);
        // res.send(err).status(400);
      })

    } catch (error) {
      console.error("Error fetching appraisal list:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  apiRoutes.post("/appraisalListL2L3L4L5", async (req, res) => {
    try {
      const id = req.body.employeeId; // manager's id fetched from req.body
      //console.log("id:::::", id);
      //console.log("Body:::::", req.body);
      const rawQuery = `
        SELECT
          CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,
          E.designation,
          A.appraisalId,
          A.createdAt,
          A.status,
          A.employeeId,
          D.name AS department,
          CASE
            WHEN M.TopManager = ${id} THEN 1
            ELSE 0
          END AS isTopManager
        FROM
          Employees AS E
          INNER JOIN EmpAppraisals AS A ON E.employeeId = A.employeeId
          INNER JOIN Departments AS D ON D.id = E.departmentId
          LEFT JOIN (
            SELECT
              employeeId,
              COALESCE(L5ManagerId, L4ManagerId, L3ManagerId, L2ManagerId) AS TopManager
            FROM
              EmpMangs
          ) AS M ON A.employeeId = M.employeeId
        WHERE
          A.assignedL2Manager = ${id} OR
          A.assignedL3Manager = ${id} OR
          A.assignedL4Manager = ${id} OR
          A.assignedL5Manager = ${id} AND
          E.organisationId = ${req.body.organisationId}`;

      sequelize.query(rawQuery, {
        type: Sequelize.QueryTypes.SELECT,
      }).then((data) => {
        //console.log(data);
        res.json({ "data": data }).status(200);
      }).catch((err) => {
        //console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
      });
    } catch (error) {
      console.error("Error fetching appraisal list:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  apiRoutes.post("/appraisalListHr", async (req, res) => {//For manager main screen to show appraisals alloted to him/her
    try {
      const id = req.body.employeeId;//manager's id fetched from req.body
      // Fetch all appraisal records for the specified assignedL2Manager or assignedL3Manager or assignedL4Manager or or assignedL5Manager
      const depId = req.body.departmentId;
      //console.log("id:::::", id)
      //console.log("departmentid:::::", depId)
      if (depId != null) {
        const rawQuery = `SELECT CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,E.designation,A.appraisalId,A.createdAt,A.status,A.employeeId,D.name AS department FROM ((Employees AS E INNER JOIN emp AS A ON E.employeeId = A.employeeId)INNER JOIN Departments AS D ON D.id = E.departmentId)INNER JOIN EmpMangs AS M ON A.employeeId = M.employeeId  WHERE M.hrID = ${id} AND D.id = ${depId} AND E.organisationId = ${req.body.organisationId}`;
        sequelize.query(rawQuery, {
          type: Sequelize.QueryTypes.SELECT,
        }).then((data) => {
          //console.log(data);
          res.json({ "data": data }).status(200);
        }).catch((err) => {
          //console.log(err);
          // res.send(err).status(400);
        })
      }
      else {
        const rawQuery = `SELECT CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,E.designation,A.appraisalId,A.createdAt,A.status,A.employeeId,D.name AS department FROM ((Employees AS E INNER JOIN EmpAppraisals AS A ON E.employeeId = A.employeeId)INNER JOIN Departments AS D ON D.id = E.departmentId)INNER JOIN EmpMangs AS M ON A.employeeId = M.employeeId  WHERE M.hrID = ${id} AND E.organisationId = ${req.body.organisationId}`;
        sequelize.query(rawQuery, {
          type: Sequelize.QueryTypes.SELECT,
        }).then((data) => {
          //console.log(data);
          res.json({ "data": data }).status(200);
        }).catch((err) => {
          //console.log(err);
          // res.send(err).status(400);
        })
      }
    } catch (error) {
      console.error("Error fetching appraisal list:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  apiRoutes.post('/anEmpBasicDetails', async (req, res) => {
    try {

      const id = req.body.employeeId;
      const rawQuery = `SELECT CONCAT(E.firstname, CONCAT(" ",E.lastName)) AS name,E.employeeId,E.designation,E.officialEmail,D.name AS Department FROM Employees AS E INNER JOIN Departments AS D ON E.departmentId = D.id WHERE E.employeeId = ${id} AND E.organisationId=${req.body.organisationId}`;

      sequelize.query(rawQuery, {
        type: Sequelize.QueryTypes.SELECT,
      }).then((data) => {
        console.log(data);
        res.json({ "data": data }).status(200)
      }).catch((err) => {
        //console.log(err);
        // res.json({"message":err}).status(400);
      });
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }

  });

  apiRoutes.post('/allDetailsOfAnAppraisal', async (req, res) => { //For HR to know progress of an appraisal
    try {
      console.log(req.body);
      const managerId = req.body.employeeId;//It can have manager id or hr id
      const id = req.body.appraisalId;
      let result = [];
      let empDetails;
      let l2Details;
      let l3Details;
      let l4Details;
      let l5Details;
      let employeeId;
      let amount = {};
      await empAppraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          employeeId = data.employeeId;
        }
      }).catch((err) => {
        //console.log(err);
      });
      //console.log("employeeId:::::", employeeId);
      let details;
      await empMang.findOne({ where: { employeeId: employeeId, organisationId: req.body.organisationId }, raw: true, attributes: ['employeeId', 'L2ManagerId', 'L3ManagerId', 'L4ManagerId', 'L5ManagerId', 'hrId'] }).then((data) => {
        //console.log("data::::::", data)
        details = data;
        // res.send(data).status(200)
        //console.log(data);
      }).catch((err) => {
        //console.log(err);

      });

      //console.log("details::::", details);
      await empAppraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          delete (data.status);
          empDetails = data;
        }
        else {
          empDetails = null
        }
      }).catch((err) => {
        //console.log(err);
      });
      await L2Appraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l2Details = data;
        }
        else {
          l2Details = null;
        }
      }).catch((err) => {
        //console.log(err);
      })
      await L3Appraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l3Details = data;
        }
        else {
          l3Details = null;
        }
      })

      await L4Appraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l4Details = data;
        }
        else {
          l4Details = null;
        }
      })
      await Manager.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l5Details = data;
        }
        else {
          l5Details = null;
        }
      })

      const info = await empAppraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true, attributes: ['status'] });
      //console.log("status::::", info.status);
      if (info.status == "Sent to HR" || info.status == "Completed") {
        //console.log(req.body.appraisalId);
        const aDetails = await Manager.findOne({ where: { appraisalId: req.body.appraisalId, organisationId: req.body.organisationId }, raw: true });
        const date = new Date;
        //console.log("date::::::::", date);
        const cYear = date.getFullYear();
        //console.log("Current Year::::", cYear);
        const rawQuery = `SELECT ExcellentAmount,VgoodAmount,GoodAmount,AverageAmount FROM (Employees AS E INNER JOIN EmpAppraisals AS A ON E.employeeId = A.employeeId)INNER JOIN HrAppraisalRatingAmounts AS H ON E.departmentId = H.departmentId WHERE A.appraisalId=${id} AND E.designation = H.designation AND H.year=${cYear} AND E.organisationId = ${req.body.organisationId}`;
        const OverallRating = aDetails.managersOverallRating;
        //console.log(OverallRating);

        await sequelize.query(rawQuery, {
          type: Sequelize.QueryTypes.SELECT,
        }).then((data) => {
          //console.log("Querydata::::::::::", data);
          if (OverallRating == "Excellent") {
            amount["amount"] = data[0].ExcellentAmount
          } else if (OverallRating == "Very Good") {
            amount["amount"] = data[0].VgoodAmount
          } else if (OverallRating == "Good") {
            amount["amount"] = data[0].GoodAmount
          } else if (OverallRating == "Average") {
            amount["amount"] = data[0].AverageAmount
          };
        }).catch((err) => {
          //console.log(err);
          // res.send(err).status(400);
        })
      }
      else {
        amount["amount"] = null;
      };
      //console.log("amount::::::::::::::", amount);





      let topManager;
      if (details.L5ManagerId != null) {
        topManager = details.L5ManagerId;
      } else if (details.L4ManagerId != null) {
        topManager = details.L4ManagerId;
      } else if (details.L3ManagerId != null) {
        topManager = details.L3ManagerId;
      } else if (details.L2ManagerId != null) {
        topManager = details.L2ManagerId;
      } else {
        // It means that all managers are null
        topManager = null;
      }
      //console.log("topmanager:::", topManager);
      if (managerId == details.L2ManagerId) {
        if (managerId == topManager) {
          let L2Details = { ...empDetails, ...l2Details, ...l5Details }

          result.push(L2Details);
        }
        else {
          let L2Details = { ...empDetails, ...l2Details }
          result.push(L2Details)
        }
      }
      if (managerId == details.L3ManagerId) {
        if (managerId == topManager) {
          let L3Details = { ...empDetails, ...l2Details, ...l5Details }

          result.push(L3Details);
        }
        else {
          let L3Details = { ...empDetails, ...l2Details, ...l3Details }
          result.push(L3Details)
        }
      }
      if (managerId == details.L4ManagerId) {
        if (managerId == topManager) {
          let L4Details = { ...empDetails, ...l2Details, ...l3Details, ...l4Details, ...l5Details }

          result.push(L4Details)
          //console.log("L4Details :::::::::::::", l4Details)
        }
        else {
          let L4Details = { ...empDetails, ...l2Details, ...l3Details, ...l4Details }
          result.push(L4Details)
        }
        //console.log("L4Details :::::::::::::", l4Details)
      }

      if (managerId == details.L5ManagerId) {
        let L5Details = { ...empDetails, ...l2Details, ...l3Details, ...l4Details, ...l5Details }

        result.push(L5Details)
      }
      if (managerId == details.hrId) {
        let hrDetails = { ...empDetails, ...l2Details, ...l3Details, ...l4Details, ...l5Details, ...amount }

        result.push(hrDetails)
      }
      // if(managerId == top)
      // result.push(empDetails, l2Details, l3Details, l4Details, l5Details)
      res.json({ "data": result }).status(200);
    }
    catch (e) {
      //console.log(e);
      res.status(400).json({ "message": e });
    }
  });

  apiRoutes.post('/NewallDetailsOfAnAppraisal', async (req, res) => {
    try {
      //console.log(req.body);
      const managerId = req.body.employeeId; // It can have manager id or hr id
      const id = req.body.appraisalId;
      let result = [];
      let empDetails;
      let l2Details;
      let l3Details;
      let l4Details;
      let l5Details;
      let employeeId;

      // Fetching employeeId based on appraisalId
      await empAppraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          employeeId = data.employeeId;
        }
      }).catch((err) => {
        //console.log(err);
      });

      let details;
      // Fetching manager details
      await empMang.findOne({ where: { employeeId: employeeId, organisationId: req.body.organisationId }, raw: true, attributes: ['employeeId', 'L2ManagerId', 'L3ManagerId', 'L4ManagerId', 'L5ManagerId', 'hrId'] }).then((data) => {
        //console.log("data::::::", data)
        details = data;
      }).catch((err) => {
        //console.log(err);
      });

      // Fetching details for various levels of appraisal
      await empAppraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          empDetails = data;
        } else {
          empDetails = null
        }
      }).catch((err) => {
        //console.log(err);
      });

      await L2Appraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l2Details = data;
        } else {
          l2Details = null;
        }
      }).catch((err) => {
        //console.log(err);
      });

      await L3Appraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l3Details = data;
        } else {
          l3Details = null;
        }
      }).catch((err) => {
        //console.log(err);
      });

      await L4Appraisal.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l4Details = data;
        } else {
          l4Details = null;
        }
      }).catch((err) => {
        //console.log(err);
      });

      await Manager.findOne({ where: { appraisalId: id, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        if (data) {
          l5Details = data;
        } else {
          l5Details = null;
        }
      }).catch((err) => {
        //console.log(err);
      });

      let topManager;
      // Determining topManager based on available managerIds
      if (details.L5ManagerId != null) {
        topManager = details.L5ManagerId;
      } else if (details.L4ManagerId != null) {
        topManager = details.L4ManagerId;
      } else if (details.L3ManagerId != null) {
        topManager = details.L3ManagerId;
      } else if (details.L2ManagerId != null) {
        topManager = details.L2ManagerId;
      } else {
        // It means that all managers are null
        topManager = null;
      }
      //console.log("topmanager:::", topManager);

      // Adding isTopManager flag based on the managerId
      if (managerId == details.L2ManagerId) {
        let L2Details = { ...empDetails, ...l2Details };
        L2Details.isTopManager = (managerId == topManager) ? 1 : 0;
        result.push(L2Details);
      }
      if (managerId == details.L3ManagerId) {
        let L3Details = { ...empDetails, ...l2Details, ...l3Details };
        L3Details.isTopManager = (managerId == topManager) ? 1 : 0;
        result.push(L3Details);
      }
      if (managerId == details.L4ManagerId) {
        let L4Details = { ...empDetails, ...l2Details, ...l3Details, ...l4Details };
        L4Details.isTopManager = (managerId == topManager) ? 1 : 0;
        result.push(L4Details);
      }

      if (managerId == details.L5ManagerId || managerId == details.hrId) {
        let temp = { ...empDetails, ...l2Details, ...l3Details, ...l4Details, ...l5Details };
        let L5Details = { ...temp };
        L5Details.isTopManager = (managerId == topManager) ? 1 : 0;
        result.push(L5Details);
      }

      res.json({ "data": result }).status(200);
    } catch (e) {
      //console.log(e);
      res.status(400).json({ "message": e });
    }
  });

  apiRoutes.post('/oldEmployees', async (req, res) => {//It is used to generate all active employee list
    try {
      Employees.findAll({
        where: { isActive: 1, organisationId: req.body.organisationId }, attributes: ['employeeId',
          [sequelize.literal('CONCAT(firstname, " ", lastName)'), 'Name'], 'designation'
        ], raw: true
      }).then((data) => {
        //console.log(data);
        res.json({ "data": data }).status(200);
      }).catch((err) => {
        //console.log(err);
        // res.send(err).status(400);
      })
    }
    catch (e) {
      res.status(400).json({ "message": e });
    }
  });

  apiRoutes.post('/Employees', async (req, res) => {//It is used to generate all active employee list
    try {
      Employees.findAll({
        where: { isActive: 1, organisationId: req.body.organisationId },
        attributes: ['employeeId', [sequelize.literal('CONCAT_WS(" ", COALESCE(firstname, ""), COALESCE(lastName, ""))'), 'Name'], 'designation'],
        raw: true
      }).then((data) => {
        //console.log(data);
        res.status(200).json({ "data": data });
      }).catch((err) => {
        //console.log(err);
        res.status(400).json({ "message": err });
      });
    }
    catch (e) {
      res.status(400).json({ "message": e });
    }
  });


  apiRoutes.post('/hrList', async (req, res) => {//It is used to generate all employee list

    try {
      Employees.findAll({
        where: { departmentId: 101, organisationId: req.body.organisationId },
        attributes: [
          'employeeId',
          [sequelize.literal('CONCAT(firstname, " ", lastName)'), 'Name'],
        ], raw: true
      }).then((data) => {
        //console.log(data);
        res.json({ "data": data }).status(200);
      }).catch((err) => {
        //console.log(err);
        // res.send(err).status(400);
      })
    }
    catch (e) {
      res.status(400).json({ "message": e });
    }
  });

  apiRoutes.post('/empmangFetch', async (req, res) => {
    try {
      let details;
      let result = [];

      await empMang.findAll({ raw: true, attributes: ['employeeId', 'L2ManagerId', 'L3ManagerId', 'L4ManagerId', 'L5ManagerId', 'hrId'] }).then((data) => {
        //console.log("data::::::", data)
        details = data;
        // res.send(data).status(200)
        //console.log(data);
      }).catch((err) => {
        //console.log(err);
        res.send(err);
      });
      //console.log("details:::::", details);
      for (let i = 0; i < details.length; i++) {
        const inputObject = details[i];

        const employeeIds = Object.values(inputObject);

        await Employees.findAll({
          attributes: ['employeeId', [sequelize.literal('CONCAT(firstname, " ", lastName)'), 'Name']],
          where: {
            employeeId: employeeIds, organisationId: req.body.organisationId
          }, raw: true
        })
          .then((Employees) => {
            //console.log("AttemptNo::::", i, "Employees::::::::", Employees);
            const employeeDetails = Employees.map((employee) => ({
              employeeId: employee.employeeId,
              name: employee.Name,
            }));
            //console.log('Employee Details:', employeeDetails);
            const secondArray = [details[i]];
            //console.log("secondArray:::::::", secondArray);

            const resultArray = secondArray.map((item) => {
              const mappedNames = {};
              Object.keys(item).forEach((key) => {
                if (key.endsWith('Id') && item[key]) {
                  const correspondingEmployee = employeeDetails.find((employee) => employee.employeeId === item[key]);
                  if (correspondingEmployee) {
                    mappedNames[`${key}Name`] = correspondingEmployee.name;
                    mappedNames["employeeId"] = details[i].employeeId;
                    mappedNames["l2ManagerId"] = details[i].L2ManagerId;
                    mappedNames["l3ManagerId"] = details[i].L3ManagerId;
                    mappedNames["l4ManagerId"] = details[i].L4ManagerId;
                    mappedNames["l5ManagerId"] = details[i].L5ManagerId;
                    mappedNames["hrId"] = details[i].hrId;
                  }
                }
              });
              //console.log("mappedNames::::", mappedNames);
              result.push(mappedNames);
            })



          }).catch((error) => {
            console.error('Error fetching employee details:', error);
          });
      }

      //console.log("RESULT:::::", result);
      res.json({ "data": result }).status(200);
    }
    catch (err) {
      res.status(400).json({ "message": err });
    }
  });

  apiRoutes.post('/oldEmpMangstore', async (req, res) => {
    try {
      //console.log("req.body", req.body);
      //console.log("entries[0].employee::::::::", req.body.entries);
      let info;
      let emp = req.body.entries[0].employee;
      let l2 = req.body.entries[0].l2Manager;
      let l3 = req.body.entries[0].l3Manager;
      let l4 = req.body.entries[0].l4Manager;
      let l5 = req.body.entries[0].l5Manager;
      let hr = req.body.entries[0].hr;
      await empMang.findOne({ where: { employeeId: req.body.entries[0].employee, organisationId: req.body.organisationId }, raw: true }).then((data) => {
        //console.log("data::::::::::::", data);

        info = data;

      }).catch((e) => {
        //console.log(e);
      })
      //console.log("Info::::", info);
      if (info != null) {
        res.status(400).json({ "message": "Entries already present for the selected employee" });
      }
      else {
        if (emp == l2 || emp == l3 || emp == l4 || emp == l5 || emp == hr) {
          res.status(400).json({ "message": "Employee and manager cannot be same" });
        }
        else {


          const entries = req.body.entries;
          //console.log("ENTRIES::::", entries)
          for (let i = 0; i < entries.length; i++) {
            await empMang.create({ employeeId: entries[i].employee, L2ManagerId: entries[i].l2Manager, L3ManagerId: entries[i].l3Manager, L4ManagerId: entries[i].l4Manager, L5ManagerId: entries[i].l5Manager, hrId: entries[i].hr }).then((data) => {
              //console.log("Entry created for entries array object:::", i)
              res.json({ "message": "Entries Created" }).status(200);
            }).catch((err) => {
              //console.log(err);
              res.status(400).json({ "message": err });
            })
          }
        }
      }
    }
    catch (e) {
      res.status(400).json({ "message": e });
    }

  });
  //new EmpMangstore is below
  apiRoutes.post('/EmpMangstore', async (req, res) => {
    try {
      //console.log("req.body", req.body);
      const entries = req.body.entries;

      // Function to check for duplicates in an array
      function hasDuplicates(managerIds) {
        const encountered = new Set();

        for (const id of managerIds) {
          if (encountered.has(id)) {
            return 1; // Found a duplicate
          } else {
            encountered.add(id);
          }
        }

        return 0; // No duplicates found
      }

      // Check for duplicate manager IDs
      const entry = entries[0];
      let managerIds = [entry.l2Manager, entry.l3Manager, entry.l4Manager, entry.l5Manager];

      // Remove null values from managerIds array
      managerIds = managerIds.filter(id => id !== null);

      //console.log("managerIds:::", managerIds);
      if (hasDuplicates(managerIds)) {
        res.status(400).json({ "message": "Managers at different levels must not be the same" });
        return;
      }

      // Check if employee is the same as any manager or HR
      if (entry.employee === entry.l2Manager || entry.employee === entry.l3Manager || entry.employee === entry.l4Manager || entry.employee === entry.l5Manager || entry.employee === entry.hr) {
        res.status(400).json({ "message": "Employee and manager cannot be the same" });
        return;
      }

      // Check if entries already exist for the selected employee
      const info = await empMang.findOne({ where: { employeeId: entries[0].employee, organisationId: req.body.organisationId }, raw: true });
      if (info) {
        res.status(400).json({ "message": "Entries already present for the selected employee" });
        return;
      }

      // Create entries in the database
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        await empMang.create({
          employeeId: entry.employee,
          L2ManagerId: entry.l2Manager,
          L3ManagerId: entry.l3Manager,
          L4ManagerId: entry.l4Manager,
          L5ManagerId: entry.l5Manager,
          hrId: entry.hr
        });
      }

      res.status(200).json({ "message": "Entries Created" });
    } catch (e) {
      res.status(400).json({ "message": e.message || "An error occurred" });
    }
  });

  apiRoutes.post('/empmangUpdate', async (req, res) => {

    try {
      // const empId = Employees.findOne({where:})
      const employeeId = req.body.entries[0].employee;
      const latestAppraisal = await empAppraisal.findOne({
        where: { employeeId: employeeId, organisationId: req.body.organisationId },
        order: [['createdAt', 'DESC']],
        raw: true
      });
      //console.log("latestAppraisal:::", latestAppraisal);
      if (Object.keys(latestAppraisal).length !== 0) {
        if (latestAppraisal.status != "Initiated" && latestAppraisal.status != "Completed") {
          res.status(400).json({ "message": "Managers Updation is not allowed if the Appraisal Process is in progress" });
          return

        }
      }

      // latestAppraisal will contain the entry with the latest createdAt date for the given employeeId
      //console.log("employeeId:::", employeeId);
      // const arrayName = name.split(' ');
      // //console.log("name:::", arrayName);
      // const firstName = arrayName[0];
      // const lastName = arrayName[1];
      // //console.log("firstName:::", firstName, "lastName::", lastName);
      // const empId = await Employees.findOne({ where: { employeeId:employeeId}, raw: true, attributes: ['employeeId'] });
      // //console.log(empId);
      const entries = req.body.entries;
      //console.log("Before ENTRIES::::", entries)
      const info = await empMang.findOne({ where: { employeeId: employeeId, organisationId: req.body.organisationId }, raw: true });
      //console.log("info::::", info);
      if (entries[0].l2Manager == null) {
        entries[0].l2Manager = info.L2ManagerId;
      }
      if (entries[0].l3Manager == null) {
        entries[0].l3Manager = info.L3ManagerId;
      }
      if (entries[0].l4Manager == null) {
        entries[0].l4Manager = info.L4ManagerId;
      }
      if (entries[0].l5Manager == null) {
        entries[0].l5Manager = info.L5ManagerId;
      }
      if (entries[0].hr == null) {
        entries[0].hr = info.hrId;
      }



      //console.log(" After ENTRIES::::", entries)


      function hasDuplicates(managerIds) {
        const encountered = new Set();

        for (const id of managerIds) {
          if (encountered.has(id)) {
            return 1; // Found a duplicate
          } else {
            encountered.add(id);
          }
        }

        return 0; // No duplicates found
      }

      // Check for duplicate manager IDs
      const entry = entries[0];
      let managerIds = [entry.l2Manager, entry.l3Manager, entry.l4Manager, entry.l5Manager];

      // Remove null values from managerIds array
      managerIds = managerIds.filter(id => id !== null);

      //console.log("managerIds:::", managerIds);
      if (hasDuplicates(managerIds)) {
        res.status(400).json({ "message": "Managers at different levels must not be the same" });
        return;
      }
      if (entry.employee === entry.l2Manager || entry.employee === entry.l3Manager || entry.employee === entry.l4Manager || entry.employee === entry.l5Manager || entry.employee === entry.hr) {
        res.status(400).json({ "message": "Employee and manager cannot be the same" });
        return;
      }


      for (let i = 0; i < entries.length; i++) {
        await empMang.update({ employeeId: employeeId, L2ManagerId: entries[i].l2Manager, L3ManagerId: entries[i].l3Manager, L4ManagerId: entries[i].l4Manager, L5ManagerId: entries[i].l5Manager, hrId: entries[i].hr }, { where: { employeeId: employeeId, organisationId: req.body.organisationId } }).then((data) => {
          //console.log("Entry updated for entries array object:::", i);
          res.json({ "message": "Entries Updated Successfully" }).status(200);
        }).catch((err) => {
          //console.log(err);
          // res.send(err).status(400);
        })
      }
      // res.send("Entries Created").status(200);
    }
    catch (e) {
      res.status(400).json({ "message": e });
    }
  });

  apiRoutes.post('/empMang', async (req, res) => { //   Replacement for EmpMangstore and empmangUpdate
    try {
      //console.log("req.body", req.body);
      //console.log("entries[0].employee::::::::", req.body.entries);

      const entries = req.body.entries;

      for (let i = 0; i < entries.length; i++) {
        let emp = entries[i].employee;
        let l2 = entries[i].l2Manager;
        let l3 = entries[i].l3Manager;
        let l4 = entries[i].l4Manager;
        let l5 = entries[i].l5Manager;
        let hr = entries[i].hr;

        // Check if employee manager data exists
        let existingData = await empMang.findOne({ where: { employeeId: emp, organisationId: req.body.organisationId } });

        if (existingData) {
          // Update managers
          await empMang.update({
            L2ManagerId: l2,
            L3ManagerId: l3,
            L4ManagerId: l4,
            L5ManagerId: l5,
            hrId: hr
          }, { where: { employeeId: emp, organisationId: req.body.organisationId } });

          //console.log("Entry updated for employee:", emp);
        } else {
          // Check if employee and manager are the same
          if (emp == l2 || emp == l3 || emp == l4 || emp == l5 || emp == hr) {
            return res.status(400).json({ "message": "Employee and manager cannot be the same" });
          }

          // Create new entry
          await empMang.create({
            employeeId: emp,
            L2ManagerId: l2,
            L3ManagerId: l3,
            L4ManagerId: l4,
            L5ManagerId: l5,
            hrId: hr
          });

          //console.log("Entry created for employee:", emp);
        }
      }

      res.json({ "message": "Entries Created" }).status(200);
    } catch (e) {
      //console.log(e);
      res.status(400).json({ "message": e });
    }
  });

  apiRoutes.post('/employeeForm', async (req, res) => {
    try {
      const traits = [
        {
          factors: 'Communication Skills',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'communicationSkill',
          formControlRemarks: 'communicationSkillRemarks',
        },
        {
          factors: 'Interpersonal Skills',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'interpersonalSkill',
          formControlRemarks: 'interpersonalSkillRemarks',
        },
        {
          factors: 'Ability To Plan The Work',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'abilityToPlanTheWork',
          formControlRemarks: 'abilityToPlanTheWorkRemarks',
        },
        {
          factors: 'Problem Solving',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'problemSolving',
          formControlRemarks: 'problemSolvingRemarks',
        },
        {
          factors: 'Adaptability/Flexibility',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'adaptability',
          formControlRemarks: 'adaptabilityRemarks',
        },
        {
          factors: 'Willingness to Shoulder Additional Responsibilities',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'willingnessToShoulderAdditional',
          formControlRemarks: 'willingnessToShoulderAdditionalRemarks',
        },
        {
          factors: 'Commitment to do a Perfect Job',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'commitmentToDoAPerfectJob',
          formControlRemarks: 'commitmentToDoAPerfectJobRemarks',
        },
        {
          factors: 'Habits and Manners',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'habitsAndManners',
          formControlRemarks: 'habitsAndMannersRemarks',
        },
        {
          factors: 'Presentation/Dress',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'presentation',
          formControlRemarks: 'presentationRemarks',
        },
        {
          factors: 'Punctuality',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'punctuality',
          formControlRemarks: 'punctualityRemarks',
        },
        {
          factors: 'Confidentiality of information/official secret /documents',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'confidentialityOfInfo',
          formControlRemarks: 'confidentialityOfInfoRemarks',
        },
        {
          factors: 'Trustworthiness/Reliability',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'trustworthiness',
          formControlRemarks: 'trustworthinessRemarks',
        },
        {
          factors: 'Team spirit/Team work',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'teamSpirit',
          formControlRemarks: 'teamSpiritRemarks',
        },
        {
          factors: 'Relationship with colleagues',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'relationshipWithColleagues',
          formControlRemarks: 'relationshipWithColleaguesRemarks',
        },
        {
          factors: 'Decision making',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'decisionMaking',
          formControlRemarks: 'decisionMakingRemarks',
        },
        {
          factors: 'Computer skills',
          excellent: 5,
          veryGood: 4,
          good: 3,
          average: 2,
          formControlName: 'computerskills',
          formControlRemarks: 'computerskillsRemarks',
        },
      ];
      res.json({ traits }).status(200);
    }
    catch (err) {
      res.status(400).json({ err });
    }
  });

  // apiRoutes.post('/NewempMang', async (req, res) => { // Sending Flag 1 if Appraisal is already In Progress.
  //   try {
  //     if (req.body.entries && req.body.entries.length > 0) {
  //       const entries = req.body.entries;
  //       const employeeId = entries[0].employee;

  //       // Check if entries already exist for the employee
  //       const existingEntry = await empMang.findOne({ where: { employeeId: employeeId }, raw: true });

  //       // Check if appraisal process exists with a status other than "Initiated"
  //       const latestAppraisal = await empAppraisal.findOne({
  //         where: { employeeId: employeeId },
  //         order: [['createdAt', 'DESC']], // Fetching the latest appraisal based on createdAt date and time
  //         limit: 1
  //       });

  //       if (existingEntry) {
  //         // Update existing entries
  //         for (let i = 0; i < entries.length; i++) {
  //           await empMang.update({
  //             L2ManagerId: entries[i].l2Manager,
  //             L3ManagerId: entries[i].l3Manager,
  //             L4ManagerId: entries[i].l4Manager,
  //             L5ManagerId: entries[i].l5Manager,
  //             hrId: entries[i].hr
  //           }, { where: { employeeId: employeeId } }).then((data) => {
  //             //console.log("Entry updated for entries array object:::", i);
  //           }).catch((err) => {
  //             //console.log(err);
  //             res.status(400).json({ "message": err });
  //           });
  //         }

  //         if (latestAppraisal && latestAppraisal.status !== 'Initiated') {
  //           // Send additional flag and message if appraisal exists and not initiated
  //           return res.status(400).json({ "flag": 1, "message": "Can't Update Managers: Appraisal Already Processed" });
  //         }

  //         res.json({ "message": "Entries Updated Successfully" }).status(200);
  //       } else {
  //         // Store new entries
  //         const emp = entries[i].employee;
  //         const l2 = entries[i].l2Manager;
  //         const l3 = entries[i].l3Manager;
  //         const l4 = entries[i].l4Manager;
  //         const l5 = entries[i].l5Manager;
  //         const hr = entries[i].hr;

  //         if (emp == l2 || emp == l3 || emp == l4 || emp == l5 || emp == hr) {
  //           return res.status(400).json({ "message": "Employee and manager cannot be same" });
  //         }

  //         await empMang.create({
  //           employeeId: emp,
  //           L2ManagerId: l2,
  //           L3ManagerId: l3,
  //           L4ManagerId: l4,
  //           L5ManagerId: l5,
  //           hrId: hr
  //         }).then((data) => {
  //           //console.log("Entry created for entries array object:::", i)
  //           res.json({ "message": "Entries Created" }).status(200);
  //         }).catch((err) => {
  //           //console.log(err);
  //           res.status(400).json({ "message": err });
  //         });
  //       }
  //     } else {
  //       res.status(400).json({ "message": "No entries provided" });
  //     }
  //   } catch (e) {
  //     res.status(400).json({ "message": e });
  //   }
  // });

  apiRoutes.get("/", function (req, res) {
    res.send({ status: true, message: "Please enter the correct endpoint" });
  });

  app.use("/", apiRoutes);
}