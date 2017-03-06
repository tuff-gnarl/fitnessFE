/**
 * Created by Tuff_gnarl1 on 19.09.15.
 */
(function () {
    'use strict';
    angular
        .module('root.MainViewCtrl', ['ui.router', 'camera'])
        .controller('MainViewCtrl', MainViewCtrl)
    MainViewCtrl.$inject = ['storage', 'sensorInfo', 'WSBridge', 'WSApp'];
    function MainViewCtrl(storage, sensorInfo, WSBridge, WSApp) {
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
    }
})();