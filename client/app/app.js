var app = angular.module('myApp', ['ui.bootstrap', 'ui.router'])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');
  });
