const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');
const apiRoutes = express.Router();
// const pdfParse = require('pdf-parse');
// const fs = require('fs');
// const { PythonShell } = require('python-shell');
// const { spawn } = require('child_process');
const atscvpool = db.ats
const atsCertification = db.atsCertification
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
  destination: './images/resume',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })
module.exports = function (app) {


  // apiRoutes.post('/createCVPool', upload.array('files', 15), async function (req, res) {
  apiRoutes.post('/createCVPool', upload.single('file'), async function (req, res) {
    // //console.log("30", req.body.personalDetail.name)
    if (req.body.isFlag == 1) {
      //console.log("32", req.body.isFlag)
      await atscvpool.create({
        "name": req.body.personalDetail.name,
        "email": req.body.personalDetail.email,
        "alternateEmail": req.body.personalDetail.alternateEmail,
        "dob": req.body.personalDetail.dob,
        "phone": req.body.personalDetail.phone,
        "otherPhone": req.body.personalDetail.otherPhone,
        "gender": req.body.personalDetail.gender,
        "country": req.body.personalDetail.country,
        "city": req.body.personalDetail.city,
        "state": req.body.personalDetail.state,
        "zipCode": req.body.personalDetail.zipCode,
        "currentSalary": req.body.personalDetail.currentSalary,
        "exceptedSalary": req.body.personalDetail.exceptedSalary,
        "primarySkill": req.body.personalDetail.primarySkill,
        "secondarySkill": req.body.personalDetail.secondarySkill,
        "jobTitle": req.body.personalDetail.jobTitle,
        "currentCompany": req.body.personalDetail.currentCompany,
        "taxTerm": req.body.personalDetail.taxTerm,
        "linkedURL": req.body.personalDetail.linkedURL,
        "workAuth": req.body.personalDetail.workAuth,
        "expiry": req.body.personalDetail.expiry,
        "yearExp": req.body.personalDetail.yearExp,
        "monthExp": req.body.personalDetail.monthExp,
        "source": req.body.personalDetail.source,
        "clearance": req.body.personalDetail.clearance,
        "employeerName": req.body.employeerDetail.employeerName,
        "employeerPhone": req.body.employeerDetail.employeerPhone,
        "employeerEmail": req.body.employeerDetail.employeerEmail,
        "employeerCurrentCompany": req.body.employeerDetail.employeerCurrentCompany,
        "employeerComment": req.body.employeerDetail.employeerComment,
        "organisationId": req.body.organisationId,
      }).then(resp => {
        res.status(200).send(resp)
      }, err => {
        res.status(400).send(err)
      })
    } else if (req.body.isFlag == 2) {

      await atscvpool.update(req.body, {
        where: { id: req.body.id }
      }).then(result => {
        res.status(200).send({ "msg": "data stored" })
      }, error => {
        res.status(401).send(error)
      })

    } else if (req.body.isFlag == 3) {

      await atscvpool.update({
        "companyDetails":req.body.workExperience
      }, {
        where: { id: req.body.id }
      }).then(result => {
        res.status(200).send({ "msg": "data stored" })
      }, error => {
        res.status(401).send(error)
      })

    } else if (req.body.isFlag == 4) {
      let data = req.file
      //console.log(data)
      await atsCertification.create({
        "originalname": data.originalname,
        "filename": data.filename,
        "size": data.size,
        "mimetype": data.mimetype,
        "path": data.path,
        "certificateName": req.body.certificateName,
        "completionYear": req.body.completionYear,
        "resumeId": req.body.id,
        "documentType": req.body.documentType,
        "organisationId":req.body.user_organisationId
      }).then(resp => {
        res.status(200).send(resp)
      }, err => {
        res.status(400).send(err)
      })
    }
  })

  apiRoutes.post('/updateCvPool', upload.single('file'), async function (req, res) {
    if (req.body.isFlag == 1) {
      await atscvpool.update(req.body, {
        where: { id: req.body.id }
      }).then(result => {
        res.status(200).send({ "msg": "User Details Updated!" })
      }, error => {
        res.status(401).send(error)
      })
    }

  })

  apiRoutes.post('/getCvDetails', async function (req, res) {
    let cvDetails = await atscvpool.findAll({ "id": req.body.id, "organisationId":req.body.user_organisationId })
    let certificateDetails = await atsCertification.findAll({"resumeId":req.body.idm, "organisationId":req.body.user_organisationId})
    res.send({ "Details": cvDetails[0], "certificateDetails": certificateDetails})
  })


  apiRoutes.post('/getAllCvPool', async function (req, res) {
    // await sequelize.query(`SELECT * FROM atscvpools a, atsCertifications b WHERE a.organisationId = ${req.body.organisationId} AND a.id = b.resumeId AND b.documentType = 'resume' ORDER BY a.createdAt DESC`, {
    await sequelize.query(`SELECT a.id, a.name, a.email, a.phone, a.workAuth, a.city, a.state, a.source, a.position, a.createdAt, b.documentType, b.filename FROM atscvpools a, atsCertifications b WHERE a.organisationId = ${req.body.organisationId} AND a.id = b.resumeId AND b.documentType = 'resume' ORDER BY a.createdAt DESC`, {
      type: sequelize.QueryTypes.SELECT
    }).then(result => {
      res.status(200).send(result)
    }, error => {
      res.status(401).send(error)
    })
  })

  apiRoutes.post('/fuzzySearchforCvPool', async function (req, res) {
    let search = req.body.search
    let sCtc = req.body.sCtc
    let eCtc = req.body.eCtc
    //console.log(search)
    await sequelize.query(`SELECT * FROM atscvpools WHERE position REGEXP '${search}' OR location REGEXP '${search}' OR totalExperience REGEXP '${search}' OR releventExperience REGEXP '${search}' OR currentCtc BETWEEN '${sCtc}' AND '${eCtc}' OR expectedCtc BETWEEN '${sCtc}' AND '${eCtc}'`, {
      type: sequelize.QueryTypes.SELECT
    }).then(result => {
      res.status(200).send(result)
    }, error => {
      res.status(401).send(error)
    })
  })


  apiRoutes.post('/deleteCv', async function (req, res) {
    await atscvpool.destroy({ where: { id: req.body.id } }).then(result => {
      res.status(200).send({ "msg": "Data Deleted" })
    }, error => {
      res.status(401).send(error)
    })
  })


  // let options = {
  // mode: 'text',
  // pythonPath: 'path/to/python',
  // pythonOptions: ['-u'], // get print results in real-time
  // scriptPath: 'path/to/my/scripts',
  // args: ['value1', 'value2', 'value3']
  // };
  // PythonShell.run('../hrportalserver/app/pythonScript/ats.py', options, function (err, result) {
  //   if (err) {
  //     //console.log("36", err)
  //   };
  //   //console.log("24", result)
  // });
  // apiRoutes.post('/pdfreader', async function (req, res) {
  //     let options = {
  //         mode: 'text',
  //         // pythonPath: 'path/to/python',
  //         pythonOptions: ['-u'], // get print results in real-time
  //         // scriptPath: 'path/to/my/scripts',
  //         // args: ['value1', 'value2', 'value3']
  //       };
  //     PythonShell.run('/hrportalserver/app/hell.py', options, function (err, result) {
  //         if (err){
  //           //console.log("36", err)
  //         };
  //         //console.log(result)
  //       });
  //   var process = spawn('python3', ["../hrportalserver/app/pythonScript/ats.py"]);

  //   process.stdout.on('data', function (response) {
  //     res.send(response);
  //   })
  // })








  // apiRoutes.post('/formreader', upload.any(), async function (req, res) {
  //   let file = req.files;
  //   // //console.log("file",file);
  //   const filename = `${Date.now()}-${file[0].originalname}`;

  //   const pdfPath = path.join(__dirname, filename);
  //   fs.writeFileSync(pdfPath, file[0].buffer);
  //   let falcon = "invoicefile";
  //   const { exec } = require('child_process');
  //   // Execute the Python script as a child process and pass the PDF file path as an argument
  //     exec(`/usr/local/bin/python3 pythonScripts/formreader.py "${pdfPath}"`, (error, stdout, stderr) => {
  //       if (error) {
  //         console.error('Error executing Python script:', error);
  //         res.status(500).json({ error: 'Internal Server Error' });
  //         return;
  //       }
  //       if (stderr) {
  //         console.error('Python script returned an error:', stderr);
  //         res.status(500).json({ error: 'Internal Server Error' });
  //         return;
  //       }

  //       const extractedText = stdout.trim();
  //       //console.log("extractedTextextractedTextextractedText", extractedText)
  //       // Sample text
  //       const text = extractedText


  //       // Function to extract and clean SSN
  //       function extractSSN(text) {
  //         const ssnIndex = text.indexOf('| Social security number |');
  //         const orIndex = text.indexOf('or', ssnIndex);

  //         if (ssnIndex !== -1 && orIndex !== -1) {
  //           const startIndex = ssnIndex + '| Social security number |'.length;
  //           const extractedData = text.slice(startIndex, orIndex).trim();
  //           const digitsOnly = extractedData.replace(/[\s-]/g, '');
  //           // //console.log('Extracted Data:', digitsOnly);
  //           return digitsOnly
  //         } else {
  //           //console.log('Data not found.');
  //           return null
  //         }
  //       }
  //       let results = []
  //       // Function to extract EIN
  //       function extractEIN(text) {
  //         const employerIndex = text.indexOf('| Employer identification number |');
  //         const oneIndex = text.indexOf('1.', employerIndex);

  //         if (employerIndex !== -1 && oneIndex !== -1) {
  //           const startIndex = employerIndex + '| Employer identification number |'.length;
  //           const extractedData = text.slice(startIndex, oneIndex).trim();
  //           const digitsOnly = extractedData.replace(/\D/g, '');
  //           // //console.log('Extracted Data (Digits Only):', digitsOnly);
  //           return digitsOnly
  //         } else {
  //           //console.log('Data not found.');
  //           return null
  //         }
  //       }
  //       // Function to extract name
  //       function extractName(text) {
  //         const nameSection = text.substring(text.indexOf('1 Name (as shown on your income tax return). Name is required on this line; do not leave this line blank.') + '1 Name (as shown on your income tax return). Name is required on this line; do not leave this line blank.'.length, text.indexOf('2 Business name/disregarded entity name, if different from above')).trim();
  //         //console.log('Name Section:', nameSection);
  //         return nameSection;
  //       }

  //       // Function to extract business name
  //       function extractBusinessName(text) {
  //         const businessSection = text.substring(text.indexOf('2 Business name/disregarded entity name, if different from above') + '2 Business name/disregarded entity name, if different from above'.length, text.indexOf('following seven boxes.')).trim();
  //         return businessSection;
  //       }

  //       // Function to extract address
  //       function extractAddress(text) {
  //         const addressSection = text.substring(text.indexOf('5 Address (number, street, and apt. or suite no.) See instructions.') + '5 Address (number, street, and apt. or suite no.) See instructions.'.length, text.indexOf('6 City, state, and ZIP code')).trim();
  //         return addressSection
  //       }

  //       // Function to extract city, state, and ZIP code
  //       function extractCityStateZip(text) {
  //         const accountSection = text.substring(text.indexOf('6 City, state, and ZIP code') + '6 City, state, and ZIP code'.length, text.indexOf('7 List account number(s) here (optional)')).trim();
  //         const [city, state, zipCode] = accountSection.split(',').map(item => item.trim());
  //         return { city, state, zipCode };
  //       }

  //       // Extract SSN, EIN, name, business name, address, city, state, and ZIP code
  //       const ssn = extractSSN(text);
  //       const ein = extractEIN(text);
  //       const name = extractName(text);
  //       const businessName = extractBusinessName(text);
  //       const address = extractAddress(text);
  //       const { city, state, zipCode } = extractCityStateZip(text);

  //       //console.log('Social Security Number (SSN):', ssn);
  //       //console.log('Employer Identification Number (EIN):', ein);
  //       //console.log('Name:', name);
  //       //console.log('Business Name:', businessName);
  //       //console.log('Address:', address);
  //       //console.log('City:', city);
  //       //console.log('State:', state);
  //       //console.log('ZIP Code:', zipCode);

  //       results.push({ 'SSN': ssn, 'EIN': ein, 'Name': name, 'Business Name': businessName, 'Address': address, 'City': city, 'State': state, 'ZIP Code': zipCode });
  //       res.status(200).json({ results });

  //     })

  // });

  app.use('/', apiRoutes);
}