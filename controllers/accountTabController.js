(function () {
    "use strict";
    angular.module(APPNAME)
        .controller('accountTabController', AccountTabController)

    AccountTabController.$inject = [
            '$scope'
            , '$baseController'
            , '$location'
            , '$serverModel'];

    function AccountTabController(
            $scope,
            $baseController,
            $location,
            $serverModel) {

        var vm = this;

        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$serverModel = $serverModel;
        vm.$location = $location;

        vm.tabs = _getAccountTabs();
        vm.selectedTab = vm.tabs[0];

        vm.tabOne = _tabOne;
        vm.tabTwo = _tabTwo;
        vm.tabThree = _tabThree;

        vm.tabClass = _tabClass;
        vm.setSelectedTab = _setSelectedTab;
        vm.checkIsInfluencer = _checkIsInfluencer;
        vm.$onInit = _render();

        //render
        function _render() {
            console.log("rendering tab controller")
            vm.setUpCurrentRequest(vm);
        };

        //tabs
        function _getAccountTabs() {
            let tabs = [
                { link: '#!/', label: 'Account' },
                { link: '#!/password', label: 'Password' }
            ];

            if (vm.$serverModel.user.accountModifier === 1 || vm.$serverModel.user.accountModifier === 2) {
                tabs.push({ link: '#!/settings', label: 'Settings' });
            }

            return tabs;
        };

        function _tabClass(tab) {
            var currentTab = "#!" + $location.path();

            if (currentTab == tab.link) {
                return "active";

            }
            else {
                return "";
            }
        };

        function _setSelectedTab(tab) {
            console.log("set selected tab", tab);

            vm.selectedTab = tab;
        };

        function _tabOne() {
            vm.$location.path("");
            _setSelectedTab(0);
        };

        function _tabTwo() {
            vm.$location.path("password");
            _setSelectedTab(1);

        };

        function _tabThree() {
            vm.$location.path("settings");
            _setSelectedTab(2);
        };

        //role check
        function _checkIsInfluencer() {
            let isInfluencer = false;

            if (vm.$serverModel.user.accountModifier === 1 || vm.$serverModel.user.accountModifier === 2) {
                isInfluencer = true;
            }
            return isInfluencer;
        };
    };

})();
