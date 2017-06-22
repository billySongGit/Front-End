(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('twitterPageController', TwitterPageController)
        .filter('to_trusted', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    TwitterPageController.$inject = [
        '$scope'
        , '$baseController'
        , '$twitterService'
        , '$timeout'
        , 'smoothScroll'
        , "$serverModel"];

    function TwitterPageController(
        $scope
        , $baseController
        , $twitterService
        , $timeout
        , smoothScroll
        , $serverModel) {
        var vm = this;

        vm.$scope = $scope;
        vm.$twitterService = $twitterService;
        vm.$timeout = $timeout;
        vm.smoothScroll = smoothScroll;

        vm.notify = vm.$twitterService.getNotifier($scope);

        vm.hideLoadingGif = false;
        vm.maxIdString = '';
        vm.tweet;
        vm.limit = 5;
        vm.pgIndex = 0;
        vm.scrollToPage = _scrollToPage;

        //Click handler
        vm.loadMore = _loadMore;

        //Success
        vm.onTweetGetSuccessful = _onTweetGetSuccessful;

        //Error
        vm.onTweetGetUnsuccessful = _onTweetGetUnsuccessful;

        // Render
        render();

        function render() {
            vm.$twitterService.getTweetsByHandle($serverModel.item, vm.onTweetGetSuccessful, vm.onTweetGetUnsuccessful);
        };

        function _scrollToPage(div, offset) {
            var scrollOptions = {
                duration: 200,
                offset: offset,
            };

            smoothScroll(div, scrollOptions);
        };

        //Click handlers
        function _loadMore() {
            vm.limit = 5;
            vm.hideLoadingGif = false;
            vm.$twitterService.getTweetsByHandle($serverModel.item, vm.onTweetGetSuccessful, vm.onTweetGetUnsuccessful, ++vm.pgIndex, 10);
        };

        //Success
        function _onTweetGetSuccessful(data, status, xhr) {
            vm.notify(function () {
                if (data && data.item) {
                    vm.tweet = data.item;
                    console.log("vm.tweet", vm.tweet);
                    var lastIndex = vm.tweet.length - 1;
                    var lastTweet = vm.tweet[lastIndex];

                    vm.maxIdString = vm.tweet[lastIndex].tweetId;

                    $timeout(function () {
                        vm.hideLoadingGif = true;
                        //var o = angular.element(lastTweet).offset().top;
                        //_scrollToPage(twitter, o);

                    }, 1000);

                    $timeout(function () {
                        vm.limit = 10;
                    }, 2000);
                }
            });
        };

        //Error
        function _onTweetGetUnsuccessful(xhr, status, errorThrown) {
            console.log("Error: " + xhr.responseText);
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