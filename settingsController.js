(function () {
    "use strict";

    angular.module(APPNAME)
    .controller('settingsController',
    SettingsController);

    SettingsController.$inject = [
            '$scope'
            , '$baseController'
            , '$accountsService'
            , '$uibModal'
            , '$imageService'
            , '$fileService'
            , '$followerService'
            , '$statsTrackService'
            , 'sweetAlert'
            , "settingSrv"];

    function SettingsController(
            $scope
            , $baseController
            , $accountsService
            , $uibModal
            , $imageService
            , $fileService
            , $followerService
            , $statsTrackService
            , sweetAlert
            , settingSrv) {

        var vm = this;

        $baseController.merge(vm, $baseController);

        vm.$scope = $scope;
        vm.sweetAlert = sweetAlert;
        vm.$uibModal = $uibModal;
        vm.$accountsService = $accountsService;
        vm.$imageService = $imageService;
        vm.$fileService = $fileService;
        vm.$followerService = $followerService;
        vm.$statsTrackService = $statsTrackService;
        vm.authorizeTwitter = _oauthTwitter;
        vm.authorizePinterest = _oauthPinterest;
        vm.addSetting = _addSetting;
        vm.settings = [];

        vm.notify = vm.$accountsService.getNotifier($scope);

        // View Model Properties //
        vm.item = null;
        vm.video = null;
        vm.videoUrlPlaceholder;
        vm.pattern;

        //Click Handlers //
        vm.openModal = _openModal;
        vm.linkInsta = _linkInsta;
        vm.uploadVideo = _uploadVideo;

        // success //
        vm.onAccountGetSuccessful = _onAccountGetSuccessful;
        vm.onVideoUpdateSuccessful = _onVideoUpdateSuccessful;

        // error //
        vm.onAccountGetUnsuccessful = _onAccountGetUnsuccessful;
        vm.onVideoUpdateUnsuccessful = _onVideoUpdateUnsuccessful;

        //startup //
        _render();

        function _render() {
            vm.$systemEventService.listen("holla", _alterThumbnail)
            vm.$accountsService.getById(vm.onAccountGetSuccessful, vm.onAccountGetUnsuccessful);
            settingSrv.getCurrentUserSettings(_settingResponse, _errorResponse);
            _checkUrl();
        }

        function _checkUrl() {
            vm.pattern = new RegExp(
              "^" +
                // protocol identifier
                "(?:(?:https?|ftp)://)" +
                // user:pass authentication
                "(?:\\S+(?::\\S*)?@)?" +
                "(?:" +
                  // IP address exclusion
                  // private & local networks
                  "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                  "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                  "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
                  // IP address dotted notation octets
                  // excludes loopback network 0.0.0.0
                  // excludes reserved space >= 224.0.0.0
                  // excludes network & broacast addresses
                  // (first & last IP address of each class)
                  "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                  "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                  "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                "|" +
                  // host name
                  "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
                  // domain name
                  "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
                  // TLD identifier
                  "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                  // TLD may end with dot
                  "\\.?" +
                ")" +
                // port number
                "(?::\\d{2,5})?" +
                // resource path
                "(?:[/?#]\\S*)?" +
              "$", "i"
            );
        }

        function _oauthTwitter() {
            $accountsService.$window.open("/twitter/begin", "_self");
        }

        function _oauthPinterest() {
            $accountsService.$window.open("/pinterest/begin", "_self");
        }

        function _linkInsta() {
            window.location.replace("/media/login");
        }

        function _addSetting(setting) {
            var model = {
                userId: $baseController.$serverModel.user.handle,
                settingId: setting.settingId
            }
            switch (setting.settingId) {
                case 1:
                    if (setting.active) {
                        model.value = false;
                        setting.active = false;
                    }
                    else {
                        model.value = true;
                        setting.active = true;
                    }
                    _toggleSetting(setting);
                    settingSrv.submitASetting(model, _consoleResponse, _errorResponse);
                    break;
                case 4:
                    if (setting.active) {
                        model.value = false;
                        setting.active = false;
                    }
                    else {
                        model.value = true;
                        setting.active = true;
                    }
                    _toggleSetting(setting);
                    settingSrv.submitASetting(model, _consoleResponse, _errorResponse);
                    break;
                case 5:
                    if (setting.active) {
                        model.value = "";
                        setting.active = false;
                    }
                    else {
                        _oauthTwitter();
                    }
                    _toggleSetting(setting);
                    settingSrv.submitASetting(model, _consoleResponse, _errorResponse);
                    break;
                case 6:
                    if (setting.active) {
                        model.value = "";
                        setting.active = false;
                    }
                    else {
                        _linkInsta();
                    }
                    _toggleSetting(setting);
                    settingSrv.submitASetting(model, _consoleResponse, _errorResponse);
                    break;
                case 7:
                    if (setting.active) {
                        model.value = "";
                        setting.active = false;
                    }
                    else {
                        _oauthPinterest();
                    }
                    _toggleSetting(setting);
                    settingSrv.submitASetting(model, _consoleResponse, _errorResponse);
                    break;
                case 9:
                    if (setting.active) {
                        model.value = false;
                        setting.active = false;
                    }
                    else {
                        model.value = true;
                        setting.active = true;
                    }
                    _toggleSetting(setting);
                    settingSrv.submitASetting(model, _consoleResponse, _errorResponse);
                    break;
            }
        }

        function _toggleSetting(setting) {
            switch (setting.settingId) {
                case 1:
                    if (setting.active) {
                        setting.btnText = "Hide Profile from Follower List";
                    }
                    else {
                        setting.btnText = "Show Profile on Follower List";
                    }
                    break;
                case 4:
                    if (setting.active) {
                        setting.btnText = "Hide Blog";
                    }
                    else {
                        setting.btnText = "Show Blog";
                    }
                    break;
                case 5:
                    if (setting.active) {
                        setting.btnText = "Logout of Twitter";
                    }
                    else {
                        setting.btnText = "Connect to Twitter";
                    }
                    break;

                case 6:
                    if (setting.active) {
                        setting.btnText = "Logout of Instagram";
                    }
                    else {
                        setting.btnText = "Connect to Instagram";
                    }
                    break;

                case 7:
                    if (setting.active) {
                        setting.btnText = "Logout of Pinterest";
                    }
                    else {
                        setting.btnText = "Connect to Pinterest";
                    }
                    break;

                case 9:
                    if (setting.active) {
                        setting.btnText = "Hide Location from Lashgirl Club";
                    }
                    else {
                        setting.btnText = "Show Location on Lashgirl Club";
                    }
                    break;
            }
            return setting.btnText;
        }

        function _alterThumbnail(event, payload) {
            vm.notify(function () {
                vm.item = payload[1];
            });
        }

        function _openModal(data) {
            var modalInstance = vm.$uibModal.open({
                animation: true
                , templateUrl: "/Scripts/app/account/template/backgroundModal.html"
                , controller: "accountFormController as afc"
                , size: "lg"
                , keyboard: true
                , resolve: {
                    passedItem: function () {
                        return { accountInfo: data }
                    }
                }
            });
            modalInstance.result.then(function (selectedItem) {

                vm.modalSelected = selectedItem;
                vm.item.backgroundPic = vm.modalSelected.backgroundPic;


            }), function () {

            }
        }

        function _uploadVideo(video, isValid) {

            if (video && isValid) {
                var newVideoUrl = null;
                if (video.toLowerCase().startsWith("https://www.youtube.com/watch?v=")) {
                    newVideoUrl = "https://www.youtube.com/embed/" + video.slice(32);

                    var data = {
                        handle: vm.item.handle,
                        firstName: vm.item.firstName,
                        lastName: vm.item.lastName,
                        videoUrl: newVideoUrl
                    };
                }
                else {
                    var data = {
                        handle: vm.item.handle,
                        firstName: vm.item.firstName,
                        lastName: vm.item.lastName,
                        videoUrl: video
                    }
                }
                vm.$accountsService.updateVideoUrl(data, vm.onVideoUpdateSuccessful, vm.onVideoUpdateUnsuccessful);
            }
            else {
                console.log("URL is not valid");
            }
        }

        function _settingResponse(data) {
            if (data.data.items) {
                for (var i = 0; i <= 9; i++) {
                    switch (i) {
                        case 1:
                            var setting = data.data.items.find(a => { return a.settingId == i });
                            if (setting) {
                                if (setting.value === "true") {
                                    setting.btnText = "Hide Profile from Follower List";
                                    setting.active = true;
                                }
                                else {
                                    setting.btnText = "Show Profile on Follower List";
                                    setting.active = false;
                                }
                            }
                            else {
                                setting = {
                                    btnText: "Show Profile on Follower List",
                                    settingId: i,
                                    active: false
                                };
                            }
                            vm.settings.push(setting);
                            break;
                        case 4:
                            var setting = data.data.items.find(a => { return a.settingId == i });
                            if (setting) {
                                if (setting.value === "true") {
                                    setting.btnText = "Hide Blog";
                                    setting.active = true;
                                }
                                else {
                                    setting.btnText = "Show Blog";
                                    setting.active = false;
                                }
                            }
                            else {
                                setting = {
                                    btnText: "Show Blog",
                                    settingId: i,
                                    active: false
                                };
                            }
                            vm.settings.push(setting);
                            break;
                        case 5:
                            var setting = data.data.items.find(a => { return a.settingId == i });
                            if (setting) {
                                if (setting.value) {
                                    setting.btnText = "Logout of Twitter";
                                    setting.active = true;
                                }
                                else {
                                    setting.btnText = "Connect to Twitter";
                                    setting.active = false;
                                }
                            }
                            else {
                                setting = {
                                    btnText: "Connect to Twitter",
                                    settingId: i,
                                    active: false
                                };
                            }
                            vm.settings.push(setting);
                            break;

                        case 6:
                            var setting = data.data.items.find(a => { return a.settingId == i });
                            if (setting) {
                                if (setting.value) {
                                    setting.btnText = "Logout of Instagram";
                                    setting.active = true;
                                }
                                else {
                                    setting.btnText = "Connect to Instagram";
                                    setting.active = false;
                                }
                            }
                            else {
                                setting = {
                                    btnText: "Connect to Instagram",
                                    settingId: i,
                                    active: false
                                };
                            }
                            vm.settings.push(setting);
                            break;

                        case 7:
                            var setting = data.data.items.find(a => { return a.settingId == i });
                            if (setting) {
                                if (setting.value) {
                                    setting.btnText = "Logout of Pinterest";
                                    setting.active = true;
                                }
                                else {
                                    setting.btnText = "Connect to Pinterest";
                                    setting.active = false;
                                }
                            }
                            else {
                                setting = {
                                    btnText: "Connect to Pinterest",
                                    settingId: i,
                                    active: false
                                };
                            }
                            vm.settings.push(setting);
                            break;

                        case 9:
                            var setting = data.data.items.find(a => { return a.settingId == i });
                            if (setting) {
                                if (setting.value === "true") {
                                    setting.btnText = "Hide Location from Lashgirl Club";
                                    setting.active = true;
                                }
                                else {
                                    setting.btnText = "Show Location on Lashgirl Club";
                                    setting.active = false;
                                }
                            }
                            else {
                                setting = {
                                    btnText: "Show Location on Lashgirl Club",
                                    settingId: i,
                                    active: false
                                };
                            }
                            vm.settings.push(setting);
                            break;
                    }
                }
            }
        }

        function _errorResponse(error) { console.log(error); }

        function _consoleResponse(data) { console.log(data); }


        //success
        function _onAccountGetSuccessful(data) {
            console.log("Settings Get success");
            vm.notify(function () {
                vm.item = data.item;
                console.log("account item ", vm.item);
                vm.videoUrlPlaceholder = vm.item.videoUrl || "i.e. http://www.youtube.com/someurl...      ";
            });
        }

        function _onVideoUpdateSuccessful(data) {
            console.log("URL upload: ", data);
            vm.sweetAlert.submitSuccess();

        }

        // error
        function _onAccountGetUnsuccessful(error) {
            console.log("Acount Error: ", error);
        }

        function _onVideoUpdateUnsuccessful(error) {
            console.log("video upload error: ", error);
        }
    }
})();