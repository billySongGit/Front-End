(function () {
    "use strict";

    angular.module(APPNAME)
        .factory('$twitterService', TwitterService);

    TwitterService.$inject = ['$baseService', '$sabio'];

    function TwitterService($baseService, $sabio) {
        var aSabioServiceObjet = sabio.services.twitter;
        var newService = $baseService.merge(true, {}, aSabioServiceObjet, $baseService);

        return newService;
    };
})();