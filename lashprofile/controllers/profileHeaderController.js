(function () {
    "use strict";
    angular.module(APPNAME)
        .controller('profileHeaderController', ProfileHeaderController);

    ProfileHeaderController.$inject = [
        '$scope'
        , '$rootScope'
        , '$baseController'
        , '$accountsService'
        , '$serverModel'];

    function ProfileHeaderController(
        $scope
        , $rootScope
        , $baseController
        , $accountsService
        , $serverModel) {
        var vm = this;

        vm.$scope = $scope;
        vm.$rootScope = $rootScope;

        vm.item = null;
        vm.accountsService = $accountsService;
        vm.serverModel = $serverModel;

        vm.handle = vm.serverModel.item;

        //success
        vm.onHandleSuccess = _onHandleSuccess;

        //errors
        vm.onHandleError = _onHandleError;

        vm.$onInit = _render;

        function _render() {
            $(".main").removeClass("addMarginTop");
            vm.accountsService.getByHandle(vm.handle, _onHandleSuccess, _onHandleError);
        };

        //successes
        function _onHandleSuccess(data) {
            vm.$rootScope.$broadcast('rootScope:broadcast', data);
            if (data && data.item) {
                vm.item = data.item;
            }
            console.log("vm.item", vm.item);
        };

        //errors
        function _onHandleError(resp) {
            console.log("account was not received ", resp);
            vm.accountsService.$window.location = "/lashgirls/profile/invalid";
        };
    };
})();