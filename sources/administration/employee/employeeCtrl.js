/**
 * Created by Tuff_gnarl1 on 19.09.15.
 */
(function () {
    'use strict';
    angular
        .module('root.AdministrationEmployeeViewCtrl', ['ui.router', 'ui.bootstrap', 'camera', 'smart-table'])
        .directive('login', function () {
            return {
                require: 'ngModel',
                link: function (scope, elm, attrs, ctrl) {
                    ctrl.$validators.login = function (modelValue, viewValue) {
                        if (ctrl.$isEmpty(modelValue)) {
                            return true;
                        }
                        return false;
                    };
                }
            };
        })
        .controller('AdministrationEmployeeViewCtrl', AdministrationEmployeeViewCtrl)
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
    AdministrationEmployeeViewCtrl.$inject = ['storage', 'sensorInfo', 'WSBridge', 'WSApp', '$http', 'sessionStorage', 'serverUrl', '$modal'];
    function AdministrationEmployeeViewCtrl(storage, sensorInfo, WSBridge, WSApp, $http, sessionStorage, serverUrl, $modal) {
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
        vm.newEmployee = false;
        vm.employeesList = [];
        vm.employeesListSafe = [];
        vm.selectedEmployee = false;
        var editedEmployee = false;
        var selectedEmployeeOrigin = {};
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
        var sendImage = function (id_employee) {
            console.log("sendImage");
            //console.log(vm.selectedEmployee.photo_file);
            var file = dataURItoBlob(vm.selectedEmployee.photo_file);
            console.log(file);
            var fd = new FormData();
            fd.append('login', sessionStorage.login)
            fd.append('password', sessionStorage.password)
            fd.append('photo_file', file);
            $http.post(serverUrl + 'ecofitness/api/employees/upload_photo/' + id_employee, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .success(function (response) {
                    console.log("success");
                    console.log(response);
                    vm.showEmployeeById(id_employee);
                })
                .error(function (response) {
                    console.log("failed");
                    console.log(response);
                });
        }
        vm.sendImage = sendImage;
        var getEmployeeList = function (callback) {
            console.log("GET EMPLOYEES LIST");
            if (sessionStorage.login && sessionStorage.password) {
                var req = {
                    method: 'GET',
                    url: serverUrl + 'ecofitness/api/employees',
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
                        //vm.employeesList = angular.copy(responseSuccces.data.content.employees, vm.employeesList);
                        //vm.employeesList = $.extend(vm.employeesList, responseSuccces.data.content.employees);
                        vm.employeesList = responseSuccces.data.content.employees;
                        //vm.employeesListSafe = $.extend(vm.employeesList, responseSuccces.data.content.employees);
                        console.log(vm.employeesList);
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
        getEmployeeList();

        //vm.employeesList = [
        //    {
        //        id_employee: 0,
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
        //            id_employee: 1,
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
        //        id_employee: 1,
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
        //            id_employee: 0,
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
        vm.onSelectEmployee = function (selectedEmployee, callback) {
            console.log("selectedEmployeeOriginBeforeCopy");
            console.log(selectedEmployeeOrigin);
            //console.log(selectedEmployee);
            if (selectedEmployee === false) {
                vm.selectedEmployee = false;
                selectedEmployeeOrigin = false;
            }
            else {
                selectedEmployee['date_of_birth'] = new Date(selectedEmployee['date_of_birth']);
                vm.selectedEmployee = $.extend(vm.selectedEmployee, selectedEmployee);
                selectedEmployeeOrigin = $.extend(selectedEmployeeOrigin, selectedEmployee);
                console.log("selectedEmployeeOriginAfterCopy");
                console.log(selectedEmployeeOrigin);
                //selectedEmployeeOrigin = selecatedEmployee;
            }
            vm.onChangeLocalView('general');
            vm.readOnly = false;
            //vm.newEmployee = false;
            editedEmployee = false;
            if (callback) {
                callback();
            }
        }
        vm.onButtonTest = function () {
            console.log("BUTTON CLICK");
            console.log(vm.employeesList);
        }
        vm.onShowRegisterByEmployee = function (id_employee) {
            var registerByEmployee = {};
            vm.employeesList.forEach(function (employee) {
                if (id_employee == employee.id_employee) {
                    registerByEmployee = employee;
                }
            });
            vm.onSelectEmployee(registerByEmployee);
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
                        return vm.selectedEmployee.deposit;
                    }
                }
            });

            modalDepositViewInstance.result.then(function (deposit) {
                vm.selectedEmployee.deposit = deposit;
                vm.onFieldChange('deposit');
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        vm.showEmployeeById = function (employee_id) {
            getEmployeeList(function () {
                console.log("FIND EMPLOYEE");
                vm.employeesList.forEach(function (employee) {
                    if (employee_id === employee.id_employee) {
                        vm.onSelectEmployee(employee);
                        //vm.selectedEmployee = employee;
                    }
                });
            });
        }
        vm.onSaveButtonClick = function () {
            if (!vm.newEmployee) {
                var saveEmployeeReq = {
                    method: 'PUT',
                    url: serverUrl + 'ecofitness/api/employees/' + vm.selectedEmployee.id_employee,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    params: {
                        login: sessionStorage.login,
                        password: sessionStorage.password,
                        employee: editedEmployee
                    }
                }
                $http(saveEmployeeReq).then(function (responseSuccces) {
                    console.log(responseSuccces);
                    if (responseSuccces.data.meta.code == 200) {
                        getEmployeeList(function () {
                            console.log("FIND EMPLOYEE");
                            if (editedEmployee['photoChanged']) {
                                sendImage(vm.selectedEmployee.id_employee);
                            }
                            else {
                                vm.showEmployeeById(vm.selectedEmployee.id_employee);
                            }
                            //vm.employeesList.forEach(function (employee) {
                            //    if(employee.id_employee == vm.selectedEmployee.id_employee) {
                            //        vm.onSelectEmployee(employee);
                            //    }
                            //});
                        });
                        //    id_employee
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
                var saveNewEmployeeReq = {
                    method: 'POST',
                    url: serverUrl + 'ecofitness/api/employees',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        login: sessionStorage.login,
                        password: sessionStorage.password,
                        employee: editedEmployee
                    }
                }
                $http(saveNewEmployeeReq).then(function (responseSuccces) {
                    console.log("server response success");
                    console.log(responseSuccces);
                    if (responseSuccces.data.meta.code == 200) {
                        vm.newEmployee = false;
                        getEmployeeList(function () {
                            console.log("FIND EMPLOYEE");
                            if (editedEmployee['photoChanged']) {
                                sendImage(responseSuccces.data.content.id_employee);
                            }
                            else {
                                vm.showEmployeeById(responseSuccces.data.content.id_employee);
                            }
                            //vm.employeesList.forEach(function (employee) {
                            //    if(responseSuccces.data.content.id_employee == employee.id_employee) {
                            //        vm.onSelectEmployee(employee);
                            //        //vm.selectedEmployee = employee;
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
            //selectedEmployeeOrigin = $.extend(selectedEmployeeOrigin, vm.selectedEmployee);
            vm.onEditModeSwitch();
        }
        vm.onCancelButtonClick = function () {
            console.log("TEST1");
            if (vm.newEmployee) {
                vm.onSelectEmployee(false);
            }
            else {
                //vm.selectedEmployee = $.extend(vm.selectedEmployee, selectedEmployeeOrigin);
                vm.onSelectEmployee(selectedEmployeeOrigin);
            }
            vm.readOnly = false;
            //vm.onEditModeSwitch();
            console.log("TEST2");
        }
        vm.onAddEmployee = function () {
            vm.newEmployee = {
                //id_employee: 0,
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
                //    id_employee: 1,
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
            //vm.selectedEmployee = vm.newEmployee;
            vm.onSelectEmployee(vm.newEmployee);
            vm.onEditModeSwitch();
        }
        vm.onDeleteButtonClick = function () {
            var deleteEmployeeReq = {
                method: 'DELETE',
                url: serverUrl + 'ecofitness/api/employees/' + vm.selectedEmployee.id_employee,
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    login: sessionStorage.login,
                    password: sessionStorage.password
                    //employee: vm.selectedEmployee
                }
            }
            $http(deleteEmployeeReq).then(function (responseSuccces) {
                console.log(responseSuccces);
                if (responseSuccces.data.meta.code == 200) {
                    vm.onSelectEmployee(false);
                    console.log("ON DELETE SUCCESS");
                    getEmployeeList();
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
            vm.employeesList.forEach(function (employee) {
                if (vm.selectedEmployee.login == employee.login && vm.selectedEmployee.id_employee != employee.id_employee) {
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
                        return vm.selectedEmployee.photo_file;
                    }
                }
            });

            modalPhotoViewInstance.result.then(function (photo) {
                vm.selectedEmployee.photo_file = photo;

                if (!editedEmployee) {
                    editedEmployee = {};
                }
                editedEmployee['photoChanged'] = "true";
            }, function () {
                console.log('Photo modal dismissed at: ' + new Date());
            });
        };
        vm.onFieldChange = function (changedKey) {
            if (!editedEmployee) {
                editedEmployee = {};
            }
            editedEmployee[changedKey] = vm.selectedEmployee[changedKey];
        }
    }
})();