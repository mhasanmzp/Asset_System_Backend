const { ExpressPeerServer } = require('peer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const app = require('express')();

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/api.hr.timesofpeople.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.hr.timesofpeople.com/fullchain.pem')
};

const server = https.createServer(options, app);

const peerServer = ExpressPeerServer(server, {
    debug: true,
    allow_discovery: true
});

app.use('/server', peerServer);

server.listen(4000);
