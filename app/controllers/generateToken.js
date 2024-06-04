const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');
const Employees = db.Employees;
const Organisation = db.organisation
const Attendance = db.attendance
const Customer = db.Customer
const clientDetail = db.clientDetails
const Otp = db.Otp
const roles = db.roles
const cors = require('cors')({ origin: true });
const api_key = 'key-a14dbfed56acf890771e7d1f3d372a82';
const domain = 'mail.aftersale.in';
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
const axios = require('axios').default;
const xmlparser = require('express-xml-bodyparser');
const xml = require('xml');
const moment = require('moment');
const nodemailer = require('nodemailer')
const smtp = require('../../config/main');
const e = require('express');
var multer = require('multer')
const jwt = require('jsonwebtoken');
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
};
let transporter = nodemailer.createTransport(smtpConfig);
transporter.verify(function (error) {
  if (error) {
    //console.log(error);
  }
});
const storage = multer.diskStorage({
  destination: './images/',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })



module.exports = {
    generateAccessToken: function (user) {
      console.log("user details...", user);
      const payload = {
        id: user.userId,
        email: user.userEmail,
        organisationId:user.organisationId
      };
  
      const secret = 'hrPortal_secret_key';
      const options = { expiresIn: '30d' };
  
      return jwt.sign(payload, secret, options);
    }
  };
