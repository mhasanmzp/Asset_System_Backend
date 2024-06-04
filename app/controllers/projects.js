const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize, Teams, Employees, ProjectMembers } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');
const app = express();
// const smtp = require('../../config/main');
const ColumnBoard = db.columnBoard
const smtp = require('../../config/main.js');
const path = require('path');
const _ = require('lodash')
const bodyParser = require("body-parser");
const Tasks = db.Tasks
const Epic = db.Epic
const Story = db.Story
const StoryTasks = db.StoryTasks
const Project = db.Project
const Notification = db.notification
const Sprint = db.Sprint
const Notes = db.Notes
const Report = db.Report
const requestTicket = db.requestTicket
const clientDetail = db.clientDetails
const taskComment = db.taskComment;
const UserGroups = db.UserGroups;
const taskLog = db.taskLog;
const apiRoutes = express.Router();
const nodemailer = require('nodemailer');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const logs = require('../middleware/logs');

const EmployeeCost = db.employeeCost;
const moment = require('moment');
const multer = require('multer');
const { where } = require('underscore');
const story = require('../models/story.js');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //console.log("15", file)
        // //console.log(__dirname)
        // //console.log()
        let paths = path.resolve("images/documents")


        cb(null, paths)
        // cb(null, './images/documents')
    },
    filename: (req, file, cb) => {
        // //console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({ storage: storage })

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
    }
    // else {
    //     //console.log('Server is ready to take our messages');
    // }
});
module.exports = function (app, io) {

    function mailer(transporter, email, subject, message) {
        // //console.log(email, subject, message)
        transporter.sendMail({
            from: {
                name: 'Mckinsol Portal',
                address: 'support@timesofpeople.com'
            },
            to: email,
            subject: `${subject}`,
            html: `${message}`,
        }).then(resp => {
            //console.log(resp)
        }, error => {
            //console.log(error)
        });
    }

    io.on('connection', function (socket) {
        console.log('a user connected');

        console.log("socket id---------------- ", socket.id); // 'G5p5...'


        // socket.join('channel1');

        // Send a message to all sockets in the "channel1" room
        // io.to('channel1').emit('new message', 'A new user has joined the channel');

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });

        socket.on('new message', function (msg) {
            let parsedMessage = JSON.parse(msg);
            console.log('parsedMessage: ' + parsedMessage);
            if (parsedMessage.action == 'joinChannel') {
                socket.join(parsedMessage.projectId);
            } else {
                // socket.
            }
            // io.emit('chat message', msg);
        });
    });

    apiRoutes.post('/createProject', async function (req, res) {
        await Project.create(req.body).then(async result => {

            // console.log(req.body);
            req.body.members.forEach(p => { p.projectId = result.projectId });
            // console.log(req.body.members);
            let projectColumns = [{
                projectId: result.projectId,
                columnName: 'To Do',
                organisationId: req.body.user_organisationId
            }, {
                projectId: result.projectId,
                columnName: 'In Progress',
                organisationId: req.body.user_organisationId
            }, {
                projectId: result.projectId,
                columnName: 'Unit Testing',
                organisationId: req.body.user_organisationId
            }, {
                projectId: result.projectId,
                columnName: 'Done',
                organisationId: req.body.user_organisationId
            }, {
                projectId: result.projectId,
                columnName: 'Hold',
                organisationId: req.body.user_organisationId
            }]
            await ColumnBoard.bulkCreate(projectColumns).then(resp => {
            }, error => {
            })

            try {
                if (req.body.replicateData == "Yes") {
                    console.log(req.body.sourceProjectId)
                    let Epics = await sequelize.query(`select id,name, description, status, start, end from Epics where projectId=${req.body.sourceProjectId} And organisationId =${req.body.organisationId}`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                    if (Epics.length) {
                        for (epicData of Epics) {
                            epicData.organisationId = req.body.organisationId;
                            epicData.projectId = result.projectId;
                            let oldEpicId = epicData['id']
                            delete epicData['id'];

                            let newEpicData = await Epic.create(epicData)
                            if (newEpicData) {
                                // console.log("Epic created", newEpicData);
                            }
                            let Stories = await sequelize.query(`select name, description, status, start, end, progress, reporter, ${newEpicData.id} as epicId, ${result.projectId} as projectId, ${req.body.organisationId} as organisationId from Stories where epicId=${oldEpicId}`,
                                {
                                    type: Sequelize.QueryTypes.SELECT
                                });
                            // console.log(Stories);
                            if (Stories.length) {
                                console.log(Stories.length);
                                let result = await Story.bulkCreate(Stories);
                                if (result) {
                                    console.log(Stories.length, 'created into', newEpicData.id, newEpicData.name)
                                }

                            }
                        }
                    }

                }
            }
            catch (err) {
                console.log({ err });
            }

            await ProjectMembers.bulkCreate(req.body.members).then(resp => {
                res.status(200).send(result)
            }, error => {
                res.status(400).send(error)
            })


        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/updateProject', async function (req, res) {
        let projectData = await Project.findOne({ where: { projectId: req.body.projectId } });
        let releaseNumber = projectData.releaseNumber;
        if (projectData.releaseNumber && req.body.releaseNumber.length) {
            req.body.releaseNumber = [...releaseNumber, ...req.body.releaseNumber];
        }
        else {
            req.body.releaseNumber = [...req.body.releaseNumber]
        }
        await Project.update(req.body, {
            where: { projectId: req.body.projectId }
        }).then(async result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })

    })

    apiRoutes.post('/fetchAllProjects', async function (req, res) {
        await Project.findAll({ where: { organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getOneProject', async function (req, res) {
        await Project.findOne({ where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getProjectMembers', async function (req, res) {
        sequelize.query(`SELECT *
          FROM Employees
          INNER JOIN ProjectMembers
          ON Employees.employeeId = ProjectMembers.employeeId AND ProjectMembers.projectId = '${req.body.projectId}' `,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.send(resp)
            }, err => {
                res.status(400).send(err)
            })
    })
    apiRoutes.post('/getProjectSummary', async function (req, res) {
        try {
            const projectId = req.body.projectId;
            const organisationId = req.body.organisationId;

            const tasks = await StoryTasks.findAll({
                where: {
                    projectId: projectId,
                    organisationId: organisationId

                }
            });

            let totalEstimatedHours = 0;
            let totalActualHours = 0;
            let totalEstimatedCost = 0;
            let totalActualCost = 0;


            tasks.forEach(task => {
                if (task.estimatedHours) {
                    totalEstimatedHours += parseFloat(task.estimatedHours);
                }
                if (task.actualHours) {
                    totalActualHours += parseFloat(task.actualHours);
                }
                if (task.estimatedCost) {
                    totalEstimatedCost += parseFloat(task.estimatedCost);
                }
                if (task.actualCost) {
                    totalActualCost += parseFloat(task.actualCost);
                }
            });

            totalEstimatedHours = parseFloat(totalEstimatedHours.toFixed(2));
            totalActualHours = parseFloat(totalActualHours.toFixed(2));
            totalEstimatedCost = parseFloat(totalEstimatedCost.toFixed(2));
            totalActualCost = parseFloat(totalActualCost.toFixed(2));


            const projectSummary = {

                Data: ["Total Estimated Hours", "Total Actual Hours", "Total Estimated Cost", "Total Actual Cost"],
                value: [totalEstimatedHours, totalActualHours, totalEstimatedCost, totalActualCost]
            };

            res.status(200).send({

                ...projectSummary
            });
        } catch (error) {
            console.error(error);
            res.status(400).send({ error: "Failed to retrieve project summary" });
        }
    })

    apiRoutes.post('/getProjectRoles', async function (req, res) {
        await Roles.findAll({ where: { organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })
    apiRoutes.post('/getProjectMemberActual', async function (req, res) {
        try {
            let startDateCondition = '';
            let endDateCondition = '';


            if (req.body.startDate && req.body.endDate) {
                const startDate = new Date(req.body.startDate);
                const endDate = new Date(req.body.endDate);

                const formattedStartDate = startDate.toISOString().split('T')[0];
                const formattedEndDate = endDate.toISOString().split('T')[0];


                startDateCondition = `AND StoryTasks.startDate >= '${formattedStartDate}'`;
                endDateCondition = `AND StoryTasks.dueDate <= '${formattedEndDate}'`;
            }

            const members = await sequelize.query(`
                SELECT 
                    Employees.firstName,
                    Employees.lastName,
                    SUM(CASE WHEN StoryTasks.assignee = Employees.employeeId THEN StoryTasks.estimatedHours ELSE 0 END) AS estimatedHours,
                    SUM(CASE WHEN StoryTasks.assignee = Employees.employeeId THEN StoryTasks.actualHours ELSE 0 END) AS actualHours
                FROM 
                    Employees
                INNER JOIN 
                    ProjectMembers ON Employees.employeeId = ProjectMembers.employeeId
                INNER JOIN 
                    StoryTasks ON ProjectMembers.projectId = StoryTasks.projectId
                WHERE 
                    ProjectMembers.projectId = '${req.body.projectId}'
                    ${startDateCondition} ${endDateCondition}
                GROUP BY 
                    Employees.employeeId
            `, {
                type: Sequelize.QueryTypes.SELECT
            });

            const memberNames = [];
            const estimatedHours = [];
            const actualHours = [];

            members.forEach(member => {
                memberNames.push(`${member.firstName} ${member.lastName}`);
                estimatedHours.push(member.estimatedHours);
                actualHours.push(member.actualHours);
            });

            res.status(200).json({
                memberNames: memberNames,
                estimatedHours: estimatedHours,
                actualHours: actualHours
            });
        } catch (error) {

            console.error("Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    apiRoutes.post('/getReporterTasks', async function (req, res) {
        sequelize.query(`select d.projectId,d.projectName,c.name as epic ,b.name as story,a.taskId,a.taskName,a.columnId,a.description, a.reporter, a.assignee, a.createdAt, e.columnName as status from StoryTasks a, Stories b, Epics c, Projects d, columnBoards e where a.storyId = b.id and b.epicId = c.id and c.projectId = d.projectId and a.columnId = e.columnId and a.reporter = '${req.body.employeeId}' and a.isActive = 1 and a.feasibilityStatus='Feasible' order by a.createdAt desc limit 20 offset ${req.body.offset}`,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.status(200).send(resp)
            }, err => {
                console.log(err);
                res.status(400).send(err)
            })
    })


    /// Below apis are created for User Tickets, some for the filters and others for the records.
    apiRoutes.post('/downloadTasksForEpicManager', async function (req, res) {
        try {

            let condition = '';
            if (req.body.feasibilityStatus) {
                const feasibilityStatus = req.body.feasibilityStatus
                    .map(status => `'${status}'`)
                    .join(',');

                condition += `AND storyTask_feasibilityStatus in (${feasibilityStatus}) `
            }
            if (req.body.projectId) {
                condition += `AND Project_id in (${req.body.projectId.join(',')}) `
            }
            if (req.body.epicId) {
                condition += `AND epic_id in (${req.body.epicId.join(',')}) `
            }
            if (req.body.storyId) {
                condition += `AND story_id in (${req.body.storyId.join(',')}) `
            }
            if (req.body.reporter) {
                condition += `AND StoryTask_reporter in (${req.body.reporter.join(',')}) `
            }
            if (req.body.status) {
                const Status = req.body.status
                    .map(status => `'${status}'`)
                    .join(',');

                condition += `AND columnBoard_name in (${Status}) `
            }

            console.log({ condition });

            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_order as \`order\`,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket'
                ${condition}
            ORDER BY
                storyTask_createdAt DESC;`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                
                    res.status(200).send({ uniqueArray: result })
                
                
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_order as \`order\`,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket'
        ${condition}
        ORDER BY
                StoryTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                }
                let dataForEpicManager = await sequelize.query(`
                SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_order as \`order\`,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket'
                ${condition}
                ORDER BY
                StoryTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_order as \`order\`,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket'
                ${condition}
                ORDER BY
                StoryTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.taskId === obj.taskId
                    ))
                );

                let uniqueCount = count.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.taskId === obj.taskId
                    ))
                );

                uniqueArray.sort((a, b) => {
                    return b.taskId - a.taskId;
                })
                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    })

    apiRoutes.post('/getTasksForEpicManager', async function (req, res) {
        try {

            let condition = '';
            if (req.body.feasibilityStatus) {
                const feasibilityStatus = req.body.feasibilityStatus
                    .map(status => `'${status}'`)
                    .join(',');

                condition += `AND storyTask_feasibilityStatus in (${feasibilityStatus}) `
            }
            if (req.body.projectId) {
                condition += `AND Project_id in (${req.body.projectId.join(',')}) `
            }
            if (req.body.epicId) {
                condition += `AND epic_id in (${req.body.epicId.join(',')}) `
            }
            if (req.body.storyId) {
                condition += `AND story_id in (${req.body.storyId.join(',')}) `
            }
            if (req.body.reporter) {
                condition += `AND StoryTask_reporter in (${req.body.reporter.join(',')}) `
            }
            if (req.body.status) {
                const Status = req.body.status
                    .map(status => `'${status}'`)
                    .join(',');

                condition += `AND columnBoard_name in (${Status}) `
            }

            console.log({ condition });

            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_order as \`order\`,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket'
                ${condition}
            ORDER BY
                storyTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                if (req.body.offset == 0) {
                    count = await sequelize.query(`
                SELECT 
                storyTask_taskId
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket'
                ${condition};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });
                }
                if (req.body.offset == 0) {
                    res.status(200).send({ uniqueArray: result, count: count.length })
                }
                else {
                    res.status(200).send({ uniqueArray: result })
                }
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []
                var count1 = [];

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_order as \`order\`,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket'
        ${condition}
        ORDER BY
                StoryTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                    if (req.body.offset == 0) {
                        count1 = await sequelize.query(`
                    SELECT storyTask_taskId
                        FROM
                    ProjectData
                    where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                            {
                                type: Sequelize.QueryTypes.SELECT
                            });
                    }
                    console.log(count1);
                }
                let dataForEpicManager = await sequelize.query(`
                SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_order as \`order\`,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket'
                ${condition}
                ORDER BY
                StoryTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                var count2 = [];
                if (req.body.offset == 0) {
                    count2 = await sequelize.query(`
                        SELECT storyTask_taskId
                            FROM
                        ProjectData
                    where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition}`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });
                }


                let dataForReporter = await sequelize.query(`
                SELECT 
                Project_id as projectId,
                Project_name as projectName,
                epic_name as epic,
                epic_id as epicId,
                story_id as storyId,
                story_name as story,
                storyTask_taskId as taskId,
                storyTask_taskName as taskName,
                storyTask_assignee as assignee,
                storyTask_order as \`order\`,
                storyTask_assignor as assignor,
                storyTask_date as date,
                epic_organisationId as organisationId,
                storyTask_columnId as columnId,
                columnBoard_name as status,
                storyTask_taskType as taskType,
                storyTask_description as description,
                storyTask_reporter as reporter,
                storyTask_dueDate as dueDate,
                storyTask_createdAt as createdAt,
                storyTask_updatedAt as updatedAt,
                storyTask_startDate as startDate,
                storyTask_estimatedHours as estimatedHours,
                storyTask_priority as priority,
                storyTask_completionDate as completionDate,
                storyTask_tester as tester,
                storyTask_reOpened as reOpened,
                storyTask_onHold as onHold,
                storyTask_projectTaskNumber as projectTaskNumber,
                storyTask_actualHours as actualHours,
                storyTask_testingDueDate as testingDueDate,
                storyTask_testingStartDate as testingStartDate,
                storyTask_testingDescription as testingDescription,
                storyTask_testingEstimatedHours as testingEstimatedHours,
                storyTask_testingActualHours as testingActualHours,
                storyTask_category as category,
                storyTask_extraHours as extraHours, 
                storyTask_totalHoursSpent as totalHoursSpent,
                storyTask_testCaseData as testCaseData,
                storyTask_actualStartDate as actualStartDate,
                storyTask_actualDueDate as actualDueDate,
                storyTask_updatedBy as updatedBy,
                storyTask_createdBy as createdBy,
                storyTask_fileName as fileName,
                storyTask_estimatedCost as estimatedCost,
                storyTask_actualCost as actualCost,
                storyTask_isActive as isActive,
                storyTask_createType as createType,
                storyTask_feasibilityReason as feasibilityReason,
                storyTask_feasibilityStatus as feasibilityStatus,
                (select type from ProjectMembers where employeeId = ${req.body.employeeId} AND projectId = Project_id) as type
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket'
                ${condition}
                ORDER BY
                StoryTask_createdAt DESC
            LIMIT 50 OFFSET ${req.body.offset};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })
                var count3 = [];
                if (req.body.offset == 0) {
                    count3 = await sequelize.query(`
                            SELECT storyTask_taskId
                                FROM
                            ProjectData
                            where
                            storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });
                }

                count = [...count1, ...count2, ...count3];
                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.taskId === obj.taskId
                    ))
                );

                let uniqueCount = count.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.taskId === obj.taskId
                    ))
                );

                uniqueArray.sort((a, b) => {
                    return b.taskId - a.taskId;
                })

                if (req.body.offset == 0) {
                    res.status(200).send({ uniqueArray, count: uniqueCount.length })
                }
                else {
                    res.status(200).send({ uniqueArray })
                }
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    })

    apiRoutes.post('/getFilterProjects', async function (req, res) {
        try {
            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT distinct
                project_id as projectId,
                Project_name as projectName
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                res.status(200).send({ uniqueArray: result })
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT distinct
                    project_id as projectId,
                    Project_name as projectName
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });
                }

                let dataForEpicManager = await sequelize.query(`
                SELECT distinct
                project_id as projectId,
                        Project_name as projectName
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT distinct
                project_id as projectId,
                        Project_name as projectName
            FROM
                ProjectData
                Where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.projectId === obj.projectId
                    ))
                );

                uniqueArray.sort((a, b) => {
                    return b.projectId - a.projectId;
                })

                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    });
    apiRoutes.post('/getFilterEpics', async function (req, res) {
        try {

            let condition = '';
            if (req.body.projectId) {
                condition += `AND Project_id in (${req.body.projectId.join(',')}) `
            }

            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT distinct
                epic_name as epic,
                epic_id as epicId
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket'
                ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                res.status(200).send({ uniqueArray: result })
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT distinct
                epic_name as epic,
                epic_id as epicId
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                }

                let dataForEpicManager = await sequelize.query(`
                SELECT distinct
                epic_name as epic,
                epic_id as epicId
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT distinct
                epic_name as epic,
                epic_id as epicId
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.epicId === obj.epicId
                    ))
                );

                uniqueArray.sort((a, b) => {
                    return b.epicId - a.epicId;
                })

                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    });

    apiRoutes.post('/getFilterStory', async function (req, res) {
        try {

            let condition = '';
            if (req.body.epicId) {
                condition += `AND epic_id in (${req.body.epicId.join(',')}) `
            }
            if (req.body.projectId) {
                condition += `AND Project_id in (${req.body.projectId.join(',')}) `
            }

            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT distinct
                story_id as storyId,
                story_name as storyName
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                res.status(200).send({ uniqueArray: result })
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT distinct
                    story_id as storyId,
                    story_name as storyName
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                }

                let dataForEpicManager = await sequelize.query(`
                SELECT distinct
                story_id as storyId,
                story_name as story
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT distinct
                story_id as storyId,
                story_name as storyName
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.storyId === obj.storyId
                    ))
                );

                uniqueArray.sort((a, b) => {
                    return b.storyId - a.storyId;
                })

                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    });
    apiRoutes.post('/getFilterCreatedBy', async function (req, res) {
        try {
            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT distinct
                storyTask_reporter as reporter
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                res.status(200).send({ uniqueArray: result })
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT distinct
                    storyTask_reporter as reporter
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                }

                let dataForEpicManager = await sequelize.query(`
                SELECT distinct
                storyTask_reporter as reporter
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT distinct
                storyTask_reporter as reporter
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.reporter === obj.reporter
                    ))
                );

                uniqueArray.sort((a, b) => {
                    return b.reporter - a.reporter;
                })

                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    });
    apiRoutes.post('/getFilterTaskStatus', async function (req, res) {
        try {
            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT distinct
                columnBoard_name as status
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                res.status(200).send({ uniqueArray: result })
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT distinct
                    columnBoard_name as status
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                }

                let dataForEpicManager = await sequelize.query(`
                SELECT distinct
                columnBoard_name as status
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT distinct
                columnBoard_name as status
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket';`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];

                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.status === obj.status
                    ))
                );

                uniqueArray.sort((a, b) => a.status.localeCompare(b.status));

                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    });
    apiRoutes.post('/getFilterFeasibilityStatus', async function (req, res) {
        try {

            let condition = '';
            if (req.body.projectId) {
                condition += `AND Project_id in (${req.body.projectId.join(',')}) `
            }
            if (req.body.epicId) {
                condition += `AND epic_id in (${req.body.epicId.join(',')}) `
            }
            if (req.body.storyId) {
                condition += `AND story_id in (${req.body.storyId.join(',')}) `
            }

            let query = `SELECT
            Employees.firstName,
            Employees.lastName,
            Employees.officialEmail,
            Employees.organisationId,
            GROUP_CONCAT(userGroups.groupName) AS groupNames
        FROM
            Employees
        INNER JOIN
            userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
        WHERE
            Employees.employeeId = ${req.body.employeeId}
        GROUP BY
            Employees.firstName,
            Employees.lastName,
            Employees.image,
            Employees.officialEmail,
            Employees.organisationId,
            Employees.employeeId;`

            let employeeData = await sequelize.query(query,
                {
                    type: Sequelize.QueryTypes.SELECT
                });
            let groups = employeeData[0].groupNames.split(',');
            let count = [];
            if (groups.includes("Admin") || groups.includes("admin")) {

                let result = await sequelize.query(`
                SELECT distinct
                StoryTask_feasibilityStatus as feasibilityStatus
            FROM
                ProjectData
            WHERE
                epic_organisationId = ${req.body.organisationId}
                AND storyTask_isActive = 1
                AND storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });
                res.status(200).send({ uniqueArray: result })
            }
            else {
                let List = [];
                let projectList = await sequelize.query(`SELECT pm.projectId
                FROM Employees e
                INNER JOIN ProjectMembers pm
                ON e.employeeId = pm.employeeId AND pm.employeeId = ${req.body.employeeId} and pm.type = "Manager";`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                let dataForProjectManager = []

                if (projectList.length) {
                    console.log('trueeeee');
                    projectList.forEach(element => {
                        List.push(element.projectId);
                    });

                    List = List.join(',');
                    console.log(List);
                    dataForProjectManager = await sequelize.query(`
                    SELECT distinct
                    StoryTask_feasibilityStatus as feasibilityStatus
            FROM
                ProjectData
        where Project_id in (${List}) and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                        {
                            type: Sequelize.QueryTypes.SELECT
                        });

                }
                /*
                select d.projectId,d.projectName,c.name as epic, c.id as epicId,b.id as storyId, b.name as story,a.*, e.columnName as status, pm.type from StoryTasks a, Stories b, Epics c, Projects d, columnBoards e,  ProjectMembers pm where a.storyId = b.id and b.epicId = c.id and c.projectId = d.projectId and a.columnId = e.columnId and pm.employeeId = ${req.body.employeeId} and pm.projectId = d.projectId and d.projectId in (${List}) and a.isActive = 1 and a.createType = 'ticket' order by a.createdAt desc;`,

                */
                let dataForEpicManager = await sequelize.query(`
                SELECT distinct
                StoryTask_feasibilityStatus as feasibilityStatus
            FROM
                ProjectData
                where JSON_CONTAINS(epic_manager, '${req.body.employeeId}') and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    });

                let dataForReporter = await sequelize.query(`
                SELECT distinct
                StoryTask_feasibilityStatus as feasibilityStatus
            FROM
                ProjectData
                where
                storyTask_reporter = '${req.body.employeeId}' and storyTask_isActive = 1 and storyTask_createType = 'ticket' ${condition};`,
                    {
                        type: Sequelize.QueryTypes.SELECT
                    })

                let result = [...dataForReporter, ...dataForEpicManager, ...dataForProjectManager];
                let uniqueArray = result.filter((obj, index, self) =>
                    index === self.findIndex((t) => (
                        t.feasibilityStatus === obj.feasibilityStatus
                    ))
                );

                uniqueArray.sort((a, b) => a.feasibilityStatus.localeCompare(b.feasibilityStatus));

                res.status(200).send({ uniqueArray })
            }
        }
        catch (e) {
            console.log(e);
            res.status(400).send(e)
        }
    });

    apiRoutes.post('/getDetailedProjects', async function (req, res) {
        try {
            const employeeId = req.body.employeeId;
            const offset = req.body.offset || 0;

            // Step 1: Fetch employee groups to determine their role
            const employeeQuery = `
                SELECT
                    Employees.firstName,
                    Employees.lastName,
                    Employees.officialEmail,
                    Employees.organisationId,
                    GROUP_CONCAT(userGroups.groupName) AS groupNames
                FROM
                    Employees
                INNER JOIN
                    userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
                WHERE
                    Employees.employeeId = :employeeId
                GROUP BY
                    Employees.firstName,
                    Employees.lastName,
                    Employees.officialEmail,
                    Employees.organisationId,
                    Employees.employeeId;`;

            const employeeData = await sequelize.query(employeeQuery, {
                type: Sequelize.QueryTypes.SELECT,
                replacements: { employeeId }
            });

            if (employeeData.length === 0) {
                return res.status(404).send({ error: "Employee not found" });
            }

            const groups = employeeData[0].groupNames.split(',');

            let query = '';
            let replacements = { employeeId, organisationId: employeeData[0].organisationId, offset };

            if (groups.includes("Admin") || groups.includes("admin")) {

                query = `
                    SELECT DISTINCT
                        Projects.projectId,
                        Projects.projectName,
                        Epics.name as epic,
                        Epics.id as epicId,
                        Stories.id as storyId,
                        Stories.name as story,
                        StoryTasks.taskId,
                        StoryTasks.taskName,
                        StoryTasks.assignee,
                        StoryTasks.assignor,
                        StoryTasks.date,
                        StoryTasks.organisationId,
                        StoryTasks.columnId,
                        columnBoards.columnName as status,
                        StoryTasks.taskType,
                        StoryTasks.order,
                        StoryTasks.description,
                        StoryTasks.reporter,
                        StoryTasks.dueDate,
                        StoryTasks.createdAt,
                        StoryTasks.updatedAt,
                        StoryTasks.startDate,
                        StoryTasks.estimatedHours,
                        StoryTasks.priority,
                        StoryTasks.completionDate,
                        StoryTasks.tester,
                        StoryTasks.reOpened,
                        StoryTasks.onHold,
                        StoryTasks.projectTaskNumber,
                        StoryTasks.actualHours,
                        StoryTasks.testingDueDate,
                        StoryTasks.testingStartDate,
                        StoryTasks.testingDescription,
                        StoryTasks.testingEstimatedHours,
                        StoryTasks.testingActualHours,
                        StoryTasks.category,
                        StoryTasks.extraHours,
                        StoryTasks.totalHoursSpent,
                        StoryTasks.testCaseData,
                        StoryTasks.actualStartDate,
                        StoryTasks.actualDueDate,
                        StoryTasks.updatedBy,
                        StoryTasks.createdBy,
                        StoryTasks.fileName,
                        StoryTasks.estimatedCost,
                        StoryTasks.actualCost,
                        StoryTasks.isActive,
                        StoryTasks.createType,
                        StoryTasks.feasibilityReason,
                        StoryTasks.feasibilityStatus
                       
                    FROM
                        Projects
                    INNER JOIN
                        StoryTasks ON Projects.projectId = StoryTasks.projectId
                    LEFT JOIN
                        Stories ON StoryTasks.storyId = Stories.id
                    LEFT JOIN
                        Epics ON Stories.epicId = Epics.id
                    INNER JOIN
                        columnBoards ON StoryTasks.columnId = columnBoards.columnId
                    WHERE
                        Projects.organisationId = ${req.body.organisationId}
                        AND StoryTasks.isActive = 1
                        AND StoryTasks.createType = 'ticket'
                    ORDER BY
                        StoryTasks.createdAt DESC
                    LIMIT 50 OFFSET :offset;`;
                const uniqueArray = await sequelize.query(query, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { employeeId, offset }
                });

                const totalCountQuery = `
                    SELECT COUNT(*) AS totalTasks
                    FROM Projects
                    INNER JOIN StoryTasks ON Projects.projectId = StoryTasks.projectId
                    LEFT JOIN Stories ON StoryTasks.storyId = Stories.id
                    LEFT JOIN Epics ON Stories.epicId = Epics.id
                    INNER JOIN columnBoards ON StoryTasks.columnId = columnBoards.columnId
                    WHERE Projects.organisationId = :organisationId
                    AND StoryTasks.isActive = 1
                    AND StoryTasks.createType = 'ticket';`;

                const totalCountResult = await sequelize.query(totalCountQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { organisationId: employeeData[0].organisationId }
                });

                const ticketCount = totalCountResult[0].totalTasks;


                return res.send({ uniqueArray, ticketCount });



            } else if (groups.includes("Managers") || groups.includes("Epic Manager")) {

                const projectManagerQuery = `
                    SELECT DISTINCT
                        Projects.projectId,
                        Projects.projectName,
                        Epics.name as epic,
                        Epics.id as epicId,
                        Stories.id as storyId,
                        Stories.name as story,
                        StoryTasks.taskId,
                        StoryTasks.taskName,
                        StoryTasks.assignee,
                        StoryTasks.assignor,
                        StoryTasks.date,
                        StoryTasks.organisationId,
                        StoryTasks.columnId,
                        columnBoards.columnName as status,
                        StoryTasks.taskType,
                        StoryTasks.order,
                        StoryTasks.description,
                        StoryTasks.reporter,
                        StoryTasks.dueDate,
                        StoryTasks.createdAt,
                        StoryTasks.updatedAt,
                        StoryTasks.startDate,
                        StoryTasks.estimatedHours,
                        StoryTasks.priority,
                        StoryTasks.completionDate,
                        StoryTasks.tester,
                        StoryTasks.reOpened,
                        StoryTasks.onHold,
                        StoryTasks.projectTaskNumber,
                        StoryTasks.actualHours,
                        StoryTasks.testingDueDate,
                        StoryTasks.testingStartDate,
                        StoryTasks.testingDescription,
                        StoryTasks.testingEstimatedHours,
                        StoryTasks.testingActualHours,
                        StoryTasks.category,
                        StoryTasks.extraHours,
                        StoryTasks.totalHoursSpent,
                        StoryTasks.testCaseData,
                        StoryTasks.actualStartDate,
                        StoryTasks.actualDueDate,
                        StoryTasks.updatedBy,
                        StoryTasks.createdBy,
                        StoryTasks.fileName,
                        StoryTasks.estimatedCost,
                        StoryTasks.actualCost,
                        StoryTasks.isActive,
                        StoryTasks.createType,
                        StoryTasks.feasibilityReason,
                        StoryTasks.feasibilityStatus
                       
                    FROM
                        Projects
                    INNER JOIN
                        StoryTasks ON Projects.projectId = StoryTasks.projectId
                    LEFT JOIN
                        Stories ON StoryTasks.storyId = Stories.id
                    LEFT JOIN
                        Epics ON Stories.epicId = Epics.id
                    INNER JOIN
                        columnBoards ON StoryTasks.columnId = columnBoards.columnId
                    WHERE
                        Projects.projectId IN (
                            SELECT DISTINCT projectId
                            FROM ProjectMembers
                            WHERE employeeId = :employeeId
                        )
                        AND StoryTasks.isActive = 1
                        AND StoryTasks.createType = 'ticket'
                    ORDER BY
                        StoryTasks.createdAt DESC
                    LIMIT 50 OFFSET :offset;`;

                const epicManagerQuery = `
                    SELECT DISTINCT
                        Projects.projectId,
                        Projects.projectName,
                        Epics.name as epic,
                        Epics.id as id,
                        Stories.id as storyId,
                        Stories.name as story,
                        StoryTasks.taskId,
                        StoryTasks.taskName,
                        StoryTasks.assignee,
                        StoryTasks.assignor,
                        StoryTasks.date,
                        StoryTasks.organisationId,
                        StoryTasks.columnId,
                        columnBoards.columnName as status,
                        StoryTasks.taskType,
                        StoryTasks.order,
                        StoryTasks.description,
                        StoryTasks.reporter,
                        StoryTasks.dueDate,
                        StoryTasks.createdAt,
                        StoryTasks.updatedAt,
                        StoryTasks.startDate,
                        StoryTasks.estimatedHours,
                        StoryTasks.priority,
                        StoryTasks.completionDate,
                        StoryTasks.tester,
                        StoryTasks.reOpened,
                        StoryTasks.onHold,
                        StoryTasks.projectTaskNumber,
                        StoryTasks.actualHours,
                        StoryTasks.testingDueDate,
                        StoryTasks.testingStartDate,
                        StoryTasks.testingDescription,
                        StoryTasks.testingEstimatedHours,
                        StoryTasks.testingActualHours,
                        StoryTasks.category,
                        StoryTasks.extraHours,
                        StoryTasks.totalHoursSpent,
                        StoryTasks.testCaseData,
                        StoryTasks.actualStartDate,
                        StoryTasks.actualDueDate,
                        StoryTasks.updatedBy,
                        StoryTasks.createdBy,
                        StoryTasks.fileName,
                        StoryTasks.estimatedCost,
                        StoryTasks.actualCost,
                        StoryTasks.isActive,
                        StoryTasks.createType,
                        StoryTasks.feasibilityReason,
                        StoryTasks.feasibilityStatus
                       
                    FROM
                        Projects
                    INNER JOIN
                        StoryTasks ON Projects.projectId = StoryTasks.projectId
                    LEFT JOIN
                        Stories ON StoryTasks.storyId = Stories.id
                    LEFT JOIN
                        Epics ON Stories.epicId = Epics.id
                    INNER JOIN
                        columnBoards ON StoryTasks.columnId = columnBoards.columnId
                    WHERE
                        JSON_CONTAINS(CAST(Epics.epicManager AS JSON), :employeeId, '$')
                        AND StoryTasks.isActive = 1
                        AND StoryTasks.createType = 'ticket'
                    ORDER BY
                        StoryTasks.createdAt DESC
                    LIMIT 50 OFFSET :offset;`;

                const projectManagerData = await sequelize.query(projectManagerQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { employeeId, offset }
                });

                const epicManagerData = await sequelize.query(epicManagerQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { employeeId, offset }
                });

                const combinedData = [...projectManagerData, ...epicManagerData];
                const uniqueArray = Array.from(new Set(combinedData.map(JSON.stringify))).map(JSON.parse);

                const totalCountQuery = `
                SELECT COUNT(*) AS totalTasks
                FROM Projects
                INNER JOIN StoryTasks ON Projects.projectId = StoryTasks.projectId
                LEFT JOIN Stories ON StoryTasks.storyId = Stories.id
                LEFT JOIN Epics ON Stories.epicId = Epics.id
                INNER JOIN columnBoards ON StoryTasks.columnId = columnBoards.columnId
                WHERE Projects.organisationId = :organisationId
                AND StoryTasks.isActive = 1
                AND StoryTasks.createType = 'ticket';`;

                const totalCountResult = await sequelize.query(totalCountQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { organisationId: employeeData[0].organisationId }
                });

                const ticketCount = totalCountResult[0].totalTasks;


                return res.send({ uniqueArray, ticketCount });


            } else {
                const managerQuery = `
                SELECT DISTINCT
                    Projects.projectId,
                    Projects.projectName,
                    Projects.projectStatus,
                    StoryTasks.*
                FROM
                    Projects
                INNER JOIN ProjectMembers ON Projects.projectId = ProjectMembers.projectId
                INNER JOIN StoryTasks ON Projects.projectId = StoryTasks.projectId
                WHERE
                    ProjectMembers.employeeId = :employeeId
                    AND ProjectMembers.type = 'Manager'
                    AND StoryTasks.isActive = 1
                    AND StoryTasks.createType = 'ticket';`;

                const managerData = await sequelize.query(managerQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { employeeId }
                });
                const employeeQuery = `
            SELECT
                Projects.projectId,
                Projects.projectName,
                Members.employeeId,
                Members.billable,
                Members.type,
                Members.id,
                StoryTaskHours.totalHours
            FROM
                Projects
                INNER JOIN (
                    SELECT DISTINCT
                        projectId,
                        employeeId,
                        billable,
                        type,
                        id
                    FROM
                        ProjectMembers
                    WHERE
                        employeeId = :employeeId
                ) as Members
                ON Projects.projectId = Members.projectId
                INNER JOIN (
                    SELECT
                        projectId,
                        SUM(estimatedHours) as totalHours
                    FROM
                        StoryTasks
                    WHERE
                        isActive = 1
                        AND createType = 'ticket'
                        AND reporter = :employeeId
                    GROUP BY
                        projectId
                ) as StoryTaskHours
                ON Projects.projectId = StoryTaskHours.projectId
            WHERE
                Projects.projectStatus IN ('Ongoing', 'Upcoming')
            ORDER BY
                Projects.projectName;
        `;


                const detailedData = await sequelize.query(employeeQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { employeeId, offset }
                });
                console.log(detailedData);
                const epicManagerQuery = `
                    SELECT DISTINCT
                        Projects.projectId,
                        Projects.projectName,
                        Epics.name as epic,
                        Epics.id as id,
                        Stories.id as storyId,
                        Stories.name as story,
                        StoryTasks.taskId,
                        StoryTasks.taskName,
                        StoryTasks.assignee,
                        StoryTasks.assignor,
                        StoryTasks.date,
                        StoryTasks.organisationId,
                        StoryTasks.columnId,
                        columnBoards.columnName as status,
                        StoryTasks.taskType,
                        StoryTasks.order,
                        StoryTasks.description,
                        StoryTasks.reporter,
                        StoryTasks.dueDate,
                        StoryTasks.createdAt,
                        StoryTasks.updatedAt,
                        StoryTasks.startDate,
                        StoryTasks.estimatedHours,
                        StoryTasks.priority,
                        StoryTasks.completionDate,
                        StoryTasks.tester,
                        StoryTasks.reOpened,
                        StoryTasks.onHold,
                        StoryTasks.projectTaskNumber,
                        StoryTasks.actualHours,
                        StoryTasks.testingDueDate,
                        StoryTasks.testingStartDate,
                        StoryTasks.testingDescription,
                        StoryTasks.testingEstimatedHours,
                        StoryTasks.testingActualHours,
                        StoryTasks.category,
                        StoryTasks.extraHours,
                        StoryTasks.totalHoursSpent,
                        StoryTasks.testCaseData,
                        StoryTasks.actualStartDate,
                        StoryTasks.actualDueDate,
                        StoryTasks.updatedBy,
                        StoryTasks.createdBy,
                        StoryTasks.fileName,
                        StoryTasks.estimatedCost,
                        StoryTasks.actualCost,
                        StoryTasks.isActive,
                        StoryTasks.createType,
                        StoryTasks.feasibilityReason,
                        StoryTasks.feasibilityStatus
                       
                    FROM
                        Projects
                    INNER JOIN
                        StoryTasks ON Projects.projectId = StoryTasks.projectId
                    LEFT JOIN
                        Stories ON StoryTasks.storyId = Stories.id
                    LEFT JOIN
                        Epics ON Stories.epicId = Epics.id
                    INNER JOIN
                        columnBoards ON StoryTasks.columnId = columnBoards.columnId
                    WHERE
                        JSON_CONTAINS(CAST(Epics.epicManager AS JSON), :employeeId, '$')
                        AND StoryTasks.isActive = 1
                        AND StoryTasks.createType = 'ticket'
                    ORDER BY
                        StoryTasks.createdAt DESC
                    LIMIT 50 OFFSET :offset;`;
                const epicManagerData = await sequelize.query(epicManagerQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { employeeId, offset }
                });
                const combinedData = [...detailedData, ...epicManagerData, ...managerData];
                const uniqueArray = Array.from(new Set(combinedData.map(JSON.stringify))).map(JSON.parse);

                const totalCountQuery = `
                    SELECT COUNT(*) AS totalTasks
                    FROM Projects
                    INNER JOIN StoryTasks ON Projects.projectId = StoryTasks.projectId
                    LEFT JOIN Stories ON StoryTasks.storyId = Stories.id
                    LEFT JOIN Epics ON Stories.epicId = Epics.id
                    INNER JOIN columnBoards ON StoryTasks.columnId = columnBoards.columnId
                    WHERE Projects.organisationId = :organisationId
                    AND StoryTasks.isActive = 1
                    AND StoryTasks.createType = 'ticket';`;

                const totalCountResult = await sequelize.query(totalCountQuery, {
                    type: Sequelize.QueryTypes.SELECT,
                    replacements: { organisationId: employeeData[0].organisationId }
                });

                const ticketCount = totalCountResult[0].totalTasks;


                return res.send({ uniqueArray, ticketCount });

            }

        } catch (err) {
            console.error("Error retrieving detailed projects:", err);
            res.status(400).send({ error: err.message });
        }
    });

    apiRoutes.post('/filterTasksForEpicManager', async function (req, res) {
        try {

            if (!req.body.createdAt || !req.body.updatedAt) {
                if (req.body.reporter) {
                    let filteredTasks = await sequelize.query(`
                        SELECT  
                            d.projectId,
                            d.projectName,
                            c.name AS epic, 
                            b.name AS story,
                            a.taskId,
                            a.taskName,
                            a.columnId,
                            a.description,
                            a.reporter,
                            a.assignee,
                            a.createdAt,
                            a.updatedAt,
                            a.fileName,
                            e.columnName AS status
                        FROM 
                            StoryTasks a, 
                            Stories b, 
                            Epics c, 
                            Projects d,
                            columnBoards e
                        WHERE 
                            a.storyId = b.id 
                            AND b.epicId = c.id 
                            AND c.projectId = d.projectId 
                            AND a.columnId = e.columnId 
                            AND a.reporter = :reporter
                        ORDER BY 
                            a.createdAt DESC;
                    `, {
                        replacements: {
                            reporter: req.body.reporter
                        },
                        type: Sequelize.QueryTypes.SELECT
                    });


                    return res.status(200).send({ status: 200, message: 'Filtered data is successful.', tasks: filteredTasks });
                } else {

                    return res.status(400).send({ status: 400, message: 'Please provide either both createdAt and updatedAt dates or a reporter.' });
                }
            }

            let filteredTasks = await sequelize.query(`
                SELECT  
                    d.projectId,
                    d.projectName,
                    c.name AS epic, 
                    b.name AS story,
                    a.taskId,
                    a.taskName,
                    a.columnId,
                    a.description,
                    a.reporter,
                    a.assignee,
                    a.createdAt,
                    a.updatedAt,
                    a.fileName,
                    e.columnName AS status
                FROM 
                    StoryTasks a, 
                    Stories b, 
                    Epics c, 
                    Projects d,
                    columnBoards e
                WHERE 
                    a.storyId = b.id 
                    AND b.epicId = c.id 
                    AND c.projectId = d.projectId 
                    AND a.columnId = e.columnId 
                    AND (a.createdAt BETWEEN :createdAt AND :updatedAt
                    AND a.updatedAt BETWEEN :createdAt AND :updatedAt)
                ORDER BY 
                    a.createdAt DESC;
            `, {
                replacements: {
                    createdAt: req.body.createdAt,
                    updatedAt: req.body.updatedAt
                },
                type: Sequelize.QueryTypes.SELECT
            });


            res.status(200).send({ status: 200, message: 'Filtered data is successful.', tasks: filteredTasks });
        } catch (e) {
            console.log(e);
            res.status(400).send(e);
        }
    });


    ///////////////////////////////// 

    apiRoutes.post('/getCreatedProjects', async function (req, res) {
        try {
            const employeeId = req.body.employeeId;
            const query = `
                SELECT
                    Projects.projectId,
                    Projects.projectName,
                    Members.employeeId,
                    Members.billable,
                    Members.type,
                    Members.id,
                    StoryTaskHours.totalHours
                FROM
                    Projects
                    INNER JOIN (
                        SELECT DISTINCT
                            projectId,
                            employeeId,
                            billable,
                            type,
                            id
                        FROM
                            ProjectMembers
                        WHERE
                            employeeId = :employeeId
                    ) as Members
                    ON Projects.projectId = Members.projectId
                    INNER JOIN (
                        SELECT
                            projectId,
                            SUM(estimatedHours) as totalHours
                        FROM
                            StoryTasks
                        WHERE
                            isActive = 1
                            AND createType = 'ticket'
                            AND reporter = :employeeId
                        GROUP BY
                            projectId
                    ) as StoryTaskHours
                    ON Projects.projectId = StoryTaskHours.projectId
                WHERE
                    Projects.projectStatus IN ('Ongoing', 'Upcoming')
                ORDER BY
                    Projects.projectName;
            `;
            const projects = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements: { employeeId }
            });
            res.send(projects);
        } catch (err) {
            res.status(400).send({ error: err.message });
        }
    })

    apiRoutes.post('/getTaskComments', async function (req, res) {
        sequelize.query(`select a.taskCommentId,a.taskComment,a.createdAt,a.employeeId,a.taskId,a.organisationId,b.firstName,b.lastName from TaskComments a, Employees b where a.employeeId = b.employeeId and a.organisationId = ${req.body.user_organisationId} and a.taskId = ${req.body.taskId} order by a.createdAt desc`,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(result => {
                res.status(200).send(result)
            }, error => {
                res.status(400).send(error)
            })
    })

    apiRoutes.post('/addTaskComments', async function (req, res) {
        await taskComment.create(req.body).then(async result => {
            await StoryTasks.update({ description: req.body.taskComment }, {
                where: { taskId: req.body.taskId }
            }).then(res => {
            }, error => {
                res.status(400).send(error)
            })
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.get('/downloadProjectExcel', async function (req, res) {
        let query = `
        SELECT distinct
        s.projectTaskNumber as 'Task_ID',
        Epics.name as 'Epic_Name',
        Stories.name as 'User_Story',
        Stories.epicId as 'epicId',
        s.taskName as 'Task_Name',
        e.firstName as 'Assigned To', 
        c.columnName as 'Status',
        s.estimatedHours as 'Estimated_Hours',
        s.actualHours as 'Actual_Hours',
        s.startDate as 'Planned_Start_Date',
        s.dueDate as 'Planned_End_Date',
        s.description as 'Comments',
        CASE WHEN s.taskType = 0 THEN 'New_Feature'
        WHEN  s.taskType = 1 THEN 'BUG'
        END AS 'Task Type',
        CASE WHEN s.priority = 0 THEN 'LOW'
        WHEN s.priority = 1 THEN 'MEDIUM'
        WHEN s.priority = 2 THEN 'HIGH'
        WHEN s.priority = 3 THEN 'ON HOLD'
        END as 'Priority',
        CAST(s.completionDate AS DATE) as 'Completed_Date'
        FROM Employees as e
        RIGHT JOIN StoryTasks as s ON e.employeeId = s.assignee
        JOIN columnBoards as c ON s.columnId = c.columnId
        JOIN Stories ON Stories.id = s.storyId
        JOIN Epics ON Epics.id = Stories.epicId
        WHERE s.projectId = '${req.query.projectId}' ORDER BY epicId ASC`;
        // //console.log(query)
        sequelize.query(query,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {

                let newArray = []

                // //console.log(resp)

                resp.forEach(line => {
                    delete line.epicId;
                })
                // resp.forEach(async(v,i)=>{
                //     let newDate
                //     if(v.Completed_Date != null){
                //         let newd = new Date(v.Completed_Date)
                //         let day = newd.getDate()
                //         let month = newd.getMonth() + 1
                //         let year = newd.getFullYear()
                //         //console.log(v,day, month, year)
                //         newDate =  `"${day}-${month}-${year}"`
                //     }

                //     //console.log(newDate)
                //     newArray.push({"Task_Id":v.Task_Id, "Epic_Name":v.Epic_Name, "User_Story":v.User_Story, "Task_Name":v.Task_Name,"Status":v.Status, "Estimated_Hours":v.Estimated_Hours, "Actual_Hours":v.Actual_Hours, "Planned_Start_Date":v.Planned_Start_Date, "Planned_End_Date":v.Planned_End_Date, "Comments":v.Comments, " Priority":v.Priority, "Completed_Date":newDate})
                // })
                Project.findOne({ where: { projectId: req.query.projectId, organisationId: req.body.user_organisationId } }).then(p => {
                    let fileName = p.projectName + '.xlsx';
                    res.xls(fileName, resp);
                })
            }, err => {
                //console.log(err)
                res.status(400).send(err)
            })
    })

    // apiRoutes.post('/addProjectMember', async function (req, res) {
    //     let projectId = req.body.projectId
    //     await Project.findAll({ where: { projectId: projectId } }).then(result => {
    //         let projectName = result[0].projectName
    //         ProjectMembers.create(req.body)
    //         res.status(200).send({ "msg": "Team Added" })
    //     }, error => {
    //         res.status(400).send({ "msg": "Server Error" })
    //     })
    // })

    apiRoutes.post('/addProjectMember', async function (req, res) {
        // let projectId = req.body.projectId
        await ProjectMembers.create(req.body).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/updateProjectMember', async function (req, res) {
        // let projectId = req.body.projectId
        await ProjectMembers.update(req.body, {
            where: {
                id: req.body.memberId
            }
        }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/removeProjectMember', async function (req, res) {
        let employeeId = parseInt(req.body.employeeId);
        let projectId = parseInt(req.body.projectId);
        await ProjectMembers.destroy({ where: { employeeId, projectId } }).then(result => {
            res.status(200).send({ success: true })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/fetchTeamColumns', async function (req, res) {
        await ColumnBoard.findAll({ where: { teamId: req.body.teamId, organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/createTask', async function (req, res) {

        // const count = await User.Tasks({
        //     where: { projectId: req.body.projectId }
        //   });

        //   req.body.projectTaskNumber = count + 1;

        Tasks.create(req.body).then(resp => {
            let employeeId = req.body.employeeId
            let taskName = req.body.taskName
            let event = "Create Task"
            logs.createTask(employeeId, taskName, event, req.body.user_organisationId)
            res.status(200).send(resp)
        }, err => {
            res.status(400).send(err)
        })
    })

    apiRoutes.post('/updateTask', async function (req, res) {
        if (req.body.status == 2) {
            //console.log("294")
            sequelize.query(`SELECT b.officialEmail,a.organisationId, a.employeeId, b.firstName, b.lastName, a.taskName, a.date, a.projectName FROM Tasks a , Employees b WHERE a.taskId = ${req.body.taskId} AND a.employeeId = b.employeeId`,
                { type: Sequelize.QueryTypes.SELECT }).then(resp => {
                    Notification.create({
                        "employeeId": resp[0].employeeId,
                        "taskId": req.body.taskId,
                        "date": resp[0].date,
                        "organisationId": resp[0].organisationId,
                        "notification": `Your DSR is Rejected by you respective Manager. Task Name - ${resp[0].taskName}`
                    })
                    Tasks.update(req.body, { where: { taskId: req.body.taskId } })
                    // logs.createTask(employeeId, taskName, event)
                    let email2 = `${resp[0].officialEmail}`
                    let subject = "DSR Notification"
                    let message = `Hello ${resp[0].firstName} ${resp[0].lastName}<br><br> Your DSR is Rejected By your Respective manager, Kindly Check the Details and Resubmit Your Rejected DSR.<br><br> 
                    Project Name : ${resp[0].projectName}<br>Task Name : ${resp[0].taskName}<br> Date : ${resp[0].date}`
                    mailer(transporter, email2, subject, message)
                    //console.log(req.body.status)
                    res.status(200).send(resp)
                }, error => {
                    res.status(400).send(error)
                })
        } else {
            //console.log("319")
            await Tasks.update(req.body, { where: { taskId: req.body.taskId, organisationId: req.body.user_organisationId } }).then(async result => {
                // let employeeId = req.body.employeeId
                // let taskName = req.body.taskName
                // let event = "Update Task"
                // logs.createTask(employeeId, taskName, event)
                // let tasksDetails = await Tasks.findAll({where:{projectId:req.body.projectId, taskId: req.body.taskId}})
                // let sum = 0
                // for(i=0; i<tasksDetails.length;i++){
                //     sum+=tasksDetails[i].hours
                // }
                // await StoryTasks.update({
                //     "totalHoursSpent":sum
                // },{
                //     where:{taskId:req.body.projectTaskId}
                // })
                // //console.log("324",tasksDetails)
                res.status(200).send(result)
                //console.log("218", result)
            }, error => {
                res.status(400).send(error)
            })
        }
    })

    apiRoutes.post('/deleteTask', async function (req, res) {
        let data = await Tasks.findOne({ where: { taskId: req.body.taskId, organisationId: req.body.user_organisationId } })
        let employeeId = data.employeeId
        let taskName = data.taskName
        let event = "Delete Task"
        logs.createTask(employeeId, taskName, event, req.body.user_organisationId)
        await Tasks.destroy({ where: { taskId: req.body.taskId } }).then(result => {
            res.status(200).send({ status: true })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getUserTasks', async function (req, res) {
        await Tasks.findAll({
            where: { columnId: req.body.columnId, teamId: req.body.teamId, employeeId: req.body.employeeId, date: req.body.date, organisationId: req.body.user_organisationId }, order: [
                ['order', 'ASC'],
            ]
        }).then(result => {
            //console.log("350")
            //console.log(result)
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/taskTypeFilter', async function (req, res) {
        //     let employeeId = req.body.employeeId
        //     let data = []
        //     for (i = 0; i < employeeId.length; i++) {
        //         await sequelize.query(`SELECT * FROM Tasks INNER JOIN Employees
        // ON Tasks.employeeId = Employees.employeeId AND Tasks.employeeId = ${employeeId[i]} AND Tasks.projectId = ${req.body.projectId} AND (date BETWEEN '${req.body.from}' AND '${req.body.to}')`,
        //             {
        //                 type: Sequelize.QueryTypes.SELECT
        //             }).then(resp => {
        //                 let billablehours = 0
        //                 let nonbillable = 0
        //                 let employeeName
        //                 resp.forEach(async (v, i) => {
        //                     employeeName = v.firstName + ' ' + v.lastName
        //                     if (v.billable == 1) {
        //                         billablehours = v.hours + billablehours
        //                     }
        //                     if (v.billable == 0) {
        //                         nonbillable = v.hours + nonbillable
        //                     }
        //                 })
        //                 //console.log("181", billablehours, nonbillable)
        //                 data.push({ employeeId: employeeId[i], employeeName: employeeName, "billable": billablehours, "nonBillable": nonbillable})
        //})
        //}

        let employeeId = req.body.employeeId
        let projectId = req.body.projectId
        let data = []
        if (employeeId.length > 0) {
            employeeId.forEach(emp => {
                data.push({ employeeId: emp, billable: 0, nonBillable: 0 })
            })
            sequelize.query(`SELECT Employees.employeeId, Employees.firstName, Employees.lastName, Tasks.hours, Tasks.billable FROM Tasks INNER JOIN Employees
        ON Tasks.employeeId = Employees.employeeId AND Tasks.employeeId IN (${employeeId.join(',')}) AND Tasks.projectId = ${projectId} AND (Tasks.date BETWEEN '${req.body.from}' AND '${req.body.to}')`,
                { type: Sequelize.QueryTypes.SELECT }).then(resp => {
                    resp.forEach(async (r, i) => {
                        //console.log("r ", r);
                        let fData = (data.filter(emp => emp.employeeId == r.employeeId))[0];
                        //console.log(fData);
                        if (r.billable == 1) {
                            fData.billable += r.hours
                        }
                        if (r.billable == 0) {
                            fData.nonBillable += r.hours
                        }
                    })
                    res.send(data)
                })
        } else {
            res.send([])
        }
    })

    apiRoutes.post('/filterByTeam', async function (req, res) {
        let employeeId = req.body.employeeId
        let data = []
        if (employeeId.length > 0) {
            employeeId.forEach(emp => {
                data.push({ employeeId: emp, billable: 0, nonBillable: 0, firstName: '', lastName: '' })
            })
            sequelize.query(`SELECT Employees.employeeId, Employees.firstName, Employees.lastName, Employees.imageExists, Tasks.hours, Tasks.billable FROM Tasks INNER JOIN Employees
        ON Tasks.employeeId = Employees.employeeId AND Tasks.employeeId IN (${employeeId.join(',')}) AND (Tasks.date BETWEEN '${req.body.from}' AND '${req.body.to}')`,
                { type: Sequelize.QueryTypes.SELECT }).then(resp => {
                    resp.forEach(async (r, i) => {
                        //console.log("r ", r);
                        let fData = (data.filter(emp => emp.employeeId == r.employeeId))[0];
                        fData.firstName = r.firstName
                        fData.lastName = r.lastName
                        fData.imageExists = r.imageExists
                        //console.log(fData);
                        if (r.billable == 1) {
                            fData.billable += r.hours
                        }
                        if (r.billable == 0) {
                            fData.nonBillable += r.hours
                        }
                    })
                    res.send(data)
                })
        } else {
            res.send([])
        }
    })

    apiRoutes.post('/getMemberProjects', async function (req, res) {
        let query = `SELECT Projects.projectId, Projects.projectId, Members.employeeId, Members.billable, Members.type, Members.id, Projects.projectName, (SELECT SUM(estimatedHours) FROM StoryTasks WHERE projectId=Projects.projectId AND status=1 AND isActive = 1) as totalHours
        from Projects inner join (select distinct projectId, employeeId, billable, type, id from ProjectMembers where employeeId = '${req.body.employeeId}') as Members where Projects.projectId = Members.projectId AND (Projects.projectStatus = 'Ongoing' OR Projects.projectStatus = 'Upcoming') order by Projects.projectName`
        sequelize.query(query,
            {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.send(resp)
            }, err => {
                res.status(400).send(err)
            })
    })
    apiRoutes.post('/getMemberProjectsNumber', async function (req, res) {
        try {
            // Query to find if the user is an admin
            const adminCheckQuery = `
                SELECT Employees.organisationId, GROUP_CONCAT(userGroups.groupName) AS groupNames
                FROM Employees
                INNER JOIN userGroups ON JSON_CONTAINS(CAST(Employees.userGroup AS JSON), CAST(userGroups.userGroupId AS CHAR))
                WHERE Employees.employeeId = ${req.body.employeeId}
                GROUP BY Employees.organisationId
            `;
            const employeeData = await sequelize.query(adminCheckQuery, { type: Sequelize.QueryTypes.SELECT });

            // Extract organisationId and groupNames from the result
            const organisationId = employeeData[0].organisationId;
            const groups = employeeData[0].groupNames.split(',');

            // Check if the user is admin based on their groups
            const isAdmin = groups.includes("Admin") || groups.includes("admin");

            let query;

            if (isAdmin) {
                // If user is admin, fetch projects for their organization only
                query = `SELECT Projects.projectId, Projects.projectId, Members.employeeId, Members.billable, Members.type, Members.id, Projects.projectName, 
                    (SELECT SUM(estimatedHours) FROM StoryTasks WHERE projectId=Projects.projectId AND status=1 AND isActive = 1) as totalHours
                    FROM Projects 
                    INNER JOIN (SELECT DISTINCT projectId, employeeId, billable, type, id FROM ProjectMembers) AS Members 
                    ON Projects.projectId = Members.projectId 
                    WHERE Projects.organisationId = '${organisationId}' 
                    AND (Projects.projectStatus = 'Ongoing' OR Projects.projectStatus = 'Upcoming') 
                    ORDER BY Projects.projectName`;
            } else {
                // If user is not admin, fetch projects for the specific employee
                query = `SELECT Projects.projectId, Projects.projectId, Members.employeeId, Members.billable, Members.type, Members.id, Projects.projectName, 
                    (SELECT SUM(estimatedHours) FROM StoryTasks WHERE projectId=Projects.projectId AND status=1 AND isActive = 1) as totalHours
                    FROM Projects 
                    INNER JOIN (SELECT DISTINCT projectId, employeeId, billable, type, id FROM ProjectMembers WHERE employeeId = '${req.body.employeeId}') AS Members 
                    ON Projects.projectId = Members.projectId 
                    WHERE (Projects.projectStatus = 'Ongoing' OR Projects.projectStatus = 'Upcoming') 
                    ORDER BY Projects.projectName`;
            }

            // Execute the query to fetch projects
            const projects = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });

            // Send the projects in the response
            res.send(projects);
        } catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    });




    apiRoutes.post('/createEpic', async function (req, res) {
        await Epic.create(req.body).then(resp => {
            res.status(200).send(resp)
            let response = { ...req.body, ...resp }
            io.emit('createEpic', response)
        }, err => {
            res.status(400).send(err)
        })
    })

    apiRoutes.post('/epicUpdate', async function (req, res) {
        console.log("Request:", req.body);
        await Epic.update(req.body, { where: { id: req.body.id } }).then(result => {
            io.emit('epicUpdate', req.body);
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/deleteEpic', async function (req, res) {
        // console.log(req.body);
        await Epic.destroy({ where: { id: req.body.id, organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send({ status: true })
        }, error => {
            console.log(error);
            res.status(400).send(error)
        })
    })
    apiRoutes.post('/createStory', async function (req, res) {
        console.log(req.body);
        await Story.create(req.body).then(resp => {
            let response = { ...req.body, ...resp }
            res.status(200).send(resp)
            io.emit('createStory', response)
        }, err => {
            console.log(err);
            res.status(400).send(err)
        })
    })

    apiRoutes.post('/getProjectEpics', async function (req, res) {
        try {
            const epics = await Epic.findAll({ where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId } });

            // Map over the epics array to add the 'epicId' key
            const modifiedEpics = epics.map(epic => ({
                ...epic.toJSON(), // Spread the existing object properties
                epicId: epic.id, // Add the 'epicId' key with the same value as 'id'
            }));

            res.status(200).send(modifiedEpics);
        } catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    });


    apiRoutes.post('/getAllRecordsOfProject', async (req, res) => {
        try {
            // console.log(req.body.projectId);
            const epics = await sequelize.query(`SELECT
            e.*,
            s.*,
            st.*
            FROM
                Epics e
            JOIN
                Stories s ON e.id = s.epicId
            JOIN
                StoryTasks st ON s.id = st.storyId
            WHERE
                e.projectId = ${req.body.projectId}
            AND
                e.organisationId = ${req.body.organisationId}`, {
                type: Sequelize.QueryTypes.SELECT
            })
            res.status(200).send({ epics })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    apiRoutes.post('/getAllRecordsOfProject1', async (req, res) => {
        Project.hasMany(Epic, { foreignKey: 'projectId' });
        Epic.belongsTo(Project, { foreignKey: 'projectId' });

        Epic.hasMany(Story, { foreignKey: 'epicId' });
        Story.belongsTo(Epic, { foreignKey: 'epicId' });

        Story.hasMany(StoryTasks, { foreignKey: 'storyId' });
        StoryTasks.belongsTo(Story, { foreignKey: 'storyId' });
        try {

            const epics = await Epic.findAll({
                where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId },
                include: [
                    {
                        model: Story,
                        include: [
                            {
                                model: StoryTasks,
                            },
                        ],
                    },
                ],
            });

            res.status(200).send({ epics })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    apiRoutes.post('/getProjectData', async (req, res) => {
        try {
            const data = await sequelize.query(
                `SELECT * FROM ProjectData 
                 WHERE epic_projectId = :projectId 
                 AND epic_organisationId = :organisationId
                 AND (storyTask_feasibilityStatus = 'Feasible' OR storyTask_feasibilityStatus IS NULL)
                 ORDER BY storyTask_createdAt DESC;`,
                {
                    replacements: {
                        projectId: req.body.projectId,
                        organisationId: req.body.organisationId
                    },
                    type: Sequelize.QueryTypes.SELECT
                }
            );
            res.status(200).json(data);
        } catch (error) {
            console.error("Error:", error);
            res.status(400).send(error);
        }
    });


    apiRoutes.post('/createStoryTask', upload.single('file'), async function (req, res) {

        if (!req.body.taskId) {

            if (req.body.permissionName === 'UserTickets') {
                req.body.createType = 'ticket',
                    req.body.feasibilityStatus = 'Pending'
            }
            let data = req.file;
            console.log(req.body);

            if (data) {
                req.body.fileName = data.filename;
            }
            let count = await sequelize.query(`SELECT MAX(projectTaskNumber) AS projectTaskNumber 
            FROM StoryTasks 
            WHERE isActive = 1 
              AND projectId = ${req.body.projectId} 
              AND (feasibilityStatus = 'Pending' OR feasibilityStatus = 'Feasible');`, {
                type: Sequelize.QueryTypes.SELECT
            });
            req.body["projectTaskNumber"] = count[0].projectTaskNumber + 1;
            try {
                const result = await StoryTasks.create(req.body);
                let res1 = { ...result.dataValues, ...req.body };
                res.status(200).send({ result });
                io.emit('createStoryTask', res1);
            } catch (error) {
                console.log(error);
                res.status(400).send({ error });
            }
        }
        else {
            console.log(req.body);
            StoryTasks.update(req.body, { where: { taskId: req.body.taskId } })
                .then(data => {
                    res.status(200).send({ data })
                        , err => {
                            res.status(400).send({ err });
                        }
                })
        }
    });

    apiRoutes.post('/storyUpdate', async function (req, res) {
        await Story.update(req.body, { where: { id: req.body.id } }).then(result => {
            io.emit('storyUpdate', req.body);
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/deleteStory', async function (req, res) {
        await Story.destroy({ where: { id: req.body.id } }).then(result => {
            res.status(200).send({ status: true })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getStories', async function (req, res) {
        try {
            let stories = await Story.findAll({
                where: { epicId: req.body.epicId, organisationId: req.body.user_organisationId }
            });

            // Adding the "storyId" key with the same value as "id"
            stories = stories.map(story => ({ ...story.dataValues, storyId: story.id }));

            res.status(200).send(stories);
        } catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    });


    apiRoutes.post('/regeneratProjectTaskNumbers', async function (req, res) {

        StoryTasks.findAll({
            where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId, isActive: true, feasibilityStatus: 'Feasible' }, order: [
                ['projectTaskNumber', 'ASC'],
            ]
        }).then(result => {
            result.forEach(async (task, index) => {
                await StoryTasks.update({ projectTaskNumber: index + 1 }, { where: { taskId: task.taskId } });
                //console.log("task ", task.taskId, " ", index + 1)
            })
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })

    })

    apiRoutes.post('/getStoryTasks', async function (req, res) {
        await StoryTasks.findAll({
            where: { storyId: req.body.storyId, organisationId: req.body.user_organisationId, isActive: true, feasibilityStatus: 'Feasible' }, order: [
                ['order', 'ASC'],
            ]
        }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
        // sequelize.query(`SELECT e.image, e.firstName, e.lastName, s.taskName, s.status, s.createdAt, s.updatedAt, s.order
        //   FROM Employees as e
        //   INNER JOIN StoryTasks as s
        //   ON e.employeeId = s.assignee AND s.storyId = '${req.body.storyId}' `,
        //     {
        //         type: Sequelize.QueryTypes.SELECT
        //     }).then(resp => {
        //         res.send(resp)
        //     }, err => {
        //         res.status(400).send(err)
        //     })


    })

    apiRoutes.post('/deleteStoryTask', async function (req, res) {
        let storyTaskdata = await StoryTasks.findOne({ where: { taskId: req.body.taskId, isActive: true } });

        let logData = {};
        // Log data
        logData.updatedBy = req.body.employeeIdMiddleware;
        logData.taskId = req.body.taskId;

        logData.updateData = storyTaskdata;
        logData.organisationId = req.body.organisationId;

        // Log the task update
        await taskLog.create(logData);

        StoryTasks.update({ isActive: 0 }, { where: { taskId: req.body.taskId } }).then(result => {
            io.emit('deleteStoryTask', req.body);
            res.status(200).send({ status: true })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/updateProjectTask', async function (req, res) {
        try {
            // Fetch the existing story task data
            let storyTaskdata = await StoryTasks.findOne({ where: { taskId: req.body.taskId, organisationId: req.body.user_organisationId, isActive: true } });


            // Fetch employee data if the assignee is updated
            let employeeData;
            if (req.body.assignee) {
                employeeData = await Employees.findOne({ where: { employeeId: req.body.assignee, organisationId: req.body.user_organisationId } });
            }


            // Fetch the project data
            let projectdata = await Project.findOne({ where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId } });


            // Initialize variables to store task assignee and tester
            let taskAssignee;
            let taskTester;

            if (storyTaskdata && storyTaskdata.assignee) {
                taskAssignee = storyTaskdata.assignee;
            }
            if (storyTaskdata && storyTaskdata.tester) {
                taskTester = storyTaskdata.tester;
            }

            // Update the 'updatedBy' field
            req.body.updatedBy = req.body.employeeIdMiddleware;

            // Initialize objects to store log data and updated data
            let logData = {};
            let updatedData = {};

            // Find the keys of the existing data and the new data
            let oldKeys = Object.keys(storyTaskdata.dataValues).sort();
            let newKeys = Object.keys(req.body).sort();

            // Compare the new data with the existing data to find updated fields
            newKeys.forEach(key => {
                if (storyTaskdata[key] != req.body[key] && req.body[key] != 0 && req.body[key] != null) {
                    updatedData[key] = req.body[key];
                }
            });

            // Log data
            logData.createdBy = storyTaskdata.reporter;
            logData.updatedBy = req.body.employeeIdMiddleware;
            logData.taskId = req.body.taskId;

            // If the assignee is updated
            if (req.body.assignee && taskAssignee != req.body.assignee) {
                // Update the log data
                logData.assignee = req.body.assignee;
                logData.assigner = req.body.employeeIdMiddleware;

                // Create notification for the assignee
                let date = new Date();
                let date1 = ("0" + date.getDate()).slice(-2);
                let month = ("0" + (date.getMonth() + 1)).slice(-2);
                let year = date.getFullYear();
                let newDate = year + "-" + month + "-" + date1;
                let message;

                let email2 = `${employeeData.officialEmail}`
                let subject = `New Task Assigned - ${projectdata.projectName}` // - ${storyTaskdata.taskName}
                // if (req.body.startDate == null || undefined && req.body.dueDate == null || undefined) {
                //     message = `Hello ${employeeData.firstName} ${employeeData.lastName}<br><br> You Have Been Assigned a Task on Project -<b> ${projectdata.projectName}</b>. Task Details are mention below please find.<br><br> <b>Project Name :</b> ${projectdata.projectName}<br><b>Epic Name : </b>${req.body.epicName}<br><b>Story Name :</b> ${req.body.storyName}<br><b>Task Name : </b>${storyTaskdata.taskName}<br> <b>Start Date :</b> Please enter the start date for this task<br><b> End Date : </b> Please enter the due date for this task <br> <b>Estimated Hours :</b> ${req.body.estimatedHours}`
                // } else {
                message = `Hello ${employeeData.firstName} ${employeeData.lastName}<br><br> You Have Been Assigned a Task on Project -<b> ${projectdata.projectName}</b>. Task Details are mention below please find.<br><br> <b>Project Name :</b> ${projectdata.projectName}<br><b>Epic Name : </b>${req.body.epicName}<br><b>Story Name :</b> ${req.body.storyName}<br><b>TaskId : ${req.body.taskId} </br></br>Task Name : </b>${req.body.taskName}<br>`
                // }
                mailer(transporter, email2, subject, message)


                await Notification.create({
                    "employeeId": req.body.assignee,
                    "taskId": req.body.taskId,
                    "taskName": storyTaskdata.taskName,
                    "date": newDate,
                    "organisationId": req.body.organisationId,
                    "notification": `You have been assigned a new task on - ${projectdata.projectName}`
                });
            }

            // Update log data
            logData.updateData = updatedData;
            logData.organisationId = req.body.organisationId;

            // Log the task update
            await taskLog.create(logData);

            // Update the story task
            await StoryTasks.update(req.body, { where: { taskId: req.body.taskId } });

            // If there is a description, create a task comment
            if (req.body.description != null) {
                await taskComment.create({
                    employeeId: req.body.employeeIdMiddleware,
                    organisationId: req.body.organisationId,
                    taskId: req.body.taskId,
                    taskComment: req.body.description,
                    createdAt: new Date().toISOString()
                });
            }


            const calculateCosts = async () => {
                const employeeId = req.body.assignee;

                try {

                    const allEmployeeCostData = await EmployeeCost.findAll();

                    if (allEmployeeCostData && allEmployeeCostData.length > 0) {
                        const startDateMonth = moment(req.body.startDate).format('MMM').toLowerCase();
                        console.log(startDateMonth);

                        const actualStartDateMonth = req.body.actualStartDate ? moment(req.body.actualStartDate).format('MMM').toLowerCase() : startDateMonth; // Get the actual start date month abbreviation in lowercase, use start date month if actual start date is not available


                        const relevantEmployeeData = allEmployeeCostData.filter(employeeCostData => {
                            const matchingEmployeeEntry = employeeCostData.monthFields.find(entry => entry.employeeName == req.body.assignee);
                            return !!matchingEmployeeEntry;
                        });

                        if (relevantEmployeeData && relevantEmployeeData.length > 0) {

                            relevantEmployeeData.forEach(async employeeCostData => {
                                //const matchingEmployeeEntry = employeeCostData.monthFields.find(entry => entry.employeeName == req.body.assignee);
                                const matchingEmployeeEntry = employeeCostData.monthFields.find(entry => entry.employeeName == req.body.assignee);
                                hourlyRate2 = parseFloat(matchingEmployeeEntry[startDateMonth]);
                                console.log(hourlyRate2);
                                const selectedMonthActual = req.body.actualStartDate ? actualStartDateMonth : startDateMonth;
                                const hourlyRate1 = parseFloat(matchingEmployeeEntry[selectedMonthActual]);
                                console.log(`Hourly Rate for Employee ${employeeId} in ${selectedMonthActual}:`, hourlyRate1);


                                let estimatedCost = 0;
                                if (req.body.startDate || req.body.estimatedHours) {
                                    const estimatedHours = req.body.estimatedHours || 0;
                                    estimatedCost = hourlyRate2 * estimatedHours;
                                    console.log(`Estimated Cost for Employee ${employeeId} in ${startDateMonth}:`, estimatedCost);
                                }


                                let actualCost = 0;
                                if (req.body.actualStartDate || req.body.actualHours) {
                                    const actualHours = req.body.actualHours || 0;
                                    actualCost = hourlyRate1 * actualHours;
                                    console.log(`Actual Cost for Employee ${employeeId} in ${selectedMonthActual}:`, actualCost);
                                }


                                await StoryTasks.update(
                                    {
                                        estimatedCost: isNaN(estimatedCost) ? 0 : estimatedCost,
                                        actualCost: isNaN(actualCost) ? 0 : actualCost
                                    },
                                    { where: { taskId: req.body.taskId } }
                                );
                            });
                        } else {
                            console.log(`Employee data not found for the provided employee ID: ${employeeId}`);
                        }
                    } else {
                        console.log('No employee cost data found');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            // Execute the calculateCosts function
            await calculateCosts();

            // Emit event to notify clients
            io.emit('updateProjectTask', req.body);

            res.status(200).send({ msg: "Task updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    });
    apiRoutes.post('/getProjectSummary', async function (req, res) {
        try {
            const projectId = req.body.projectId;
            const organisationId = req.body.organisationId;

            const tasks = await StoryTasks.findAll({
                where: {
                    projectId: projectId,
                    organisationId: organisationId

                }
            });

            let totalEstimatedHours = 0;
            let totalActualHours = 0;
            let totalEstimatedCost = 0;
            let totalActualCost = 0;


            tasks.forEach(task => {
                if (task.estimatedHours) {
                    totalEstimatedHours += parseFloat(task.estimatedHours);
                }
                if (task.actualHours) {
                    totalActualHours += parseFloat(task.actualHours);
                }
                if (task.estimatedCost) {
                    totalEstimatedCost += parseFloat(task.estimatedCost);
                }
                if (task.actualCost) {
                    totalActualCost += parseFloat(task.actualCost);
                }
            });

            totalEstimatedHours = parseFloat(totalEstimatedHours.toFixed(2));
            totalActualHours = parseFloat(totalActualHours.toFixed(2));
            totalEstimatedCost = parseFloat(totalEstimatedCost.toFixed(2));
            totalActualCost = parseFloat(totalActualCost.toFixed(2));


            const projectSummary = {

                Data: ["Total Estimated Hours", "Total Actual Hours", "Total Estimated Cost", "Total Actual Cost"],
                value: [totalEstimatedHours, totalActualHours, totalEstimatedCost, totalActualCost]
            };

            res.status(200).send({

                ...projectSummary
            });
        } catch (error) {
            console.error(error);
            res.status(400).send({ error: "Failed to retrieve project summary" });
        }
    })





    apiRoutes.post('/storystatus', async function (req, res) {
        let epicId = req.body.epicId
        let data = []

        for (i = 0; i < epicId.length; i++) {
            let storyName
            let storyId
            let total0 = 0
            let total1 = 0
            let total2 = 0
            let hours0 = 0
            let hours1 = 0
            let hours2 = 0
            await sequelize.query(`SELECT * FROM Stories a, Tasks b WHERE a.projectId = b.projectId AND a.storyId = b.storyId AND a.epicId = ${epicId[i]} AND b.projectId=${req.body.projectId}`,
                {
                    type: Sequelize.QueryTypes.SELECT
                }).then(resp => {

                    //console.log("loop318", resp)
                    resp.forEach(async (v, i) => {
                        // //console.log(v)
                        storyName = v.storyName
                        storyId = v.storyId
                        if (v.status == 0) {
                            hours0 = hours0 + v.hours
                            total0 = total0 + 1
                        } else if (v.status == 1) {
                            hours1 = hours1 + v.hours
                            total1 = total1 + 1
                        } else if (v.status == 2) {
                            hours2 = hours2 + v.hours
                            total2 = total2 + 1
                        }
                    })
                })
            let statusSum = total0 + total1 + total2
            let average = (statusSum - (total0 + total2)) * 100 / statusSum
            data.push({ "storyId": storyId, "storyName": storyName, "statusPerc": average, "approvedTotalHours": hours1, "rejectedTotalHours": hours2, "approved": total1, "rejected": total2 })
        }
        //console.log(data)
        res.send(data)

    })
    app.post('/addEmployeeCost', async (req, res) => {
        try {
            const { monthFields } = req.body;

            const employeeName = monthFields[0].employeeName;

            const allEmployeeCostData = await EmployeeCost.findAll();

            const existingEntry = allEmployeeCostData.some(costEntry => {
                return costEntry.monthFields.some(entry => entry.employeeName == employeeName);
            });
            if (existingEntry) {

                return res.status(400).json({ error: `Employee cost  already exists` });
            }

            await EmployeeCost.create({
                monthFields: monthFields
            });
            res.status(201).json({ message: "Cost entry added successfully" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });






    app.post('/updateEmployeeCost', async (req, res) => {
        try {
            const { monthFields } = req.body;

            const employeeId = monthFields.employeeId;


            const allEmployeeCostData = await EmployeeCost.findAll();


            const relevantEmployeeEntry = allEmployeeCostData.find(employeeCostData => {

                return employeeCostData.monthFields.some(entry => entry.employeeName == employeeId);
            });


            if (!relevantEmployeeEntry) {
                return res.status(404).json({ error: `Employee cost entry for employeeId ${employeeId} not found` });
            }


            relevantEmployeeEntry.monthFields = relevantEmployeeEntry.monthFields.map(entry => {

                if (entry.employeeName == employeeId) {

                    return {
                        ...entry,
                        jan: monthFields.jan || entry.jan,
                        feb: monthFields.feb || entry.feb,
                        mar: monthFields.mar || entry.mar,
                        apr: monthFields.apr || entry.apr,
                        may: monthFields.may || entry.may,
                        jun: monthFields.jun || entry.jun,
                        jul: monthFields.jul || entry.jul,
                        aug: monthFields.aug || entry.aug,
                        sep: monthFields.sep || entry.sep,
                        oct: monthFields.oct || entry.oct,
                        nov: monthFields.nov || entry.nov,
                        dec: monthFields.dec || entry.dec
                    };
                }
                return entry;
            });


            await relevantEmployeeEntry.save();

            res.status(200).json({ message: 'Employee cost entry updated successfully' });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });



    app.post('/getEmployeeCost', async (req, res) => {
        try {
            // Fetch all employee cost entries from the database
            const allCostEntries = await EmployeeCost.findAll();

            // If there are no cost entries, send an empty array
            if (!allCostEntries || allCostEntries.length === 0) {
                return res.status(404).json({ message: "No cost entries found" });
            }

            // Initialize an array to store the results
            const results = [];

            // Iterate over each cost entry
            for (const costEntry of allCostEntries) {
                const { monthFields } = costEntry;

                // Iterate over each month field for the employee
                for (const monthField of monthFields) {
                    const { employeeName, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = monthField;

                    // Find the corresponding employee by employee ID
                    const employee = await Employees.findOne({
                        where: { employeeId: employeeName }, // Assuming employeeId is the column in Employees table
                        attributes: ['firstName', 'lastName', 'employeeId'] // Fetch firstName and lastName attributes
                    });

                    // If the employee is found, use their name and ID
                    if (employee) {
                        const { firstName, lastName, employeeId } = employee;

                        // Add the employee details along with the cost for each month to the results array
                        results.push({
                            employeeId,
                            employeeName: `${firstName} ${lastName}`,
                            jan,
                            feb,
                            mar,
                            apr,
                            may,
                            jun,
                            jul,
                            aug,
                            sep,
                            oct,
                            nov,
                            dec
                        });
                    }
                }
            }

            // Send the results as JSON response
            res.status(200).json({ results });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });








    apiRoutes.post('/getProjectColumns', async function (req, res) {
        await ColumnBoard.findAll({ where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })


    apiRoutes.post('/filterDsr', async function (req, res) {
        await sequelize.query(`SELECT a.employeeId, a.date, b.firstName, b.lastName ,SUM(a.hours) AS Hours FROM Tasks a, Employees b WHERE a.employeeId = b.employeeId AND a.employeeId IN (${req.body.employeeIds}) AND (MONTH(a.date) = ${parseInt(req.body.month)}) GROUP BY a.employeeId, a.date`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            let data = []
            let ids = []
            resp.forEach(async (v, i) => {
                let employeeId = v.employeeId
                ids.push(employeeId)
            })
            const uniqueId = ids.filter((x, i, a) => a.indexOf(x) == i)
            uniqueId.forEach(async (v, i) => {
                let id = uniqueId[i]
                let name;
                let result = [];
                resp.forEach(async (v, i) => {
                    let employeeId = v.employeeId
                    let hours = v.Hours
                    let date = v.date
                    let dsrStatus
                    if (hours >= 9) {
                        dsrStatus = "Completed"
                    } else if (hours < 9) {
                        dsrStatus = "In-Complete"
                    }
                    if (id == employeeId) {
                        name = v.firstName + ' ' + v.lastName
                        result.push({ "date": date, "dsrStatus": dsrStatus })
                    }
                })
                data.push({ name: name, employeeId: id, result: result })
            })
            res.send(data)
        })
    })

    apiRoutes.post('/createNotes', async function (req, res) {
        await Notes.create(req.body).then(data => {
            res.send(data)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/updateNotes', async function (req, res) {
        await Notes.update(req.body, { where: { NoteId: req.body.NoteId } }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/fetchNotes', async function (req, res) {
        await Notes.findAll({ where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId } }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })
    apiRoutes.post('/deleteNotes', async function (req, res) {
        await Notes.destroy({ where: { NoteId: req.body.id } }).then(resp => {
            res.send({ code: 1, "msg": "Note Deleted" })
        }, error => {
            res.send({ code: 0, error })
        })
    })

    apiRoutes.post('/createSprint', async function (req, res) {
        await Sprint.create(req.body).then(data => {
            res.send(data)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/getActiveSprints', async function (req, res) {
        let date = new Date();
        const where = {
            projectId: req.body.projectId,
            startDate: { [Op.lte]: date },
            [Op.or]: [{ completionDate: null }, { completionDate: { [Op.gte]: date } }],
            organisationId: req.body.user_organisationId
        };
        // //console.log(where)
        await Sprint.findAll({ where }).then(data => {
            res.send(data)
        }, error => {
            res.send(error)
        })
    })
    apiRoutes.post('/getSprintsAccReleaseNumber', async function (req, res) {
        const where = {
            releaseNumber: req.body.releaseNumber,
            organisationId: req.body.user_organisationId
        };
        Sprint.findAll({ where }).then(data => {
            let tasks = [];
            data.forEach(element => {
                tasks.push(...element.tasks);
            })
            if (tasks.length) {
                sequelize.query(`Select distinct st.*,cb.columnName from StoryTasks st join columnBoards cb on st.columnId = cb.columnId where st.taskType = '0' and st.taskId in (${tasks.join(',')})`, {
                    type: Sequelize.QueryTypes.SELECT
                })
                    .then(data => {
                        res.status(200).send(data.flat());
                    }, err => {
                        res.status(400).send(err);
                    })
            }
            else {
                res.status(200).send({ msg: "No Data Found." })
            }

        }, error => {
            res.status(400).send(error);
        })
    })

    apiRoutes.post('/getInactiveSprints', async function (req, res) {
        let date = new Date();
        const where = {
            projectId: req.body.projectId,
            [Op.or]: [{ startDate: null }, { dueDate: null }, { startDate: { [Op.gt]: date } }],
            organisationId: req.body.user_organisationId
        }

        await Sprint.findAll({ where }).then(data => {
            res.send(data)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/getPastSprints', async function (req, res) {
        let date = new Date();
        const where = {
            projectId: req.body.projectId,
            dueDate: { [Op.lt]: date },
            organisationId: req.body.user_organisationId
        }

        await Sprint.findAll({ where, order: [['completionDate', 'DESC']] }).then(data => {
            res.send(data)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/updateSprint', async function (req, res) {
        await Sprint.update(req.body, { where: { sprintId: req.body.sprintId } }).then(data => {
            res.send(data)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.get('/downloadSprint', async function (req, res) {
        await sequelize.query(`select e.sprintName as Sprint_Name, e.sprintGoal as Sprint_Goal, e.startDate as Sprint_Start_Date,
        e.dueDate as Sprint_Due_Date, e.completionDate as Sprint_Completion_Date, g.name as Epic_Name, f.name as Story_Name, a.projectTaskNumber as Project_Task_Number,
        c.projectName as Project_Name, a.taskName as Task_Name, a.estimatedHours as Estimated_Hours, a.actualHours as Actual_Hours,
        a.extraHours as Extra_Hours, a.startDate as Start_Date, a.dueDate as Due_Date, a.completionDate as Completion_Date,
        a.description as Remarks, b.firstName as Assignee_FirstName, b.lastName as Assignee_LastName,
        d.columnName as Status from StoryTasks a, Employees b, Projects c, columnBoards d, Sprints e, Stories f, Epics g
        where a.assignee = b.employeeId and a.projectId = c.projectId and a.storyId = f.id and f.epicId = g.id
        and a.columnId = d.columnId and e.sprintId = ${req.query.sprintId} and a.taskId in (${req.query.tasks})`, {
            // await sequelize.query(`select e.sprintName as Sprint_Name, e.sprintGoal as Sprint_Goal, e.startDate as Sprint_Start_Date, e.dueDate as Sprint_Due_Date, e.completionDate as Sprint_Completion_Date, a.projectTaskNumber as Project_Task_Number, c.projectName as Project_Name, a.taskName as Task_Name, a.estimatedHours as Estimated_Hours, a.actualHours as Actual_Hours, a.extraHours as Extra_Hours, a.startDate as Start_Date, a.dueDate as Due_Date, a.completionDate as Completion_Date,a.description as Remarks, b.firstName as Assignee_FirstName, b.lastName as Assignee_LastName, d.columnName as Status from StoryTasks a, Employees b, Projects c, columnBoards d, Sprints e where a.assignee = b.employeeId and a.projectId = c.projectId and a.columnId = d.columnId and e.sprintId = ${req.query.sprintId} and a.taskId in (${req.query.tasks})`, {
            // ${req.body.sprintId} and a.taskId in (${req.body.tasks})`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            // let fileName = p.projectName + '.xlsx';
            let fileName = 'SprintStatus.xlsx';
            res.xls(fileName, resp);


        })

    })


    apiRoutes.get('/dailyStatus', async function (req, res) {
        // //console.log("hello")
        // let project = await Project.findAll()
        let projects = await sequelize.query(`SELECT a.projectName, a.projectId, b.employeeId, c.firstName, c.lastName, c.officialEmail  FROM Projects a, ProjectMembers b, Employees c WHERE a.projectId = b.projectId AND b.employeeId = c.employeeId AND a.sendDailyStatus=true`, {
            type: Sequelize.QueryTypes.SELECT
        })
        // AND a.projectId = 13
        var groupedProjects = _.mapValues(_.groupBy(projects, 'projectId'),
            clist => clist.map(project => _.omit(project, 'projectId')));

        // //console.log("groupedProjects ",groupedProjects);
        let projectIds = Object.keys(groupedProjects);

        // //console.log("projectIds ", projectIds)
        let allData = []
        for (k = 0; k < projectIds.length; k++) {

            let users = groupedProjects[projectIds[k]];
            let userEmails = [];
            users.forEach(user => userEmails.push(user.officialEmail))
            // //console.log("userEmails ",userEmails)

            // let projectTasks = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = '8' AND StoryTasks.organisationId IS NOT NULL AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
            let projectTasks = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = ${projectIds[k]} AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })
            // //console.log("projectTasks ",projectTasks[0])
            let projectBoard = await sequelize.query(`SELECT * from columnBoards WHERE projectId = ${projectIds[k]}`, {
                type: sequelize.QueryTypes.SELECT
            })
            // //console.log("projectBoard ",projectBoard[0])
            let boardData = [];
            projectBoard.forEach(column => {
                boardData.push({
                    columnName: column.columnName,
                    tasks: projectTasks.filter(task => task.columnId == column.columnId),
                    taskCount: projectTasks.filter(task => task.columnId == column.columnId).length
                })
            })

            let completedTodayTasks = projectTasks.filter(task => new Date(task.completionDate).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0))
            boardData.push({
                columnName: 'Completed Today',
                tasks: completedTodayTasks,
                taskCount: completedTodayTasks.length
            })


            let columnIDs = []
            projectTasks.forEach((v, i) => {
                columnIDs.push(v.columnId)
            })

            let uniqueData = ([...new Set(columnIDs)]).sort()
            // //console.log(uniqueData, uniqueData[0])



            let todayCompleted = completedTodayTasks.length
            let date = formatDate(new Date());
            let newTasksToday = projectTasks.filter(task => formatDate(task.createdAt) == date)
            let getTasksCreatedToday = newTasksToday.length;


            let date_time = new Date();
            date_time.setDate(date_time.getDate() - (0));
            let newDateforCurrentDay = date_time.getFullYear() + "-" + ("0" + (date_time.getMonth() + 1)).slice(-2) + "-" + ("0" + date_time.getDate()).slice(-2) + " " + date_time.getHours() + ":" + date_time.getMinutes() + ":" + date_time.getSeconds();
            let newDateOnly = date_time.getFullYear() + "-" + ("0" + (date_time.getMonth() + 1)).slice(-2) + "-" + ("0" + date_time.getDate()).slice(-2)
            // let newOpenedTasks = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = '${projectIds[k]}' AND StoryTasks.columnId = '${uniqueData[0]}' AND CAST(StoryTasks.createdAt AS DATE) = '2023-03-20' AND StoryTasks.organisationId IS NOT NULL AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
            let newOpenedTasks = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId ='${projectIds[k]}' AND StoryTasks.columnId = '${uniqueData[0]}' AND CAST(StoryTasks.createdAt AS DATE) = '${newDateOnly}' AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive =1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })

            date_time.setDate(date_time.getDate() - (7));
            let newDateforsevenDay = date_time.getFullYear() + "-" + ("0" + (date_time.getMonth() + 1)).slice(-2) + "-" + ("0" + date_time.getDate()).slice(-2) + " " + date_time.getHours() + ":" + date_time.getMinutes() + ":" + date_time.getSeconds();
            let pendingTaskCountforSevenday = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = ${projectIds[k]} AND StoryTasks.columnId = ${uniqueData[0]} AND (StoryTasks.createdAt BETWEEN "${newDateforsevenDay}" AND "${newDateforCurrentDay}") AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })

            date_time.setDate(date_time.getDate() - (30));
            let newDateforThirtyDay = date_time.getFullYear() + "-" + ("0" + (date_time.getMonth() + 1)).slice(-2) + "-" + ("0" + date_time.getDate()).slice(-2) + " " + date_time.getHours() + ":" + date_time.getMinutes() + ":" + date_time.getSeconds();
            let pendingTaskCountforthirtyDays = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = ${projectIds[k]} AND StoryTasks.columnId = ${uniqueData[0]} AND (StoryTasks.createdAt BETWEEN "${newDateforThirtyDay}" AND "${newDateforCurrentDay}") AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })


            date_time.setDate(date_time.getDate() - (60));
            let newDateforSixtyDay = date_time.getFullYear() + "-" + ("0" + (date_time.getMonth() + 1)).slice(-2) + "-" + ("0" + date_time.getDate()).slice(-2) + " " + date_time.getHours() + ":" + date_time.getMinutes() + ":" + date_time.getSeconds();
            let pendingTaskCountforsixtyDays = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = ${projectIds[k]} AND StoryTasks.columnId = ${uniqueData[0]} AND (StoryTasks.createdAt BETWEEN "${newDateforSixtyDay}" AND "${newDateforCurrentDay}") AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })

            date_time.setDate(date_time.getDate() - (90));
            let newDateforNintyDay = date_time.getFullYear() + "-" + ("0" + (date_time.getMonth() + 1)).slice(-2) + "-" + ("0" + date_time.getDate()).slice(-2) + " " + date_time.getHours() + ":" + date_time.getMinutes() + ":" + date_time.getSeconds();
            let pendingTaskCountforNintyDays = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = ${projectIds[k]} AND StoryTasks.columnId = ${uniqueData[0]} AND (StoryTasks.createdAt BETWEEN "${newDateforNintyDay}" AND "${newDateforCurrentDay}") AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })

            let lastColumnId = uniqueData[uniqueData.length - 1]
            // //console.log("953",uniqueData.length, uniqueData.length+1, lastColumnId)
            let newDate2 = new Date()
            newDate2.setDate(newDate2.getDate() - (7));
            // //console.log("956", newDate2)
            let newDateforsevenDays = newDate2.getFullYear() + "-" + ("0" + (newDate2.getMonth() + 1)).slice(-2) + "-" + ("0" + newDate2.getDate()).slice(-2) + " " + newDate2.getHours() + ":" + newDate2.getMinutes() + ":" + newDate2.getSeconds();
            let closedTaskCountforNintyDays = await sequelize.query(`SELECT * from StoryTasks INNER JOIN Stories INNER JOIN Epics WHERE StoryTasks.projectId = '${projectIds[k]}' AND StoryTasks.columnId = '${lastColumnId}' AND (StoryTasks.createdAt BETWEEN "${newDateforsevenDays}" AND "${newDateforCurrentDay}") AND StoryTasks.organisationId IS NOT NULL AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible' AND Stories.id = StoryTasks.storyId AND Epics.id = Stories.epicId`, {
                type: sequelize.QueryTypes.SELECT
            })




            let toDoCount = boardData.filter(board => board.columnName == 'To Do')[0]['tasks'].length;
            // let toDoCount1 = boardData.filter(board => board.columnName == 'To Do')[0]['tasks'].length;
            let toDoTasks = boardData.filter(board => board.columnName == 'To Do')[0]['tasks'];

            let inProgress = boardData.filter(board => board.columnName == 'In Progress')[0]['tasks'];
            let testing = boardData.filter(board => board.columnName == 'Testing')[0]['tasks'];
            let completedCount = boardData.filter(board => board.columnName == 'Done')[0]['tasks'].length;

            let toDoNotStarted = toDoTasks.filter(task => task.onHold == false && task.reOpened == false).length;
            let toDoOnHold = toDoTasks.filter(task => task.onHold == true).length;
            let toDoReOpened = toDoTasks.filter(task => task.reOpened == true).length;

            let subject = `Daily Project Status - ${groupedProjects[projectIds[k]][0].projectName}`
            let todayTasks = ''
            let tasksInProgress = ''
            let tasksInTesting = ''
            let taskRow = `
            
            <tr>
            <td align="center" valign="top">
                [ID]
            </td>
            <td align="center" valign="top">
                [TASK]
            </td>
            <td align="center" valign="top">
                [ASSIGNEE]
            </td>
            <td align="center" valign="top">
                [ESTHOURS]
            </td>
            <td align="center" valign="top">
                [STARTDATE]
            </td>
            <td align="center" valign="top">
                [ENDDATE]
            </td>
            <td align="center" valign="top">
                [TASKTYPE]
            </td>
            </tr>`
            completedTodayTasks.forEach(task => {
                // //console.log("948", task.taskType)
                let taskType
                if (task.taskType == 0) {
                    taskType = "New Features"
                } else {
                    taskType = "Bug"
                }
                let filterAssignee = projects.filter(p => p.employeeId == task.assignee)[0]
                let tDataRow = taskRow.replace('[ID]', task.projectTaskNumber).replace('[TASK]', task.taskName)
                if (filterAssignee && filterAssignee.firstName)
                    tDataRow = tDataRow.replace('[ASSIGNEE]', filterAssignee.firstName)
                        .replace('[ESTHOURS]', task.estimatedHours)
                        .replace('[STARTDATE]', task.startDate ? task.startDate : '')
                        .replace('[ENDDATE]', new Date(task.dueDate).toISOString().split('T')[0])
                        .replace('[TASKTYPE]', taskType ? taskType : '');
                todayTasks += tDataRow
            });
            // //console.log("todayTasks ", projectTaskNumber);
            inProgress.forEach(task => {
                // //console.log(task)
                let taskType
                if (task.taskType == 0) {
                    taskType = "New Features"
                } else {
                    taskType = "Bug"
                }
                let filterAssignee = projects.filter(p => p.employeeId == task.assignee)[0] || { firstName: '' }
                let tDataRow =

                    taskRow.replace('[ID]', task.projectTaskNumber)
                        .replace('[TASK]', task.taskName)
                if (filterAssignee)
                    tDataRow = tDataRow.replace('[ASSIGNEE]', filterAssignee.firstName)
                        .replace('[ESTHOURS]', task.estimatedHours)
                        .replace('[STARTDATE]', task.startDate ? task.startDate : '')
                        .replace('[ENDDATE]', new Date(task.dueDate).toISOString().split('T')[0])
                        .replace('[TASKTYPE]', taskType ? taskType : '');

                tasksInProgress += tDataRow
            });
            testing.forEach(task => {
                let taskType
                if (task.taskType == 0) {
                    taskType = "New Features"
                } else {
                    taskType = "Bug"
                }
                // //console.log(task)
                let filterAssignee = projects.filter(p => p.employeeId == task.assignee)[0]
                let tDataRow = taskRow.replace('[ID]', task.projectTaskNumber).replace('[TASK]', task.taskName)
                if (filterAssignee)
                    tDataRow = tDataRow.replace('[ASSIGNEE]', filterAssignee.firstName)
                        .replace('[ESTHOURS]', task.estimatedHours)
                        .replace('[STARTDATE]', task.startDate ? task.startDate : '')
                        .replace('[ENDDATE]', new Date(task.dueDate).toISOString().split('T')[0])
                        .replace('[TASKTYPE]', taskType ? taskType : '');
                tasksInTesting += tDataRow
            });

            let message2 = `<table style="font-size:14px" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
            <tr>
                <td align="center" valign="top">
                    <table border="0" cellpadding="5" cellspacing="0" width="90%"" id="emailContainer">

                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="5" cellspacing="0" width="100%" id="emailBody">
                                <tr border="0">
                                <td border="0" colspan="16" style="color:#3498db">Project Health
                                </td>
                                </tr>
                                <tr>
                                <th align="center" valign="top">
                                    Date
                                </th>
                                <th align="center" valign="top" style="background: #2ecc71">
                                    Total Defects
                                </th>
                                <th align="center" valign="top">
                                Total Closed
                                </th>
                                <th align="center" valign="top" style="background: #2ecc71">
                                Total Open
                                </th>
                                <th align="center" valign="top">
                                Re-Opened
                                </th>
                                <th align="center" valign="top">
                                Not Started
                                </th>
                                <th align="center" valign="top">
                                In Progress
                                </th>
                                <th align="center" valign="top" style="background: #f39c12">
                                Ready for Testing
                                </th>
                                <th align="center" valign="top">
                                On Hold
                                </th>
                                <th align="center" valign="top" style="background: #f39c12">
                                New Opened Today
                                </th>
                                <th align="center" valign="top" style="background: #f39c12">
                                Total Closed Today
                                </th>
                                <th align="center" valign="top">
                                Task Opened(7 Days)
                                </th>
                                <th align="center" valign="top">
                                Task Closed(7 Days)
                                </th>
                                <th align="center" valign="top">
                                Pending Task(30 Days)
                                </th>
                                <th align="center" valign="top">
                                Pending Task(60 Days)
                                </th>
                                <th align="center" valign="top">
                                Pending Task(90 Days)
                                </th>
                                </tr>
                                [STATUSTABLE]
                                </table>
                            </td>
                        </tr>
               
                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="5" cellspacing="0" width="100%" id="emailBody">
                                <tr border="0">
                                <td border="0" colspan="7" style="color:#2ecc71">Tasks Completed Today
                                </td>
                                </tr>
                                <tr>
                                <th align="center" valign="top">
                                    Id
                                </th>
                                <th align="center" valign="top">
                                    Task
                                </th>
                                <th align="center" valign="top">
                                    Assignee
                                </th>
                                <th align="center" valign="top">
                                    Est. Hrs
                                </th>
                                <th align="center" valign="top">
                                    Start Date
                                </th>
                                <th align="center" valign="top">
                                    Due Date
                                </th>
                                <th align="center" valign="top">
                                    Task Type
                                </th>
                                </tr>
                                ${todayTasks}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="5" cellspacing="0" width="100%" id="emailBody">
                                <tr border="0">
                                <td border="0" colspan="7" style="color:#e67e22">Tasks In Progress
                                </td>
                                </tr>
                                <tr>
                                <th align="center" valign="top">
                                    Id
                                </th>
                                <th align="center" valign="top">
                                    Task
                                </th>
                                <th align="center" valign="top">
                                    Assignee
                                </th>
                                <th align="center" valign="top">
                                    Est. Hrs
                                </th>
                                <th align="center" valign="top">
                                    Start Date
                                </th>
                                <th align="center" valign="top">
                                    Due Date
                                </th>
                                <th align="center" valign="top">
                                    Task Type
                                </th>
                                </tr>
                                ${tasksInProgress}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top">
                                <table border="1" cellpadding="5" cellspacing="0" width="100%" id="emailBody">
                                <tr border="0">
                                <td border="0" colspan="7" style="color:#34495e">Tasks In Testing
                                </td>
                                </tr>
                                <tr>
                                <th align="center" valign="top">
                                    Id
                                </th>
                                <th align="center" valign="top">
                                    Task
                                </th>
                                <th align="center" valign="top">
                                    Assignee
                                </th>
                                <th align="center" valign="top">
                                    Est. Hrs
                                </th>
                                <th align="center" valign="top">
                                    Start Date
                                </th>
                                <th align="center" valign="top">
                                    Due Date
                                </th>
                                <th align="center" valign="top">
                                    Task Type
                                </th>
                                </tr>
                                ${tasksInTesting}
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>`
            // //console.log("subject ", subject)
            let report = {
                total: projectTasks.length,
                projectId: projectIds[k],
                closed: completedCount,
                open: projectTasks.length - completedCount,
                toDoReOpened: toDoReOpened,
                toDoOnHold: toDoOnHold,
                toDoNotStarted: toDoNotStarted,
                inProgress: inProgress.length,
                testing: testing.length,
                openedToday: newOpenedTasks.length,
                closedToday: todayCompleted,
                pendingsixtyDaysTask: pendingTaskCountforsixtyDays.length,
                pendingsevenDaysTask: pendingTaskCountforSevenday.length,
                pendingThirtyDaysTask: pendingTaskCountforthirtyDays.length,
                pendingNintyDaysTasks: pendingTaskCountforNintyDays.length,
                closedBugsinSevenDays: closedTaskCountforNintyDays.length,
                organisationId: req.body.user_organisationId
            }


            Report.create(report).then(result => {
                // res.status(200).send(result)
            }, error => {
                // res.status(400).send(error)
            })

            let statusRow = ''
            Report.findAll({
                where: { projectId: projectIds[k], organisationId: req.body.user_organisationId },
                order: [
                    ['createdAt', 'DESC']
                ], limit: 5
            }).then(result => {
                // //console.log("1260",result.length)
                result = JSON.parse(JSON.stringify(result))
                result.forEach(r => {
                    r['date'] = formatDate(new Date(r.createdAt));
                })

                result = getUniqueListBy(result, 'date')

                let tableRow = `
                <tr>
                <td align="center" valign="top">
                    [Date]
                </td>
                <td align="center" valign="top">
                    [Total]
                </td>
                <td align="center" valign="top">
                    [TotalClosed]
                </td>
                <td align="center" valign="top">
                    [TotalOpen]
                </td>
                <td align="center" valign="top">
                    [Re-Opened]
                </td>
                <td align="center" valign="top">
                    [NotStarted]
                </td>
                <td align="center" valign="top">
                    [InProgress]
                </td>
                <td align="center" valign="top">
                    [ReadyforTesting]
                </td>
                <td align="center" valign="top">
                    [OnHold]
                </td>
                <td align="center" valign="top">
                    [NewOpenedToday]
                </td>
                <td align="center" valign="top">
                    [TotalClosedToday]
                </td>
                <td align="center" valign="top">
                    [TaskPending7Days]
                </td>
                <td align="center" valign="top">
                    [TaskClosed7Days]
                </td>
                <td align="center" valign="top">
                    [TaskPending30Days]
                </td>
                <td align="center" valign="top">
                    [TaskPending60Days]
                </td>
                <td align="center" valign="top">
                    [TaskPending90Days]
                </td>
                </tr>`
                //console.log("1371", newOpenedTasks.length)
                statusRow += tableRow.replace('[Date]', formatDate(new Date())).replace('[Total]', projectTasks.length).replace('[TotalClosed]', completedCount).replace('[TotalOpen]', projectTasks.length - completedCount).replace('[Re-Opened]', toDoReOpened).replace('[NotStarted]', toDoNotStarted).replace('[InProgress]', inProgress.length).replace('[ReadyforTesting]', testing.length).replace('[OnHold]', toDoOnHold).replace('[NewOpenedToday]', newOpenedTasks.length).replace('[TotalClosedToday]', todayCompleted).replace('[TaskPending7Days]', pendingTaskCountforSevenday.length).replace('[TaskClosed7Days]', closedTaskCountforNintyDays.length).replace('[TaskPending30Days]', pendingTaskCountforthirtyDays.length).replace('[TaskPending60Days]', pendingTaskCountforsixtyDays.length).replace('[TaskPending90Days]', pendingTaskCountforNintyDays.length,)
                // message2 = message2.replace('[STATUSTABLE]',statusRow)
                result.forEach(r => {
                    statusRow += tableRow.replace('[Date]', formatDate(new Date(r.createdAt))).replace('[Total]', r.total).replace('[TotalClosed]', r.closed).replace('[TotalOpen]', r.open).replace('[Re-Opened]', r.toDoReOpened).replace('[NotStarted]', r.toDoNotStarted).replace('[InProgress]', r.inProgress).replace('[ReadyforTesting]', r.testing).replace('[OnHold]', r.toDoOnHold).replace('[NewOpenedToday]', r.openedToday).replace('[TotalClosedToday]', r.closedToday).replace('[TaskPending7Days]', r.pendingsevenDaysTask).replace('[TaskClosed7Days]', r.closedBugsinSevenDays).replace('[TaskPending30Days]', r.pendingThirtyDaysTask).replace('[TaskPending60Days]', r.pendingsixtyDaysTask).replace('[TaskPending90Days]', r.pendingNintyDaysTasks)
                })

                message2 = message2.replace('[STATUSTABLE]', statusRow)
                email2 = "vkumar@mckinsol.com"
                mailer(transporter, email2, subject, message2)
                // mailer(transporter, userEmails.join(','), subject, message2)
            }, error => {
                // res.status(400).send(error)
            })

            // //console.log("total ", projectTasks.length)
            // //console.log("projectId ", projectIds[k])
            // //console.log("closed ", completedCount)
            // //console.log("open ", projectTasks.length - completedCount)
            // //console.log("toDoNotStarted ", toDoNotStarted)
            // //console.log("toDoOnHold ", toDoOnHold)
            // //console.log("toDoReOpened ",  toDoReOpened)
            // //console.log("inProgress ", inProgress.length)
            // //console.log("testing ", testing.length)
            // //console.log("openedToday ", getTasksCreatedToday)
            // //console.log("closedToday ", todayCompleted)
            // mailer(transporter, email2, subject, message2)
        }
        res.send(allData)
    })


    function getUniqueListBy(arr, key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }

    apiRoutes.post('/getTasksAssigned', async function (req, res) {
        let employeeId = req.body.employeeId
        await sequelize.query(`SELECT * from ProjectData where storyTask_assignee = ${employeeId} AND columnBoard_name = "To Do" AND storyTask_feasibilityStatus = 'Feasible';`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/getTestingTasksAssigned', async function (req, res) {
        let employeeId = req.body.employeeId
        await sequelize.query(`SELECT a.*, c.projectName, a.dueDate FROM StoryTasks a, columnBoards b, Projects c  WHERE a.tester = ${employeeId} AND a.columnId = b.columnId AND a.isActive = 1 AND a.feasibilityStatus='Feasible' AND b.columnName = "Testing" AND a.projectId = c.projectId`, {
            // await sequelize.query(`SELECT a.*, a.taskName,c.projectName, a.startDate, a.dueDate FROM StoryTasks a, columnBoards b, Projects c  WHERE a.tester = ${employeeId} AND a.columnId = b.columnId AND b.columnName = "Testing" AND a.projectId = c.projectId`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/getProjectByClientId', async function (req, res) {
        await Project.findAll({ where: { clientId: req.body.clientId, organisationId: req.body.user_organisationId } }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })


    apiRoutes.post('/getClientList', async function (req, res) {
        await clientDetail.findAll({ where: { organisationId: req.body.user_organisationId } }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })
    apiRoutes.post('/getTesterTasks', async function (req, res) {
        await StoryTasks.findAll({ where: { tester: req.body.tester, projectId: req.body.projectId, organisationId: req.body.user_organisationId, isActive: true, feasibilityStatus: 'Feasible' } }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })


    apiRoutes.post('/getAllProjectReport', async function (req, res) {
        await StoryTasks.findAll({ where: { projectId: req.body.projectId, organisationId: req.body.user_organisationId, isActive: true, feasibilityStatus: 'Feasible' } }).then(resp => {
            let assignee = []
            for (i = 0; i < resp.length; i++) {
                assignee.push(resp[i].assignee)
            }
            let unique = [...new Set(assignee)];
            let realData = []
            for (j = 0; j < unique.length; j++) {
                let assineeDetails = []
                let actualHours = 0
                let plannedhours = 0
                for (k = 0; k < resp.length; k++) {
                    if (unique[j] != null && unique[j] == resp[k].assignee) {
                        assineeDetails.push(resp[k])
                        let actHours = resp[k].actualHours
                        let estimatedHours = resp[k].estimatedHours
                        actualHours += actHours
                        plannedhours += estimatedHours
                    }
                }
                realData.push({ "employeeId": unique[j], "actualHours": actualHours, "plannedhours": plannedhours, "TaskCount": assineeDetails.length, "Tasks": assineeDetails })
            }
            res.send(realData)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/getallprojectwholedetails', async function (req, res) {
        await sequelize.query(`SELECT StoryTasks.projectId, columnBoards.columnId,columnBoards.columnName, COUNT(StoryTasks.columnId) AS counts, Projects.projectName,Projects.organisationId,Projects.projectStatus, SUM(StoryTasks.estimatedHours) AS estHours, SUM(StoryTasks.actualHours) AS actHurs
        FROM StoryTasks 
        JOIN Projects ON StoryTasks.projectId = Projects.projectId
        JOIN columnBoards ON StoryTasks.columnId = columnBoards.columnId
        WHERE Projects.organisationId = ${req.body.organisationId}
        AND StoryTasks.isActive = 1 AND StoryTasks.feasibilityStatus='Feasible'
        GROUP BY StoryTasks.projectId, columnBoards.columnId
        ORDER BY StoryTasks.projectId ASC;`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            let projects = []
            for (i = 0; i < resp.length; i++) {
                projects.push(resp[i].projectId)
            }
            let unique = [...new Set(projects)];
            //console.log(unique)
            let newData = []
            for (j = 0; j < unique.length; j++) {
                let SimilarProjectData = []
                for (k = 0; k < resp.length; k++) {
                    if (unique[j] == resp[k].projectId) {
                        SimilarProjectData.push(resp[k])
                    }
                }
                newData.push(SimilarProjectData)
            }
            res.send(newData)
        }, error => {
            res.send(error)
        })
    })


    apiRoutes.post('/getAllProjectHrs', async function (req, res) {
        await sequelize.query(`SELECT a.projectId, a.projectName,a.organisationId,a.projectStatus,a.projectType, SUM(b.estimatedHours) AS estHours, SUM(b.actualHours) AS actHurs FROM Projects a, StoryTasks b  WHERE a.projectId = b.projectId AND a.organisationId = ${req.body.organisationId} GROUP BY b.projectId`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })

    })

    apiRoutes.post('/getTasksforDsr', async function (req, res) {
        sequelize.query(`select a.projectId, c.projectName, a.projectTaskNumber, a.taskName, a.taskId as projectTaskId, b.columnName, a.estimatedHours 
        from StoryTasks a, columnBoards b, Projects c where a.isActive = 1 and a.feasibilityStatus='Feasible' and a.projectId = b.projectId and a.columnId = b.columnId and a.projectId = c.projectId and 
        b.columnName in ("In progress", "Testing") and a.projectId in (${req.body.projectId}) and a.isActive =1 and a.assignee = ${req.body.employeeId} order by c.projectId ASC`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })


    // ProjectManagement Request Ticket Feature Apis Start from down below ---------------------------------------
    apiRoutes.post('/requestTicket', async function (req, res) {
        requestTicket.create(req.body).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })
    })

    apiRoutes.post('/getAllTicketsforuser', async function (req, res) {
        sequelize.query(`
        select a.requestId, a.projectId, b.projectName, a.requestdBy, c.firstName, c.lastName, a.taskId, a.taskName, a.requestdate, a.status, a.requestComment, a.approvedBy,a.approverName,  a.approvedDate, a.createdAt, a.updatedAt from requestTickets a, Projects b, Employees c where a.projectId = b.projectId and a.requestdBy = c.employeeId and a.requestdBy = ${req.body.employeeId}`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.send(resp)
        }, error => {
            res.send(error)
        })

        // requestTicket.findAll({where:{requestdBy:req.body.employeeId}}).then(resp=>{
        //     res.send(resp)
        // }, error=>{
        //     res.send(error)
        // })
    })

    apiRoutes.post('/getAllTicketsforManager', async function (req, res) {
        sequelize.query(`select c.firstName, c.lastName,a.requestId, a.projectId, b.projectName, a.taskName, a.requestdBy, a.requestdate, a.status, a.requestComment,
        a.createdAt, a.updatedAt, a.approvedBy,a.approverName, a.approvedDate 
        from requestTickets a, Projects b, Employees c
        where a.projectId = b.projectId and a.requestdBy = c.employeeId and a.projectId in (${req.body.projectId});`, {
            type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
            res.send(resp)
        }, error => {
            console.log(error);
            res.send(error)
        })
        // sequelize.query(`select * from requestTickets where projectId in (${req.body.projectId})`,{
        //     type: Sequelize.QueryTypes.SELECT
        // }).then(resp => {
        //     res.send(resp)
        // }, error => {
        //     res.send(error)
        // })
    })

    apiRoutes.post('/actionTicketbyProjectManager', async function (req, res) {
        await requestTicket.update({
            "approvedBy": req.body.approvedBy,
            "approvedDate": req.body.approvedDate,
            "status": req.body.status,
            "approverName": req.body.approverName
        }, {
            where: { requestId: req.body.requestId }
        }).then(result => {
            StoryTasks.update({ extraHours: req.body.extraHours }, {
                where: { projectTaskNumber: req.body.taskId, projectId: req.body.projectId }
            })
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    apiRoutes.post('/getTaskLogs', async (req, res) => {
        let employeeData = await Employees.findAll({
            where: { organisationId: req.body.organisationId },
            attributes: ["employeeId", "firstName", "lastName"]
        });
        taskLog.findAll({ where: { taskId: req.body.taskId, } })
            .then(result => {
                let array = [];
                result.forEach(element => {
                    if (element.assignee && element.assigner) {
                        element.assigner = getEmployeeName(employeeData, element.assigner);
                        element.assignee = getEmployeeName(employeeData, element.assignee);
                        array.push({ index: `${element.assigner}  delegated the task to ${element.assignee} on ${element.createdAt.toDateString()}` });
                    }
                    element.createdBy = getEmployeeName(employeeData, element.createdBy);
                    element.updatedBy = getEmployeeName(employeeData, element.updatedBy);
                })

                const response = {
                    result, array
                }
                res.send(response);

            }, err => {
                res.send(err);
            })
    })
    function getEmployeeName(employeeData, employeeId) {
        try {
            // console.log(employeeData,employeeId);
            const foundEmployee = employeeData.find(employee => employee.employeeId === employeeId);
            return `${foundEmployee.firstName} ${foundEmployee.lastName}`;
        }
        catch {
            return 'Unknown';
        }

    }
    apiRoutes.post('/getAllProjectTask', async function (req, res) {
        try {

            const columns = await ColumnBoard.findAll({
                where: {
                    projectId: req.body.projectId,
                    organisationId: req.body.user_organisationId
                }
            });


            const taskCountsArray = [];


            for (const column of columns) {
                const columnName = column.columnName;


                const tasks = await StoryTasks.findAll({
                    where: {
                        projectId: req.body.projectId,
                        organisationId: req.body.user_organisationId,
                        columnId: column.columnId, isActive: true,
                        feasibilityStatus: 'Feasible'
                    }
                });


                taskCountsArray.push({ value: tasks.length, name: columnName });
            }


            const todayCompletedTasks = await StoryTasks.count({
                where: {
                    projectId: req.body.projectId,
                    organisationId: req.body.user_organisationId,
                    completionDate: {
                        [Op.gte]: moment().startOf('day').toDate(),
                        [Op.lte]: moment().endOf('day').toDate()
                    }
                }
            });

            const todayCreatedTasks = await StoryTasks.count({
                where: {
                    projectId: req.body.projectId,
                    organisationId: req.body.user_organisationId,
                    createdAt: {
                        [Op.gte]: moment().startOf('day').toDate(),
                        [Op.lte]: moment().endOf('day').toDate()
                    }
                }
            });
            const todayData = [];

            todayData.push({ value: todayCompletedTasks, name: "Today's Complete Task" });
            todayData.push({ value: todayCreatedTasks, name: "Today's Created Task" });


            res.status(200).json({ data: taskCountsArray, todayData });
        } catch (error) {

            console.error("Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    apiRoutes.post('/getEmployeeTaskCounts', async function (req, res) {
        try {
            const projectId = req.body.projectId;
            const organisationId = req.body.user_organisationId;


            const columns = await ColumnBoard.findAll({
                attributes: ['columnId', 'columnName'],
                where: { projectId, organisationId },
                raw: true
            });


            const employees = await sequelize.query(`
                SELECT DISTINCT 
                    Employees.employeeId,
                    CONCAT(Employees.firstName, ' ', Employees.lastName) AS employeeName
                FROM 
                    Employees
                INNER JOIN 
                    ProjectMembers ON Employees.employeeId = ProjectMembers.employeeId
                WHERE 
                    ProjectMembers.projectId = '${projectId}'
                ORDER BY Employees.employeeId
            `, {
                type: Sequelize.QueryTypes.SELECT
            });


            await StoryTasks.sync();

            const taskCounts = {};
            const employeeTaskCounts = {};

            for (const column of columns) {
                const { columnId, columnName } = column;
                const tasks = await StoryTasks.findAll({
                    attributes: ['assignee', [sequelize.fn('COUNT', sequelize.col('assignee')), 'taskCount']],
                    where: { projectId, organisationId, columnId, isActive: true, feasibilityStatus: 'Feasible' },
                    group: ['assignee'],
                    raw: true
                });


                employees.forEach(employee => {
                    const employeeName = employee.employeeName;
                    const task = tasks.find(task => task.assignee === employee.employeeId);
                    if (task) {
                        if (!employeeTaskCounts[employeeName]) {
                            employeeTaskCounts[employeeName] = {};
                        }
                        employeeTaskCounts[employeeName][columnName] = task.taskCount;
                    } else {
                        if (!employeeTaskCounts[employeeName]) {
                            employeeTaskCounts[employeeName] = {};
                        }
                        employeeTaskCounts[employeeName][columnName] = 0;
                    }
                });


                taskCounts[columnName] = employees.map(employee => {
                    const employeeName = employee.employeeName;
                    return employeeTaskCounts[employeeName][columnName] || 0;
                });
            }


            res.status(200).json({ employeeNames: employees.map(employee => employee.employeeName), taskCounts });
        } catch (error) {

            console.error("Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    apiRoutes.post('/getReleaseNumber', (req, res) => {
        Project.findOne({
            where: {
                projectId: req.body.projectId,
                organisationId: req.body.organisationId
            },
            attributes: ['releaseNumber']
        })
            .then(data => {

                res.status(200).send(data);
            }, err => {
                res.status(400).send(err);
            })
    })

    apiRoutes.get('/getReleaseNumberForOrganisation', (req, res) => {
        let arr = [];
        sequelize.query(`Select distinct releaseNumber from Projects where organisationId='${req.body.organisationId}' AND releaseNumber IS NOT NULL`,
            { type: Sequelize.QueryTypes.SELECT })
            .then(data => {
                data.forEach(element => {
                    if (!(element == undefined) && element.releaseNumber) {
                        arr.push(...element.releaseNumber);
                    }
                });
                let arrayWithoutDuplicates = [...new Set(arr)];
                res.status(200).send(arrayWithoutDuplicates.sort());
            })
    })
    app.use('/', apiRoutes);
};


/*
    Structure for the update Employee table:
 CREATE TABLE updated_employees (
    employeeId INT,
    personalEmail VARCHAR(50),
    officialEmail VARCHAR(50),
    firstName VARCHAR(255),
    middleName VARCHAR(255),
    lastName VARCHAR(255),
    phoneNo VARCHAR(20),
    presentAddress VARCHAR(255),
    permanentAddress VARCHAR(255),
    panNumber VARCHAR(20),
    adharNumber VARCHAR(20),
    gender VARCHAR(10),
    DOJ DATE,
    DOB DATE,
    employeeType VARCHAR(50),
    fatherName VARCHAR(50),
    officialEmailPassword VARCHAR(50),
    spouseName VARCHAR(50),
    emergencyContactName VARCHAR(50),
    companyName VARCHAR(255),
    organisationId INT,
    designation VARCHAR(255),
    companyBranch VARCHAR(50),
    isActive TINYINT(1),
    emergencyContactNumber VARCHAR(50),
    apperisalDays VARCHAR(150),
    basicSalary FLOAT,
    totalSalary FLOAT,
    PASSWORD VARCHAR(255),
    permissions JSON,
    hashedEmail VARCHAR(255),
    userGroup JSON,
    image LONGTEXT,
    imageExists TINYINT(1),
    biometricId INT,
    location INT,
    positionName VARCHAR(255),
    fedID VARCHAR(50),
    taxTerm VARCHAR(50),
    corporationName VARCHAR(50),
    pocName VARCHAR(50),
    clientName VARCHAR(255),
    roles INT,
    constHour FLOAT,
    hoursDay FLOAT,
    costRate FLOAT,
    UserGroups JSON,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TRIGGER t1_bd BEFORE DELETE ON Employees FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'table Employees does not support deletion'


DELIMITER //

CREATE TRIGGER before_update_employee
BEFORE DELETE ON Employees
FOR EACH ROW
BEGIN

    INSERT INTO updated_employees 
    (employeeId, personalEmail, officialEmail, firstName, middleName, lastName, phoneNo, presentAddress, permanentAddress, panNumber, adharNumber, gender, DOJ, DOB, employeeType, fatherName, officialEmailPassword, spouseName, emergencyContactName, companyName, organisationId, designation, companyBranch, isActive, emergencyContactNumber, apperisalDays, basicSalary, totalSalary, password, permissions, hashedEmail, userGroup, image, imageExists, biometricId, location, positionName, fedID, taxTerm, corporationName, pocName, clientName, roles, constHour, hoursDay, costRate, UserGroups)
    VALUES
    (OLD.employeeId, OLD.personalEmail, OLD.officialEmail, OLD.firstName, OLD.middleName, OLD.lastName, OLD.phoneNo, OLD.presentAddress, OLD.permanentAddress, OLD.panNumber, OLD.adharNumber, OLD.gender, OLD.DOJ, OLD.DOB, OLD.employeeType, OLD.fatherName, OLD.officialEmailPassword, OLD.spouseName, OLD.emergencyContactName, OLD.companyName, OLD.organisationId, OLD.designation, OLD.companyBranch, OLD.isActive, OLD.emergencyContactNumber, OLD.apperisalDays, OLD.basicSalary, OLD.totalSalary, OLD.password, OLD.permissions, OLD.hashedEmail, OLD.userGroup, OLD.image, OLD.imageExists, OLD.biometricId, OLD.location, OLD.positionName, OLD.fedID, OLD.taxTerm, OLD.corporationName, OLD.pocName, OLD.clientName, OLD.roles, OLD.constHour, OLD.hoursDay, OLD.costRate, OLD.UserGroups);
END;
//

DELIMITER ;


*/

/*
CREATE TABLE StoryTasks_Backup (
    taskId int,
    assignee int,
    assignor int,
    date date,
    organisationId int,
    columnId int,
    taskName varchar(255),
    `from` bigint,
    `to` bigint,
    projectId int,
    status int,
    taskType int,
    storyId int,
    `order` int,
    description text,
    reporter int,
    dueDate date,
    createdAt datetime,
    updatedAt datetime,
    startDate date,
    estimatedHours float,
    priority int,
    completionDate datetime,
    tester int,
    reOpened tinyint(1),
    onHold tinyint(1),
    projectTaskNumber int,
    actualHours float,
    testingDueDate datetime,
    testingStartDate datetime,
    testingDescription varchar(255),
    testingEstimatedHours float,
    testingActualHours float,
    category int,
    extraHours float,
    totalHoursSpent float,
    testCaseData json,
    actualStartDate date,
    actualDueDate date,
    updatedBy int,
    createdBy int,
    fileName varchar(255),
    estimatedCost varchar(255),
    actualCost varchar(255),
    isActive tinyint
);


DELIMITER //

CREATE TRIGGER before_delete_StoryTasks
BEFORE DELETE ON StoryTasks
FOR EACH ROW
BEGIN
    INSERT INTO StoryTasks_Backup
    VALUES (
        OLD.taskId,
        OLD.assignee,
        OLD.assignor,
        OLD.date,
        OLD.organisationId,
        OLD.columnId,
        OLD.taskName,
        OLD.from,
        OLD.to,
        OLD.projectId,
        OLD.status,
        OLD.taskType,
        OLD.storyId,
        OLD.order,
        OLD.description,
        OLD.reporter,
        OLD.dueDate,
        OLD.createdAt,
        OLD.updatedAt,
        OLD.startDate,
        OLD.estimatedHours,
        OLD.priority,
        OLD.completionDate,
        OLD.tester,
        OLD.reOpened,
        OLD.onHold,
        OLD.projectTaskNumber,
        OLD.actualHours,
        OLD.testingDueDate,
        OLD.testingStartDate,
        OLD.testingDescription,
        OLD.testingEstimatedHours,
        OLD.testingActualHours,
        OLD.category,
        OLD.extraHours,
        OLD.totalHoursSpent,
        OLD.testCaseData,
        OLD.actualStartDate,
        OLD.actualDueDate,
        OLD.updatedBy,
        OLD.createdBy,
        OLD.fileName,
        OLD.estimatedCost,
        OLD.actualCost,
        OLD.isActive
    );
END;
//

DELIMITER ;

*/