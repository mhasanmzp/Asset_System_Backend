let cron = require('node-cron');
const nodemailer = require('nodemailer')
const request = require('request')
const smtp = require('../../config/main');
const moment = require('moment')
const { Teams, Employees, ProjectMembers, notification, Tasks, Project, StoryTasks, Sprint } = require('../../config/db.config.js');
const db = require('../../config/db.config.js');
const weeklyDashboard = db.weeklyDashboard
const leave = db.leave;
const Sequelize = require('sequelize');
const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/db.config.js');
const team = require('../models/team.js');
const { where } = require('underscore');
const Op = Sequelize.Op

// const { Tasks, notification } = require('./config/db.config.js');
let smtpAuth = {
  user: smtp.smtpuser,
  pass: smtp.smtppass
}
let smtpConfig = {
  host: smtp.smtphost,
  port: smtp.smtpport,
  secure: false,
  auth: smtpAuth
};
//console.log("19", smtpConfig)
let transporter = nodemailer.createTransport(smtpConfig);
transporter.verify(function (error) {
  if (error) {
    //console.log(error);
  }
});
module.exports = function (app) {


  cron.schedule('0 7 * * 1-5', () => {
    let currentDate = new Date()
    currentDate = moment(currentDate).local().format('YYYY-MM-DD');
    let dayOfWeek = moment(currentDate).day();
    sequelize.query(`SELECT * FROM leaves WHERE 
    sdate > CURDATE() 
    AND leaveType NOT IN ('sick') 
    AND status NOT IN ('Rejected')`, {
      type: Sequelize.QueryTypes.SELECT
    })
      .then(data => {
        const filteredData = data.filter(item => {

          let startDate = new Date(item.sdate);
          startDate = moment(startDate).local().format('YYYY-MM-DD');;

          const diffInHours = moment(startDate).diff(currentDate, 'hours');

          if (dayOfWeek == 5) {
            return diffInHours <= 72 && diffInHours > 0;
          }
          else {
            return diffInHours <= 24 && diffInHours > 0;
          }
        });
        filteredData.forEach(leave => {

          sequelize.query(`SELECT * from Teams WHERE JSON_CONTAINS(users, '${leave.employeeId}', '$');`,
            {
              type: Sequelize.QueryTypes.SELECT
            }).then(async teams => {
              let managerIds = [leave.employeeId,354, 130, 141,201];
              teams.forEach(team => {
                // console.log(team);
                managerIds.push(...team.managers)
              })
              let uniqueManager = Array.from(new Set(managerIds));

              let employeeData = await Employees.findOne({ where: { employeeId: leave.employeeId }, attributes: ['employeeId', 'officialEmail', 'firstName', 'middleName','lastName'] })
              let managerData = await Employees.findAll({ where: { employeeId: { [Sequelize.Op.in]: uniqueManager } }, attributes: ['employeeId', 'officialEmail', 'firstName'] });

              managerData.forEach(manager => {
                let ReceiverName = manager.middleName?`${manager.firstName} ${manager.middleName} ${manager.lastName}`:`${manager.firstName} ${manager.lastName}`;
                let formattedDate = moment(leave.createdAt).format('YYYY-MM-DD');
                let subject = `Leave Approval Remainder`
                let message = `
              <p>Dear ${ReceiverName},</p>

              <p>I hope this email finds you well.</p>

              <p>I wanted to send you a quick reminder regarding my leave request for <b>${leave.sdate}</b>.</p>

              <p>As discussed previously, I have submitted a request for leave on <b>${formattedDate}</b> for <b>${leave.reason}</b>. I understand that you may be busy with various tasks, and I wanted to ensure that my request has been duly noted.</p>

              <p>Thank you for your attention to this matter.</p>

              <p>Best regards,</p>
              <p><b>${employeeData.firstName}</b></p>
              `
                let email = manager.officialEmail;
                
                mailer(transporter, email, subject, message)
              })
            });
        })
      })
  })



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
  
  cron.schedule('01 0 26 3,6,9,12 *', async function testing() {
    console.log("Schedular is called");
    request('http://127.0.0.1:3000/assignMonthlyLeaves', function (error, response, body) {
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    });
  })

    
// cron.schedule('* * * * *', async function WeeklyDashboard() {
//   //console.log("hello")
// })
// WeeklyDashboardss()
async function WeeklyDashboardss() {
  await weeklyDashboard.findAll({ where: { isActive: 1, organisationId: req.body.user_organisationId } }).then(resp => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const date3 = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    for (i = 0; i < resp.length; i++) {
      sequelize.query(`select * from Sprints where  projectId = 2 and startDate < '${date3}' and dueDate >= '${date3}' and completionDate IS NULL`, {
        type: Sequelize.QueryTypes.SELECT
      }).then(result => {
        sequelize.query(`select * from StoryTasks where taskId in (${result[0].tasks})`).then(taskresp => {


        })
      })
    }
  })
}
}
//Done