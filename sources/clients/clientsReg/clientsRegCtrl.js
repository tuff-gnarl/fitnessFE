/**
 * Created by Tuff_gnarl1 on 19.09.15.
 */
(function () {
    'use strict';
    angular
        .module('root.ClientsRegViewCtrl', ['ui.router', 'ui.bootstrap', 'dndLists'])
        .controller('ClientsRegViewCtrl', ClientsRegViewCtrl)
        .controller('ModalPhotoViewInstanceCtrl', function ($scope, $modalInstance, photo) {
            $scope.photo = photo;
            $scope.retakePhoto = function () {
                $scope.photo = false;
            };
            $scope.ok = function () {
                $modalInstance.close($scope.photo);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        })
        .controller('ModalServicesViewInstanceCtrl', function ($scope, $modalInstance, choosedServices, availableServices) {

            $scope.choosedServices = angular.copy(choosedServices, $scope.choosedServices);
            $scope.availableServices = [];

            //TODO использовать андерскор
            for (var i = 0; i < availableServices.length; i++) {
                var contains = false;
                for (var j = 0; j < choosedServices.length; j++) {
                    if (availableServices[i].id == choosedServices[j].id) {
                        contains = true;
                    }
                }
                if (!contains) {
                    $scope.availableServices.push(availableServices[i]);
                }
            }

            //$scope.models = {
            //    selected: null,
            //    lists: {"A": [], "B": []}
            //};
            //
            //console.log(availableServices.length);
            //// Generate initial model
            //for (var i = 0; i < availableServices.length; i++) {
            //    $scope.models.lists.A.push(availableServices[i]);
            //    //$scope.models.lists.B.push({label: "Item B" + i});
            //}

            // Model to JSON for demo purpose
            //$scope.$watch('availableServices', function(model) {
            //    $scope.modelAsJson = angular.toJson(model, true);
            //}, true);
            $scope.ok = function () {
                $modalInstance.close($scope.choosedServices);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        })
        .controller('ModalSensorViewInstanceCtrl', function ($scope, $modalInstance, sensorInfo, WSBridge, client) {
            //TODO ФУНКЦИИ СЕНСОРА ИНЖЕКТИТЬ
            $scope.sensorInfo = sensorInfo;
            $scope.check = function () {
                console.log(JSON.stringify(sensorInfo));
                console.log(sensorInfo.sensorRegisterMode.status);
            }
            $scope.sendToSensorBtnClick = function (msg) {
                if (sensorInfo.bridgeIsConnected && sensorInfo.sensorIsConnected && sensorInfo.sensorIsInit) {
                    WSBridge.$emit(msg);
                    console.log("sent to sensor: " + msg);
                }
                else
                    console.log("sensor is not available, msg did not send: " + msg);
            }
            $scope.repeat = function () {
                $scope.sendToSensorBtnClick('startRegistration');
            }
            $scope.sendToSensorBtnClick('startRegistration');
            $scope.ok = function () {
                //client.sensorTmpl = sensorInfo.sensorRegisterMode.tmpl;
                $modalInstance.close($scope.sensorInfo.sensorRegisterMode.tmpl);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        })
    ClientsRegViewCtrl.$inject = ['storage', 'sensorInfo', 'WSBridge', '$modal', 'tempClientPhoto', 'WSApp'];
    function ClientsRegViewCtrl(storage, sensorInfo, WSBridge, $modal, tempClientPhoto, WSApp) {
        var vm = this;
        vm.storage = storage;
        vm.sensorInfo = sensorInfo;
        vm.msgToSensor = "";
        vm.sensorisSwitch = false;
        vm.client = sensorInfo.sensorClient;
        vm.sensorInfo.sensorClient = {
            photo: tempClientPhoto,
            surname: "",
            name: "",
            middleName: "",
            bornDate: "",
            gender: "",
            //passportNumber: "",
            //passportIssuedBy: "",
            //passportBirthPlace: "",
            //passportВateofIssue: "",
            //passportRegistration: "",
            choosedServices: [],
            sensorTmpl: "",
            telNumber: "",
            email: "",
            infoFrom: "",
            coach: "",
            comment: ""
        }

        vm.client = vm.sensorInfo.sensorClient;

        vm.sendToSensorBtnClick = function (msg) {
            console.log(vm.picture);
        }
        vm.connectSensorBtnClick = function () {
            console.log("connectSensorbtn clicked");
            if (vm.sensorInfo.bridgeIsConnected && vm.sensorInfo.sensorIsConnected && !vm.sensorInfo.sensorIsInit) {
                WSBridge.$emit('1');
                console.log("sent to bridge 1");
            }
            if (vm.sensorInfo.bridgeIsConnected && vm.sensorInfo.sensorIsConnected && vm.sensorInfo.sensorIsInit) {
                WSBridge.$emit('5');
                console.log("sent to bridge 5");
            }
        }
        vm.animationsEnabled = true;
        vm.openCamModalWindowBtnClick = function (size) {
            console.log("openCamModalBtnClicked");
            var modalPhotoViewInstance = $modal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'ModalPhotoView.html',
                controller: 'ModalPhotoViewInstanceCtrl',
                size: size,
                resolve: {
                    photo: function () {
                        return vm.client.photo;
                    }
                }
            });

            modalPhotoViewInstance.result.then(function (photo) {
                vm.client.photo = photo;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        vm.openServicesModalWindowBtnClick = function (size) {
            console.log("openServicesModalWidnowBtnClick");
            var modalServicesViewInstance = $modal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'ModalServicesView.html',
                controller: 'ModalServicesViewInstanceCtrl',
                size: size,
                resolve: {
                    choosedServices: function () {
                        return vm.client.choosedServices;
                    },
                    availableServices: function () {
                        return vm.storage.services;
                    }
                }
            });

            modalServicesViewInstance.result.then(function (choosedServices) {
                vm.client.choosedServices = choosedServices;
            }, function () {
                console.log(vm.client.choosedServices);
            });
        };
        vm.openSensorModalWindowBtnClick = function (size) {
            console.log("openSensorModalWidnowBtnClick");
            var modalSensorViewInstance = $modal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'ModalSensorView.html',
                controller: 'ModalSensorViewInstanceCtrl',
                size: size,
                resolve: {
                    sensorInfo: function () {
                        return vm.sensorInfo;
                    },
                    WSBridge: function () {
                        return WSBridge;
                    },
                    client: function () {
                        return vm.client;
                    }
                }
            });

            modalSensorViewInstance.result.then(function (sensorTmpl) {
                vm.client.sensorTmpl = sensorTmpl;
                console.log(vm.client.sensorTmpl);
            }, function () {
                console.log(vm.client.sensorTmpl);
            });
        };
        vm.toggleAnimation = function () {
            vm.animationsEnabled = !vm.animationsEnabled;
        };

        vm.sendToSensorBtnClick = function (msg) {
            if (vm.sensorInfo.bridgeIsConnected && vm.sensorInfo.sensorIsConnected && vm.sensorInfo.sensorIsInit) {
                WSBridge.$emit(msg);
                console.log("sent to sensor: " + msg);
            }
            else
                console.log("sensor is not available, msg did not send: " + msg);
        }
        vm.connectSensorBtnClick = function () {
            console.log("connectSensorbtn clicked");
            if (vm.sensorInfo.bridgeIsConnected && vm.sensorInfo.sensorIsConnected && !vm.sensorInfo.sensorIsInit) {
                WSBridge.$emit('initSensor');
                console.log("sent to bridge initSensor");
            }
            if (vm.sensorInfo.bridgeIsConnected && vm.sensorInfo.sensorIsConnected && vm.sensorInfo.sensorIsInit) {
                WSBridge.$emit('uninitSensor');
                console.log("sent to bridge uninitSensor");
            }
        }
        vm.safeClientBtnClick = function () {
            console.log(JSON.stringify(vm.client));
            WSApp.$emit("newUser", vm.client);
        }
    }
})();
