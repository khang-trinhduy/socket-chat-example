var express = require("express");
var app = express();
var path = require("path");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

// Chatroom

var numUsers = 0;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

io.on("connection", client => {
  client.on("event", data => {});
  client.on("disconnect", () => {});

  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  client.on("new message", data => {
    // we tell the client to execute 'new message'
    client.broadcast.emit("new message", {
      username: client.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  client.on("add user", username => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    client.username = username;
    ++numUsers;
    addedUser = true;
    client.emit("login", {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    client.broadcast.emit("user joined", {
      username: client.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  client.on("typing", () => {
    client.broadcast.emit("typing", {
      username: client.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  client.on("stop typing", () => {
    client.broadcast.emit("stop typing", {
      username: client.username
    });
  });

  // when the user disconnects.. perform this
  client.on("disconnect", () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      client.broadcast.emit("user left", {
        username: client.username,
        numUsers: numUsers
      });
    }
  });
});
