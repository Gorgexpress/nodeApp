angular.module('myApp')
  .controller('LobbyInfoCtrl', function($scope, $timeout, LobbyInfo, Socket) {
    var refreshLobbyUserList = function(lobby) {
      if (lobby)
        LobbyInfo.get(lobby)
          .then(function(response){ 
            $scope.lobbyInfo = response.data;
            if ($scope.lobbyInfo.users[$scope.$parent.self.name])
              $scope.showButtons = true;
            if ($scope.lobbyInfo.host === $scope.$parent.self.userid)
              $scope.isHost = true;
            if ($scope.lobbyInfo.users.length >= 2)
              $scope.lobbyFull = true;
          }, function (response) {
            $scope.lobbyInfo.users = [];
            alert("Could not get lobby: " + response);
          });
    };

    //We will use this as a callback for a call to $timeout. We want
    //to temporarily disable the ready button so the client cant spam
    //it to ready and unready repeatedly 
    var reenableReadyButtonCallback = function () {
      $scope.disableReadyButton = false;
      timeoutPromise = null;
    };

    //when clicking ready button, ready or unready
    $scope.onReady = function() {
      if (!$scope.ready) {
        LobbyInfo.ready()
          .then(function (response) {
            $scope.readyButtonText = "Unready";
            $scope.disableReadyButton = true;
            $scope.ready = true;
            timeoutPromise = $timeout(reenableReadyButtonCallback, 3000);         
          }, function (response) {
            alert(response); 
          });
      }
      else {
        LobbyInfo.unready()
          .then(function (response) {
            $scope.readyButtonText = "Ready";
            $scope.disableReadyButton = true;
            $scope.ready = false;
            timeoutPromise = $timeout(reenableReadyButtonCallback, 3000);
          }, function (response) {
            alert(response);
          });
      }
    };

    $scope.onStart = function() {
      //double check that everyone is ready
      
    };
    Socket.on('user joined', function(user) {
      $scope.lobbyInfo.users[user.id] = {
        'name': user.name,
        'role': user.role
      };
      if(user.id === $scope.$parent.self.userid && $scope.lobbyInfo.users[user.id])
        $scope.showButtons = true;
      if (Object.keys($scope.lobbyInfo.users).length == 2)
        $scope.lobbyFull = true;
    });
    Socket.on('user left', function(user) {
      if ($scope.lobbyInfo.users[user])
        delete $scope.lobbyInfo.users[user];
      if ($scope.lobbyFull) {
        //set state of controller to one where the lobby is not full
        //cancel our $timeout, as the callback is going to change the variable of
        //a button that is no longer accessible.
        $scope.lobbyFull = false;
        $scope.ready = false;
        $scope.disableReadyButton = false;
        if (timeoutPromise)
          $timeout.cancel(timeoutPromise);
      }
    });
    $scope.lobbyInfo = {
      'users': {}
    };
    $scope.showButtons = false;
    $scope.isHost = false;
    $scope.lobbyFull = false;
    $scope.ready = false;
    $scope.disableReadyButton = false;
    $scope.enableStartButton = false;
    $scope.readyButtonText = "Ready";

    //holds the promose from our $timeout call so we can cancel it if necessary
    var timeoutPromise = null; 
    refreshLobbyUserList($scope.$parent.lobby);
    $scope.$on('$destroy', function (event) {
      Socket.removeAllListeners('user joined');
      Socket.removeAllListeners('user left');
    });

  });
