(function () {
    "use strict";

    angular.module(APPNAME)
        .factory('$commentsService', CommentsService);

    CommentsService.$inject = ['$baseService', '$sabio'];

    function CommentsService($baseService, $sabio) {
        var aSabioServiceObject = sabio.services.comments;
        var newService = $baseService.merge(true, {}, aSabioServiceObject, $baseService);

        return newService;
    };
})();