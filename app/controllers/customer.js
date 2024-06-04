/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
const express = require('express');
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/db.config.js');
const Op = Sequelize.Op
const db = require('../../config/db.config.js');
const Employees = db.Employees;
const Organisation = db.organisation
const Project = db.Project
const Customer = db.Customer
// const Service = db.service;
// const Call = db.call;
// const Request = db.request;
// const httpRequest = require('request');
const cors = require('cors')({ origin: true });
const api_key = 'key-a14dbfed56acf890771e7d1f3d372a82';
const domain = 'mail.aftersale.in';
const mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

module.exports = function (app) {

  const apiRoutes = express.Router();

  apiRoutes.post('/createCustomer', (req, res) => {
    // eslint-disable-next-line promise/catch-or-return, promise/always-return
    Customer.create(req.body).then(result => {
      res.status(200).send(result)
    }, error => {
      res.status(401).send(error)
    })
  });

  apiRoutes.post('/fetchCustomers', (req, res) => {
    Customer.findAll({where:{organisationId:req.body.user_organisationId}}).then(result => {
      res.status(200).send(result)
    }, error => {
      res.status(401).send(error)
    })
  });

  apiRoutes.post('/updateCustomer', (req, res) => {
    Customer.update(req.body, {
      where: { customerId: req.body.customerId, organisationId:req.body.organisationId }
    }).then(result => {
      res.status(200).send(result)
    }, error => {
      res.status(400).send(error)
    })
  });

  apiRoutes.post('/getCustomerProjects', (req, res) => {
    let query = `SELECT * from Projects where customerId = '${req.body.customerId}' And organisationId:'${req.body.organisation}'`
    sequelize.query(query,
      {
        type: Sequelize.QueryTypes.SELECT
      }).then(resp => {
        res.send(resp)
      }, err => {
        res.status(400).send(err)
      })
  });

  app.use('/', apiRoutes);
};
