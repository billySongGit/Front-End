(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('mediaController', MediaController);

    MediaController.$inject = [
        '$scope'
        , '$baseController'
        , '$mediaService'
        , '$uibModal'
        , '$serverModel'
        , 'smoothScroll'];

    function MediaController(
        $scope
        , $baseController
        , $mediaService
        , $uibModal
        , $serverModel
        , smoothScroll) {
        var vm = this;

        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$uibModal = $uibModal;
        vm.$serverModel = $serverModel
        vm.smoothScroll = smoothScroll;

        vm.$mediaService = $mediaService;
        vm.notify = vm.$mediaService.getNotifier($scope);

        vm.items = [];
        vm.modalSelected = null;

        vm.openModal = _openModal;
        vm.scroll = _scroll;

        _render();

        function _render() {
            vm.$mediaService.getFeed($baseController.$serverModel.item, _onGetFeedSuccess, _onFail);
        };

        function _scroll(tabs, offset) {
            var scrollOptions = {
                duration: 400,
                offset: offset,
            };

            smoothScroll(tabs, scrollOptions);
        };

        function _openModal(data) {
            var modalInstance = vm.$uibModal.open({
                animation: true
                , templateUrl: "/Scripts/app/lashProfile/template/mediaModal.html"
                , controller: "instagramModalController as mediaModal"
                , size: "md"
                , keyboard: true
                , resolve: {
                    passedItem: function () {
                        console.log("modal has been opened");

                        return { accountInfo: data }
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {
                vm.modalSelected = selectedItem;
            }, function () {
                console.log("vm.items", vm.items);
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        function _onGetFeedSuccess(data) {
            vm.notify(function () {
                vm.items = data.items;
            });

            _scroll(media, 150)
        };

        function _onFail(jqXHR) {
            console.log("get all failed");
        };
    };

})();