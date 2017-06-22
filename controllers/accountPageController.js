/// <reference path="../template/pictureModal.html" />
(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('accountPageController', AccountPageController);

    AccountPageController.$inject = [
            '$scope'
            , '$baseController'
            , '$accountsService'
            , '$uibModal'
            , '$imageService'
            , '$fileService'
            , '$followerService'
            , '$statsTrackService'
            , '$mediaService'
            , 'sweetAlert'
            , '$serverModel'
            , '$window'
            , '$location'];

    function AccountWizardController(
            $scope
            , $baseController
            , $accountsService
            , $uibModal
            , $imageService
            , $fileService
            , $followerService
            , $statsTrackService
            , $mediaService
            , sweetAlert
            , $serverModel
            , $window
            , $location) {

        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.$serverModel = $serverModel;
        vm.$location = $location;
        vm.$window = $window;
        vm.$uibModal = $uibModal;
        vm.$accountsService = $accountsService;
        vm.$imageService = $imageService;
        vm.$fileService = $fileService;
        vm.$followerService = $followerService;
        vm.$statsTrackService = $statsTrackService;
        vm.$mediaService = $mediaService;
        vm.totalCount = 0;
        vm.sweetAlert = sweetAlert;

        vm.item = null;
        vm.itemCheckAgainst = null
        vm.items = [];
        vm.isThereData = false;
        vm.newDate = null;
        vm.email = null;

        vm.notify = vm.$accountsService.getNotifier($scope);
        vm.statsNotify = vm.$statsTrackService.getNotifier($scope);

        vm.genderIDs = [
            { id: 1, title: 'Female' },
            { id: 2, title: 'Male' },
            { id: 3, title: 'Non-binary/ third gender' },
            { id: 4, title: 'Transgender' },
            { id: 5, title: 'Prefer not to say' },
        ];

        //modal directive
        vm.modalItems = [];
        vm.modalSelected = null;

        //blur handler
        vm.checkHandle = _checkHandle;

        //click handlers
        vm.submit = _submit;
        vm.openModal = _openModal;
        vm.openFollowerModal = _openFollowerModal;
        vm.changeTab = _changeTab;
        vm.openEmailModal = _getEmail;

        //successes
        vm.onAccountGetSuccessful = _onAccountGetSuccessful;
        vm.onAccountUpdateSuccessful = _onAccountUpdateSuccessful;
        vm.onTotalCountGetSuccessful = _onTotalCountGetSuccessful;

        //errors
        vm.onAccountGetUnsuccessful = _onAccountGetUnsuccessful;
        vm.onAccountUpdateUnsuccessful = _onAccountUpdateUnsuccessful;
        vm.onAccountGetUnsuccessful = _onAccountGetUnsuccessful;
        vm.onTotalCountGetUnsuccessful = _onTotalCountGetUnsuccessful;

        //startup
        _render();

        function _render() {
            _replaceTextArea();

            console.log("vm.isThereData", vm.isThereData);
            vm.$accountsService.getById(vm.onAccountGetSuccessful, vm.onAccountGetUnsuccessful);
            console.log("$serverModel", vm.$serverModel);
            vm.$statsTrackService.getTotalCount(vm.onTotalCountGetSuccessful, vm.onTotalCountGetUnsuccessful);

            var sentData = {
                pageIndex: 0,
                pageSize: 1,
            };

            vm.pc = vm.getParentController("acctTabCtrl");

            console.log("$scope", $scope);
        };

        function _replaceTextArea() {
            console.log("CKEDITOR", CKEDITOR);
            CKEDITOR.replace('bio');
        };

        function _changeTab() {
            vm.notify(function () {
                vm.pc.tabTwo();

                vm.$location.path("password");
            });
        };

        //blur handler
        function _checkHandle(handle) {
            vm.$accountsService.getByHandle(handle, _onAccountCheckGetSuccessful, _onAccountNotExists);
        };

        //click handlers
        function _submit(isValid, data) {
            data.bio = CKEDITOR.instances.bio.getData();
            console.log("data going in", data);

            //if there is Account info, update
            if (vm.isThereData && data) {
                if (isValid) {

                    vm.$accountsService.updateAccount(data, vm.onAccountUpdateSuccessful, vm.onAccountUpdateUnsuccessful);
                }
            }

        };

        function _openModal(data) {
            var modalInstance = vm.$uibModal.open({
                animation: true
                , templateUrl: "/Scripts/app/account/template/pictureModal.html"
                , controller: "accountFormController as afc"
                , size: "lg"
                , keyboard: true
                , resolve: {
                    passedItem: function () {
                        console.log("modal has been opened");
                        return {
                            accountInfo: data
                        }
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

        function _getEmail() {
            vm.$accountsService.getEmail(_onEmailGetSuccessful, _onAccountGetUnsuccessful);
        };

        function _openEmailModal(oldEmail) {
            var modalInstance = vm.$uibModal.open({
                animation: true
                , templateUrl: "/Scripts/app/account/template/emailModal.html"
                , controller: "accountFormController as afc"
                , size: "md"
                , keyboard: true
                , resolve: {
                    passedItem: function () {
                        console.log("email modal has been opened");
                        console.log(oldEmail);

                        return { email: oldEmail }
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log("selected item:", selectedItem);
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });

        };

        function _openFollowerModal(data) {
            var modalInstance = vm.$uibModal.open({
                animation: true
                , templateUrl: "/Scripts/app/account/template/followerModal.html"
                , controller: "followerController as followerCtrl"
                , size: "lg"
                , keyboard: true
                , resolve: {
                    passedFollowerItem: function () {

                        console.log("modal has been opened");

                        return {
                            profileData: data
                        }
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

        //successes
        function _onAccountGetSuccessful(data) {
            console.log("data", data);

            vm.item = data.item;
            var genderVar = data.item.genderID;
            vm.genderID = genderVar;

            vm.notify(function () {
                data.item.dob = new Date(data.item.dob);
                vm.isThereData = true;
            });
        };

        function _onEmailGetSuccessful(data) {
            console.log("Get email success:", data.item);

            let email = data.item;

            if (email) {
                _openEmailModal(email);
            }
        };

        function _onAccountCheckGetSuccessful(data) {
            console.log(data)
            if (data && data.item) {
                vm.notify(function () {
                    vm.itemCheckAgainst = data.item;

                    if (vm.item.userId != vm.itemCheckAgainst.userId) {
                        console.log("Handle already exists in DB - Denied for Submission");

                        vm.$scope.accountForm.handle.$setValidity("checkHandle", false);
                        vm.$scope.accountForm.handle.$render();
                    }
                });
            }
        };

        function _onAccountUpdateSuccessful() {
            console.log("Account was edited");
            console.log($window);
            _changeTab();
        };

        function _onTotalCountGetSuccessful(data) {
            vm.notify(function () {
                vm.followerCount = data.item;
                vm.totalCount = data.item.totalCount;
                console.log("total count", vm.totalCount);
            });
        };

        //errors
        function _onAccountGetUnsuccessful(error) {
            console.error("account was not got", error);
        };

        function _onAccountUpdateUnsuccessful(error) {
            console.error("account was not updated ", error);
            alert("Your Bio is too long! Please shorten.");
        };

        function _onTotalCountGetUnsuccessful(error) {
            console.error("Total count was not received ", error);
        };

        function _onAccountNotExists(error, status) {
            console.log("Handle does not exist in DB - Approved for Submission");

            vm.notify(function () {
                vm.$scope.accountForm.handle.$setValidity("checkHandle", true);
            });
        };
    };

})();
