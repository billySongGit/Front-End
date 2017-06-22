(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('lashProfileTabController', LashProfileTabController)
        .filter('to_trusted', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    LashProfileTabController.$inject = [
        '$scope'
        , '$baseController'
        , '$location'
        , 'smoothScroll'
        , 'settingSrv'
        , 'userRoleSrv'
        , '$timeout'
        , 'registerService'
        , '$uibModal'];

    function LashProfileTabController(
        $scope
        , $baseController
        , $location
        , smoothScroll
        , settingSrv
        , userRoleSrv
        , $timeout
        , registerService
        , $uibModal) {
        var vm = this;

        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;

        vm.tabs = [
            { link: '#!/comments', id: 'comments', icon: '<i class="material-icons">comment</i>Comments' },
            { link: '#!/connections', id: 'connections', icon: '<i class="material-icons">people</i>Connections' },
        ];

        vm.selectedTab = null;
        vm.tabClass = _tabClass;
        vm.$uibModal = $uibModal;
        vm.setSelectedTab = _setSelectedTab;
        vm.smoothScroll = smoothScroll;
        $baseController.merge(vm, $baseController);
        vm.notify = settingSrv.getNotifier($scope);
        vm.scrollToPage = _scrollToPage;

        //modal directive
        vm.modalItems = [];
        vm.modalSelected = null;

        vm.openVideo = _openVideo;

        vm.$onInit = _render();

        //render
        function _render() {
            registerService.getUser($baseController.$serverModel.item, _continue, _errorResponse);

            function _continue(data) {
                if (data && data.item && !data.item.lockoutEnabled) {
                    vm.setUpCurrentRequest(vm);
                    settingSrv.getSettingByHandle($baseController.$serverModel.item, 2, _settingResponse, _errorResponse);
                    settingSrv.getSettingByHandle($baseController.$serverModel.item, 4, _settingResponse, _errorResponse);
                    settingSrv.getSettingByHandle($baseController.$serverModel.item, 5, _settingResponse, _errorResponse);
                    settingSrv.getSettingByHandle($baseController.$serverModel.item, 6, _settingResponse, _errorResponse);
                    settingSrv.getSettingByHandle($baseController.$serverModel.item, 7, _settingResponse, _errorResponse);
                }
                else {
                    $location.href = "/lashgirls/profile/invalid";
                }
            };
        };

        function _openVideo(data) {
            var modalInstance = vm.$uibModal.open({
                animation: true
                , templateUrl: "/Scripts/app/lashProfile/template/videoModal.html"
                , controller: "videoModalController as VMC"
                , size: "lg"
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
                vm.item.avatarUrl = vm.modalSelected.avatarUrl;
            }, function () {
                console.log("vm.items", vm.items);
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        //tabs
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

            _scrollToPage(tabs, 150);
        };

        function _settingResponse(data) {
            if (!vm.accountSettings) {
                vm.accountSettings = {
                    canHaveBlog: false,
                    canShowBlog: false,
                    handle: $baseController.$serverModel.item
                };
            }
            if (data.data.item && data.data.item.value === "true" && data.data.item.settingId === 2) {
                if (!$scope.$$phase) {
                    vm.notify(function () {
                        vm.accountSettings.canHaveBlog = true;
                    });
                }
                else {
                    vm.accountSettings.canShowBlog = true;
                }
            }
            if (data.data.item && data.data.item.value === "true" && data.data.item.settingId === 4) {
                if (!$scope.$$phase) {
                    vm.notify(function () {
                        vm.accountSettings.canShowBlog = true;
                    });
                }
                else {
                    vm.accountSettings.canShowBlog = true;
                }
            }
            if (data.data.item && data.data.item.value && data.data.item.settingId === 5) {
                if (!$scope.$$phase) {
                    vm.notify(function () {
                        vm.accountSettings.hasTwitter = true;
                    });
                }
                else {
                    vm.accountSettings.hasTwitter = true;
                }
            }
            if (data.data.item && data.data.item.value && data.data.item.settingId === 6) {
                if (!$scope.$$phase) {
                    vm.notify(function () {
                        vm.accountSettings.hasInsta = true;
                    });
                }
                else {
                    vm.accountSettings.hasInsta = true;
                }
            }
            if (data.data.item && data.data.item.value && data.data.item.settingId === 7) {
                if (!$scope.$$phase) {
                    vm.notify(function () {
                        vm.accountSettings.hasPinterest = true;
                    });
                }
                else {
                    vm.accountSettings.hasPinterest = true;
                }
            }

            if (vm.accountSettings.hasTwitter) {
                vm.tabs.push({ link: '#!/twitter', id: 'twitter', icon: '<i class="fa fa-twitter"></i>Twitter' });
                vm.accountSettings.hasTwitter = false;
            }
            if (vm.accountSettings.hasInsta) {
                vm.tabs.push({ link: '#!/media', id: 'media', icon: '<i class="fa fa-instagram"></i>Instagram' });
                vm.accountSettings.hasInsta = false;
            }
            if (vm.accountSettings.hasPinterest) {
                vm.tabs.push({ link: '#!/pinterest', id: 'pinterest', icon: '<i class="fa fa-pinterest"></i>Pinterest' });
                vm.accountSettings.hasPinterest = false;
            }
        };

        function _errorResponse(error, status, xhr) {
            console.log(error);
        };

        function _scrollToPage(div, offset) {
            var scrollOptions = {
                duration: 200,
                offset: offset,
            };

            smoothScroll(div, scrollOptions);
        };
    };
})();


