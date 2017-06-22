(function () {
    "use strict";

    angular.module(APPNAME)
        .controller('pictureCropController', PictureCropController);

    PictureCropController.$inject = [
            '$scope'
            , '$baseController'
            , '$uibModalInstance'
            , '$accountsService'
            , '$imageService'
            , '$fileService'
            , 'passedPic'
            , '$serverModel'
            , '$jCropService'];

    function PictureCropController(
            $scope
            , $baseController
            , $uibModalInstance
            , $accountsService
            , $imageService
            , $fileService
            , passedPic
            , $serverModel
            , $jCropService) {
        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.$uibModalInstance = $uibModalInstance;

        vm.$accountsService = $accountsService;
        vm.$imageService = $imageService;
        vm.$fileService = $fileService;
        vm.$serverModel = $serverModel;
        vm.$jCropService = $jCropService;

        vm.notify = vm.$accountsService.getNotifier($scope);
        vm.picNotify = vm.$imageService.getNotifier($scope);

        vm.modalItem = passedPic.passedData;
        vm.modalItems = [];

        //click handlers
        vm.ok = _ok;
        vm.cancel = _cancel;
        vm.crop = _crop;
        vm.rotate = _rotate;
        vm.uploadPic = _uploadPic;

        //successes
        vm.onUploadPicSuccessful = _onUploadPicSuccessful;

        //errors
        vm.onUploadPicUnsuccessful = _onUploadPicUnsuccessful;

        //startup
        _render();

        function _render() {
            var input = vm.modalItem;

            vm.$jCropService.loadImage(input);
        };


        //click handlers
        function _ok() {
            vm.$uibModalInstance.close(vm.modalItem);
        };

        function _cancel() {
            vm.$uibModalInstance.dismiss('cancel');
        };

        function _crop() {
            vm.$jCropService.applyCrop();
        };

        function _rotate() {
            vm.$jCropService.applyRotate();
        };

        function _uploadPic() {
            console.log("jCrop service", vm.$jCropService.upload());

            vm.$fileService.post(vm.$jCropService.upload(), vm.onUploadPicSuccessful, vm.onUploadPicUnsuccessful);
        };

        //successes
        function _onUploadPicSuccessful(data) {
            vm.modalItem = data;
            console.log("upload successful. vm.modalItem", vm.modalItem);

            _ok(vm.modalItem);
        };

        //errors
        function _onUploadPicUnsuccessful(error) {
            console.error("images could not be uploaded ", error);

        };
    }
})();
