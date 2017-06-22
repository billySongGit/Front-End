(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('instagramModalController', InstagramModalController);

    InstagramModalController.$inject = [
        '$scope'
        , '$baseController'
        , '$uibModalInstance'
        , '$mediaService'
        , 'passedItem'];

    function InstagramModalController(
        $scope
        , $baseController
        , $uibModalInstance
        , $mediaService
        , passedItem) {
        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.$mediaService = $mediaService;
        vm.notify = vm.$mediaService.getNotifier($scope);

        vm.$uibModalInstance = $uibModalInstance;
        vm.item;

        vm.modalItem;
        vm.passedItem = passedItem;

        vm.cancel = _cancel;

        //startup
        _render();

        function _render() {
            vm.modalItem = vm.passedItem.accountInfo;
            console.log("vm.modalItem", vm.modalItem);
            console.log("vm.$scope", vm.$scope);
        };

        function _cancel() {
            vm.$uibModalInstance.dismiss('cancel');
        };
    };
})();