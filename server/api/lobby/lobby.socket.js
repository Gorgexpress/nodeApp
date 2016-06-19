var LobbyEvents = require('./lobby.events');

module.exports = function(io, socket) {
  'use strict';
  socket.on('l:new', function(lobby) {
    socket.broadcast.emit('l:new', lobby);
  });
  socket.on('l:join', function(lobby) {
    if (socket.room){
      socket.leave(socket.room);
      socket.broadcast.emit('l:left', socket.request.session.userid);
    }
    socket.join(lobby);
    socket.room = lobby;
    var user = {
      'id': socket.request.session.userid,
      'name': socket.request.session.name,
      'role': 0
    };
    io.to(lobby).emit('l:join', user);
  });
  socket.on('l:left', function() {
    if (socket.room){
      socket.leave(socket.room);
      socket.room = null;
      socket.broadcast.emit('l:left', socket.request.session.userid);
    }
  });
  socket.on('l:start', function() {
    io.to(socket.room).emit('l:start');
  });
  socket.on('l:ready', function (userid) {
    io.to(socket.room).emit('l:ready', userid);
  });
  socket.on('l:unready', function (userid) {
    io.to(socket.room).emit('l:unready', userid);
  });
  
  var listener = createListener('l:disband', socket);
  LobbyEvents.on('l:disband', listener);
  socket.on('disconnect', removeListener('l:disband', listener));
};

var createListener = function (event, socket) {
  return function (doc) {
    socket.emit(event, doc);
  };
};

var removeListener = function (event, listener) {
  return function () {
    LobbyEvents.removeListener(event, listener);
  };
};