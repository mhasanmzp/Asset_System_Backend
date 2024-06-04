const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize, Teams } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');

const Project = db.Project
const Feedback = db.Feedback

module.exports = function (app) {
    const apiRoutes = express.Router();

    apiRoutes.post('/createFeedback', async function (req, res) {
        Feedback.create(req.body).then(resp => {
            res.status(200).send(resp)
        }, err => {
            res.status(400).send(err)
        })
    })

    apiRoutes.post('/updateFeedback', async function (req, res) {
        await Feedback.update(req.body, { where: { feedbackId: req.body.feedbackId, organisationId:req.body.organisationId } }).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/deleteFeedback', async function (req, res) {
        await Feedback.destroy({ where: { feedbackId: req.body.feedbackId, organisationId:req.body.organisationId } }).then(result => {
            res.status(200).send({ status: true })
        }, error => {
            res.status(400).send(error)
        })
    })

    apiRoutes.post('/getUserFeedback', async function (req, res) {
        await Feedback.findAll({ where: {organisationId: req.body.user_organisationId}}).then(result => {
            res.status(200).send(result)
        }, error => {
            res.status(400).send(error)
        })
    })

    app.use('/', apiRoutes);
}