/**
 * Created by Tuff_gnarl1 on 19.09.15.
 */

(function () {
    'use strict';
    angular
        .module('root.AdministrationClientsViewCtrl', ['ui.router', 'ui.bootstrap', 'camera', 'smart-table'])
        .directive('login', function () {
            return {
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {
                    ctrl.$validators.login = function (modelValue, viewValue) {
                        if (ctrl.$isEmpty(modelValue)) {
                            // consider empty models to be valid
                            return true;
                        }
                        // it is invalid
                        return false;
                    };
                }
            };
        })
        .controller('AdministrationClientsViewCtrl', AdministrationClientsViewCtrl)
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
        .controller('ModalDepositViewInstanceCtrl', function ($scope, $modalInstance, deposit) {
            $scope.deposit = deposit;
            $scope.depositIncreaseValue = 0;
            $scope.ok = function () {
                $scope.deposit += $scope.depositIncreaseValue;
                $modalInstance.close($scope.deposit);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        })
    AdministrationClientsViewCtrl.$inject = ['storage', 'sensorInfo', 'WSBridge', 'WSApp', '$http', 'sessionStorage', 'serverUrl', '$modal'];
    function AdministrationClientsViewCtrl(storage, sensorInfo, WSBridge, WSApp, $http, sessionStorage, serverUrl, $modal) {
        var vm = this;
        vm.storage = storage;
        vm.sensorInfo = sensorInfo;
        vm.msgToSensor = "";
        vm.sensorisSwitch = false;
        vm.sendToSensorBtnClick = function (msg) {
            //if (vm.sensorInfo.bridgeIsConnected && vm.sensorInfo.sensorIsConnected && vm.sensorInfo.sensorIsInit) {
            //    WSBridge.$emit('id',msg);
            console.log("sent to sensor: " + msg);
            var k = {id: 5}
            WSApp.$emit("id", 0);
            //}
            //else
            //    console.log("sensor is not available, msg did not send: " + msg);
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
        vm.newClient = false;
        vm.clientsList = [];
        vm.clientsListSafe = [];
        vm.selectedClient = false;
        var editedClient = false;
        var selectedClientOrigin = {};
        var dataURItoBlob = function (dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type: mimeString});
        }
        var sendImage = function (id_client) {
            console.log("sendImage");
            //console.log(vm.selectedClient.photo_file);
            var file = dataURItoBlob(vm.selectedClient.photo_file);
            console.log(file);
            var fd = new FormData();
            fd.append('login', sessionStorage.login)
            fd.append('password', sessionStorage.password)
            fd.append('photo_file', file);
            $http.post(serverUrl + 'ecofitness/api/clients/upload_photo/' + id_client, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .success(function (response) {
                    console.log("success");
                    console.log(response);
                    vm.showClientById(id_client);
                })
                .error(function (response) {
                    console.log("failed");
                    console.log(response);
                });
        }
        vm.sendImage = sendImage;
        var getClientList = function (callback) {
            console.log("GET EMPLOYEES LIST");
            if (sessionStorage.login && sessionStorage.password) {
                var req = {
                    method: 'GET',
                    url: serverUrl + 'ecofitness/api/clients',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    params: {
                        login: sessionStorage.login,
                        password: sessionStorage.password
                    }
                }
                $http(req).then(function (responseSuccces) {
                    //console.log("server response success");
                    //console.log(responseSuccces);
                    if (responseSuccces.data.meta.code == 200) {
                        //vm.clientsList = angular.copy(responseSuccces.data.content.clients, vm.clientsList);
                        //vm.clientsList = $.extend(vm.clientsList, responseSuccces.data.content.clients);
                        vm.clientsList = responseSuccces.data.content.clients;
                        //vm.clientsListSafe = $.extend(vm.clientsList, responseSuccces.data.content.clients);
                        console.log(vm.clientsList);
                        if (callback) {
                            callback();
                        }
                    }
                    else {
                        alert("Ошибка при загрузке данных");
                    }

                }, function (responseFail) {
                    console.log("server response failed");
                    console.log(responseFail);
                    alert("Ошибка при загрузке данных");
                });
            }
        }
        //"http://posttestserver.com/post.php?dir=example
        getClientList();
        //vm.clientsList = [
        //    {
        //        id_client: 0,
        //        photo_file: 'http://cs630825.vk.me/v630825605/1cd2d/K2CI_uhtPRw.jpg',
        //        name: "Кирилл",
        //        surname: "Пономарев",
        //        patronymic: "Юрьевич",
        //        date_of_birth: new Date(),
        //        employment_date: new Date(),
        //        dismissal_date: new Date(),
        //        role: "Администратор",
        //        gender: 'male',
        //        passport: {
        //            serial: '1234',
        //            number: '123456',
        //            date: new Date(),
        //            department: "Выдан выдан выдан",
        //            place_birth: "Ленинградская область спб.",
        //            department_code: "123456",
        //            registration_region: "Регион регион",
        //            registration_locality: "СПб",
        //            registration_street_street: 'Улицааааааа',
        //            registration_street_house: '20',
        //            registration_street_flat: '10',
        //            registration_department: "Зарегистрирован нннавлраоыврло",
        //        },
        //        register_by: {
        //            id_client: 1,
        //            name: "Данила",
        //            surname: "Лапко",
        //            role: "Администратор"
        //        },
        //        auth_info: {
        //            login: "tuff",
        //            pass: ""
        //        },
        //        status: "dismissed",
        //        dismissed_cause: "потому что",
        //        vacation_date_start: new Date(),
        //        vacation_date_end: new Date(),
        //        tel: "89992071024",
        //        tel1: "",
        //        deposit: 200,
        //        comment: "Комментарий комментарий комментарий",
        //        login: "admin",
        //        password: "admin"
        //    },
        //    {
        //        id_client: 1,
        //        photo_file: 'http://cs624225.vk.me/v624225207/40bd7/VfEWVpcYbTU.jpg',
        //        name: "Данила",
        //        surname: "Лапко",
        //        patronymic: "Вадимович",
        //        date_of_birth: new Date(),
        //        employment_date: new Date(),
        //        dismissal_date: new Date(),
        //        role: "Администратор",
        //        gender: 'male',
        //        passport_serial: '1234',
        //        passport_number: '123456',
        //        passport_date: new Date(),
        //        passport_department: "Выдан выдан выдан",
        //        passport_place_birth: "Камчатский край, гор. Елизово",
        //        passport_department_code: "123456",
        //        passport_registration_region: "Регион регион",
        //        passport_registration_locality: "СПб",
        //        passport_registration_street_street: 'Улицааааааа',
        //        passport_registration_street_house: "10/2",
        //        passport_registration_street_flat: "20",
        //        passport_registration_department: "Зарегистрирован нннавлраоыврло",
        //        register_by: {
        //            id_client: 0,
        //            name: "Кирилл",
        //            surname: "Пономарев",
        //            role: "Администратор"
        //        },
        //        auth_info: {
        //            login: "danlapko",
        //            pass: ""
        //        },
        //        status: "active",
        //        dismissed_cause: "",
        //        vacation_date_start: new Date(),
        //        vacation_date_end: new Date(),
        //        tel: "89602488331",
        //        tel1: "",
        //        deposit: 300,
        //        comment: "Комментарий комментарий комментарий",
        //        login: "admin1",
        //        password: "admin1"
        //    }
        //]
        vm.currentLocalViewInfo = "general";
        vm.onChangeLocalView = function (selectedLocalView) {
            vm.currentLocalViewInfo = selectedLocalView;
        }
        vm.readOnly = false;
        vm.onEditModeSwitch = function () {
            console.log("onEditModeSwitch");
            vm.readOnly = !vm.readOnly;
        }
        vm.onSelectClient = function (selectedClient, callback) {
            console.log("selectedClientOriginBeforeCopy");
            console.log(selectedClientOrigin);
            //console.log(selectedClient);
            if (selectedClient === false) {
                vm.selectedClient = false;
                selectedClientOrigin = false;
            }
            else {
                selectedClient['date_of_birth'] = new Date(selectedClient['date_of_birth']);
                vm.selectedClient = $.extend(vm.selectedClient, selectedClient);
                selectedClientOrigin = $.extend(selectedClientOrigin, selectedClient);
                console.log("selectedClientOriginAfterCopy");
                console.log(selectedClientOrigin);
                //selectedClientOrigin = selecatedClient;
            }
            vm.onChangeLocalView('general');
            vm.readOnly = false;
            //vm.newClient = false;
            editedClient = false;
            if (callback) {
                callback();
            }
        }
        vm.onButtonTest = function () {
            console.log("BUTTON CLICK");
            console.log(vm.clientsList);
        }
        vm.onShowRegisterByClient = function (id_client) {
            var registerByClient = {};
            vm.clientsList.forEach(function (client) {
                if (id_client == client.id_client) {
                    registerByClient = client;
                }
            });
            vm.onSelectClient(registerByClient);
        }
        vm.onOpenDepositModal = function () {
            //console.log("openCamModalBtnClicked");
            var modalDepositViewInstance = $modal.open({
                animation: true,
                templateUrl: 'ModalDepositView.html',
                controller: 'ModalDepositViewInstanceCtrl',
                size: "sm",
                resolve: {
                    deposit: function () {
                        return vm.selectedClient.deposit;
                    }
                }
            });

            modalDepositViewInstance.result.then(function (deposit) {
                vm.selectedClient.deposit = deposit;
                vm.onFieldChange('deposit');
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        vm.showClientById = function (client_id) {
            getClientList(function () {
                console.log("FIND EMPLOYEE");
                vm.clientsList.forEach(function (client) {
                    if (client_id === client.id_client) {
                        vm.onSelectClient(client);
                        //vm.selectedClient = client;
                    }
                });
            });
        }
        vm.onSaveButtonClick = function () {
            if (!vm.newClient) {
                var saveClientReq = {
                    method: 'PUT',
                    url: serverUrl + 'ecofitness/api/clients/' + vm.selectedClient.id_client,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    params: {
                        login: sessionStorage.login,
                        password: sessionStorage.password,
                        client: editedClient
                    }
                }
                $http(saveClientReq).then(function (responseSuccces) {
                    console.log(responseSuccces);
                    if (responseSuccces.data.meta.code == 200) {
                        getClientList(function () {
                            console.log("FIND EMPLOYEE");
                            if (editedClient['photoChanged']) {
                                sendImage(vm.selectedClient.id_client);
                            }
                            else {
                                vm.showClientById(vm.selectedClient.id_client);
                            }
                            //vm.clientsList.forEach(function (client) {
                            //    if(client.id_client == vm.selectedClient.id_client) {
                            //        vm.onSelectClient(client);
                            //    }
                            //});
                        });
                        //    id_client
                    }
                    else {
                        alert("Ошибка при загрузке данных");
                    }

                }, function (responseFail) {
                    console.log("server response failed");
                    console.log(responseFail);
                    alert("Ошибка при загрузке данных");
                });
            }
            else {
                var saveNewClientReq = {
                    method: 'POST',
                    url: serverUrl + 'ecofitness/api/clients',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        login: sessionStorage.login,
                        password: sessionStorage.password,
                        client: editedClient
                    }
                }
                $http(saveNewClientReq).then(function (responseSuccces) {
                    console.log("server response success");
                    console.log(responseSuccces);
                    if (responseSuccces.data.meta.code == 200) {
                        vm.newClient = false;
                        getClientList(function () {
                            console.log("FIND EMPLOYEE");
                            if (editedClient['photoChanged']) {
                                sendImage(responseSuccces.data.content.id_client);
                            }
                            else {
                                vm.showClientById(responseSuccces.data.content.id_client);
                            }
                            //vm.clientsList.forEach(function (client) {
                            //    if(responseSuccces.data.content.id_client == client.id_client) {
                            //        vm.onSelectClient(client);
                            //        //vm.selectedClient = client;
                            //    }
                            //});
                        });

                    }
                    else {
                        alert("Ошибка при загрузке данных");
                    }

                }, function (responseFail) {
                    console.log("server response failed");
                    console.log(responseFail);
                    alert("Ошибка при загрузке данных");
                });
            }
            //selectedClientOrigin = $.extend(selectedClientOrigin, vm.selectedClient);
            vm.onEditModeSwitch();
        }
        vm.onCancelButtonClick = function () {
            console.log("TEST1");
            if (vm.newClient) {
                vm.onSelectClient(false);
            }
            else {
                //vm.selectedClient = $.extend(vm.selectedClient, selectedClientOrigin);
                vm.onSelectClient(selectedClientOrigin);
            }
            vm.readOnly = false;
            //vm.onEditModeSwitch();
            console.log("TEST2");
        }
        vm.onAddClient = function () {
            vm.newClient = {
                //id_client: 0,
                photo_file: "images/photo.jpg",
                name: "",
                surname: "",
                patronymic: "",
                date_of_birth: new Date(),
                employment_date: new Date(),
                dismissal_date: new Date(),
                role: "admin",
                //gender: 'male',
                //passport: {
                //    serial: '',
                //    number: '',
                //    date: new Date(),
                //    department: "",
                //    place_birth: "",
                //    department_code: "",
                //    registration_region: "",
                //    registration_locality: "",
                //    registration_street_street: '',
                //    registration_street_house: '',
                //    registration_street_flat: '',
                //    registration_department: "",
                //},
                //register_by: {
                //    id_client: 1,
                //    name: "",
                //    surname: "",
                //    role: ""
                //},
                //auth_info: {
                //    login: "",
                //    pass: ""
                //},
                status: "active",
                //dismissed_cause: "",
                //vacation_date_start: new Date(),
                //vacation_date_end: new Date(),
                //tel: "",
                //tel1: "",
                deposit: 0,
                //comment: "",
                login: "",
                password: ""
            }
            //vm.selectedClient = vm.newClient;
            vm.onSelectClient(vm.newClient);
            vm.onEditModeSwitch();
        }
        vm.onDeleteButtonClick = function () {
            var deleteClientReq = {
                method: 'DELETE',
                url: serverUrl + 'ecofitness/api/clients/' + vm.selectedClient.id_client,
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    login: sessionStorage.login,
                    password: sessionStorage.password
                    //client: vm.selectedClient
                }
            }
            $http(deleteClientReq).then(function (responseSuccces) {
                console.log(responseSuccces);
                if (responseSuccces.data.meta.code == 200) {
                    vm.onSelectClient(false);
                    console.log("ON DELETE SUCCESS");
                    getClientList();
                }
                else {
                    alert("Ошибка при загрузке данных");
                }

            }, function (responseFail) {
                console.log("server response failed");
                console.log(responseFail);
                alert("Ошибка при загрузке данных");
            });
        }
        vm.loginCheck = function () {
            vm.clientsList.forEach(function (client) {
                if (vm.selectedClient.login == client.login && vm.selectedClient.id_client != client.id_client) {
                    console.log("BUSY");
                }
            });
        }
        vm.onEditPhotoButtonClick = function (size) {
            console.log("openCamModalBtnClicked");
            var modalPhotoViewInstance = $modal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'ModalPhotoView.html',
                controller: 'ModalPhotoViewInstanceCtrl',
                size: size,
                resolve: {
                    photo: function () {
                        return vm.selectedClient.photo_file;
                    }
                }
            });

            modalPhotoViewInstance.result.then(function (photo) {
                vm.selectedClient.photo_file = photo;

                if (!editedClient) {
                    editedClient = {};
                }
                editedClient['photoChanged'] = "true";
            }, function () {
                console.log('Photo modal dismissed at: ' + new Date());
            });
        };
        vm.onFieldChange = function (changedKey) {
            if (!editedClient) {
                editedClient = {};
            }
            editedClient[changedKey] = vm.selectedClient[changedKey];
        }
    }
})();