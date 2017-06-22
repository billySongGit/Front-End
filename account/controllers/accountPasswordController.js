(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('accountPasswordController', AccountPasswordController);

    AccountPasswordController.$inject = [
            '$scope'
            , '$baseController'
            , '$accountsService'
            , 'sweetAlert'
            , 'smoothScroll'
            , '$location'
            , '$window'];

    function AccountPasswordController(
            $scope
            , $baseController
            , $accountsService
            , sweetAlert
            , smoothScroll
            , $location
            , $window) {

        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.$location = $location;
        vm.$window = $window;
        vm.$accountsService = $accountsService;
        vm.sweetAlert = sweetAlert;

        vm.item = null;
        vm.itemCheckAgainst = null

        vm.notify = vm.$accountsService.getNotifier($scope);

        vm.scrollPage = _scrollPage;
        vm.request = {
            password: ""
            , confirmPassword: ""
        };

        //modal directive
        vm.modalItems = [];
        vm.modalSelected = null;

        //click handlers
        vm.submitRcvry = _submitRcvry;

        vm.onPasswordUpdateSuccessful = _onPasswordUpdateSuccessful;
        vm.onPasswordUpdateUnsuccessful = _onPasswordUpdateUnsuccessful;

        //startup
        _render();

        function _render() {
            vm.$window.scrollTo(0, 500);

            vm.pc = vm.getParentController("acctTabCtrl");

            console.log("vm.pc", vm.pc);
        };

        function _submitRcvry() {
            var passRegex = /^(?=(.*\d){1})(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,16}$/;
            if (passRegex.test(vm.request.password)) {
                console.log(vm.request);

                vm.$accountsService.changePW(vm.request, _onPasswordUpdateSuccessful, _onPasswordUpdateUnsuccessful);
            }
            else {
                vm.sweetAlert.pwStrengthError();
            }
        };

        function _onPasswordUpdateSuccessful() {
            console.log("Password was edited");
            _changeTab();
            console.log("path", vm.$accountsService.$location.path());
        };
        function _onPasswordUpdateUnsuccessful(error) {
            console.error("account was not updated ", error);
        };

        function _scrollPage(div, offset) {
            var scrollOptions = {
                duration: 200,
                offset: offset,
            }

            smoothScroll(div, scrollOptions);
        };

        function _changeTab() {
            vm.notify(function () {
                vm.pc.tabThree();

                vm.$location.path("settings");
            });
        };
    };

})();
