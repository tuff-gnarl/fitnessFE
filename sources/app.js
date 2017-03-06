/**
 * Created by Tuff_gnarl1 on 17.09.15.
 */

'use strict';
angular.module('root', ['ui.router', 'smart-table', 'root.MainViewCtrl', 'root.AuthViewCtrl', 'root.ClientsRegViewCtrl', 'root.ClientsViewCtrl', 'root.AdministrationViewCtrl', 'root.AdministrationEmployeeViewCtrl', 'root.AdministrationClientsViewCtrl', 'ngWebsocket', 'uiSwitch', 'ui.bootstrap', 'dndLists', 'ngCookies'])
    .constant('WSBridgeUrl', 'ws://localhost:8001/')
    .constant('WSAppUrl', 'ws://localhost:8002/')
    .constant('serverUrl', 'http://192.168.43.48:5000/')
    .directive('appLoading', function () {
        return {
            restrict: 'E',
            templateUrl: 'template-file.html',
            replace: true,
            link: function (scope, elem) {
                scope.$on('app-start-loading', function () {
                    elem.fadeIn();
                });
                scope.$on('app-finish-loading', function () {
                    elem.fadeOut();
                });
            }
        }
    })
    .value('sessionStorage', {
        login: '',
        password: '',
        role: '',
        isAuthorized: true
    })
    .value("storage", {
        testData: "SUCCESS",
        msgFromSensor: "",
        services: [
            {
                id: 0,
                name: "Абонемент 1",
            },
            {
                id: 1,
                name: "Абонемент 2",
            },
            {
                id: 2,
                name: "Абонемент 3",
            },
            {
                id: 3,
                name: "Др. услуга1",
            },
            {
                id: 4,
                name: "Др. услуга2",
            },
        ]
    })
    .value("sensorInfo", {
        bridgeIsConnected: false,
        sensorIsConnected: false,
        sensorIsInit: false,
        sensorSwitchButton: false,
        sensorRegisterMode: {
            status: false,
            times: "0",
            quality: "0",
            success: false,
            tmpl: "",
        },
        sensorOnCaptureUserId: '0',
        sensorClient: {}
    })
    .service("SessionService", ['sessionStorage', '$state'], function (sessionStorage, $state) {
        this.checkAccess = function () {
            if (!sessionStorage.isAuthorized) {
                $state.go('auth');
            }
        };

    })
    .config(function ($stateProvider, $urlRouterProvider) {
        console.log('config.initialized');
        // For any unmatched url, send to /route1
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'sources/main/main.html',
                controller: 'MainViewCtrl',
                controllerAs: "mainViewCtrl",
                onEnter: function () {
                    console.log("main enter");
                    //SessionService.checkAccess();
                }
            })
            .state('auth', {
                url: '/auth',
                views: {
                    'contentView': {
                        templateUrl: 'sources/auth/auth.html',
                        controller: 'AuthViewCtrl',
                        controllerAs: 'authViewCtrl'
                    }
                    //'menuView':{
                    //    templateUrl: 'sources/administration/administrationMenu.html'
                    //}
                }
            })
            .state('clients', {
                url: '/clients',
                templateUrl: 'sources/clients/clients.html',
                controller: 'ClientsViewCtrl',
                controllerAs: 'clientsViewCtrl'
            })
            .state('clientsReg', {
                url: '/clientsReg',
                views: {
                    'contentView': {
                        templateUrl: 'sources/clients/clientsReg/clientsReg.html',
                        controller: 'ClientsRegViewCtrl',
                        controllerAs: 'clientsRegViewCtrl'
                    }
                }
            })
            //.state('administration', {
            //    url: '/administration',
            //    templateUrl: 'sources/administration/administration.html',
            //    controller: 'AdministrationViewCtrl',
            //    controllerAs: 'administrationViewCtrl'
            //})
            .state('administration', {
                url: '/administration',
                views: {
                    'contentView': {
                        templateUrl: 'sources/administration/administration.html',
                        controller: 'AdministrationViewCtrl',
                        controllerAs: 'administrationViewCtrl'
                    },
                    'menuView': {
                        templateUrl: 'sources/administration/administrationMenu.html'
                    }
                }
            })
            .state('administrationEmployee', {
                url: '/administration_employee',
                views: {
                    'contentView': {
                        templateUrl: 'sources/administration/employee/employee.html',
                        controller: 'AdministrationEmployeeViewCtrl',
                        controllerAs: 'administrationEmployeeViewCtrl'
                    },
                    'menuView': {
                        templateUrl: 'sources/administration/administrationMenu.html'
                    }
                }
            })
            .state('administrationClients', {
                url: '/administration_clients',
                views: {
                    'contentView': {
                        templateUrl: 'sources/administration/clients/clients.html',
                        controller: 'AdministrationClientsViewCtrl',
                        controllerAs: 'administrationClientsViewCtrl'
                    },
                    'menuView': {
                        templateUrl: 'sources/administration/administrationMenu.html'
                    }
                }
            })

    })
    .service('WSBridge', ['$websocket', 'WSBridgeUrl', function ($websocket, WSBridgeUrl) {
        console.log('WSBridge initialized');
        //return $websocket.$new({
        //    url: WSBridgeUrl,
        //    lazy: false,
        //    reconnect: true,
        //    reconnectInterval: 2000,
        //    enqueue: false,
        //    mock: false,
        //    protocols: ['chat']
        //});
        return null;
    }])
    .service('WSApp', ['$websocket', 'WSAppUrl', function ($websocket, WSAppUrl) {
        console.log('wsApp initialized');
        //return $websocket.$new({
        //    url: WSAppUrl,
        //    reconnect: true,
        //    reconnectInterval: 2000,
        //    lazy: false,
        //    enqueue: false,
        //    //mock: {
        //    //    fixtures: {
        //    //        getClients: {
        //    //            data: [
        //    //                {}],
        //    //        }
        //    //    }
        //    //}
        //    protocols: []
        //});
        return null;
    }])
    .run(function (WSBridge, WSApp, sensorInfo, storage, sessionStorage, $rootScope, $state) {
        $state.go('auth');
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams, options) {
                console.log("STATE CHANGE START");
                if (!sessionStorage.isAuthorized) {
                    console.log("GERE");
                    event.preventDefault();
                    //$state.go('auth');
                }
                //console.log(event);
            }
        );
        //TODO WSBridge
        //WSBridge.$on('$open', function () {
        //    console.log("Bridge connected");
        //    sensorInfo.bridgeIsConnected = true;
        //    //ws.$emit('ping', 'hi listening websocket server') // send a message to the websocket server
        //    //    .$emit('pong', data);
        //    $rootScope.$apply();
        //})
        //WSBridge.$on('$close', function () {
        //    console.log("Bridge disconnected");
        //    sensorInfo.bridgeIsConnected = false;
        //    sensorInfo.sensorIsConnected = false;
        //    sensorInfo.sensorIsInit = false;
        //    $rootScope.$apply();
        //})
        //WSBridge.$on('$message', function (msg) {
        //    //console.log(msg);
        //    var msgFromSensor = JSON.parse(msg);
        //    //console.log(msg);
        //    //console.log(JSON.stringify(msgFromSensor));
        //    var k = 10;
        //    if (msgFromSensor.event !== "hey") {
        //        storage.msgFromSensor = msg;
        //        console.log("Message from sensor: " + msg);
        //    }
        //    switch (msgFromSensor.event) {
        //        case "sensorConnected":
        //            console.log("Sensor connected to bridge");
        //            sensorInfo.sensorIsConnected = true;
        //            break;
        //        case "sensorDisconnected":
        //            console.log("Sensor disconnected from bridge");
        //            sensorInfo.sensorIsConnected = false;
        //            sensorInfo.sensorIsInit = false;
        //            break;
        //        case "initSensor":
        //            if (msgFromSensor.status == "true") {
        //                console.log("Sensor init success");
        //                sensorInfo.sensorIsInit = true;
        //                //WSApp.$emit('pullCache');
        //                //console.log("Sent to sensor pullCache")
        //            }
        //            else {
        //                console.log("Sensor init failed");
        //                sensorInfo.sensorIsInit = false;
        //            }
        //            break;
        //        case "unInitSensor":
        //            if (msgFromSensor.status == "true") {
        //                console.log("Sensor uninit success");
        //                sensorInfo.sensorIsInit = false;
        //            }
        //            else {
        //                console.log("Sensor uninit failed");
        //                sensorInfo.sensorIsInit = false;
        //            }
        //            break;
        //        case "pullCache":
        //            if (msgFromSensor.status == "true") {
        //                console.log("Sensor pullCache success");
        //            }
        //            else {
        //                console.log("Sensor pullCache failed, cause: " + msgFromSensor.cause);
        //
        //            }
        //            break;
        //        case "startRegister":
        //            if (msgFromSensor.status == "true") {
        //                console.log("Sensor startRegistration success");
        //                sensorInfo.sensorRegisterMode.status = true;
        //                sensorInfo.sensorRegisterMode.times = "0";
        //                sensorInfo.sensorRegisterMode.quality = "0";
        //                sensorInfo.sensorRegisterMode.success = false;
        //            }
        //            else {
        //                sensorInfo.sensorRegisterMode.status = false;
        //                console.log("Sensor startRegistration failed, cause: " + msgFromSensor.cause);
        //            }
        //            break;
        //        case "registration":
        //            console.log("Registration: times-" + msgFromSensor.times + " quality-" + msgFromSensor.quality);
        //            sensorInfo.sensorRegisterMode.times = msgFromSensor.times;
        //            sensorInfo.sensorRegisterMode.quality = msgFromSensor.quality;
        //            break;
        //        case "registrationFinished":
        //            if (msgFromSensor.status == "true") {
        //                console.log("Sensor registerstration success, got tmpl: " + msgFromSensor.tmpl);
        //                sensorInfo.sensorRegisterMode.times = "0";
        //                sensorInfo.sensorRegisterMode.quality = "0";
        //                sensorInfo.sensorRegisterMode.success = true;
        //                sensorInfo.sensorRegisterMode.tmpl = msgFromSensor.tmpl;
        //                //WSApp.$emit("clientFromSensor",sensorInfo.sensorOnCaptureUserId.id);
        //                //TODO SEND TO SERVER TMPL
        //            }
        //            else {
        //                console.log("Sensor registrationFinished failed, cause: " + msgFromSensor.cause);
        //                sensorInfo.sensorRegisterMode.times = "0";
        //                sensorInfo.sensorRegisterMode.quality = "0";
        //                sensorInfo.sensorRegisterMode.success = false;
        //                sensorInfo.sensorRegisterMode.tmpl = "";
        //            }
        //            sensorInfo.sensorRegisterMode.status = false;
        //            break;
        //        case "onCapture":
        //            if (msgFromSensor.status == "true") {
        //                console.log("Sensor onCapture success, got id: "+ msgFromSensor.id);
        //                sensorInfo.sensorOnCaptureUserId = msgFromSensor.id;
        //                WSApp.$emit("id",sensorInfo.sensorOnCaptureUserId);
        //            }
        //            else {
        //                console.log("Sensor onCapture failed");
        //                sensorInfo.sensorOnCaptureUserId = "";
        //            }
        //            break;
        //    }
        //    $rootScope.$apply();
        //    //console.log("after message from sensor: " + sensorInfo.bridgeIsConnected + " " + sensorInfo.sensorIsConnected + " " + sensorInfo.sensorIsInit);
        //
        //})
        //
        ////TODO WSApp
        //WSApp.$on('$open', function () {
        //    console.log("WSApp socket connected");
        //    //WSApp.$emit('hi');
        //});
        //WSApp.$on('getClients', function (msg) {
        //    console.log(msg);
        //});
        //WSApp.$on('$close', function () {
        //    console.log("WSApp closed");
        //})
        //WSApp.$on('clientFromSensor', function (msg) {
        //    console.log("Got client from sensor: " + JSON.stringify(msg));
        //    sensorInfo.sensorClient = angular.copy(msg, sensorInfo.sensorClient);
        //    $rootScope.apply();
        //})
        //WSApp.$on('pullCache', function (msg) {
        //    WSBridge.$emit("pullCache");
        //})
        //WSApp.$on('$message', function (msg) {
        //    console.log("WSAPP ON MESSAGE: " + msg);
        //})
    })
    .constant('tempClientPhoto', 'images/photo.jpg');
