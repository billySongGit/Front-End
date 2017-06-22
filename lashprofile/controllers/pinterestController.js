(function () {
    "use strict";
    angular.module(APPNAME)
    .controller('pinterestController', PinterestController);

    PinterestController.$inject = [
        '$scope'
        , '$baseController'
        , '$pinterestService'
        , 'smoothScroll'];

    function PinterestController(
        $scope
        , $baseController
        , $pinterestService
        , smoothScroll) {
        var vm = this;

        vm.$pinService = $pinterestService;
        vm.$scope = $scope;
        vm.items = [];
        vm.smoothScroll = smoothScroll;

        // vm.selectedPin = null;
        $baseController.merge(vm, $baseController);
        vm.notify = vm.$pinService.getNotifier($scope);

        _render();

        function _render() {
            vm.$pinService.getPinsFromUserBoard($baseController.$serverModel.item, _onSuccess, _onError);
        };

        function _onSuccess(data) {
            if (data.items) {
                vm.notify(function () {
                    vm.items = data.items;
                    console.log(vm.items);

                    _scrollPage(pinterest, 150);
                });
            }
        };

        function _onError(data) {
            console.log("ERROR!", data);
        };

        function _scrollPage(div, offset) {
            var scrollOptions = {
                duration: 200,
                offset: offset,
            };

            smoothScroll(div, scrollOptions);
        };
    };
})();