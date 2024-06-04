const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');
const apiRoutes = express.Router();
const inventory = db.inventory
const Employees = db.Employees;
const assignItem = db.assignItem;
const moment = require('moment');
let multer = require('multer')
let path = require('path')
const XLSX = require('xlsx');
//////////////////////////////Email /////////////////////////////////
//////////////////////////Email ////////////////////////////
const smtp = require('../../config/main');
const nodemailer = require('nodemailer');
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
transporter.verify(function (error, success) {
  if (error) {
    //console.log(error);
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
// let json2xls = require("json2xls");
// const bcrypt = require("bcrypt");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let paths = path.resolve("images/documents")
//     cb(null, paths)
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// })
// let upload = multer({ storage: storage })
let upload = multer({ dest: "images/", storage: multer.memoryStorage() })

module.exports = function (app) {


    apiRoutes.post('/createInventoryItems', async function (req, res) {
        await inventory.create({
            "itemType": req.body.itemType,
            "companyBrand": req.body.companyBrand,
            "serialnumber": req.body.serialnumber,
            "modelNumber": req.body.modelNumber,
            "hostName": req.body.hostName,
            "dateofpurchase": req.body.dateofpurchase,
            "orderNumber": req.body.orderNumber,
            "dateofIssue": req.body.dateofIssue,
            "ram": req.body.ram,
            "systemPassword": req.body.systemPassword,
            "uniqueId": req.body.uniqueId,
            "pin": req.body.pin,
            "accessories": req.body.accessories,
            "warrantyPeriod": req.body.warrantyPeriod,
            "workingStatus": req.body.workingStatus,
            "adminPassword": req.body.adminPassword,
            "isReturn": req.body.isReturn,
            "organisationId": req.body.organisationId
        }).then(resp => {
            res.status(200).send(resp)
        }, err => {
            res.status(400).send(err)
        })
    })
    apiRoutes.post('/updateInventoryItems', async function (req, res) {
        await inventory.update(req.body, {
            where: { id: req.body.id }
        }).then(result => {
            res.status(200).send({ "msg": "User Details Updated!" })
        }, error => {
            res.status(401).send(error)
        })
    })

    apiRoutes.post('/deleteInventoryItem', async function (req, res) {
        await inventory.destroy({ where: { id: req.body.id, organisationId:req.body.organisationId } }).then(result => {
            res.status(200).send({ "msg": "Item Deleted" })
        }, error => {
            res.status(401).send(error)
        })
    })

    apiRoutes.post('/getAllInventoryItems', async function (req, res) {
        await inventory.findAll({
            where: { organisationId: req.body.user_organisationId }, order: [
                ['updatedAt', 'DESC']
            ]
        }).then(result => {
            // let data = []
            // result.forEach(v=>{
            //     if(v.isReturn == 0){
            //         //console.log(v)
            //         let newData = assignItem.findAll({where:{itemTypeId:v.id}})
            //         data.push(newData)
            //     }
            //     else{
            //         data.push(v)
            //     }
            // })
            
            // let abc = assignItem.findAll({itemId : result.id})
            // res.status(200).send(data)
            res.status(200).send(result)
        }, error => {
            res.status(401).send(error)
        })
    })

    apiRoutes.post('/assignItem', async function (req, res) {
        // //console.log("req.body.organisationId", req.body.organisationId)
        let itamassignData = await assignItem.findAll({ where: { itemTypeId: req.body.itemTypeId, isReturnStatus: 1, organisationId:req.body.user_organisationId } })

        // if (itamassignData.length == 0) {
        if (itamassignData.length == 0 || itamassignData[0].email != req.body.email) {
            // //console.log("80",itamassignData[0].email, req.body.email)
            let employeeData = await Employees.findAll({ where: { officialEmail: req.body.email, organisationId:req.body.user_organisationId } })

            let itemDetails = await inventory.findAll({ where: { id: req.body.itemTypeId, organisationId:req.body.user_organisationId } })
            await assignItem.update({ "isReturnStatus": 0 }, { where: { itemTypeId: req.body.itemTypeId, isReturnStatus: 1 } })
            // //console.log("req.body.organisationId",req.body.organisationId,itemDetails[0])
            await assignItem.create({
                "employeeName": employeeData[0].firstName + " " + employeeData[0].lastName,
                "email": req.body.email,
                "phone": employeeData[0].phoneNo,
                "designation": employeeData[0].designation,
                "itemTypeId": req.body.itemTypeId,
                "hostName": itemDetails[0].hostName,
                "itemType": itemDetails[0].itemType,
                "isReturnStatus": 1,
                "organisationId": req.body.organisationId
            }).then(result => {
                // //console.log
                let email2 = [req.body.email, "hr.support@mckinsol.com","bshrivastava@mckinsol.com", "avarshney@mckinsol.com" ]
                // let email2 = 'vkumar@mckinsol.com'
                let subject = `Inventory Item Assigned to ${employeeData[0].firstName + " " + employeeData[0].lastName}`
                let message = `Hello All, <br><br> This is for the information only, Laptop/ Desktop has been assigned to <b>${employeeData[0].firstName + " " + employeeData[0].lastName}</b> on ${result.createdAt}. Below are the Details Kindly Check- <br> Item Type - ${itemDetails[0].itemType},<br> Device Id - ${itemDetails[0].hostName},<br> Serial Number - ${itemDetails[0].serialnumber} <br><br> Please Acknowledge from your end.<br><br> Thanks, <br> IT Support Team`
                // let message = `Hello ${employeeData[0].firstName + " " + employeeData[0].lastName}, <br><br> We Assined a ${itemDetails[0].itemType} to you. Below are the Details Kindly Check- <br> Item Type - ${itemDetails[0].itemType},<br> Device Id - ${itemDetails[0].hostName} <br><br> Please Acknowledge from your end.<br><br> Thanks, <br> IT Support Team`
                
                mailer(transporter, email2, subject, message)
                inventory.update({
                    isReturn: 0
                }, { where: { id: req.body.itemTypeId } })
                res.status(200).send({ code: 1, "msg": "Item Assigned" })
            }, error => {
                res.status(401).send({ code: 0, error })
            })
        } else {
            res.status(200).send({ code: 1, "msg": "Item Already Assign to this User, Please check on Inventory Log" })
        }
    })

    apiRoutes.post('/updateAssignItem', async function (req, res) {

        await assignItem.update(req.body, { where: { id: req.body.id } }).then(result => {
            if (req.body.isReturnStatus == 0) {
                inventory.update({
                    isReturn: 1
                }, { where: { id: req.body.id } })
            }
            res.status(200).send({ "msg": "Updated Assigned Team" })
        }, error => {
            res.status(401).send(error)
        })
    })

    apiRoutes.post('/getAssignItemAllDetails', async function (req, res) {
        // //console.log(req.body.organisationId)
        if (req.body.itemTypeId) {
            await assignItem.findAll({
                where: { itemTypeId: req.body.itemTypeId, organisationId:req.body.user_organisationId }, order: [
                    ['updatedAt', 'DESC']
                ]
            }).then(result => {
                if (result.length > 0) {
                    res.status(200).send({ code: 1, result })
                } else {
                    res.status(200).send({ code: 1, "msg": "No Log Found!" })
                }
            }, error => {
                res.status(401).send({ code: 0, error })
            })
        } else {
            // //console.log("128")
            await assignItem.findAll({
                where: { organisationId: req.body.user_organisationId }, order: [
                    ['updatedAt', 'DESC']
                ]
            }).then(result => {
                // //console.log(result.length)
                if (result.length > 0) {
                    res.status(200).send({ code: 1, result })
                } else {
                    res.status(200).send({ code: 1, "msg": "No Log Found!" })
                }
            }, error => {
                res.status(401).send({ code: 0, error })
            })
        }
    })

    apiRoutes.post('/importInventoryDetails', upload.any(), async function (req, res) {
        let file = req.files[0]
        var workbook = XLSX.read(file.buffer)
        // var workbook = XLSX.read(req.files.xlsx[0].buffer, { type: 'buffer' })
        //console.log("173", workbook)
        var sheet_name_list = workbook.SheetNames;
        var json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
            raw: false,
        });
        //console.log("json", json.length)
        if (json.length == 0) {
            res.send({msg:'empty data'});
            res.end();
        }
        else {
            let myObj
            myObj = json
            //console.log("185", myObj)
            //console.log("Helo")
            for (i = 0; i < myObj.length; i++) {
//console.log("232", myObj[i])
                inventory.create({
                    "itemType": myObj[i].Item_Type,
                    "companyBrand": myObj[i].Company_Brand,
                    "serialnumber": myObj[i].Serial_Number,
                    "modelNumber": myObj[i].Model_Number,
                    "hostName": myObj[i].Host_Name,
                    // "dateofpurchase": myObj[i].Purchase_Date,
                    "orderNumber": myObj[i].Order_Number,
                    // "dateofIssue": myObj[i].Item_Issue_Date,
                    "ram": parseInt(myObj[i].Ram),
                    "systemPassword": myObj[i].System_Password,
                    "uniqueId": myObj[i].Outlook_Unique_Id,
                    "pin": myObj[i].Pin,
                    "accessories": myObj[i].Accessories,
                    "warrantyPeriod": myObj[i].Warranty_Period,
                    "workingStatus": myObj[i].Working_Status,
                    "adminPassword": myObj[i].Admin_Password,
                    "isReturn": parseInt(myObj[i].Is_Return),
                    "organisationId": parseInt(req.body.organisationId)
                })
            }
            res.send({ code: 1, msg: "Inventory Rocord Created" })
        }
    })

    apiRoutes.get('/exportInventoryDetails', async function (req, res) {
        await inventory.findAll({ where: { organisationId: req.query.user_organisationId } }).then(resp => {
            if (resp.length > 0) {
                let data = []
                resp.forEach(async (v, i) => {
                    data.push({
                        "itemType": v.itemType,
                        "companyBrand": v.companyBrand,
                        "serialnumber": v.serialnumber,
                        "modelNumber": v.modelNumber,
                        "hostName": v.hostName,
                        "dateofpurchase": v.dateofpurchase,
                        "orderNumber": v.orderNumber,
                        "dateofIssue": v.dateofIssue,
                        "ram": v.ram,
                        "systemPassword": v.systemPassword,
                        "uniqueId": v.uniqueId,
                        "pin": v.pin,
                        "accessories": v.accessories,
                        "warrantyPeriod": v.warrantyPeriod,
                        "workingStatus": v.workingStatus,
                        "adminPassword": v.adminPassword,
                        "isReturn": v.isReturn,
                        "organisationId":req.body.organisationId
                    })
                })
                let abc = data.sort(function (a, b) { return a.createdAt - b.createdAt })
                let InventoryList = `InventoryList ${new Date()}.xlsx`
                res.xls(InventoryList, abc)
            }
        })
    })


    app.use('/', apiRoutes);
}