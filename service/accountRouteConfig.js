(function () {
    "use strict";

    angular.module(APPNAME)
        .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {

            $routeProvider.caseInsensitiveMatch = true;

            $locationProvider.hashPrefix('!');

            $routeProvider.when('/', {
                templateUrl: '/Scripts/app/account/template/accountPage.html',
                controller: 'accountController'
            }).when('/password', {
                templateUrl: '/Scripts/app/account/template/passwordPage.html',
                controller: 'accountPasswordController',
                controllerAs: 'passwordController'
            }).when('/settings', {
                templateUrl: '/Scripts/app/account/template/settingsPage.html',
                controller: 'settingsController',
                controllerAs: 'sc'
            });
            $locationProvider.html5Mode({
                enabled: false,
                requireBase: false
            });
        }]);
})();
