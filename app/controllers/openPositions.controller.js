const express = require('express');
const apiRoutes = express.Router();
const db = require('../../config/db.config');
const { orderBy } = require('lodash');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;
const openPositions = db.openPositions;

module.exports = function (app) {

    apiRoutes.post('/createOpenPositions',(req,res)=>{
        openPositions.create(req.body).then(data=>{
            res.status(200).send({data});
        },err=>{
            res.status(400).send({err});
        })
    })
    apiRoutes.post('/updateOpenPositions',(req,res)=>{
        openPositions.update(req.body,{where:{openPositionsId: req.body.openPositionsId}}).then(data=>{
            res.status(200).send({data});
        },err=>{
            res.status(400).send({err});
        })
    })

    apiRoutes.get('/getOpenPositions',(req,res)=>{
        openPositions.findAll({
            where: {
              organisationId: req.body.organisationId
            },
            order: [
                ['createdAt', 'DESC']
              ]
          }).then(data=>{
            res.status(200).send({data});
        },err=>{
            res.status(400).send({err});
        })
    })

    app.use('/', apiRoutes);
};
