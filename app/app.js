var globalApp = angular.module('globalApp', ['angular-loading-bar', 'ngAnimate', 'ui.bootstrap']);
globalApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
}]);