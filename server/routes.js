var usernum = 1;
var User = require('./api/user/user.controller.js');
var Rating = require('./api/rating/rating.controller.js');
var Lobby = require('./api/lobby/lobby.controller');
module.exports = function(app) {
  /* GET home page. */

app.get('/', function(req, res, next) {
  if (!req.session.userid)
    res.redirect('/login');
  else{
    if(!User.isOnline(req.session.userid))
      User.setName(req.session.userid, req.session.name);
    res.sendFile(app.get('clientPath') + 'index.html');
  }
});
//TODO put remaining logic below in controllers
app.use('/api/lobbies', require('./api/lobby'));
app.get('/api/user/self', function(req, res, next) {
  var self = {};
  self.name = req.session.name;
  self.userid = req.session.userid;
  self.lobby = req.session.lobby;
  self.inActiveLobby = Lobby.isActiveLobby(req.session.lobby);
  res.status(200).json(self);
});


app.get('/login', function(req, res, next) {
  res.sendFile(app.get('clientPath') + 'login.html');
});

//temporary login for testing before integrating steam
app.post('/login', function(req, res, next) {
  req.session.userid = usernum;
  req.session.name = req.body.username;
  usernum += 1;
  res.redirect('/');
  User.setName(req.session.userid, req.session.name);
});

};
