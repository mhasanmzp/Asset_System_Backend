const express = require('express');
const db = require('../../config/db.config.js');
const auth = require('./generateToken.js')

const Organisation = db.organisation
const userAdmin = db.userAdmin
const Employees = db.Employees

module.exports = function (app) {
    const apiRoutes = express.Router();
    apiRoutes.post('/getAllOrganisation', async function (req, res) {
        console.log("organisation")
        await Organisation.findAll().then((result) => {
            console.log("organisation", result)
            if (result) {
                res.status(200).send(result)
            }
        }, error => {
            //console.log(error)
            res.status(401).send(error)
        })
    });

    apiRoutes.post('/loginAdmin', (req, res) => {
        let email = req.body.email;
        if (email) {
            userAdmin.findOne({
                where: {
                    Email: req.body.email,
                    password: req.body.password,
                    isActive: 1
                }
            }).then(resp => {
                if (resp && Object.keys(resp).length > 0) {
                    let generateTokenPayload = { userId: resp.adminId, organisationId: 0, userEmail: resp.Email }
                    let token = auth.generateAccessToken(generateTokenPayload);

                    res.header('jwt_token', `${token}`);
                    res.send({ userId: resp.adminId, type: 'admin' });
                } else {
                    res.status(400).send("No User found.")
                }
            }, err => {
                res.status(400).send(err)
            })
        }

    })

    apiRoutes.post('/getOrganisationEmployee', async function (req, res) {
        await Employees.findAll({
            where: { organisationId: req.body.organisationUserId },
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

    apiRoutes.post('/activeinactiveOrg', async function (req, res) {
        if(req.body.isActive == 0 || req.body.isActive == 1)
        {
            await Organisation.update({
                isActive: req.body.isActive
            }, {
                where: {
                    organisationId: req.body.orgId
                }
            }).then(result => {
                res.status(200).send({'msg':"Organisation has been updated successfully"})
            }, error => {
                res.status(401).send(error)
            })
        }
        else{
            res.status(400).send({'msg':"Error while updating Organisation"})
        }
    });

    app.use('/', apiRoutes);
}