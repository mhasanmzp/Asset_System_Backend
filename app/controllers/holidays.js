const express = require("express");
const db = require("../../config/db.config.js");
const { Sequelize, DataTypes, Op } = require('sequelize');
const holidays = db.holidays;
var apiRoutes = express.Router();
const { sequelize, Teams } = require("../../config/db.config.js");
const { Employees, leave } = db; 

module.exports = function (app) {
  apiRoutes.post("/insertHoliday", async (req, res) => {
    let date = req.body.date;
    let event = req.body.event;
    let dayOfWeek = req.body.dayOfWeek;
    let holidayType = req.body.holidayType;
    let forTeam = req.body.forTeam; // 1 for Recruitment Team & SAP (US -Shift), 2 for Development / Marketing / NeuVays Team & 3 for All Teams
    let applicableForTeam = [];

    if (forTeam === 1) {
      applicableForTeam = [99, 46, 48, 49, 51, 52, 54, 69, 80, 89, 97];
      forTeam = "Recruitment Team & SAP (US -Shift)";
      //console.log(`${forTeam}---${applicableForTeam}`);
    } else if (forTeam === 2) {
      applicableForTeam = [72, 88, 104, 105, 106, 107, 108, 100];
      forTeam = "Development / Marketing / NeuVays";
      //console.log(`${forTeam}---${applicableForTeam}`);
    } else if (forTeam === 3) {
      applicableForTeam = [
        46, 48, 49, 51, 52, 54, 55, 69, 70, 71, 72, 75, 78, 80, 81, 82, 88, 89,
        96, 97, 98, 99, 100, 101, 102, 104, 105, 106, 107, 108, 109,
      ];
      forTeam = "ALL Teams";
      //console.log(`${forTeam}---${applicableForTeam}`);
    }

    await holidays
      .create({
        date: date,
        event: event,
        dayOfWeek: dayOfWeek,
        holidayType: holidayType,
        forTeam : forTeam,
        applicableForTeam: applicableForTeam,
        organisationId:req.body.organisationId,
      })
      .then(
        (resp) => {
          res.status(200).send(resp);
        },
        (err) => {
          res.status(400).send(err);
        }
      );
  });

  apiRoutes.post('/getAllHolidays',async (req,res)=>{
    await holidays
    .findAll({where:{organisationId:req.body.user_organisationId}})
    .then(
      (result) => {
        res.status(200).send(result);
      },
      (error) => {
        res.status(400).send(error);
      }
    );
  })

  apiRoutes.post("/getMyHolidays", async (req, res) => {
    // let teamId = req.body.teamId; 
    let teamIds = req.body.teamId;
    try {
      const getHolidays = await holidays.findAll({
        // where: Sequelize.literal(`JSON_CONTAINS(applicableForTeam, JSON_ARRAY(${teamId}))`),
        where: {
          [Sequelize.Op.or]: teamIds.map(team => {
              return Sequelize.literal(`JSON_CONTAINS(applicableForTeam, JSON_ARRAY(${team.teamId}))`);
          }),
          organisationId:req.body.user_organisationId
      }
      });
      // //console.log("Rows found:", getHolidays);
      res.status(200).send(getHolidays);
    } catch (error) {
      // console.error("Error finding rows:", error);
      res.status(400).send(error);
    }
  });

  apiRoutes.post("/updateHoliday",async (req,res)=>{
    // let date = req.body.date;
    let holidayId = req.body.holidayId;
    let event = req.body.event;
    try {
      const result = await holidays.update(
        { event: event },
        { where: { holidayId: holidayId, organisationId:req.body.organisationId } }
      );
      if (result[0] > 0) {
        res.status(200).send('Update successful',);
      } else {
        res.status(404).send('Record not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });
  

  //working!!
  apiRoutes.post("/getCapacity", async (req, res) => {
    try {
      // const { from, to} = req.body;

      // const { from, to, employeeId } = req.body;

      const { from, to, page, pageSize } = req.body;
      // Calculate offset based on page and pageSize
    const offset = (page - 1) * pageSize;

      const employees = await Employees.findAll({where:{organisationId:req.body.user_organisationId},
        attributes: [
          "employeeId",
          "firstName",
          "middleName",
          "lastName",
          "officialEmail",
        ],
        // where: {
        //   employeeId: employeeId
        // }
        offset,
        limit: pageSize,
      });
      // //console.log("employees ... ",employees)

      const allocatedPerHrData = [];

      for (const employee of employees) {
        const { employeeId } = employee;
        const { firstName } = employee;
        const { middleName } = employee;
        const { lastName } = employee;

        const leaves = await leave.findAll({
          where: {
            employeeId,
            [Op.or]: [
              {
                sdate: {
                  [Op.between]: [from, to],
                },
              },
              {
                edate: {
                  [Op.between]: [from, to],
                },
              },
            ],
            organisationId:req.body.user_organisationId
          },
        });
        //console.log("leaves ... ", leaves);

        const teamData = await Teams.findAll({
          attributes: ["teamName", "teamId"],
          where: Sequelize.literal(`JSON_CONTAINS(users, '[${employeeId}]')`),
        });

        // Initialize arrays to store teamName and teamId for each team
        let teamName = [];
        let teamId = [];

        // Extract teamName and teamId from each result
        teamData.forEach((team) => {
          teamName.push(team.teamName);
          teamId.push(team.teamId);
        });

        const TeamName = teamName.length > 0 ? teamName[0] : null;
        //console.log("First Team Name:", TeamName);

        //console.log("teamId...", teamId);

        const holidayss = await holidays.findAll({
          where: {
            date: {
              [Sequelize.Op.between]: [from, to],
            },
            applicableForTeam: {
              [Sequelize.Op.and]: teamId.map((teamId) =>
                Sequelize.literal(
                  `JSON_CONTAINS(applicableForTeam, '[${teamId}]')`
                )
              ),
            },
            holidayType : "OFF",
            organisationId: req.body.user_organisationId
          },
          // logging: //console.log, // Add this line for logging
        });
        //console.log("holidays ... ", holidayss);

        const weekdays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ];

        let allocatedPerHr = 0;
        let availableHr = 0;

        for (
          let date = new Date(from);
          date <= new Date(to);
          date.setDate(date.getDate() + 1)
        ) {
          const currentDay = date.toLocaleDateString("en-US", {
            weekday: "long",
          });
          //console.log("currentDay ... ", currentDay);

          if (!weekdays.includes(currentDay)) {
            // Skip Saturday and Sunday
            continue;
          }

          const currentDate = date.toISOString().split("T")[0];
          //console.log("currentDate ... ", currentDate);

          const isLeaveTaken = leaves.some(
            (leave) =>
              (leave.sdate <= currentDate && currentDate <= leave.edate) ||
              (leave.edate instanceof Date &&
                leave.edate.toISOString().split("T")[0] === currentDate)
          );
          //console.log("isLeavetaken ... ", isLeaveTaken);

          const isHoliday = holidayss.some((holiday) => {
            const holidayDate = new Date(holiday.date)
              .toISOString()
              .split("T")[0];
            return holidayDate === currentDate;
          });
          //console.log("isHoliday ... ", isHoliday);

          if (!isLeaveTaken && !isHoliday) {
            allocatedPerHr += 9; // Assuming 9 hours per day
            availableHr += 9; // Assuming 9 hours per day
          } else {
            availableHr += 9; // Subtract only weekends and holidays
          }
          //console.log("allocatedPerHr---", allocatedPerHr);
        }

        let costData = await Employees.findAll({
          attributes : ["costRate"],
          where : {employeeId : employeeId, organisationId:req.body.user_organisationId},
          raw : true
        })
        costRate = costData.map(employee=>employee.costRate)
        //console.log("costRate........",costRate)

        let costingPerHr = allocatedPerHr*costRate

        // let costingPerHr = allocatedPerHr*400

        allocatedPerHrData.push({
          employeeId,
          // teamName,
          TeamName,
          firstName,
          middleName,
          lastName,
          allocatedPerHr,
          availableHr,
          costingPerHr
        });
      }

      // res.json(allocatedPerHrData);

      // Send the result along with pagination metadata
    res.json({
      data: allocatedPerHrData,
      meta: {
        totalRecords: employees.length, // Total number of records
        currentPage: page,
        pageSize,
      },
    }); 
    /* if pagination is implemented, then payload will be -
    {
    "from": "2023-12-31",
    "to": "2024-01-06",
    "page": 1,
    "pageSize": 10,
    "permissionName": "Dashboard",
    "employeeIdMiddleware": "344"
    } */

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  apiRoutes.post("/updateEmployeeCostRate", async (req, res)=>{
    try{
      await Employees.update(
        {
          costRate : req.body.costRate
        },{
          where :{
            employeeId : req.body.employeeId,
            organisationId: req.body.organisationId
          }
        }
      )
      res.send({message:"records upadated successfully!!"})
    } catch (error){
      res.status(400).send(error)
    }
  })

  apiRoutes.get("/", function (req, res) {
    res.send({ status: true });
  });
  app.use("/", apiRoutes);
};
