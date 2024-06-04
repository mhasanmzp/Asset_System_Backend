const express = require('express');
const apiRoutes = express.Router();
const axios = require('axios');
const { sequelize } = require('../../config/db.config');
const { Sequelize } = require('../../config/db.config');

let url = 'http://localhost:8080/flowable-control/#/process-definitions'


module.exports = (app) => {

  apiRoutes.get('/getProcessDefinition',(req,res)=>{

  const username = 'admin';
  const password = 'test';

  axios.get('http://64.23.227.74:8080/flowable-ui/process-api/repository/process-definitions', {
    auth: {
      username: username,
      password: password
    }
  })
    .then( (response)=> {
      res.status(200).send(response.data)
      })
    .catch( (error)=> {
      console.log(error);
    });
  })
  apiRoutes.post('/getOneProcessDefinition',(req,res)=>{
    console.log(req.body.processId);
  const username = 'admin';
  const password = 'test';

  axios.get(`http://64.23.227.74:8080/flowable-ui/process-api/repository/process-definitions/${req.body.processId}`, {
    auth: {
      username: username,
      password: password
    }
  })
    .then( (response)=> {
      res.status(200).send(response.data)
      })
    .catch( (error)=> {
      console.log(error);
      res.send(error);
    });
  })
  app.use('/',apiRoutes);
}