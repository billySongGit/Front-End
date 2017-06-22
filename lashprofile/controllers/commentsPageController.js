(function () {
    "use strict";
    angular.module(APPNAME)
        .controller('commentsPageController', CommentsPageController);

    CommentsPageController.$inject = [
        '$scope'
        , '$baseController'
        , '$serverModel'
        , '$sabio'
        , '$commentsService'
        , '$accountsService'
        , 'smoothScroll'];

    function CommentsPageController(
        $scope
        , $baseController
        , $serverModel
        , $sabio
        , $commentsService
        , $accountsService
        , smoothScroll) {
        var vm = this;

        vm.$scope = $scope;
        vm.serverModel = $serverModel;
        vm.commentsService = $commentsService;
        vm.accountsService = $accountsService;

        vm.smoothScroll = smoothScroll;
        vm.notify = vm.commentsService.getNotifier($scope);
        vm.notifyTwo = vm.accountsService.getNotifier($scope);

        // vm properties //
        vm.profileHandle = vm.serverModel.entityId;
        vm.typeId = vm.serverModel.ownerType;
        vm.item = null;
        vm.showReply = false
        vm.comments;
        $baseController.merge(vm, $baseController);
        vm.commentLimit = 10;
        vm.replyLimit = 0;
        vm.noMoreReplies = false;
        vm.noMoreComments = true;
        vm.noComments = false;
        vm.collapseReply = false;

        vm.addComment;
        vm.currentUserAvatar = null;
        vm.accountInfo = null;
        vm.select = _select;
        vm.submitComment = _submitComment;
        vm.$serverModel = $serverModel;
        vm.totalCount = null;//initializing to null
        vm.onDeleteComment = _onDeleteComment;
        vm.displayReplyTemplate = _displayReplyTemplate;
        //vm.cancel = _cancel;

        vm.scrollPage = _scrollPage;

        //click handlers
        vm.addReply = _addReply;
        vm.showMoreComments = _showMoreComments;
        vm.showLessComments = _showLessComments;
        vm.showMoreReplies = _showMoreReplies;
        vm.showNoReplies = _showNoReplies;

        // Render //
        render();

        function render() {
            vm.accountsService.getById(_onGetAccountSuccess, _onGetAccountError);
            vm.commentsService.getProfileComments(vm.profileHandle, vm.typeId, _onGetCommentsSuccessful, _onGetCommentsUnsuccessful);
        };

        //click handlers
        function _onGetAccountSuccess(response) {
            vm.notifyTwo(function () {
                console.log(response);
                vm.accountInfo = response.item;
                vm.currentUserAvatar = vm.fixUrl(response.item.avatarUrl);
            });
            vm.$systemEventService.broadcast("getUserAccountInfo", response);
            //vm.$alertService.success("Retrieved account info");
        };

        function _onGetAccountError(jqXHR) {
            console.log("Account not found.");
            //vm.$alertService.error(jqXHR.responseText, "GetAccount Failed.");
        };

        function _submitComment(singleComment) {
            if (singleComment == null) {
                vm.addComment = {
                    typeId: vm.$serverModel.ownerType
                    , entityId: vm.$serverModel.entityId
                    , description: vm.commentDescription

                };
            }
            else { //Reply
                vm.itemIndex = vm.comments.indexOf(singleComment);

                vm.addComment = {
                    typeId: vm.$serverModel.ownerType
                    , entityId: vm.$serverModel.entityId
                    , description: vm.commentDescription
                    , parentId: singleComment.id
                };
                singleComment.showReply = !singleComment.showReply;
            }

            console.log("Submit Comment fired");
            vm.commentsService.insertBlogComment(vm.addComment, singleComment, _onSubmitCommentSuccess, _onSubmitCommentError);
        };

        function _select(comments) {
            vm.itemIndex = vm.comments.indexOf(comments);

            return vm.itemIndex;
        };

        function _onSubmitCommentSuccess(responseData, sentData, singleComment) {
            sentData.id = responseData.item;

            $baseController.merge(sentData, vm.accountInfo);
            if (singleComment == null) {
                vm.notify(function () {
                    vm.comments.push(sentData);
                    vm.totalCount = (vm.totalCount || 0) + 1;
                });
            }
            else {
                vm.notify(function () { //reply
                    if (singleComment.replies == null) {
                        vm.comments[vm.itemIndex].replies = [];
                        vm.comments[vm.itemIndex].replies.push(sentData);
                    }
                    else {
                        vm.comments[vm.itemIndex].replies.push(sentData);
                    }
                    vm.totalCount = (vm.totalCount || 0) + 1;
                    _showMoreReplies(vm.comments[vm.itemIndex]);
                });
            };
            vm.commentDescription = null;
            vm.$alertService.success("Comment added successfully.");
        };

        function _onSubmitCommentError(jqXHR) {
            console.log("Blog comment not posted.");
            //vm.$alertService.error(jqXHR.responseText, "Create comment Failed")
        };

        function _onDeleteComment(singleComment) {
            if (singleComment) {
                var id = singleComment.id;
                vm.itemIndex = _select(singleComment);
                vm.commentsService.deleteComment(id, _onDeleteCommentSuccess, _onDeleteCommentError);
            };
        };


        function _onDeleteCommentSuccess(responseData) {
            console.log("Blog comment successfully deleted.");
            vm.notify(function () {
                vm.comments.splice(vm.itemIndex, 1);
            });
            vm.$alertService.success("Deleted comment successfully.");
        };

        function _onDeleteCommentError(jqXHR) {
            console.log("Blog comment not deleted.");
            //vm.$alertService.error(jqXHR.responseText, "Delete Comment failed.");
        };

        function _displayReplyTemplate(singleComment) {
            singleComment.showReply = !singleComment.showReply;
        };

        function _addReply(currentComment) {
            currentComment.showReply = !currentComment.showReply;
        };

        function _showMoreComments(comment) {
            //vm.replyLimit = 0;
            vm.commentLimit = vm.commentLimit + 10;
            if (vm.commentLimit >= comment.length) {
                return vm.noMoreComments = true;
            }
            else {
                return vm.noMoreComments = false;
            };
        };

        function _showLessComments(comment) {
            vm.commentLimit = 10;
            vm.noMoreComments = false;

            _scrollPage(comments, 150);
        };

        function _showMoreReplies(aComment) {
            aComment.replyLimit = (aComment.replyLimit || 0) + 10;

            if (aComment.replies && (aComment.replyLimit >= aComment.replies.length)) {
                return collapseReply(aComment);
            };
        };

        function _showNoReplies(aComment) {
            aComment.replyLimit = 0;
            aComment.noMoreReplies = false;
        };

        function collapseReply(aComment) {
            console.log(aComment);
            aComment.noMoreReplies = true;
            aComment.collapseReply = true;
        };

        function _scrollPage(div, offset) {
            var scrollOptions = {
                duration: 200,
                offset: offset,
            };

            smoothScroll(div, scrollOptions);
        };

        //success
        function _onGetCommentsSuccessful(data) {
            if (data && data.items) {
                vm.notify(function () {
                    vm.comments = data.items;
                })
                vm.noMoreComments = false;
                console.log("vm.comments", vm.comments)
            }
            else {
                vm.notify(function () {
                    vm.noComments = true;
                    $(".toggleComments").remove();
                    console.log("No Comments");
                });
            };

            _scrollPage(comments, 150);
        };

        //error
        function _onGetCommentsUnsuccessful(resp, error) {
            console.log("Failed to get comments ", resp, error);
        };
    };
})();
