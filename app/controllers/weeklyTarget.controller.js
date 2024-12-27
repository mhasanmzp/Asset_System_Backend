const express = require('express');
const Sequelize = require('sequelize');
const { sequelize } = require('../../config/db.config.js');
const db = require('../../config/db.config.js');
const apiRoutes = express.Router();
const WeeklyTargets = db.weeklyTarget;
const WeeklyActuals = db.weeklyActual
const moment = require('moment');
const employeesModel = require('../models/employees.model.js');
const { tryEach } = require('async');
const Op = Sequelize.Op;
apiRoutes.post('/createWeeklyTarget', async (req, res) => {
    try {
      // Log the received payload
      console.log('Received Payload:', req.body);
  
      // Destructure the payload
      const { employeeId, employeeIdMiddleware, permissionName, targets } = req.body;
  
      // Validate the required fields
      if (!employeeId || !employeeIdMiddleware || !permissionName) {
        return res.status(400).json({
          code: 0,
          message: 'Employee ID, Employee Middleware ID, or Permission Name is missing.',
        });
      }
  
      // Validate targets
      if (!Array.isArray(targets) || targets.length === 0) {
        return res.status(400).json({
          code: 0,
          message: 'Payload must be a non-empty array of targets.',
        });
      }
  
      // Insert each target into the database
      const createdTargets = [];
      for (const target of targets) {
        const {
          bdm,
          emailCampaigns,
          qualifiedLeads,
          clientMeetings,
          demos,
          lob,
          poc,
          closure,
          week,
        } = target;
  
        // Ensure required fields in target
        if (
          bdm == null ||
          week == null ||
          emailCampaigns == null ||
          qualifiedLeads == null ||
          clientMeetings == null ||
          demos == null ||
          lob == null ||
          poc == null ||
          closure == null
        ) {
          return res.status(400).json({
            code: 0,
            message: 'One or more fields in targets are missing or invalid.',
          });
        }
  
        // Create a target entry in the database
        const newTarget = await WeeklyTargets.create({
          bdmId: bdm,
          weekStartDate: null, // Placeholder, add logic if weekStartDate is needed
          weekEndDate: null,   // Placeholder, add logic if weekEndDate is needed
          weekNo: week,
          emailCampaigns,
          qualifiedLeads,
          clientMeetings,
          demos,
          lob,
          poc,
          closures: closure,
          managerId: employeeId, // Save employeeId as the creator
        });
  
        createdTargets.push(newTarget);
      }
  
      // Respond with success
      res.status(200).json({
        code: 1,
        message: 'Weekly Targets created successfully!',
        data: createdTargets,
      });
    } catch (error) {
      console.error('Error creating weekly targets:', error);
      res.status(500).json({
        code: 0,
        message: 'Failed to create weekly targets.',
        error: error.message,
      });
    }
  });

apiRoutes.post('/updateWeeklyTarget', async function (req, res) {
    try {
        const { id, ...updatedData } = req.body;

        const result = await WeeklyTargets.update(updatedData, { where: { id } });

        if (result[0] === 1) {
            res.status(200).send({ code: 1, message: "Weekly Target Updated Successfully!" });
        } else {
            res.status(400).send({ code: 0, message: "Target Not Found or No Changes Made" });
        }
    } catch (error) {
        res.status(400).send({ code: 0, message: "Failed to Update Weekly Target", error });
    }
});

apiRoutes.post('/deleteWeeklyTarget', async function (req, res) {
    try {
        const { id } = req.body;

        const result = await WeeklyTargets.destroy({ where: { id } });

        if (result === 1) {
            res.status(200).send({ code: 1, message: "Weekly Target Deleted Successfully!" });
        } else {
            res.status(400).send({ code: 0, message: "Target Not Found" });
        }
    } catch (error) {
        res.status(400).send({ code: 0, message: "Failed to Delete Weekly Target", error });
    }
});

apiRoutes.post('/getEmpWeeklyTargets', async function (req, res) {
    try {
        const employeeId = req.body.employeeId
       const empWeekData = await WeeklyTargets.findAll({ where : {bdmId: employeeId }  })
        res.status(200).send({ code: 1, data: empWeekData });
    } catch (error) {
        res.status(400).send({ code: 0, message: "Failed to Fetch Weekly Targets", error });
    }
});

apiRoutes.post('/saveWeeklyActuals', async function (req, res) {
    const { employeeId, permissionName, actuals } = req.body;
    
    // Validate incoming data
    if (!employeeId || !permissionName || !Array.isArray(actuals) || actuals.length === 0) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    try {
        // Loop over actuals array to store each record in the weeklyActual table
        for (const actual of actuals) {
            const { targetId, weekNo, emailCampaigns, qualifiedLeads, clientMeetings, demos, poc, closures } = actual;

            // You can add additional validation or transformation here as necessary

            // Create the weekly actual record
            await WeeklyActuals.create({
                targetId,         // Assuming targetId exists and relates to a target
                weekNo,           // Week number of the data
                emailCampaigns,
                qualifiedLeads,
                clientMeetings,
                demos,
                poc,
                closures
            });
        }

        // Send success response
        return res.status(200).json({ message: 'Weekly actuals saved successfully' });

    } catch (error) {
        // Handle error and return a failure response
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = function (app) {
    app.use('/', apiRoutes);
};
