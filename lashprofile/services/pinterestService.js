(function () {
    "use strict";

    angular.module(APPNAME)
        .factory('$pinterestService', PinterestService); //do i need to put a $

    PinterestService.$inject = ['$baseService', '$sabio'];

    function PinterestService($baseService, $sabio) {
        var vm = this;
        var pinterestServiceObject = sabio.services.pinterest;
        var newService = $baseService.merge(true, {}, pinterestServiceObject, $baseService);

        return newService;
    };
})();