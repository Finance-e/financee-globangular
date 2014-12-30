var globalApp = angular.module('globalApp', ['angular-loading-bar', 'ngAnimate', 'ui.bootstrap']);
(function () {
    'use strict';
    globalApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = true;
    }]);
}());

