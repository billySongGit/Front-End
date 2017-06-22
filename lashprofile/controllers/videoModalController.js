(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('videoModalController', VideoModalController);

    VideoModalController.$inject = [
        '$scope'
        , '$baseController'
        , '$accountsService'
        , '$sabio'
        , '$sce'
        , '$uibModalInstance'
        , 'passedItem'
        , '$serverModel'];

    function VideoModalController(
        $scope
        , $baseController
        , $accountsService
        , $sabio
        , $sce
        , $uibModalInstance
        , passedItem
        , $serverModel) {
        var vm = this;

        // vm depedncies intialization //
        vm.accountsService = $accountsService;
        vm.$scope = $scope;
        vm.$serverModel = $serverModel;
        vm.$uibModalInstance = $uibModalInstance;

        $baseController.merge(vm, $baseController);

        vm.modalItem;
        vm.passedItem = passedItem;

        vm.onGetAccountSuccessful = _onGetAccountSuccessful;
        vm.onGetAccountUnsuccessful = _onGetAccountUnsuccessful;

        vm.cancel = _cancel;

        vm.trustSrc = _trustSrc;


        // Render //
        vm.$onInit = render;

        function render() {
            vm.accountsService.getByHandle(vm.$serverModel.item, vm.onGetAccountSuccessful, vm.onGetAccountUnsuccessful)
        };

        function _onGetAccountSuccessful(data) {
            vm.modalItem = data.item;
            vm.videoUrl = vm.modalItem.videoUrl + "?autoplay=1";
        };

        function _onGetAccountUnsuccessful(error) {
            console.log("account was not received ", error)
        };

        function _cancel() {
            vm.$uibModalInstance.dismiss('cancel');
        };

        // SANITIZE FILES
        function _trustSrc(src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
})();