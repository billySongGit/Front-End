(function () {
    "use strict";

    angular.module(APPNAME)
        .factory('$ratingService', RatingService);

    RatingService.$inject = ['$baseService', '$sabio'];

    function RatingService($baseService, $sabio) {
        var aRatingServiceObj = sabio.services.ratings;
        var newService = $baseService.merge(true, {}, aRatingServiceObj, $baseService);

        return newService;
    };
})();