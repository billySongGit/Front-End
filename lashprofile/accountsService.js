(function () {
    "use strict";

    angular.module(APPNAME)
        .factory('$accountsService', AccountsService);

    AccountsService.$inject = ['$baseService', '$sabio'];

    function AccountsService($baseService, $sabio) {
        var accountsServiceObject = sabio.services.accounts;
        var newService = $baseService.merge(true, {}, accountsServiceObject, $baseService);

        return newService;
    };
})();