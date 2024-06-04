// Import dependencies
const express = require('express');
const config = require('../config/main');
// Load controllers
module.exports = function(app,io) {
const apiRoutes = express.Router();
// require('./controllers/report')(app)
require('./controllers/auth')(app)
require('./controllers/data')(app)
require('./controllers/admin')(app)
require('./controllers/user')(app)
require('./controllers/projects')(app,io)
require('./controllers/post')(app)
require('./controllers/feedback')(app)
require('./controllers/KRA')(app)
require('./controllers/leave')(app)
require('./controllers/cron')(app)
require('./controllers/customer')(app)
require('./controllers/ats')(app)
require('./controllers/inventory')(app)
require('./controllers/ticket')(app)
require('./controllers/convinceAndCalm')(app)
require('./controllers/holidays')(app)
require('./controllers/leadGeneration.controller')(app)
require('./controllers/superAdmin')(app)
require('./controllers/bpmn')(app)
require('./controllers/appraisal')(app)
require('./controllers/assetTracking.controller')(app)
require('./controllers/openPositions.controller')(app)
};
