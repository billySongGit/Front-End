(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('profilesController', ProfilesController);

    ProfilesController.$inject = [
        '$scope'
        , '$rootScope'
        , '$baseController'
        , '$accountsService'
        , '$ratingService'
        , '$serverModel'
        , '$statsTrackService'
        , '$sabio'
        , 'smoothScroll'
        , 'OwnerKind'
        , '$sce'];

    function ProfilesController(
        $scope
        , $rootScope
        , $baseController
        , $accountsService
        , $ratingService
        , $serverModel
        , $statsTrackService
        , $sabio
        , smoothScroll
        , OwnerKind
        , $sce) {
        var vm = this;

        // vm depedncies intialization //
        vm.accountsService = $accountsService;
        vm.ratingService = $ratingService;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.serverModel = $serverModel;
        vm.statsTrackService = $statsTrackService;
        vm.smoothScroll = smoothScroll;
        vm.OwnerKind = OwnerKind;
        vm.notify = vm.accountsService.getNotifier($scope);
        vm.notifyRate = vm.ratingService.getNotifier($scope);

        // vm properties //
        vm.handle = vm.serverModel.item;
        vm.item = null;
        vm.bio = null;
        vm.more = true;
        vm.less = false;

        vm.tabOne = _tabOne;
        vm.tabTwo = _tabTwo;
        vm.tabThree = _tabThree;
        vm.tabFour = _tabFour;
        vm.tabFive = _tabFive;
        vm.scrollToPage = _scrollToPage;
        vm.canRate = false;
        vm.profileItem;

        $baseController.merge(vm, $baseController);
        vm.typeId = vm.OwnerKind.kinds.owners.site;

        // vm Utils//
        vm.trustSrc = _trustSrc;

        vm.toggleStars = _toggleStars;
        vm.onClickSubmitRating = _onClickSubmitRating;
        vm.readMoreBio = _readMoreBio;

        // Render //
        vm.$onInit = render;

        function render() {
            _canUserRate()
            _getFollowerCount()
            _broadcastListener();
            _getRatingStats()
            _findProductsLiked()
            vm.$systemEventService.listen('newRatingSent', _onNewRatingSubmit);
        };

        function _canUserRate() {
            if (vm.serverModel.user != null && vm.serverModel.item == vm.serverModel.user.handle) {
                vm.canRate = true;
            }
        };

        function _getFollowerCount() {
            var accInfo = {
                handle: vm.handle
            };
            vm.statsTrackService.getPublicProfileTotalCount(accInfo, _onGetFollowerCountSuccess, _onGetFollowerCountError)
        };

        function _broadcastListener() {
            vm.$scope.$on('rootScope:broadcast', function (event, data) {
                vm.item = data.item;
                vm.profileItem = data.item;
                switch (data.item.accountModifier) {
                    case 1:
                        vm.item.accountType = 'Lash Girl'
                        break;
                    case 2:
                        vm.item.accountType = 'Healthy Lifestyle Coach'
                        break;
                    case 4:
                        vm.item.accountType = 'User'
                        break;
                    default:
                        vm.item.accountType = 'Lash Girl'
                };

                vm.bio = $sce.trustAsHtml(data.item.bio);
            });
        };

        function _tabOne() {
            vm.accountsService.$location.path("comments");
        };

        function _tabTwo() {
            vm.accountsService.$location.path("connections");
        };

        function _tabThree() {
            vm.accountsService.$location.path("media");
        };

        function _tabFour() {
            vm.accountsService.$location.path("twitter");
        };

        function _tabFive() {
            vm.accountsService.$location.path("pinterest");
        };

        function _toggleStars() {
            vm.heartsShow = !vm.heartsShow;
        };

        function _getRatingStats() {
            var ratingsInfo = {
                entity: vm.handle,
                type: vm.typeId
            };
            if (vm.serverModel.user != null) {
                vm.ratingService.getRatings(ratingsInfo, _onGetUserRatingSuccess, _onGetRatingsError);
            }
            vm.statsTrackService.getTotalAndAvg(ratingsInfo, _onGetRatingsSuccess, _onGetRatingsError)
        };

        function _readMoreBio() {
            var bioClass = angular.element('#bioLanding');
            bioClass.toggleClass("fullBio");

            if (bioClass.hasClass('fullBio')) {
                vm.more = false;
                vm.less = true;
            }
            if (!bioClass.hasClass('fullBio')) {
                vm.more = true;
                vm.less = false;
                _scrollToPage(avatarDiv, 0);
            }
        };

        function _scrollToPage(scrollSpot, offset) {
            var scrollOptions = {
                duration: 200,
                offset: offset,
            };

            smoothScroll(scrollSpot, scrollOptions);
        };

        function _onClickSubmitRating() {
            swal({
                type: "question",
                html: "Give " + vm.item.firstName + " " + vm.rateit + " Star Rating?",
                showCancelButton: true,
                buttonsStyling: false,
                showLoaderOnConfirm: true,
                confirmButtonClass: "btn btn-success",
                cancelButtonClass: "btn btn-danger"
            }).then(_submitRating, _swalRatingCancel);
        };

        function calcAvgRating() {
            if (vm.hasRated == false) {
                vm.ratingSum = (vm.totalRatings * vm.avgRating) + vm.rateit;
                vm.totalRatings += 1;
                vm.avgRating = (vm.ratingSum / vm.totalRatings).toFixed(2)
                vm.hasRated = true
            }
            else {
                vm.ratingSum = ((vm.totalRatings * vm.avgRating) - vm.oldRating) + vm.rateit;
                vm.avgRating = (vm.ratingSum / vm.totalRatings).toFixed(2)

            }
            var newRatingInfo = {
                ratingSum: vm.ratingSum,
                totalRatings: vm.totalRatings,
                avgRating: vm.avgRating,
                hasRated: vm.hasRated
            }

            vm.$systemEventService.broadcast('newRatingSent', newRatingInfo);
        };

        function _submitRating() {
            var ratingInfo = {
                EntityId: vm.handle
                    , TypeId: vm.typeId
                    , Rating: vm.rateit * 2
            };

            if (vm.hasRated == true) {
                vm.ratingService.updateRating(ratingInfo, _onRatingSuccess, _onRatingError)
            }
            else {
                vm.ratingService.addNewRating(ratingInfo, _onRatingSuccess, _onRatingError)
            }
        };

        function _swalRatingCancel() {
            vm.notifyRate(function () {
                vm.rateit = vm.oldRating;
            });
        };

        function _onRatingSuccess(resp) {
            calcAvgRating();
            vm.$alertService.success("Your Rating Was Submitted!");
            console.log("Rating Added!", resp);
        };

        function _onGetUserRatingSuccess(data) {
            if (data && data.item) {
                var currentUser = data.item;
                vm.hasRated = currentUser.hasRated;
                vm.rateit = currentUser.ratingAmount / 2;
                vm.oldRating = vm.rateit;
            }
        };

        function _onGetRatingsSuccess(data) {
            if (data && data.item) {
                var ratings = data.item;
                vm.totalRatings = ratings.totalCount;
                vm.avgRating = (ratings.avg / 2).toFixed(2);
                console.log('Succsefully got ratings', ratings);
            }
        };

        function _onGetRatingsError(resp) {
            console.log('Failed to get ratings', resp);
        };

        function _onRatingError(resp) {
            console.log("Failed to Add Rating!", resp);
        };

        // ~~~~~~~~~~~~~~~ Ratings ~~~~~~~~~~~~~~~~~~~~~~~

        // Util Expressions//
        function _findProductsLiked() {
            var ratingsInfo = {
                entity: vm.handle,
                type: 7
            };
            vm.ratingService.getTotalRatings(ratingsInfo, _onGetTotalProductLiked, _onGetTotalProductLikedError);
        };

        function _onNewRatingSubmit(event, payload) {
            var newRatingInfo = payload[1];
            vm.ratingSum = newRatingInfo.ratingSum;
            vm.totalRatings = newRatingInfo.totalRatings;
            vm.avgRating = newRatingInfo.avgRating;
            vm.hasRated = newRatingInfo.hasRated;
            calcAvgRating();
        };

        function calcAvgRating() {
            if (vm.hasRated == false) {
                vm.ratingSum = (vm.totalRatings * vm.avgRating) + vm.rateit;
                vm.totalRatings += 1;
                vm.avgRating = (vm.ratingSum / vm.totalRatings).toFixed(2);
                vm.hasRated = true;
            }
            else {
                vm.ratingSum = ((vm.totalRatings * vm.avgRating) - vm.oldRating) + vm.rateit;
                vm.avgRating = (vm.ratingSum / vm.totalRatings).toFixed(2);
            }
        };

        // Ajax Result Functions //
        //success
        function _onGetTotalProductLiked(data) {
            if (data && data.item) {
                vm.notifyRate(function () {
                    vm.totalProducts = data.item.totalCount;

                });
            }
        };

        function _onGetFollowerCountSuccess(data) {
            if (data && data.item) {
                vm.totalFollowers = data.item.totalCount;
            }
        };

        //Errors
        function _onGetTotalProductLikedError(resp) {
            console.log('Failed to get product likes', resp);
        };

        function _onGetFollowerCountError(resp) {
            console.log('Failed to get follower count', resp);
        };

        // SANITIZE FILES
        function _trustSrc(src) {
            return $sce.trustAsResourceUrl(src);
        };
    }
})();