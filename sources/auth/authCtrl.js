/**
 * Created by Tuff_gnarl1 on 19.09.15.
 */
(function () {
    'use strict';
    angular
        .module('root.AuthViewCtrl', ['ui.router', 'camera'])
        .controller('AuthViewCtrl', AuthViewCtrl)

    AuthViewCtrl.$inject = ['storage', 'sensorInfo', 'WSBridge', 'WSApp', '$cookies', '$http', '$state', 'sessionStorage', 'serverUrl'];
    function AuthViewCtrl(storage, sensorInfo, WSBridge, WSApp, $cookies, $http, $state, sessionStorage, serverUrl) {
        var vm = this;
        vm.storage = storage;
        vm.login = "";
        vm.password = "";
        vm.authProcessing = false;
        vm.authError = false;

        vm.onLoginButtonClick = function (login, password) {
            vm.authProcessing = true;
            var req = {
                method: 'GET',
                url: serverUrl + 'ecofitness/api/login',
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    login: vm.login,
                    password: vm.password
                }
            }
            $http(req).then(function (responseSuccces) {
                console.log("server response success");
                console.log(responseSuccces);
                vm.authProcessing = false;
                if (responseSuccces.data.meta.code == 200) {
                    sessionStorage.isAuthorized = true;
                    sessionStorage.login = vm.login;
                    sessionStorage.password = vm.password;
                    console.log("AFTER SERVER RESPONSE");
                    switch (responseSuccces.data.content.employee.role) {
                        case 'admin':
                            $state.go('administration');
                            break;
                        case '':
                            $state.go('administration');

                            break;
                    }
                }
                else {
                    vm.authError = true;
                }

            }, function (responseFail) {
                vm.authProcessing = false;
                console.log("server response failed");
                console.log(responseFail);
                vm.authError = true;
            });


        }

    }
})();