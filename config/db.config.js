const env = require('./env.js');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  logging: false,
  operatorsAliases: 0,
  pool: {
    max: env.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }
});
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Employees = require('../app/models/employees.model.js')(sequelize, Sequelize);
db.organisation = require('../app/models/organisation.model')(sequelize, Sequelize);
// db.salaryStructure = require('../app/models/salaryStructure.model')(sequelize, Sequelize);
db.attendance = require('../app/models/attendance.model')(sequelize, Sequelize);
db.MonthlySalary = require('../app/models/monthlySalary')(sequelize, Sequelize);
db.Tasks = require('../app/models/task')(sequelize, Sequelize);
db.Project = require('../app/models/project')(sequelize, Sequelize);
db.board = require('../app/models/board')(sequelize, Sequelize);
db.columnBoard = require('../app/models/columnBoard')(sequelize, Sequelize);
db.Teams = require('../app/models/team')(sequelize, Sequelize);
db.UserGroups = require('../app/models/userGroup')(sequelize, Sequelize);
db.ProjectMembers = require('../app/models/projectMembers')(sequelize, Sequelize);
db.Epic = require('../app/models/epic')(sequelize, Sequelize);
db.Story = require('../app/models/story')(sequelize, Sequelize);
db.StoryTasks = require('../app/models/storyTasks')(sequelize, Sequelize);
db.Post = require('../app/models/post')(sequelize, Sequelize);
db.Report = require('../app/models/report')(sequelize, Sequelize);
db.postComments = require('../app/models/comments')(sequelize, Sequelize);
db.Feedback = require('../app/models/feedback')(sequelize, Sequelize);
db.kra = require('../app/models/kra')(sequelize, Sequelize);
db.leave = require('../app/models/leave')(sequelize, Sequelize);
db.notification = require('../app/models/notification')(sequelize, Sequelize);
db.Document = require('../app/models/documents')(sequelize, Sequelize);
db.Notes = require('../app/models/notes')(sequelize, Sequelize);
db.Otp = require('../app/models/otp')(sequelize, Sequelize);
db.Sprint = require('../app/models/sprint')(sequelize, Sequelize);
db.Customer = require('../app/models/customer')(sequelize, Sequelize);
db.clientDetails = require('../app/models/clientDetails')(sequelize, Sequelize);
db.logs = require('../app/models/logs')(sequelize, Sequelize);
db.ats = require('../app/models/ats')(sequelize, Sequelize);
db.inventory = require('../app/models/inventory')(sequelize, Sequelize);
db.assignItem = require('../app/models/assignItem')(sequelize, Sequelize);
db.managerRating = require('../app/models/managerRating')(sequelize, Sequelize);
db.atsCertification = require('../app/models/atsCertification')(sequelize, Sequelize);
db.requestTicket = require('../app/models/requestTicket')(sequelize, Sequelize);
db.weeklyDashboard = require('../app/models/weeklyDashboard')(sequelize, Sequelize);
db.roles = require('../app/models/roles.js')(sequelize, Sequelize);
db.yearlyEmployeeLeaves = require('../app/models/yearlyEmployeeLeave.js')(sequelize, Sequelize);
db.ticket = require('../app/models/ticket')(sequelize, Sequelize);
db.ticketComments = require('../app/models/ticketComments')(sequelize, Sequelize);
db.convinceAndCalm = require('../app/models/convinceAndCalm')(sequelize, Sequelize);
db.holidays = require('../app/models/holidays.js')(sequelize,Sequelize)
db.leadGeneration = require('../app/models/leadGeneration.model.js')(sequelize,Sequelize);
db.cmf = require('../app/models/cmf.model.js')(sequelize,Sequelize);
db.qualityDocument= require("../app/models/qualityDocuments.js")(sequelize,Sequelize);
db.Status=require("../app/models/masterStatus")(sequelize,Sequelize);
db.userAdmin = require('../app/models/userAdmin.js')(sequelize,Sequelize);
db.taskComment = require('../app/models/taskComment.js')(sequelize,Sequelize);
db.leadAdmin = require('../app/models/leadAdmin.js')(sequelize,Sequelize);
db.taskLog = require('../app/models/taskLog.js')(sequelize, Sequelize);
db.employeeCost=require('../app/models/employeeCost.js')(sequelize, Sequelize);
db.department = require('../app/models/department.js')(sequelize,Sequelize);
db.empAppraisal= require('../app/models/empAppraisal.js')(sequelize,Sequelize);
db.L2Appraisal= require('../app/models/l2ManagerAppraisal.js')(sequelize,Sequelize);
db.L3Appraisal= require('../app/models/l3ManagerAppraisal.js')(sequelize,Sequelize);
db.L4Appraisal= require('../app/models/l4ManagerAppraisal.js')(sequelize,Sequelize);
db.ManagerEvaluation= require('../app/models/managerEvaluation.js')(sequelize,Sequelize);
db.hrAppraisalPerRatingAmount = require('../app/models/hrAppraisalPerRatingAmount.js')(sequelize,Sequelize);
db.empMan = require('../app/models/employee.manager.js')(sequelize,Sequelize);
db.Event=require('../app/models/event.js')(sequelize, Sequelize);
db.openPositions=require('../app/models/openPositions.model.js')(sequelize, Sequelize);
db.AssetCategory = require('../app/models/assetCategory.model.js')(sequelize, Sequelize);
db.AssetChallan = require('../app/models/assetChallan.model.js')(sequelize, Sequelize);
db.AssetEngineer = require('../app/models/assetEngineer.model.js')(sequelize, Sequelize);
db.AssetInventory = require('../app/models/assetInventory.model.js')(sequelize, Sequelize);
// db.AssetItem = require('../app/models/assetItem.model.js')(sequelize, Sequelize);
db.AssetModel = require('../app/models/assetModel.model.js')(sequelize, Sequelize);
db.AssetMovement = require('../app/models/assetMovement.model.js')(sequelize, Sequelize);
db.AssetOem = require('../app/models/assetOem.model.js')(sequelize, Sequelize);
db.AssetProject = require('../app/models/assetProjects.model.js')(sequelize, Sequelize);
db.AssetPurchase = require('../app/models/assetPurchase.model.js')(sequelize, Sequelize);
db.AssetSite = require('../app/models/assetSite.model.js')(sequelize, Sequelize);
// db.AssetTesting = require('../app/models/assetTesting.model.js')(sequelize, Sequelize);
// db.AssetWarranty = require('../app/models/assetWarranty.model.js')(sequelize, Sequelize);
module.exports = db;