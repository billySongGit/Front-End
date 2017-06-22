(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('accountFormController', AccountFormController);

    AccountFormController.$inject = [
            '$scope'
            , '$uibModal'
            , '$baseController'
            , '$uibModalInstance'
            , '$accountsService'
            , '$imageService'
            , '$fileService'
            , 'passedItem'
            , '$serverModel'
            , 'sweetAlert'
            , 'registerService'];

    function AccountFormController(
            $scope
            , $uibModal
            , $baseController
            , $uibModalInstance
            , $accountsService
            , $imageService
            , $fileService
            , passedItem
            , $serverModel
            , sweetAlert
            , registerService) {

        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.$uibModal = $uibModal;
        vm.$uibModalInstance = $uibModalInstance;

        vm.$accountsService = $accountsService;
        vm.$imageService = $imageService;
        vm.$fileService = $fileService;
        vm.$serverModel = $serverModel;
        vm.registerService = registerService;

        vm.notify = vm.$accountsService.getNotifier($scope);

        vm.modalSelected = null;
        vm.modalItem = passedItem.accountInfo;
        
        vm.modalItems = [];
        vm.picInfo = null;
        vm.itemIndex = -1;
        vm.sweetAlert = sweetAlert;

        vm.email = {
            old: passedItem.email
            , changeTo: null
        };

        //click handlers
        vm.ok = _ok;
        vm.cancel = _cancel;
        vm.changeAvatar = _changeAvatar;
        vm.addPicture = _addPicture;
        vm.deletePicture = _deletePicture;
        vm.changeBackground = _changeBackground;
        vm.checkEmail = _checkEmail;

        //successes
        vm.onImageGetSuccessful = _onImageGetSuccessful;
        vm.onAvatarUpdated = _onAvatarUpdated;
        vm.onDeleteSuccessful = _onDeleteSuccessful;
        vm.onBackgroundUpdate = _onBackgroundUpdate;
        //errors
        vm.onImageGetUnsuccesful = _onImageGetUnsuccesful;
        vm.onAvatarNotUpdate = _onAvatarNotUpdate;
        vm.onBackgroundNotUpdate = _onBackgroundNotUpdate;
        vm.onDeleteUnsuccessful = _onDeleteUnsuccessful;

        //startup
        _render();

        function _render() {
            vm.$imageService.getUserImages(vm.onImageGetSuccessful, vm.onImageGetUnsuccesful);
        };

        //click handlers
        function _ok(item) {
            vm.$uibModalInstance.close(item);
        };

        function _cancel() {
            vm.$uibModalInstance.dismiss('cancel');
        };

        function _changeBackground(singleItem) {
            var mItem = vm.modalItem;
            if (singleItem) {
                var newUrl = vm.fixUrl(singleItem.imageUrl);
                var newAccountData = {
                    "userId": mItem.userId,
                    "avatarUrl": mItem.avatarUrl,
                    "firstName": mItem.firstName,
                    "lastName": mItem.lastName,
                    "dob": mItem.dob,
                    "highlight": mItem.highlight,
                    "handle": mItem.handle,
                    "genderID": mItem.genderID,
                    "bio": mItem.bio,
                    "backgroundPicture": newUrl
                };
                vm.modalItem = newAccountData;
                vm.$accountsService.updateBackgroundPicture(newAccountData, vm.onBackgroundUpdate, vm.onBackgroundNotUpdate);
            }
        };

        function _checkEmail() {
            vm.registerService.checkEmail(vm.email.changeTo, _onEmailCheckSuccess, _onEmailCheckFail);
        };

        function _changeAvatar(singleItem) {
            var newUrl = vm.fixUrl(singleItem.imageUrl);
            if (singleItem) {
                var newAccountData = {
                    "avatarUrl": newUrl,
                };
            }
            vm.modalItem = newAccountData;

            console.log("newAccountData", newAccountData);
            vm.$accountsService.updateAvatar(newAccountData, vm.onAvatarUpdated, vm.onAvatarNotUpdate);
        };

        function _addPicture(image) {
            if (image != null && image != undefined && image.value != "") {
                var modalInstance = vm.$uibModal.open({
                    animation: true
                    , templateUrl: "/Scripts/app/account/template/pictureCropModal.html"
                    , controller: "pictureCropController as pcc"
                    , size: "md"
                    , keyboard: true
                    , resolve: {
                        passedPic: function () {

                            console.log("modal has been opened");

                            return { passedData: image };
                        }
                    }
                });
                modalInstance.result.then(function (uploadedPic) {
                    var newImage = vm.fixUrl(uploadedPic[0]);
                    var accountItem = vm.modalItem;

                    var newPictureObj = {
                        'createdBy': accountItem.userId,
                        'imageUrl': newImage,
                        'modifiedBy': accountItem.userId,
                    }
                    //unshift prepends object to array (until refresh)
                    vm.items.unshift(newPictureObj);
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            }
        };

        function _deletePicture(item, index) {
            if (item.id) {
                var ajaxCall = function () {
                    vm.$fileService.deleteFile(item.id, vm.onDeleteSuccessful, vm.onDeleteUnsuccessful);
                    //   vm.$imageService.Delete(item.id, vm.onDeleteSuccessful, vm.onDeleteUnsuccessful);
                    vm.notify(function () {
                        vm.itemIndex = vm.modalItems.indexOf(item);
                        console.log(vm.itemIndex, "vm.itemIndex");
                        vm.modalItems.splice(vm.itemIndex, 1);
                    })
                }
                vm.sweetAlert.promptDelete("default", ajaxCall);
            }
        };

        //successes
        function _onImageGetSuccessful(data) {
            vm.notify(function () {
                console.log("images were got");
                vm.items = data.items;
                vm.modalItems = vm.items;

                console.log("data.items: ", data.items);
                console.log("vm.modalItems: ", vm.modalItems);
            });


        };

        function _onEmailCheckSuccess(data) {
            //console.log(data.item);
            if (data.item) {
                vm.sweetAlert.emailExists();
            }
            else {
                vm.registerService.updateEmail({ email: vm.email.changeTo }, _onEmailUpdateSuccess, _onEmailUpdateFail);
            }
        };

        function _onEmailUpdateSuccess(data) {
            vm.sweetAlert.confirmEmail("");
        };

        function _onAvatarUpdated() {
            console.log("account was updated");
            vm.notify(function () {
                var data = vm.modalItem;
                vm.ok(data);
            });
        };

        function _onBackgroundUpdate(data, newData) {
            newData = newData || {};
            vm.$systemEventService.broadcast("holla", newData);
            vm.ok(newData);
        };

        function _onDeleteSuccessful() {
            console.log("deleted");
        };

        //errors
        function _onImageGetUnsuccesful(error) {
            console.error("images could not be retrieved ", error);
        };

        function _onAvatarNotUpdate(error) {
            console.error("avatar could not be updated ", error);
        };

        function _onBackgroundNotUpdate(error) {
            console.error("Background could not be updated ", error);
        };

        function _onDeleteUnsuccessful(error) {
            console.error("image could not be deleted ", error);
        };

        function _onEmailCheckFail(error) {
            console.error("Email check unsuccessful: ", error);
        };

        function _onEmailUpdateFail(error) {
            console.error("Email update unsuccessful: ", error);
        };
    };

})();