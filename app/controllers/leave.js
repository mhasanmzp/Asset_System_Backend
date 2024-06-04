const express = require('express');
const Sequelize = require('sequelize');
const nodemailer = require('nodemailer');
const { QueryTypes } = require('sequelize');
const { sequelize, Teams } = require('../../config/db.config.js');
const Op = Sequelize.Op
const smtp = require('../../config/main.js');
const db = require('../../config/db.config.js');
const XLSX = require('xlsx');
let json2xls = require("json2xls");
const leave = db.leave
const Employees = db.Employees;
const yearlyEmployeeLeaves = db.yearlyEmployeeLeaves;
const cors = require('cors')({ origin: true });
let moment = require('moment')
var multer = require('multer')
const path = require('path')
let smtpAuth = {
    user: smtp.smtpuser,
    pass: smtp.smtppass
}
let smtpConfig = {
    host: smtp.smtphost,
    port: smtp.smtpport,
    secure: false,
    auth: smtpAuth
    //auth:cram_md5
};

let transporter = nodemailer.createTransport(smtpConfig);

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
            name: 'HR Portal',
            address: 'support@timesofpeople.com'
        },
        to: email,
        subject: `${subject}`,
        html: `${message}`,
    });
}

const storage = multer.diskStorage({
    destination: './images/',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })
module.exports = function (app) {

    const apiRoutes = express.Router();

    apiRoutes.post('/applyLeave', upload.single('file'), async function (req, res) {
        let sdate = new Date(req.body.sdate)
        let sdate1 = "" + moment(sdate).format('l');
        let edate = new Date(req.body.edate)
        let edate1 = "" + moment(edate).format('l');
        let leaveType = req.body.leaveType
        let reason = req.body.reason
        let certificate = req.body.certificate
        let days = req.body.days
        let employeeId = req.body.employeeId

        //console.log(" employeeId ", employeeId)
        sequelize.query(`SELECT * from Teams WHERE JSON_CONTAINS(users, '${employeeId}', '$');`,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(teams => {
                let managerEmails = ['hr.support@mckinsol.net', 'leave@mckinsol.com', 'pbhandari@mckinsol.com'];
                teams.forEach(team => {
                    team['managers'].forEach(manager => {
                        Employees.findOne({ where: { employeeId: manager, organisationId:req.body.user_organisationId } }).then(e => {
                            //console.log("Employees e ", e['officialEmail']);
                            managerEmails.push(e['officialEmail'])
                        })
                    })
                })
                let subject = "Leave Request: " + req.body.employeeName
                let message = `New ${leaveType} leave request received for ${req.body.employeeName}<br><br>  
                Kindly approve or reject it on the Mckinsol Portal<br>
                Reason: ${reason} <br>
                Start Date: ${sdate1}<br>
                Days: ${days}<br>`
                mailer(transporter, managerEmails, subject, message)
            }, err => {
                //   res.status(400).send(err)
            })

        let status = req.body.status
        //console.log(new Date(), req.body.sdate, sdate1, edate1)
        if (leaveType == "sick") {
            leave.create({
                "sdate": sdate,
                "edate": edate,
                "leaveType": leaveType,
                "reason": reason,
                "certificate": certificate,
                "days": days,
                "employeeId": employeeId,
                "status": status,
                "organisationId": req.body.organisationId
            }).then(resp => {
                res.status(200).send(resp)
            }, err => {
                res.status(400).send(err)
            })
        } else {
            leave.create({
                "sdate": sdate,
                "edate": edate,
                "leaveType": leaveType,
                "reason": reason,
                "days": days,
                "employeeId": employeeId,
                "certificate": "None",
                "status": status,
                "organisationId": req.body.organisationId
            }).then(resp => {
                res.status(200).send(resp)
            }, err => {
                res.status(400).send(err)
            })
        }
    })

    apiRoutes.post('/getLeaves', async function (req, res) {
        let offset=req.body.skip;
        let employees = Array.from(req.body.employees).join(',');
        //console.log("emplpoyees ", employees)
        if(!employees){
            employees = ("");
        }
        sequelize.query(`SELECT a.firstName, a.lastName, a.employeeId, b.sdate, b.edate, b.leaveType, b.days, b.reason,b.certificate, b.leaveId, b.status FROM Employees a INNER JOIN leaves b WHERE b.organisationId = ${req.body.organisationId}
        AND a.employeeId in (${employees}) AND a.employeeId = b.employeeId  AND a.organisationId='${req.body.organisationId}' order by b.createdAt desc LIMIT 50 OFFSET ${offset}`,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.status(200).send(resp)
            }, err => {
                res.status(400).send(err)
            })
    })

    apiRoutes.post('/getUserLeaveRecord', async function (req, res) {
        sequelize.query(`SELECT * FROM yearly_employee_leaves WHERE employeeId = ${req.body.employeeId} AND organisationId='${req.body.organisationId}'`,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.status(200).send(resp)
            }, err => {
                res.status(400).send(err)
            })
    })
    apiRoutes.post('/getAllUserLeaveRecord', async function (req, res) {
        sequelize.query(`SELECT * FROM yearly_employee_leaves WHERE year = ${req.body.year} AND organisationId='${req.body.organisationId}'`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.status(200).send(resp)
        }, err => {
            res.status(400).send(err)
        })
    })


    apiRoutes.post('/getUserLeaves', async function (req, res) {
        await leave.findAll({
            where: { employeeId: req.body.employeeId,  organisationId : req.body.user_organisationId }, order: [
                ['createdAt', 'DESC']
            ], limit: 100
        }).then(resp => {
            //console.log(res)
            res.status(200).send(resp)
        }, err => {
            //console.log(err)
            res.status(400).send(err)
        })
    })

    apiRoutes.post('/getUserLeaveBalance', async function (req, res) {
        let year = new Date().getFullYear();
        sequelize.query(`SELECT 
        COALESCE((
            (select sick_leaves from yearly_leaves) -
            (select SUM(days) from leaves where employeeId=${req.body.employeeId} and leaveType='sick' and status='Approved' and YEAR(createdAt)=${year} group by days)
              ), (select paid_leaves from yearly_leaves))
            as sick_leave_balance,
        COALESCE((
            (select paid_leaves from yearly_leaves) -
            (select SUM(days) from leaves where employeeId=${req.body.employeeId} and leaveType='paid' and status='Approved' and YEAR(createdAt)=${year} group by days)
              ), (select paid_leaves from yearly_leaves))
            as paid_leave_balance,
        ((select wfh from yearly_leaves) - 
        (select count(*) from leaves where employeeId=${req.body.employeeId} and leaveType='WFH' and status='Approved' and YEAR(createdAt)=${year})) as wfh_balance`,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.status(200).send(resp[0])
            }, err => {
                res.status(400).send(err)
            })
    })

    // Get all leave Details for admin in count
    apiRoutes.post('/getAllUserLeaveBalanceforAdmin', async function (req, res) {
        // let year = new Date().getFullYear();
        let year = req.body.year
        sequelize.query(`SELECT DISTINCT
        emp.firstName,
        emp.lastName,
        emp.officialEmail,
        emp.phoneNo,
        emp.DOJ,
        yel.sick_leaves,
        yel.paid_leaves,
        yel.wfh,
        yel.year,
        yel.month,
        yel.employeeId,
        (yel.paid_leaves - COALESCE(pd1.day, 0)) as remainPaidLeaves,
        COALESCE(pd1.day, 0) as paidLeaveTaken,
        (yel.wfh - COALESCE(pd2.day, 0)) as remainWFHLeaves,
        COALESCE(pd2.day, 0) as WFHLeaveTaken,
        (yel.sick_leaves - COALESCE(pd3.day, 0)) as remainSickLeaves,
        COALESCE(pd3.day, 0) as sickLeaveTaken
      FROM
        yearly_employee_leaves as yel
        LEFT JOIN Employees as emp ON yel.employeeId = emp.employeeId
      LEFT JOIN (
          SELECT
            l.employeeId,
            SUM(l.days) as day
          FROM
            leaves as l
          WHERE
            l.leaveType IN ('paid', 'halfpaid')
            AND l.status = 'Approved'
                AND YEAR(l.createdAt) = ${year}
          GROUP BY
            l.employeeId
      ) as pd1 ON yel.employeeId = pd1.employeeId
      LEFT JOIN (
          SELECT
            l.employeeId,
            SUM(l.days) as day
          FROM
            leaves as l
          WHERE
            l.leaveType = 'WFH'
            AND l.status = 'Approved'
                AND YEAR(l.createdAt) = ${year}
          GROUP BY
            l.employeeId
      ) as pd2 ON yel.employeeId = pd2.employeeId
      LEFT JOIN (
          SELECT
            l.employeeId,
            SUM(
              CASE
                WHEN l.leaveType IN ('sick', 'halfDaySick') THEN l.days
                ELSE 0
              END
            ) as day
          FROM
            leaves as l
          WHERE
            l.status = 'Approved'
            AND YEAR(l.createdAt) = ${year} -- Adjust the year as needed
          GROUP BY
            l.employeeId
      ) as pd3 ON yel.employeeId = pd3.employeeId
      where 
          yel.year = ${year}
      `,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.status(200).send(resp)
            }, err => {
                res.status(400).send(err)
            })
    })
    ////////////////////////////////////////

    apiRoutes.post('/updateLeave', async function (req, res) {
        await leave.update(req.body, { where: { leaveId: req.body.leaveId, organisationId:req.body.organisationId } }).then(resp => {
            res.status(200).send({ "msg": "Request Updated" })
        }, err => {
            //console.log(err)
            res.status(400).send(err)
        })
    })


    apiRoutes.post('/updateLeaveMonth', async function (req, res) {
        await yearlyEmployeeLeaves.update({month : 12}, { where: { employeeId: 254 } }).then(resp => {
            res.status(200).send({ "msg": "Request Updated" })
        }, err => {
            console.log(err)
            res.status(400).send(err)
        })
    })

    //Update monthly Leave Manually Process
    apiRoutes.post('/updateAssignedLeave', async function (req, res) {
        await yearlyEmployeeLeaves.update(req.body, { where: { employeeId: req.body.employeeId, organisationId:req.body.organisationId } }).then(resp => {
            res.status(200).send({ "msg": "Request Updated" })
        }, err => {
            //console.log(err)
            res.status(400).send(err)
        })
    })
    //
    apiRoutes.get('/assignMonthlyLeaves', async function (req, res) {
        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let date = new Date().getDate();
        //console.log(year, month,date)
        let emps = await Employees.findAll({
             where: { organisationId: 1, isActive : 1 },
             attributes: ['employeeId', 'officialEmail', 'DOJ'] 
            })
        // console.log("leaves",emps)
        for (i = 0; i < emps.length; i++) {
            let firstDate = new Date(emps[i].DOJ),
                secondDate = new Date(),
                timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());
            //console.log("time",timeDifference);
            let differentDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
            //console.log("days",differentDays)
            //console.log("employee id",emps[i].employeeId)
            if (differentDays > 90) {
                let employeeLeaveDetails = await sequelize.query(`select * from yearly_employee_leaves where employeeId='${emps[i].employeeId}' and year='${year}'`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                //console.log("employee details",employeeLeaveDetails)
                if (employeeLeaveDetails.length > 0) {
                    if(month == 12 && date == 26)
                    {
                        sequelize.query(`UPDATE yearly_employee_leaves set month = '${month}', year = '${year}', paid_leaves = (SELECT paid_leaves FROM yearly_leaves)/4, sick_leaves = (SELECT sick_leaves FROM yearly_leaves)/4 , wfh = (SELECT wfh FROM yearly_leaves)/4 where employeeId= '${emps[i].employeeId}'`).then(resp => {
                            // //console.log("211", "Data Updated")
                        })
                    }
                    else{
                        sequelize.query(`UPDATE yearly_employee_leaves set month = '${month}', year = '${year}', paid_leaves = paid_leaves + (SELECT paid_leaves FROM yearly_leaves)/4, sick_leaves = sick_leaves + (SELECT sick_leaves FROM yearly_leaves)/4 , wfh = wfh + (SELECT wfh FROM yearly_leaves)/4 where employeeId= '${emps[i].employeeId}'`).then(resp => {
                            // //console.log("211", "Data Updated")
                        })
                    }
                } else {
                    await sequelize.query(`INSERT INTO yearly_employee_leaves (employeeId, year, sick_leaves, paid_leaves, wfh, month) VALUES ('${emps[i].employeeId}', '${year}', (SELECT sick_leaves FROM yearly_leaves)/4, (SELECT paid_leaves FROM yearly_leaves)/4, (SELECT wfh FROM yearly_leaves)/4, '${month}')`)
                }
            }
        }
    })

    apiRoutes.post('/downloadLeaves', async function (req, res) {
        sequelize.query(`SELECT b.firstName, b.lastName, a.sdate, a.edate, a.leaveType, a.days, a.reason, a.status FROM leaves a, Employees b WHERE a.employeeId = b.employeeId AND
        b.employeeId IN (${req.body.employeeId}) AND (a.sdate BETWEEN '${req.body.sdate}' AND '${req.body.edate}')`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            if (resp.length > 0) {
                // let fileName = 'levaeDetails' + new Date() + '.xlsx';
                // res.xls(fileName, resp);
                res.send({ code: 1, resp })
            } else {
                res.send({ code: 1, "msg": "No Data Found" })
            }
        }, err => {
            // //console.log("err ", err)
            // res.status(400).send(err)
        })
    })

    apiRoutes.post('/updateLeaveBalanceusingExcelSheet', upload.any(), async function (req, res) {

        let file = req.files.path
        const XLSX = require('xlsx');

        // Path to the Excel file
        const filePath = './images/' + req.files[0].filename;
        //console.log(filePath)
        // Load the Excel file
        const workbook = XLSX.readFile(filePath);

        // Select the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Parse the sheet to JSON format
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Print the imported data
        //console.log(jsonData);
        //console.log("295", jsonData[0].paid_leaves)
        for (i = 0; i < jsonData.length; i++) {
            //console.log("297", jsonData[i].paid_leaves)

            sequelize.query(`UPDATE yearly_employee_leaves SET paid_leaves = 6, sick_leaves = 3 WHERE paid_leaves = -4`)
        }
        res.send({msg:"ok"})
    })

    // apiRoutes.post('/createSonalikaChecklist', upload.any(), async function (req, res) {

    //     let file = req.files.path
    //     //console.log("file", req.files, file)
    //     const XLSX = require('xlsx');

    //     // Path to the Excel file
    //     const filePath = './images/' + req.files[0].filename;
    //     //console.log(filePath)
    //     // Load the Excel file
    //     const workbook = XLSX.readFile(filePath);

    //     // Select the first sheet
    //     const sheetName = workbook.SheetNames[0];
    //     const sheet = workbook.Sheets[sheetName];

    //     // Parse the sheet to JSON format
    //     const jsonData = XLSX.utils.sheet_to_json(sheet);

    //     let array = []
    //     for (i = 0; i < jsonData.length; i++) {
    //         array.push(jsonData[i].Parentname)
    //     }
    //     const uniqueArray = [...new Set(array)];

    //     for (j = 0; j < uniqueArray.length; j++) {
    //         sequelize.query(`insert into pdi_mst_checklist (checklist_description, organisation_id, created_by, created_date, is_active, updated_by, updated_date) values (${uniqueArray[j]}, 17, 24, '2023-09-05', 1, 24, '2023-09-05');
    //         `, {
    //             type: Sequelize.QueryTypes.SELECT
    //         }).then(resp => {
    //             //console.log(resp)
    //             //     if (uniqueArray[j].Parentname = jsonData[i].Parentname) {
    //             //         sequelize.query(`insert into pdi_mst_sub_checklist (checklist_description, organisation_id, created_by, created_date, is_active, updated_by, updated_date) values (${uniqueArray[j]}, 17, 24, '2023-09-05', 1, 24, '2023-09-05');
    //             // `, {
    //             //     type: Sequelize.QueryTypes.SELECT
    //             // })
    //             //     }
    //         })


    //     }
    //     res.send(array)
    // })


    // app.post('/exportprojectDetails', async function (req, res) {
    //     sequelize.query(`select Employees.firstName, Employees.lastName, st.projectTaskNumber, st.taskName, st.estimatedHours, st.actualHours, st.startDate, st.dueDate, st.completionDate from StoryTasks as st
    //     LEFT JOIN Employees ON st.assignee = Employees.employeeId
    //     where st.projectId = 31 and completionDate Between '2023-08-28' and '2023-09-01'`, {
    //         type: Sequelize.QueryTypes.SELECT
    //     }).then(resp => {
    //         res.xls('abc.xlsx', resp)
    //     })

    // })

    apiRoutes.get('/', function (req, res) {
        res.send({ status: true })
    });

    app.use('/', apiRoutes);
};
