const express = require('express');
const Sequelize = require('sequelize');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path')
const os = require('os')
const db = require('../../config/db.config.js');
const bodyParser = require('body-parser');
const smtp = require('../../config/main.js');
//const path = require('path')
const qualityDocument = db.qualityDocument
const moment = require('moment');

const Status = db.Status
const app = express()


const { sequelize } = require('../../config/db.config');
const _ = require('lodash')
let multer = require('multer')
// let path = require('path')
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
app.use('/images/documents', express.static(path.join(__dirname, 'images', 'documents')));
let upload = multer({ storage: storage })
const XLSX = require('xlsx');
let json2xls = require("json2xls");
// const bcrypt = require("bcrypt");
const { error } = require('console');
const App = express();
// const { dirname } = require('path/posix');
// const { Json } = require('sequelize/types/utils.js');
// const csvParser = require("csv-parser");
const Employees = db.Employees;
const Organisation = db.organisation
const Attendance = db.attendance
const MonthlySalary = db.MonthlySalary
const Project = db.Project
const board = db.board
const columnBoard = db.columnBoard
const Tasks = db.Tasks
const Teams = db.Teams
const Document = db.Document
const Notification = db.notification

var csv = require('node-csv').createParser();
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
// let smtpAuth = {
//   user: "vB5uBGFvQ06ugmCSGQcjSw",
//   pass: "SG.vB5uBGFvQ06ugmCSGQcjSw.cFZCx-Lc-LtYHS2lTQ9crd5udwSMjDvemGSCL-rbcyw"
// }

// let smtpConfig = {
//   host: 'smtp.sendgrid.net',
//   port: 587,
//   secure: false,
//   auth: smtpAuth
//   //auth:cram_md5
// };
let transporter = nodemailer.createTransport(smtpConfig);

transporter.verify(function (error, success) {
  if (error) {
    //console.log(error);
  } else {
    //console.log('Server is ready to take our messages');
  }
});
module.exports = function (app) {

  const apiRoutes = express.Router();
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
  apiRoutes.post('/createStatus', async (req, res) => {
    try {
      //const { name,organisationId } = req.body;

      // Create a new status entry
      console.log("dcis");
      console.log(req.body);
      const newStatus = await Status.create(req.body)

      res.status(201).json(newStatus);
    } catch (error) {
      console.error('Error adding status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  apiRoutes.post('/getStatus', async (req, res) => {
    try {

      const allStatus = await Status.findAll();

      res.status(200).json(allStatus);
    } catch (error) {
      console.error('Error fetching status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  apiRoutes.post('/employeeOnboarding', async function (req, res) {
    console.log(req.body);
    req.body['constHour'] = parseFloat(req.body.constHour);
    req.body['hoursDay'] = parseFloat(req.body.hoursDay);
    req.body.isActive = true;
    req.body.image = 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg';
    Employees.create(req.body).then(c => {
      // let email = c.officialEmail
      // let email2  = "vkumar@mckinsol.com"
      // let subject = "Create Your New Password for HR Portal Login"
      // let message = `Hello ${First_Name} ${Last_Name}, <br><br> Please Create Your New Password for HR Portal Login.<br><br> Thanks<br>Team HR`

      // mailer(transporter, email2, subject, message)
      res.status(200).send(c)
    }, error => {
      console.log("error ", error)

      res.status(401).send(error)
    })
  });

  /*apiRoutes.post('/employeeFilesUploading', upload.array('files'), async function (req, res) {
    try {
      const files = req.files; // Access the uploaded files
      const organisationId = req.body.organisationId; // Access other form data fields
      const employeeId = req.body.employeeId;
      const projectId = req.body.projectId;
      console.log(projectId);

      const date = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
  
      // Array to store uploaded file data
      const uploadedFiles = [];
  
      // Iterate over the uploaded files and save them to the database
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFile = await Document.create({
          organisationId: organisationId,
          employeeId: employeeId,
          projectId: projectId,
          originalname: file.originalname,
          filename: file.filename,
          path:file.path,
          size: file.size,
          date: date
        });
        // Add uploaded file data to the array
        uploadedFiles.push(uploadFile);
      }
      
  
      // Send the array of uploaded files as the response
      res.status(200).send({ uploadedFiles });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});*/
  apiRoutes.post('/employeeFilesUpload', upload.array('files'), async function (req, res) {
    try {
      console.log("dsfvfssf");
      const files = req.files; // Access the uploaded files
      const organisationId = req.body.organisationId; // Access other form data fields
      const employeeId = req.body.employeeId;
      const projectId = req.body.projectId;
      console.log(projectId);
      const createdAt = new Date();
      console.log(createdAt);
      let employeeData = await Employees.findOne({
        where: { employeeId: req.body.employeeId },
      });
      console.log(employeeData);
      const createdBy = employeeData.firstName + " " + employeeData.lastName;

      //const date = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format

      // Array to store uploaded file data
      const uploadedFiles = [];

      // Iterate over the uploaded files and save them to the database
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadFile = await Document.create({
          organisationId: organisationId,
          employeeId: employeeId,
          projectId: projectId,
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          createdAt: createdAt,
          createdBy: createdBy

        });
        // Add uploaded file data to the array
        uploadedFiles.push(uploadFile);
      }


      // Send the array of uploaded files as the response
      res.status(200).send({ uploadedFiles });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  apiRoutes.post('/deleteDocuments', async function (req, res) {
    await Document.destroy({ where: { documentId: req.body.documentId } }).then(resp => {
      res.send({ code: 1, "msg": "Document Deleted" })
    })
  })
  apiRoutes.post('/getoneEmployee', async function (req, res) {
    console.log(req.body);
    await Employees.findAll({
      attributes: { exclude: ['password'] },
      where: {
        employeeId: req.body.employeeId,
        organisationId: req.body.user_organisationId
      }
    }).then((c) => {
      if (c && c.length > 0) { // Check if any employee found
        res.status(200).send(JSON.stringify(c, null, 2));
      } else {
        res.status(404).send("Employee not found");
      }
    }).catch(error => {
      console.error(error);
      res.status(500).send("Internal server error");
    });
  });

  apiRoutes.post('/uploadDocument', upload.array('documents'), async (req, res) => {
    try {
      const files = req.files; // Access the uploaded files array
      const organisationId = req.body.organisationId;
      const employeeId = req.body.employeeId;
      const documentName = req.body.documentName;
      const reviewedDate = req.body.reviewedDate;
      const documentCode = req.body.documentCode;

      // Assuming user ID is available in the request object
      const createdAt = new Date();
      console.log(createdAt); // Current date/time

      const uploadedDocuments = [];

      // Define allowed file extensions
      const allowedExtensions = ['.doc', '.docx', '.pdf', '.xls', '.xlsx', '.ppt', '.pptx'];

      // Iterate over the uploaded files and save them to the database
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { originalname, path: filePath, size } = file;

        // Check file extension
        const fileExtension = path.extname(originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          // If the file extension is not allowed, delete the file and send an error response
          fs.unlinkSync(filePath);
          return res.status(400).json({ error: 'Only document files are allowed' });
        }

        let employeeData = await Employees.findOne({
          where: { employeeId: req.body.employeeId },
        });
        console.log(employeeData);
        const createdBy = `${employeeData.firstName} ${employeeData.lastName}`;
        console.log(createdBy);

        // Construct the document object to save to the database
        const newDocument = await qualityDocument.create({
          filename: originalname,
          path: filePath, // Assuming file path is saved during multer diskStorage configuration
          size: size,
          createdBy: createdBy,
          createdAt: createdAt,
          documentName: documentName,
          reviewedDate: reviewedDate,
          documentCode: documentCode
        });

        uploadedDocuments.push(newDocument);
      }

      res.status(201).json({ uploadedDocuments });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  apiRoutes.get('/qualityDoc', async (req, res) => {
    console.log("test")
    try {
      // Fetch all documents from the database
      const documents = await qualityDocument.findAll();
      console.log(documents)
      // Return the documents as JSON
      res.status(200).send({ documents });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error });
    }
  });

  apiRoutes.get('/employeeFilesByProject/:projectId', async function (req, res) {
    try {
      console.log("dldiv");
      const projectId = req.params.projectId; // Get project ID from the URL parameters

      // Query the database for files associated with the project ID
      const files = await Document.findAll({
        where: {
          projectId: projectId
        }
      });

      res.status(200).json({ files }); // Respond with the array of uploaded files
    } catch (error) {
      console.error('Error retrieving files by project ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  apiRoutes.post('/getAllEmployee', async function (req, res) {
    await Employees.findAll({
      where: { organisationId: req.body.user_organisationId },
      order: [
        ['employeeId', 'DESC']
      ],
      attributes: ['employeeId', 'firstName', 'lastName', 'imageExists', 'designation', 'officialEmail', 'phoneNo', 'DOJ', 'employeeType']
    }).then(result => {
      res.status(200).send(result)
    }, error => {
      res.status(401).send(error)
    })
  });

  apiRoutes.post('/updateEmployeeDetails', async function (req, res) {
    if (req.body.image) {
      req.body.imageExists = 1;
      var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
      require("fs").writeFile("images/employees/" + req.body.employeeId + ".png", base64Data, 'base64', function (err) {
        //console.log(err);
      });
    }

    await Employees.update(req.body, {
      where: { employeeId: req.body.employeeId }
    }).then(result => {
      res.status(200).send({ "msg": "User Details Updated!" })
    }, error => {
      res.status(401).send(error)
    })
  });


  // apiRoutes.get('/getAllOrganisation', async function (req, res) {
  //   await Organisation.findAll().then(result => {
  //     if (result) {
  //       res.status(200).send({ "count": result.length, result })
  //     }
  //   }, error => {
  //     res.status(401).send(error)
  //   })
  // });

  apiRoutes.post('/dailyAttendance', upload.fields([
    { name: 'name' },
    { name: 'type' },
    { name: 'xlsx' }
  ]), async function (req, res) {
    var workbook = XLSX.read(req.files.xlsx[0].buffer, { type: 'buffer' })
    var sheet_name_list = workbook.SheetNames;
    var json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
      raw: false,
    });
    if (json.length == 0) {
      res.send({ msg: 'empty data' });
      res.end();
    }
    else {
      let myObj
      myObj = json
      for (i = 0; i < myObj.length; i++) {
        let employeeId = myObj[i].Employee_Id
        let punchIn = myObj[i].Punch_In
        let punchOut = myObj[i].Punch_Out
        var now = moment(punchOut, "H:mm:ss");
        var prev = moment(punchIn, "H:mm:ss");
        let totalWorkingHours = parseFloat(moment(now).diff(moment(prev), 'Hours', 'minutes')).toFixed(2);
        let overtime
        if (totalWorkingHours > 9) {
          overtime = parseFloat(totalWorkingHours - 9).toFixed(2);
        } else {
          overtime = 0
        }
        let date = myObj[i].Date
        date_ob = new Date(date)
        var day = ("0" + date_ob.getDate()).slice(-2);
        var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        var year = date_ob.getFullYear();
        await Attendance.create({
          employeeId: employeeId,
          punchIn: punchIn,
          punchOut: punchOut,
          date: date,
          day: day,
          year: year,
          month: month,
          organisationId: req.body.organisationId,
          totalWorkingHours: totalWorkingHours,
          overtime: overtime
        })
      }
      res.send({ code: 1, msg: "Employee Attendance Inserted" })
    }
  })

  apiRoutes.post('/updateEmployeeAttendance', async function (req, res) {
    try {

      let employeeData = await Employees.findAll({ where: { employeeId: req.body.employeeId } });
      if (employeeData.length === 1) {
        
        await Attendance.update({
          punchIn: req.body.punchIn,
          punchOut: req.body.punchOut,
          totalWorkingHours: req.body.hours
        }, { where: { employeeId: employeeData[0].biometricId, date: req.body.date } });
        res.status(200).send({ "msg": "Employee Attendance Updated" });

        // sequelize.query(`select employeeId, 
        // FROM_UNIXTIME(punchIn / 1000) AS old_punchIn,
        // FROM_UNIXTIME(punchOut / 1000) AS old_punchOut,date,totalWorkingHours from Attendances where employeeId = '${employeeData[0].biometricId}' and date = '${req.body.date}'`,
        //   {
        //     type: Sequelize.QueryTypes.SELECT
        //   }).then(oldRecord=>{     
            
        // let utcDate = new Date(oldRecord[0].old_punchIn);//.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'})
        // utcDate.setDate(utcDate.getDate() - 1);
        // utcDate = utcDate.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
        // oldRecord[0].old_punchIn = utcDate


        // utcDate = new Date(req.body.punchIn)//.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
        // utcDate.setDate(utcDate.getDate() - 1)
        // oldRecord[0].new_punchIn = utcDate

        // utcDate = new Date(oldRecord[0].old_punchOut)//.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
        // utcDate.setDate(utcDate.getDate() - 1)
        // oldRecord[0].old_punchOut = utcDate

        // utcDate = new Date(req.body.punchOut)//.toLocaleString('en-US', {timeZone: 'Asia/Kolkata'});
        // utcDate.setDate(utcDate.getDate() - 1)
        // oldRecord[0].new_punchOut =utcDate

        // oldRecord[0].updatedBy = new Date(req.body.employeeIdMiddleware)

        // console.log(oldRecord);
        //   },err=>{console.log(err)})
      } else {
        res.status(404).send({ "msg": "Employee not found" });
      }
    } catch (error) {
      res.status(500).send({ "error": error.message });
    }
  });


  apiRoutes.post('/deleteEmployeeAttendance', async function (req, res) {
    await Attendance.destroy({ where: { employeeId: req.body.employeeId, date: req.body.date } }).then(result => {
      res.status(200).send({ "msg": "Employee Attendance Deleted" })
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/viewEmployeesAttendance', async function (req, res) {
    console.log(req.body);
    // const Employees = db.Employees.findOne({where:{employeeId:req.body.employeeIdMiddleware}})
    sequelize.query(`SELECT Employees.employeeId, Employees.firstName, Employees.lastName, Employees.imageExists, Attendances.date,
    Attendances.punchIn, Attendances.punchOut, Attendances.totalWorkingHours
      FROM Employees
      INNER JOIN Attendances
      ON Attendances.employeeId = Employees.biometricId WHERE Attendances.date = '${req.body.date}' And Employees.organisationId = '${req.body.user_organisationId}';`,
      {
        type: Sequelize.QueryTypes.SELECT
      }).then(resp => {
        console.log({ resp });
        res.send(resp)
      }, err => {
        console.log({ err });
        res.status(400).send(err)
      })
  })

  apiRoutes.post('/viewEmployeesMonthAttendance', async function (req, res) {
    console.log(req.body);


    const excludedEmployees = [
      'Yogesh Singh', 'Sonali Sharma', 'Rudresh Ojha', 'Nitin Nambiar', 'Sasidhar Pasumarthi',
      'Manish Yadav', 'Anil Dhupadal', 'Ankit Saraswat', 'Neelam Goyal', 'Sibananda Panigrahy',
      'Haresh Patil', 'Om Prakash', 'Ankur Shukla', 'Prateek Shukla', 'Ishan Dixit',
      'Mukesh Singh', 'Deepti Sharma', 'Shalindra Singh', 'Saumya Mishra', 'Varun Saxena',
      'Sumit Upadhyay', 'Abhishek Singh', 'Akansha Jaiswal', 'Aarthi Singh', 'Anuj Bhatnagar',
      'Thomas Stelma', 'Bhawana Singh', 'Divyank Pilwan', 'Urvashi Chauhan', 'Surjeet Verma',
      'Ashwani Pachori', 'Hansora Umeshbhai', 'Chamdeep Mudigolam', 'Rajat Panwar', 'Nishant Shah',
      'Lokeshwar Byni', 'Kajal Singh', 'Rakesh Kumar', 'Vivan Bajaj', 'Neha Kumari', 'Vivek Yadav',
      'Shikhar Binayak', 'Amreen Khan', 'Shweta Gautam', 'Krishna Pandey', 'Mckinsol Testing',
      'dummy test', 'Anurag Varshney', 'Rajni Varshney', 'Amar Lahare', 'Priyanka Gobhil',
      'Ruchi Bhagat', 'Ruchi Bhagat', 'Nikhil Sidhwani', 'Mayank Gupta', 'Venkata Dhulipala',
      'Nisha Midha', 'Pradeep Nagireddy', 'Ameen Basha', 'Lucila Pellyker', 'Purnima Kharya',
      'Dipti Chauhan', 'Romila bhatt', 'Pragya Soni', 'Shah Aziz', 'Karthika Seetharaman',
      'Suresh Kaki', 'Srinivas Yakkanti', 'Manali Naik', 'charan verma', 'Vijay Rathore',
      'Sushant Suresh', 'Kakarla Geethika', 'Avdhesh Singh', 'Aryaman Varshney', 'Vivan Bajaj',
      'Rakesh Kumar', 'Nishant Shah', 'Saurabh Nigam', null, 'Rajat Panwar', 'Charan Verma'
    ];


    const currentYear = new Date().getFullYear();
    const year = req.body.year || currentYear;
    const month = req.body.month;


    const daysInCurrentMonth = new Date(year, month, 0).getDate();

    const prevMonthYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();


    const prevMonthStartDate = moment.utc(`${prevMonthYear}-${prevMonth}-26`, 'YYYY-MM-DD')

    const prevMonthEndDate = moment.utc(`${year}-${month}-25`, 'YYYY-MM-DD');


    const currentDate = new Date();


    const allDates = [];
    let loopDate = new Date(prevMonthStartDate);


    while (loopDate <= prevMonthEndDate) {
      allDates.push(new Date(loopDate));
      loopDate.setDate(loopDate.getDate() + 1);
    }


    sequelize.query(`
    SELECT 
        Employees.employeeId, 
        CONCAT(Employees.firstName, ' ', Employees.lastName) AS name,
        Attendances.date,
        CASE
            WHEN Attendances.punchIn IS NOT NULL THEN 'P'
            ELSE 'A'
        END AS status
    FROM 
        Employees
    LEFT JOIN 
        Attendances
    ON 
        Attendances.employeeId = Employees.biometricId 
        AND Attendances.date >= '${prevMonthStartDate.toISOString().slice(0, 10)}' 
        AND Attendances.date <= '${prevMonthEndDate.toISOString().slice(0, 10)}'
    WHERE 
        Employees.organisationId = '${req.body.user_organisationId}';
    `, {
      type: Sequelize.QueryTypes.SELECT
    })
      .then(resp => {

        const filteredResp = resp.filter(record => !excludedEmployees.includes(record.name));

        const employeesAttendance = {};


        filteredResp.forEach(row => {
          if (!employeesAttendance[row.name]) {
            employeesAttendance[row.name] = {
              name: row.name,
              attendance: []
            };
          }
        });


        allDates.forEach(date => {
          Object.values(employeesAttendance).forEach(employee => {
            const dateString = date.toISOString().slice(0, 10);
            const attendanceRecord = filteredResp.find(record => record.name === employee.name && record.date === dateString);
            let status = 'NA'; // Default status to NA

            // Check if date is in the past or today
            if (date <= currentDate) {
              // Check if the current date is a Saturday or Sunday
              const dayOfWeek = date.getDay();
              if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday (0) or Saturday (6)
                status = 'W'; // Set status to 'W' for weekend
              } else {
                status = attendanceRecord && attendanceRecord.punchIn !== null ? 'P' : 'A';
              }
            }
            // console.log({date});
            employee.attendance.push({
              date: date,
              status: status
            });


          });
        });

        const result = Object.values(employeesAttendance);
        // console.log({ result });
        res.send({
          attendance: result,
          daysInCurrentMonth: daysInCurrentMonth,
          daysInPrevMonth: daysInPrevMonth
        });
      })
      .catch(err => {
        console.log({ err });
        res.status(400).send(err);
      });
  });
  apiRoutes.post('/downloadEmployeesMonthAttendance', async function (req, res) {
    console.log(req.body);


    const excludedEmployees = [
      'Yogesh Singh', 'Sonali Sharma', 'Rudresh Ojha', 'Nitin Nambiar', 'Sasidhar Pasumarthi',
      'Manish Yadav', 'Anil Dhupadal', 'Ankit Saraswat', 'Neelam Goyal', 'Sibananda Panigrahy',
      'Haresh Patil', 'Om Prakash', 'Ankur Shukla', 'Prateek Shukla', 'Ishan Dixit',
      'Mukesh Singh', 'Deepti Sharma', 'Shalindra Singh', 'Saumya Mishra', 'Varun Saxena',
      'Sumit Upadhyay', 'Abhishek Singh', 'Akansha Jaiswal', 'Aarthi Singh', 'Anuj Bhatnagar',
      'Thomas Stelma', 'Bhawana Singh', 'Divyank Pilwan', 'Urvashi Chauhan', 'Surjeet Verma',
      'Ashwani Pachori', 'Hansora Umeshbhai', 'Chamdeep Mudigolam', 'Rajat Panwar', 'Nishant Shah',
      'Lokeshwar Byni', 'Kajal Singh', 'Rakesh Kumar', 'Vivan Bajaj', 'Neha Kumari', 'Vivek Yadav',
      'Shikhar Binayak', 'Amreen Khan', 'Shweta Gautam', 'Krishna Pandey', 'Mckinsol Testing',
      'dummy test', 'Anurag Varshney', 'Rajni Varshney', 'Amar Lahare', 'Priyanka Gobhil',
      'Ruchi Bhagat', 'Ruchi Bhagat', 'Nikhil Sidhwani', 'Mayank Gupta', 'Venkata Dhulipala',
      'Nisha Midha', 'Pradeep Nagireddy', 'Ameen Basha', 'Lucila Pellyker', 'Purnima Kharya',
      'Dipti Chauhan', 'Romila bhatt', 'Pragya Soni', 'Shah Aziz', 'Karthika Seetharaman',
      'Suresh Kaki', 'Srinivas Yakkanti', 'Manali Naik', 'charan verma', 'Vijay Rathore',
      'Sushant Suresh', 'Kakarla Geethika', 'Avdhesh Singh', 'Aryaman Varshney', 'Vivan Bajaj',
      'Rakesh Kumar', 'Nishant Shah', 'Saurabh Nigam', null, 'Rajat Panwar', 'Charan Verma'
    ];


    const currentYear = new Date().getFullYear();
    const year = req.body.year || currentYear;
    const month = req.body.month;


    const daysInCurrentMonth = new Date(year, month, 0).getDate();

    const prevMonthYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();


    const prevMonthStartDate = moment.utc(`${prevMonthYear}-${prevMonth}-26`, 'YYYY-MM-DD')

    const prevMonthEndDate = moment.utc(`${year}-${month}-25`, 'YYYY-MM-DD');


    const currentDate = new Date();


    const allDates = [];
    let loopDate = new Date(prevMonthStartDate);


    while (loopDate <= prevMonthEndDate) {
      allDates.push(new Date(loopDate));
      loopDate.setDate(loopDate.getDate() + 1);
    }


    sequelize.query(`
    SELECT 
        Employees.employeeId, 
        CONCAT(Employees.firstName, ' ', Employees.lastName) AS name,
        Attendances.date,
        CASE
            WHEN Attendances.punchIn IS NOT NULL THEN 'P'
            ELSE 'A'
        END AS status
    FROM 
        Employees
    LEFT JOIN 
        Attendances
    ON 
        Attendances.employeeId = Employees.biometricId 
        AND Attendances.date >= '${prevMonthStartDate.toISOString().slice(0, 10)}' 
        AND Attendances.date <= '${prevMonthEndDate.toISOString().slice(0, 10)}'
    WHERE 
        Employees.organisationId = '${req.body.user_organisationId}';
    `, {
      type: Sequelize.QueryTypes.SELECT
    })
      .then(resp => {
        console.log(resp);
        const filteredResp = resp.filter(record => !excludedEmployees.includes(record.name));

        const employeesAttendance = {};


        filteredResp.forEach(row => {
          if (!employeesAttendance[row.name]) {
            employeesAttendance[row.name] = {
              name: row.name,
              attendance: []
            };
          }
        });


        allDates.forEach(date => {
          Object.values(employeesAttendance).forEach(employee => {
            const dateString = date.toISOString().slice(0, 10);
            const attendanceRecord = filteredResp.find(record => record.name === employee.name && record.date === dateString);
            let status = 'NA'; // Default status to NA

            // Check if date is in the past or today
            if (date <= currentDate) {
              // Check if the current date is a Saturday or Sunday
              const dayOfWeek = date.getDay();
              if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday (0) or Saturday (6)
                status = 'W'; // Set status to 'W' for weekend
              } else {
                status = attendanceRecord && attendanceRecord.punchIn !== null ? 'P' : 'A';
              }
            }
            // console.log({date});
            employee.attendance.push({
              date: date,
              status: status
            });


          });
        });

        let result = Object.values(employeesAttendance);

        result = result.reduce((acc, curr) => {
          let data = {};
          data.name = curr.name;
          curr.attendance.forEach(element => {
            let date = moment(element.date);
            const formattedDate = date.format('YYYY-MM-DD');
            data[formattedDate] = element.status;
          });
          acc.push(data);
          return acc;
        }, []);
        console.log(result)
        // console.log({ result });
        res.send({
          attendance: result,
          daysInCurrentMonth: daysInCurrentMonth,
          daysInPrevMonth: daysInPrevMonth
        });
      })
      .catch(err => {
        console.log({ err });
        res.status(400).send(err);
      });
  });


  apiRoutes.post('/viewUserAttendance', async function (req, res) {
    sequelize.query(`SELECT b.employeeId, b.punchIn, b.punchOut, b.date, b.totalWorkingHours FROM Employees a, Attendances b WHERE a.employeeId = ${req.body.employeeId} AND b.employeeId = a.biometricId ORDER BY DATE DESC LIMIT 30`,
      {
        type: Sequelize.QueryTypes.SELECT
      }).then(resp => {
        res.send(resp)
      }, err => {
        res.status(400).send(err)
      })
  })

  apiRoutes.get('/employeesAttendanceDownload', async function (req, res) {
    sequelize.query(`
    SELECT Employees.employeeId as id, Employees.firstName, Employees.lastName, Employees.biometricId, Attendances.date,
    Attendances.punchIn, Attendances.punchOut, Attendances.totalWorkingHours as hours
FROM Employees
LEFT JOIN Attendances ON Employees.biometricId = Attendances.employeeId AND Attendances.date = '${req.query.date}' 
order by Employees.firstName
`,
      {
        type: Sequelize.QueryTypes.SELECT
      }).then(resp => {
        let fileName = 'Attendance_' + req.query.date + '.xlsx';
        // //console.log(fileName)
        resp = resp.filter(e => e['biometricId'] != null);
        resp.forEach(r => {
          delete r['biometricId'];
          r['date'] = req.query.date;
          // var input = d;
          // var fmt = "YYYY-MM-DD hh:mm:ss";  // must match the input
          // var zone = "Asia/Kolkata";
          // var m = moment.tz(input, fmt, zone);
          // m = m.utc();
          // var s = m.format(fmt);
          // var m = moment.unix(utc).tz('Asia/Kolkata').format("hh:mm a")
          if (r.punchIn) {
            var punchIn = moment.utc(r.punchIn);
            r.punchIn = punchIn.tz('Asia/Kolkata').format("hh:mm a")
          }
          if (r.punchOut) {
            var punchOut = moment.utc(r.punchOut);
            r.punchOut = punchOut.tz('Asia/Kolkata').format("hh:mm a")
          }

          // r.punchIn = moment(r.punchIn).format("hh:mm a")
          // if(r.punchOut)
          // r.punchOut = moment(r.punchOut).format("hh:mm a")
        })
        res.xls(fileName, resp)
      }, err => {
        res.status(400).send(err)
      })
  })

  apiRoutes.post('/generateSalaries', async function (req, res) {
    let month = req.body.month;
    let year = req.body.year
    await Employees.findAll({ where: { organisationId: req.body.user_organisationId } }).then(async result => {
      for (i = 0; i < result.length; i++) {
        let pfDeduction
        let esicDeduction
        let overAllDeductedSalary

        let employeeId = result[i].employeeId
        let employeeName = result[i].firstName + ' ' + result[i].lastName
        let basicSalary = result[i].basicSalary
        let totalSalary = result[i].totalSalary
        let presentDays;
        let overtimeSalary = 0;
        let overtimeHours = 0;

        //console.log("264", totalSalary, basicSalary, employeeId)
        daysInMonth = new Date(year, month, 0).getDate();

        await Attendance.findAll({
          where: {
            employeeId: employeeId,
            month: month,
            year: year,
            organisationId: req.body.user_organisationId
          }
        },
          {
            type: Sequelize.QueryTypes.SELECT
          }).then(resp => {
            // //console.log("attendanceData resp ", resp)
            presentDays = resp.length;
            resp.forEach(attendance => {
              //console.log("attendanceData.overtime ", attendance.overtime)
              overtimeHours += attendance.overtime
              overtimeSalary += 20 * attendance.overtime
            });
          })
        let basicSalaryNew = ((basicSalary / daysInMonth) * presentDays).toFixed(2)
        let totalSalaryNew = ((totalSalary / daysInMonth) * presentDays).toFixed(2)
        if (basicSalary <= 10500) {
          pfDeduction = ((basicSalaryNew * 12) / 100)
        } else {
          pfDeduction = 0
        }
        if (totalSalary <= 21000) {
          esicDeduction = ((totalSalaryNew * 0.75) / 100)
        } else {
          esicDeduction = 0
        }
        let overallDeduction = pfDeduction + esicDeduction;

        overAllDeductedSalary = (((totalSalary / daysInMonth) * presentDays) - (pfDeduction + esicDeduction)).toFixed(2);

        let monthlySalaryCount = await MonthlySalary.count({ where: { employeeId: employeeId, month: month, year: year } })

        //console.log("monthlySalaryCount ", monthlySalaryCount)
        if (monthlySalaryCount == 0) {
          let salaryObj = {
            employeeId: employeeId,
            employeeName: employeeName,
            organisationId: req.body.organisationId,
            totalWorkingDays: presentDays,
            basicSalary: basicSalaryNew,
            pfDeduction: parseFloat(pfDeduction).toFixed(2),
            esicDeduction: parseFloat(esicDeduction).toFixed(2),
            overallDeduction: parseFloat(overallDeduction).toFixed(2),
            overtimeSalary: parseFloat(overtimeSalary).toFixed(2),
            overtimeHours: parseFloat(overtimeHours).toFixed(2),
            totalSalary: parseFloat(totalSalaryNew).toFixed(2),
            overAllDeductedSalary: parseFloat(overAllDeductedSalary).toFixed(2),
            date: new Date(),
            month: month,
            year: year
          }
          await MonthlySalary.create(salaryObj)

        } else {
          await MonthlySalary.update({
            totalWorkingDays: presentDays,
            basicSalary: basicSalaryNew,
            pfDeduction: parseFloat(pfDeduction).toFixed(2),
            esicDeduction: parseFloat(esicDeduction).toFixed(2),
            overallDeduction: parseFloat(overallDeduction).toFixed(2),
            overtimeSalary: parseFloat(overtimeSalary).toFixed(2),
            overtimeHours: parseFloat(overtimeHours).toFixed(2),
            totalSalary: parseFloat(totalSalaryNew).toFixed(2),
            overAllDeductedSalary: parseFloat(overAllDeductedSalary).toFixed(2),
            date: new Date()
          }, {
            where: { employeeId: employeeId, month: month, year: year }
          });
        }
      }
      res.status(200).send({ "msg": "All Employee Salary Created Please Verify!" })
    })
  })

  apiRoutes.post('/getMonthlySalary', function (req, res) {
    sequelize.query(`SELECT *
    FROM Monthly_Salaries
    INNER JOIN Employees
    ON Monthly_Salaries.employeeId = Employees.employeeId AND Monthly_Salaries.year = '${req.body.year}' WHERE Monthly_Salaries.month = '${req.body.month}' AND Employees.organisationId = '${req.body.organisationCode}'`,
      {
        type: Sequelize.QueryTypes.SELECT
      }).then(resp => {
        res.send(resp)
      }, err => {
        res.status(400).send(err)
      })
  });

  // apiRoutes.post('/downloadexcel', async function (req, res) {
  //   let month = req.body.month
  //   let organisationId = req.body.organisationId
  //   if (month) {
  //     let userDetails = await MonthlySalary.findAll({ where: { month: month, organisationId: organisationId } })
  //     let data = JSON.stringify(userDetails)
  //   }
  // })



  apiRoutes.post('/createBoard', async function (req, res) {
    await board.create({
      boardName: req.body.boardName,
      teamId: req.body.teamId,
      organisationId: req.body.user_organisationId
    }).then(c => {

      res.status(200).send({ "msg": "Board Created" })
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/updateBoard', async function (req, res) {
    await board.update({
      boardName: req.body.boardName,
      teamId: req.body.teamId
    }, { where: { boardId: req.body.boardId } }).then(c => {
      res.status(200).send({ "msg": "Board Updated" })
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/deleteBoard', async function (req, res) {
    await board.destroy({ where: { boardId: req.body.boardId } }).then(c => {
      res.status(200).send({ "msg": "Board Deleted" })
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/fetchBoard', async function (req, res) {
    await board.findAll({ where: { organisationId: req.body.user_organisationId } }).then(c => {
      res.status(200).send(c)
    }, error => {
      res.status(401).send(error)
    })
  })
  apiRoutes.post('/createTeamColumn', async function (req, res) {

    await columnBoard.create(req.body).then(c => {
      res.status(200).send(c)
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/updateTeamColumn', async function (req, res) {
    await columnBoard.update(req.body, { where: { columnId: req.body.columnId } }).then(c => {
      res.status(200).send(c)
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/deleteTeamColumn', async function (req, res) {
    //console.log("deleteTeamColumn", req.body.columnId)
    await columnBoard.destroy({ where: { columnId: req.body.columnId } }).then(c => {
      res.status(200).send({ success: true })
    }, error => {
      res.status(401).send(error)
    })
  })

  // apiRoutes.post('/fetchTeamColumns', async function (req, res) {
  //   await columnBoard.findAll({ where: { teamId: req.body.teamId, organisationId:req.body.user_organisationId } }).then(c => {
  //     res.status(200).send(c)
  //   }, error => {
  //     res.status(401).send(error)
  //   })
  // })

  apiRoutes.post('/createTeam', async function (req, res) {
    await Teams.create({
      teamName: req.body.teamName,
      organisationId: req.body.user_organisationId,
    }).then(c => {
      res.status(200).send({ "msg": "Team Created" })
    }, error => {
      res.status(401).send(error)
    })
  })
  apiRoutes.post('/fetchEmployees', async function (req, res) {
    try {
      const teams = await Teams.findAll({
        where: {
          teamId: {
            [Sequelize.Op.in]: [54, 88, 110, 112]
          }
        }
      });

      const employeeIds = teams.reduce((acc, team) => {
        acc.push(...team.users, ...team.managers);
        return acc;
      }, []);

      console.log('Employee IDs:', employeeIds);

      const employees = await Employees.findAll({
        where: {
          employeeId: {
            [Sequelize.Op.in]: employeeIds
          }
        },
        attributes: ['employeeId', 'firstName', 'lastName'],
        group: ['employeeId'],
        order: [['firstName', 'ASC']]
      });
      console.log(employees);

      const results = employees.map(employee => ({
        employeeId: employee.employeeId,
        firstName: `${employee.firstName} ${employee.lastName}`
      }));
      console.log(results);

      res.status(200).send({ results });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });

  apiRoutes.post('/fetchSalesEmployees', async function (req, res) {
    try {
      const teams = await Teams.findAll({
        where: {
          teamId: {
            [Sequelize.Op.in]: [98]
          }
        }
      });

      const employeeIds = teams.reduce((acc, team) => {
        acc.push(...team.users, ...team.managers);
        return acc;
      }, []);

      console.log('Employee IDs:', employeeIds);

      const employees = await Employees.findAll({
        where: {
          employeeId: {
            [Sequelize.Op.in]: employeeIds
          }
        },
        attributes: ['employeeId', 'firstName', 'lastName'],
        group: ['employeeId'],
        order: [['firstName', 'ASC']]
      });
      console.log(employees);

      const results = employees.map(employee => ({
        employeeId: employee.employeeId,
        firstName: `${employee.firstName} ${employee.lastName}`
      }));
      console.log(results);

      res.status(200).send({ results });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });
  apiRoutes.post('/fetchDevEmployees', async function (req, res) {
    try {
      const teams = await Teams.findAll({
        where: {
          teamId: {
            [Sequelize.Op.in]: [88]
          }
        }
      });

      const employeeIds = teams.reduce((acc, team) => {
        acc.push(...team.users, ...team.managers);
        return acc;
      }, []);

      console.log('Employee IDs:', employeeIds);

      const employees = await Employees.findAll({
        where: {
          employeeId: {
            [Sequelize.Op.in]: employeeIds
          }
        },
        attributes: ['employeeId', 'firstName', 'lastName'],
        group: ['employeeId'],
        order: [['firstName', 'ASC']]
      });
      console.log(employees);

      const results = employees.map(employee => ({
        employeeId: employee.employeeId,
        firstName: `${employee.firstName} ${employee.lastName}`
      }));
      console.log(results);

      res.status(200).send({ results });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });



  apiRoutes.post('/updateTeam', async function (req, res) {
    await Teams.update(req.body, { where: { teamId: req.body.teamId } }).then(c => {
      res.status(200).send({ "msg": "Team Updated" })
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/deleteTeam', async function (req, res) {
    await Teams.destroy({ where: { teamId: req.body.teamId } }).then(c => {
      res.status(200).send({ "msg": "Team Deleted" })
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/fetchTeams', async function (req, res) {
    await Teams.findAll({ where: { organisationId: req.body.user_organisationId } }).then(c => {
      res.status(200).send(c)
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/getMyTeamId', async function (req, res) {
    await Teams.findAll({
      attributes: ['teamId'],
      where: Sequelize.literal(`JSON_CONTAINS(users, '[${req.body.employeeId}]')`),
    }).then(c => {
      res.status(200).send(c)
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/massOnboarding', upload.fields([
    { name: 'name' },
    { name: 'type' },
    { name: 'xlsx' }
  ]), async function (req, res) {
    var workbook = XLSX.read(req.files.xlsx[0].buffer, { type: 'buffer' })
    var sheet_name_list = workbook.SheetNames;
    var json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
      raw: false,
    });
    if (json.length == 0) {
      res.send({ msg: 'empty data' });
      res.end();
    }
    else {
      let myObj
      myObj = json
      //console.log("245", myObj)
      for (i = 0; i < myObj.length; i++) {
        let First_Name = myObj[i].First_Name
        let Middle_Name = myObj[i].Middle_Name
        let Last_Name = myObj[i].Last_Name
        let Personal_Email = myObj[i].Personal_Email
        let Official_Email_ID = myObj[i].Official_Email_ID
        let Official_Email_Password = myObj[i].Official_Email_Password
        let Phone_Number = myObj[i].Phone_Number
        let Present_Address = myObj[i].Present_Address
        let Permanent_Address = myObj[i].Permanent_Address
        let Pan_Number = myObj[i].Pan_Number
        let Adhar_Number = myObj[i].Adhar_Number
        let Gender = myObj[i].Gender
        let DOJ = myObj[i].DOJ
        let DOB = myObj[i].DOB
        let Employee_Type = myObj[i].Employee_Type
        let Father_Name = myObj[i].Father_Name
        let Spouse_Name = myObj[i].Spouse_Name
        let Emergency_Contact_Name = myObj[i].Emergency_Contact_Name
        let Emergency_Contact_Number = myObj[i].Emergency_Contact_Number
        let Organisation_ID = myObj[i].Organisation_ID
        let Company_Name = myObj[i].Company_Name
        let Company_Branch = myObj[i].Company_Branch
        let Apperisal_Days = myObj[i].Apperisal_Days
        let Basic_Salary = myObj[i].Basic_Salary
        let Total_Salary = myObj[i].Total_Salary
        let password = myObj[i].Password
        let designation = myObj[i].Designation
        let userGroup = myObj[i].userGroup
        bcrypt.genSalt(10, function (err, result) {
          bcrypt.hash(Official_Email_ID, result, function (err, hash) {
            if (err) {
              return //console.log('Cannot encrypt');
            }
            Employees.create({
              firstName: First_Name,
              middleName: Middle_Name,
              lastName: Last_Name,
              personalEmail: Personal_Email,
              officialEmail: Official_Email_ID,
              officialEmailPassword: Official_Email_Password,
              presentAddress: Present_Address,
              phoneNo: Phone_Number,
              permanentAddress: Permanent_Address,
              panNumber: Pan_Number,
              adharNumber: Adhar_Number,
              gender: Gender,
              DOJ: DOJ,
              DOB: DOB,
              employeeType: Employee_Type,
              fatherName: Father_Name,
              spouseName: Spouse_Name,
              emergencyContachName: Emergency_Contact_Name,
              emergencyContactNumber: Emergency_Contact_Number,
              organisationId: Organisation_ID,
              companyName: Company_Name,
              companyBranch: Company_Branch,
              apperisalDays: Apperisal_Days,
              basicSalary: Basic_Salary,
              totalSalary: Total_Salary,
              isActive: true,
              hashedEmail: hash,
              password: password,
              designation: designation,
              userGroup: userGroup,
              organisationId: req.body.user_organisationId
            })
            // let email2 = Official_Email_ID
            // let subject = "Create Your New Password for HR Portal Login"
            // let message = `Hello ${First_Name} ${Last_Name}, <br><br> Please Create Your New Password for HR Portal Login.<br><br> Thanks<br>Team HR`
            // mailer(transporter, email2, subject, message)
            // }
          })
        })
      }
      res.send({ code: 1, msg: "Employee Attendance Inserted" })
    }
  })

  apiRoutes.post('/filterdataTask', async function (req, res) {

    let employeeId = req.body.employeeId
    let to = req.body.to
    let from = req.body.from
    let statuses = req.body.statuses

    if (employeeId.length > 0) {
      let query = `select tab1.*,
      (
        case
          when (Projects.projectName is not null) then Projects.projectName
          else 'No Project Assigned'
        end
      ) as projectName
    from
      (
        select
          Employees.lastName,
          Employees.firstName,
          Employees.employeeId,
          Tasks.to,
          Tasks.date,
          Tasks.from,
          Tasks.hours,
          Tasks.status,
          Tasks.taskId,
          Tasks.taskName,
          Tasks.projectId,
          Tasks.approverId,
          Tasks.approverName,
          Tasks.approvedDate,
          Tasks.estimatedHours,
          columnBoards.columnName
        from
          Employees Inner join Tasks on Employees.employeeId = Tasks.employeeId 
          JOIN columnBoards ON Tasks.columnId = columnBoards.columnId
        where                  
          Employees.employeeId in (${employeeId})
          and Tasks.date between '${to}' and '${from}'
          and Tasks.status in (${statuses})
      ) as tab1 left join Projects on tab1.projectId = Projects.projectId `;
      sequelize.query(query,
        {
          type: Sequelize.QueryTypes.SELECT
        }).then(resp => {
          let newResp = _.groupBy(resp, function (person) {
            var props = ['lastName', 'firstName', 'employeeId'],
              prop = [];
            for (var i = 0, length = props.length; i < length; i++) {
              prop.push(person[props[i]]);
            }
            return prop
          });
          let finalResult = []
          Object.entries(newResp).forEach(([key, value]) => {
            // //console.log(`${key} ${value}`); 
            let newValue = value.map(({ employeeId, firstName, lastName, ...rest }) => {
              return rest;
            });
            let myArray = key.split(",");
            let finalResultObject = {}
            finalResultObject['details'] = {}
            finalResultObject['details']['task'] = newValue
            finalResultObject['details']['lastName'] = myArray[0]
            finalResultObject['details']['firstName'] = myArray[1]
            finalResultObject['details']['employeeId'] = parseInt(myArray[2])
            finalResult.push(finalResultObject)
          });
          res.send(finalResult)
        }, error => {
          //console.log('error is.........', error)
          res.status(400).send({ msg: JSON.stringify(error) })
        })
    } else {
      res.status(400).send({ "msg": "Please Select Employee" })
    }
  }),

    apiRoutes.post('/getNotifications', async function (req, res) {
      //console.log("741", req.body.employeeId)
      let data = await Notification.findAll({ where: { employeeId: req.body.employeeId, organisationId: req.body.user_organisationId } })
      //console.log(data.length)
      await Notification.findAll({
        limit: 20, where: { employeeId: req.body.employeeId, organisationId: req.body.user_organisationId }, order: [
          ['notificationId', 'DESC']
        ]
      }).then(resp => {
        res.send({ "count": data.length, resp })
      }, error => {
        res.send({ msg: "error" })
      })
    })

  // let test = {
  //   "analysis": {
  //     "title": "DMAC Profiling Report",
  //     "date_start": "2022-10-17 14:41:19.286235",
  //     "date_end": "2022-10-17 14:41:25.070987",
  //     "duration": "0:00:05.784752"
  //   },
  //   "table": {
  //     "n": 12,
  //     "n_var": 67,
  //     "memory_size": 6308,
  //     "record_size": 525.6666666666666,
  //     "n_cells_missing": 527,
  //     "n_vars_with_missing": 54,
  //     "n_vars_all_missing": 34,
  //     "p_cells_missing": 0.6554726368159204,
  //     "types": {
  //       "Categorical": 29,
  //       "Unsupported": 34,
  //       "Numeric": 1,
  //       "Boolean": 3
  //     },
  //     "n_duplicates": 0,
  //     "p_duplicates": 0.0
  //   },
  //   "variables": {
  //     "Plant": {
  //       "n_distinct": 12,
  //       "p_distinct": 1.0,
  //       "is_unique": true,
  //       "n_unique": 12,
  //       "p_unique": 1.0,
  //       "type": "Categorical",
  //       "hashable": true,
  //       "value_counts_without_nan": {
  //         "0001": 1,
  //         "0003": 1,
  //         "1000": 1,
  //         "2000": 1,
  //         "INDC": 1,
  //         "INST": 1,
  //         "MCK1": 1,
  //         "MCK2": 1,
  //         "RFDC": 1,
  //         "RFST": 1,
  //         "RRDC": 1,
  //         "RRST": 1
  //       },
  //       "value_counts_index_sorted": {
  //         "0001": 1,
  //         "0003": 1,
  //         "1000": 1,
  //         "2000": 1,
  //         "INDC": 1,
  //         "INST": 1,
  //         "MCK1": 1,
  //         "MCK2": 1,
  //         "RFDC": 1,
  //         "RFST": 1,
  //         "RRDC": 1,
  //         "RRST": 1
  //       },
  //       "ordering": true,
  //       "n_missing": 0,
  //       "n": 12,
  //       "p_missing": 0.0,
  //       "count": 12,
  //       "memory_size": 224,
  //       "first_rows": {
  //         "0": "0001",
  //         "1": "0003",
  //         "2": "1000",
  //         "3": "2000",
  //         "4": "INDC"
  //       },
  //       "chi_squared": {
  //         "statistic": 0.0,
  //         "pvalue": 1.0
  //       },
  //       "max_length": 4,
  //       "mean_length": 4.0,
  //       "median_length": 4,
  //       "min_length": 4,
  //       "length_histogram": {
  //         "4": 12
  //       },
  //       "histogram_length": {
  //         "counts": [
  //           12
  //         ],
  //         "bin_edges": [
  //           3.5,
  //           4.5
  //         ]
  //       },
  //       "n_characters_distinct": 14,
  //       "n_characters": 48,
  //       "character_counts": {
  //         "0": 12,
  //         "R": 6,
  //         "C": 5,
  //         "1": 3,
  //         "D": 3,
  //         "S": 3,
  //         "T": 3,
  //         "2": 2,
  //         "I": 2,
  //         "N": 2,
  //         "M": 2,
  //         "K": 2,
  //         "F": 2,
  //         "3": 1
  //       },
  //       "category_alias_values": {
  //         "0": "Decimal_Number",
  //         "R": "Uppercase_Letter",
  //         "C": "Uppercase_Letter",
  //         "1": "Decimal_Number",
  //         "D": "Uppercase_Letter",
  //         "S": "Uppercase_Letter",
  //         "T": "Uppercase_Letter",
  //         "2": "Decimal_Number",
  //         "I": "Uppercase_Letter",
  //         "N": "Uppercase_Letter",
  //         "M": "Uppercase_Letter",
  //         "K": "Uppercase_Letter",
  //         "F": "Uppercase_Letter",
  //         "3": "Decimal_Number"
  //       },
  //       "block_alias_values": {
  //         "0": "ASCII",
  //         "R": "ASCII",
  //         "C": "ASCII",
  //         "1": "ASCII",
  //         "D": "ASCII",
  //         "S": "ASCII",
  //         "T": "ASCII",
  //         "2": "ASCII",
  //         "I": "ASCII",
  //         "N": "ASCII",
  //         "M": "ASCII",
  //         "K": "ASCII",
  //         "F": "ASCII",
  //         "3": "ASCII"
  //       },
  //       "block_alias_counts": {
  //         "ASCII": 48
  //       },
  //       "n_block_alias": 1,
  //       "block_alias_char_counts": {
  //         "ASCII": {
  //           "0": 12,
  //           "R": 6,
  //           "C": 5,
  //           "1": 3,
  //           "D": 3,
  //           "S": 3,
  //           "T": 3,
  //           "2": 2,
  //           "I": 2,
  //           "N": 2,
  //           "M": 2,
  //           "K": 2,
  //           "F": 2,
  //           "3": 1
  //         }
  //       },
  //       "script_counts": {
  //         "Latin": 30,
  //         "Common": 18
  //       },
  //       "n_scripts": 2,
  //       "script_char_counts": {
  //         "Common": {
  //           "0": 12,
  //           "1": 3,
  //           "2": 2,
  //           "3": 1
  //         },
  //         "Latin": {
  //           "R": 6,
  //           "C": 5,
  //           "D": 3,
  //           "S": 3,
  //           "T": 3,
  //           "I": 2,
  //           "N": 2,
  //           "M": 2,
  //           "K": 2,
  //           "F": 2
  //         }
  //       },
  //       "category_alias_counts": {
  //         "Uppercase Letter": 30,
  //         "Decimal Number": 18
  //       },
  //       "n_category": 2,
  //       "category_alias_char_counts": {
  //         "Decimal_Number": {
  //           "0": 12,
  //           "1": 3,
  //           "2": 2,
  //           "3": 1
  //         },
  //         "Uppercase_Letter": {
  //           "R": 6,
  //           "C": 5,
  //           "D": 3,
  //           "S": 3,
  //           "T": 3,
  //           "I": 2,
  //           "N": 2,
  //           "M": 2,
  //           "K": 2,
  //           "F": 2
  //         }
  //       },
  //       "word_counts": {
  //         "0001": 1,
  //         "0003": 1,
  //         "1000": 1,
  //         "2000": 1,
  //         "indc": 1,
  //         "inst": 1,
  //         "mck1": 1,
  //         "mck2": 1,
  //         "rfdc": 1,
  //         "rfst": 1,
  //         "rrdc": 1,
  //         "rrst": 1
  //       }
  //     }
  //   }
  // }

  // async function excelGenerate() {
  //   //console.log(" excelGenerate ")

  //   const ws = XLSX.utils.json_to_sheet([test.analysis])

  //   const wb = XLSX.utils.book_new()
  //   await XLSX.utils.book_append_sheet(wb, ws, 'users')
  //   var tempFilePath = path.join(os.tmpdir(), new Date().getTime() + "-DMAC.xlsx");

  //   await XLSX.writeFile(wb, tempFilePath)
  //   //console.log(" excelGenerate tempFilePath ", tempFilePath)
  // }
  // excelGenerate();


  apiRoutes.post('/organisationChart', async function (req, res) {
    // let data = await sequelize.query(`SELECT * from Teams WHERE JSON_CONTAINS(managers, '${203}', '$');`, { type: Sequelize.QueryTypes.SELECT })
    // //console.log(data)
    let data = await sequelize.query(`SELECT * from Teams a where a.teamName = "LOB"`, { type: Sequelize.QueryTypes.SELECT })
    let id = data[0].users
    let managerid = data[0].managers
    let headNode = await sequelize.query(`SELECT * from Employees a where a.employeeId IN(${managerid})`, { type: Sequelize.QueryTypes.SELECT })
    let nodeArray = []
    for (i = 0; i < headNode.length; i++) {
      let firstName = headNode[i].firstName
      let lastName = headNode[i].lastName
      let employeeId = headNode[i].employeeId
      let officialEmail = headNode[i].officialEmail
      let teamArray = []
      let detailsData = await sequelize.query(`SELECT * from Employees a where a.employeeId IN(${id})`, { type: Sequelize.QueryTypes.SELECT })
      for (j = 0; j < detailsData.length; j++) {
        let teamFirstName = detailsData[j].firstName
        let teamLastName = detailsData[j].lastName
        let teamEmployeeId = detailsData[j].employeeId
        let teamOfficialEmail = detailsData[j].officialEmail
        let chieldTeamDataArray = []

        let teamIdSearch = await sequelize.query(`SELECT * from Teams WHERE JSON_CONTAINS(managers, '${teamEmployeeId}', '$');`, { type: Sequelize.QueryTypes.SELECT })
        for (l = 0; l < teamIdSearch.length; l++) {
          let chieldTeamData = await sequelize.query(`SELECT * from Employees a where a.employeeId IN(${teamIdSearch[l].users})`, { type: Sequelize.QueryTypes.SELECT })
          for (o = 0; o < chieldTeamData.length; o++) {

            let teamIdSearchdata = await sequelize.query(`SELECT * from Teams WHERE JSON_CONTAINS(managers, '${chieldTeamData[o].employeeId}', '$');`, { type: Sequelize.QueryTypes.SELECT })
            let subChildData = []
            for (p = 0; p < teamIdSearchdata.length; p++) {
              let chieldTeamDatasss = await sequelize.query(`SELECT * from Employees a where a.employeeId IN(${teamIdSearchdata[p].users})`, { type: Sequelize.QueryTypes.SELECT })
              for (q = 0; q < chieldTeamDatasss.length; q++) {
                subChildData.push({
                  "firstName": chieldTeamDatasss[q].firstName,
                  "lastName": chieldTeamDatasss[q].lastName,
                  "employeeId": chieldTeamDatasss[q].employeeId,
                  "officialEmail": chieldTeamDatasss[q].officialEmail,
                  "chieldNode": []
                })
              }
            }
            chieldTeamDataArray.push({ "firstName": chieldTeamData[o].firstName, "lastName": chieldTeamData[o].lastName, "employeeId": chieldTeamData[o].employeeId, "officialEmail": chieldTeamData[o].officialEmail, "chieldNode": subChildData })
          }
        }
        teamArray.push({ "teamFirstName": teamFirstName, "teamLastName": teamLastName, "teamEmployeeId": teamEmployeeId, "teamOfficialEmail": teamOfficialEmail, "chieldNode": chieldTeamDataArray })
      }
      nodeArray.push({ "firstName": firstName, "lastName": lastName, "employeeId": employeeId, "officialEmail": officialEmail, "teamArray": teamArray })
    }
    res.send(nodeArray)
  })

  // apiRoutes.post('/abhi',(req,res)=>{
  //   res.send("hello world...")
  // })

  // var newPunchOut = moment(1696351089000);
  // var newPuncIn = moment(1696318269000);
  // //console.log("newPunchOut....", newPunchOut)
  // //console.log("newPuncIn....", newPuncIn)

  // let totalWorkingHours = parseFloat(moment(newPunchOut).diff(moment(newPuncIn), 'Hours', 'minutes')).toFixed(2);
  // //console.log("time difference is ...", totalWorkingHours)

  // apiRoutes.post('/tes',async (req, res) => {
  //   await Employees.findAll({}).then(re => {
  //     //console.log("employees result is...", re.length);
  //   }, error => {
  //     //console.log("error while finding the employees data..", error)
  //   })
  //   //console.log("hello hi there ...");
  // })\

  upload = multer();
  apiRoutes.post('/readExcel', upload.single('file'), async (req, res) => {  // This is for data upload into db.
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    let epic = {};
    let story = {};
    if (sheetData.length === 0) {
      return res.status(400).json({ error: 'Empty data' });
    }

    for (const element of sheetData) {
      let projectId = req.body.projectId;
      try {
        epic = {
          "name": `${element.Epic}`,
          "start": "2024-04-01",
          "end": "2024-04-02",
          "progress": 0,
          "projectId": `${projectId}`,
          "organisationId": '11'
        };
        story = {
          "name": `${element.Story}`,
          "progress": 0,
        };

        let epicData = await db.Epic.findOne({ where: { name: `${element.Epic}`, projectId: projectId } });

        if (epicData) {
          let epicId = epicData.id;
          story.epicId = epicId;
          // console.log(story);
          let existingStory = await db.Story.findOne({ where: { name: `${element.Story}`, epicId: epicId } });
          if (existingStory) {
            console.log('story exist');
          } else {
            await db.Story.create(story);
          }
        } else {
          // Create the epic only if it doesn't exist
          let newEpic = await db.Epic.create(epic);
          let epicId = newEpic.id;
          story.epicId = epicId;
          await db.Story.create(story);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }



    res.json({ code: 1, msg: 'Data extracted successfully', data: sheetData });
  }
  )

  app.use('/', apiRoutes);
};
