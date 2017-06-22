(function () {
    "use strict";

    angular.module(APPNAME)
        .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
            $routeProvider.caseInsensitiveMatch = true;

            $locationProvider.hashPrefix('!');

            $routeProvider.when('/comments', {
                templateUrl: '/Scripts/app/lashProfile/template/commentsPage.html',
                controller: 'commentsPageController',
                controllerAs: 'commentsCtrl',
                activetab: 'comments'
            }).when('/connections', {
                templateUrl: '/Scripts/app/lashProfile/template/connectionsPage.html',
                controller: 'followerPageController',
                controllerAs: 'followerCtrl',
                activetab: 'connections'
            }).when('/media', {
                templateUrl: '/Scripts/app/lashProfile/template/mediaPage.html',
                controller: 'mediaController',
                controllerAs: 'mc',
                activetab: 'instagram'
            }).when('/twitter', {
                templateUrl: '/Scripts/app/lashProfile/template/twitterPage.html',
                controller: 'twitterPageController',
                controllerAs: 'twitterCtrl',
                activetab: 'twitter'
            }).when('/pinterest', {
                templateUrl: '/Scripts/app/lashProfile/template/pinterestPage.html',
                controller: 'pinterestController',
                controllerAs: 'pinVm',
                activetab: 'pinterest'
            });
            $locationProvider.html5Mode({
                enabled: false,
                requireBase: false
            });
        }]).run(['$rootScope', '$location', function ($rootScope, $location) {
            var path = function () { return $location.path(); };
            $rootScope.$watch(path, function (newVal, oldVal) {
                $rootScope.activetab = newVal;
            });
        }]);
})();