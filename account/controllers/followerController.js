(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('followerController', FollowerController);

    FollowerController.$inject = [
            '$scope'
            , '$location'
            , '$baseController'
            , '$uibModalInstance'
            , '$followerService'
            , "sweetAlert"
            , "passedFollowerItem"
            , "geoService"
            , '$anchorScroll'];

    function FollowerController(
            $scope
            , $location
            , $baseController
            , $uibModalInstance
            , $followerService
            , sweetAlert
            , passedFollowerItem
            , geoService
            , $anchorScroll) {

        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.$location = $location;
        vm.$anchorScroll = $anchorScroll;
        vm.$uibModalInstance = $uibModalInstance;

        vm.$followerService = $followerService;

        vm.items = null;
        vm.pagedItems = [];

        vm.itemIndex = -1;
        vm.map;
        vm.centerLatLng;
        var page;
        vm.pageObj = {};
        vm.markers = {};
        vm.savedPages = {};
        vm.savedMarkers = {};
        vm.savedUsers = {};
        vm.followerClone;

        vm.currentPage = 0;
        //vm.pageNumber = 1;
        vm.pageSize = 12;
        vm.totalCount = 0;
        vm.followers = [];
        vm.sweetAlert = sweetAlert

        vm.notify = vm.$followerService.getNotifier($scope);

        vm.geoService = geoService;

        vm.pagination = _pagination;
        vm.savePage = _savePage;
        vm.mapFollower = _mapFollower;
        vm.getPage = _getPage;
        vm.getMarkers = _getMarkers;

        //click handlers
        vm.deleteFollower = _deleteFollower
        vm.ctrlPagination = _ctrlPagination;
        vm.ok = _ok;
        vm.cancel = _cancel;
        vm.showOnMap = _showOnMap;

        //successes
        vm.getPageSuccessful = _getPageSuccessful;
        vm.onDeleteSuccessful = _onDeleteSuccessful;

        //errors
        vm.getPageUnsuccessful = _getPageUnsuccessful;
        vm.onDeleteUnsuccessful = _onDeleteUnsuccessful;

        //################### THE FOLD #######################
        render();

        function render() {
            _pagination();
            console.log("followerCtrl", $scope.followerCtrl);
        };

        function _pagination(page, pageSize) {
            var sentData = {
                pageIndex: vm.currentPage,
                pageSize: vm.pageSize,
            }
            console.log("sentdata", sentData);
            vm.$followerService.getByPagination(sentData, vm.getPageSuccessful, vm.getPageUnsuccessful);
        };

        function _savePage(data) {
            vm.savedPages[data.pageIndex] = data;
        };

        function _saveMap(data, markers) {
            vm.savedMarkers[data.pageIndex] = markers;

            for (var i = 0; i < markers.length; i++) {

                var handle = markers[i].lashGirl.data.handle;

                if (!vm.savedUsers[handle]) {

                    vm.savedUsers[handle] = markers[i];
                }
            }
            console.log("savedMarkers", vm.savedMarkers);
            console.log("savedUsers", vm.savedUsers);
        };

        function _getPage(pageIndex) {
            return vm.savedPages[pageIndex];
        };

        function _getMarkers(pageIndex) {
            return vm.savedMarkers[pageIndex];
        };

        function _showSavedPage(data) {
            if (data) {
                if (!vm.savedPages[data.pageIndex]) {
                    vm.notify(function () {
                        vm.totalCount = data.totalCount;
                        vm.pagedItems = data.pagedItems;
                    })

                    _savePage(data);

                    console.log("vm.savedPages", vm.savedPages);
                }
                else {
                    vm.totalCount = vm.followers.totalCount;
                    vm.pagedItems = data.pagedItems;

                    console.log("vm.savedPages", vm.savedPages);
                }
            }
            else {
                console.log("Data is null")
            }
        };

        function _mapFollower(data) {
            if (data) {
                var mapId = "followerMap";
                var page = vm.savedPages[data.pageIndex];
                var locArr = page.pagedItems;

                vm.centerLatLng = {
                    lat: 31.653381399664
                    , long: 29.53125
                };
                var mapOpts = {
                    zoom: 2
                    , scrollwheel: true
                };
                var markerOpts = {
                    infoWindow: true
                    , zoomVisibility: true
                    , zoomThreshold: 2
                    , onClick: _onMarkerClicked
                };

                vm.markers = vm.geoService.getMarkersFromArray(locArr, markerOpts);

                if (!vm.savedMarkers[page.pageIndex] && !vm.savedMarkers[0]) {
                    vm.map = vm.geoService.initMap(vm.centerLatLng, mapOpts, mapId);
                }

                if (!vm.savedMarkers[page.pageIndex]) {
                    vm.geoService.addMarkersToMap(vm.map, vm.markers, markerOpts);
                    _saveMap(data, vm.markers);
                    var newMarkers = vm.markers;
                    for (var i = 0; i < newMarkers.length; i++) {
                        newMarkers[i].setVisible(true);
                    };
                }
                else if (vm.savedMarkers[page.pageIndex]) {
                    var indexString = page.pageIndex.toString();
                    var oldMarkers = vm.savedMarkers[indexString];
                    for (var i = 0; i < oldMarkers.length; i++) {
                        oldMarkers[i].setVisible(true);
                    };
                }
            }


        };

        function _ok() {
            vm.$uibModalInstance.close(vm.modalItem);
        };

        function _showAndMap(data) {
            //pass the actual items
            _showSavedPage(data);
            _mapFollower(data);
        };

        //click handlers
        function _ctrlPagination(page, pageSize) {
            var sentData = {
                pageIndex: page - 1,
                pageSize: vm.pageSize,
            };
            var markersToHide = null;
            markersToHide = _getMarkers(vm.currentPage - 1);

            if (!_getPage(sentData.pageIndex)) {
                vm.$followerService.getByPagination(sentData, vm.getPageSuccessful, vm.getPageUnsuccessful);
            }
            else {
                _showAndMap(_getPage(sentData.pageIndex));
            }

            for (var i = 0; i < markersToHide.length; i++) {
                var window = markersToHide[i].lashGirl.infoWindow;
                if (_isInfoWindowOpen(window)) {
                    vm.geoService.centerAndZoom(vm.map, { lat: 31.653381399664, lng: 29.53125 }, 2);

                    window.close();
                }

                markersToHide[i].setVisible(false);
            };

            vm.currentPage = page;
        };

        function _deleteFollower(item, index) {
            if (item.followerId) {
                var ajaxCall = function () {
                    vm.$followerService.deleteFollower(item.followerId, vm.onDeleteSuccessful, vm.onDeleteUnsuccessful);
                    vm.notify(function () {
                        vm.itemIndex = vm.followers.pagedItems.indexOf(item);
                        console.log(vm.itemIndex, "vm.itemIndex");
                        vm.followers.pagedItems.splice(vm.itemIndex, 1);
                    })
                };
                vm.sweetAlert.promptDelete("default", ajaxCall);
            }
        };

        function _cancel() {
            vm.$uibModalInstance.dismiss('cancel');
        };

        function _showOnMap(data, $event) {
            var marker = vm.savedUsers[data.handle];

            vm.followerClone = $event.currentTarget.innerHTML;

            $location.hash('followerMap');

            $anchorScroll();

            _centerAndZoom(marker, 4);

            return vm.geoService.showInfo(marker, _getWinContent, vm.map);
        };

        //successes
        function _getPageSuccessful(data) {
            vm.followers = data.item;
            console.log("page " + vm.currentPage + " has been received", data);
            _showAndMap(data.item);//pass the actual items

        };

        function _onDeleteSuccessful(item) {
            console.log("follower has been deleted");
        };

        //errors
        function _getPageUnsuccessful(jqXhr, error) {
            console.error(error);
        };
        function _onDeleteUnsuccessful(jqXhr, error) {
            console.error(error);
        };

        //geo code
        function _onMarkerClicked(map) {
            var marker = this;

            var searchItem = "follower_" + marker.lashGirl.data.handle;

            var clonedDom = document.getElementById(searchItem).innerHTML;

            vm.followerClone = clonedDom;

            _centerAndZoom(marker, 4);

            return vm.geoService.showInfo(marker, _getWinContent, vm.map);
        };

        function _getWinContent(follower) {
            var infoWin = vm.followerClone;

            return infoWin;
        };

        function _centerAndZoom(marker, zoom) {
            vm.geoService.centerAndZoom(vm.map, marker, zoom);
        };

        function _isInfoWindowOpen(infoWindow) {
            var map = infoWindow.getMap();
            return (map !== null && typeof map !== "undefined");
        };
    };
})();
