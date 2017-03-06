/**
 * Created by Tuff_gnarl1 on 19.09.15.
 */
(function () {
    'use strict';
    angular
        .module('root.ClientsViewCtrl', ['ui.router'])
        .controller('ClientsViewCtrl', ClientsViewCtrl)
    ClientsViewCtrl.$inject = ['storage', 'sensorInfo', 'WSBridge', '$scope', '$watch'];
    function ClientsViewCtrl(storage, sensorInfo, WSBridge, $scope, $watch) {
        var vm = this;
        vm.storage = storage;
        vm.sensorInfo = sensorInfo;
        vm.msgToSensor = "";
        vm.sensorisSwitch = false;
        vm.sendToSensorBtnClick = function (msg) {
            console.log((!sensorInfo.bridgeIsConnected || !sensorInfo.sensorIsConnected));
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
    }
})();