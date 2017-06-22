(function () {
    "use strict";

    angular.module(APPNAME)
        .factory('$mediaService', MediaService);

    MediaService.$inject = ['$baseService', '$sabio'];

    function MediaService($baseService, $sabio) {
        var aSabioServiceObject = sabio.services.media;
        var newService = $baseService.merge(true, {}, aSabioServiceObject, $baseService);

        return newService;
    };
})();