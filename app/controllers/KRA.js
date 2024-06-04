const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
let moment = require('moment')
const { sequelize, Teams, managerRating } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');
const kra = db.kra;


module.exports = function (app) {
    const apiRoutes = express.Router();
    apiRoutes.post('/createKra', async function (req, res) {
        await kra.create(req.body).then(resp => {
            res.status(200).send(resp)
        }, err => {
            res.status(400).send(err)
        })
    })
    apiRoutes.post('/KraUpdate', async function (req, res) {
        await kra.update(req.body, { where: { kraId: req.body.kraId, organisationId:req.body.organisationId } }).then(result => {
            res.status(200).send({ "msg": "Comment Updated" })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/deleteKra', async function (req, res) {
        await kra.destroy({ where: { kraId: req.body.kraId, organisationId:req.body.organisationId } }).then(result => {
            res.status(200).send({ "msg": "Comment Deleted" })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getAllKra', async function (req, res) {
        await kra.findAll({ where: { organisationId: req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })
    apiRoutes.post('/getUserKra', async function (req, res) {
        await kra.findAll({ where: { employeeId: req.body.employeeId, organisationId:req.body.user_organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getKraForManager', async function (req, res) {

        let result = await managerRating.findAll({ where: { kraId: req.body.kraId, organisationId:req.body.user_organisationId } })
        if (result.length > 0) {
            sequelize.query(`SELECT a.*, b.* FROM kras a, managerRatings b WHERE a.employeeId = ${req.body.employeeId} AND a.kraId = b.kraId AND a.kraId = ${req.body.kraId}`, {
                type: Sequelize.QueryTypes.SELECT
            }).then(resp => {
                res.send(resp)
            }, err => {
                res.status(400).send(err)
            })
        } else {
            await kra.findAll({ where: { kraId: req.body.kraId, organisationId:req.body.user_organisationId } }).then(result => {
                res.status(200).send(result)
            }, error => {
                res.status(400).send(error)
            })
        }



        // sequelize.query(`SELECT a.*, b.* FROM kras a, managerRatings b WHERE a.employeeId = ${req.body.employeeId} AND a.kraId = b.kraId AND a.kraId = ${req.body.kraId}`, {
        //     type: Sequelize.QueryTypes.SELECT
        // }).then(resp => {
        //     res.send(resp)
        // }, err => {
        //     res.status(400).send(err)
        // })
    })


    apiRoutes.post('/managerRating', async function (req, res) {
        await managerRating.create(req.body).then(resp => {
            res.send({ code: 1, "msg": "Rating Added" })
        }, error => {
            res.send({ code: 0, error })
        })
    })



    app.use('/', apiRoutes);
}