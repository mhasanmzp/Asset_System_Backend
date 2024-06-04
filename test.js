const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/:project', (req, res) => {
  res.sendFile(__dirname + '/test.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a room based on the project name from the URL
  const project = socket.handshake.query.proc;
  console.log("...........................",JSON.stringify(socket.handshake.query));
  socket.join(project);

  // Listen for messages from clients
  socket.on('message', (data) => {
    console.log(`Message from ${socket.id} in project ${project}: ${data}`);

    // Broadcast the message to clients in the same room
    io.to(project).emit('message', `Broadcast in project ${project}: ${data}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
