/**
 * Created by borisbondarenko on 21.12.15.
 */
(function () {

    angular.module('pinmap')
        .controller('homeCtrl', ['$scope', 'authService', 'pinService', 'userService', homeCtrl]);

    function homeCtrl($scope, authService, pinService, userService) {

        var thisCtrl = this;

        // user firstName
        thisCtrl.firstName = '';
        // adds GoogleMap
        thisCtrl.map = {};
        // pin info window
        thisCtrl.pinInfo = {};
        // add pin window
        thisCtrl.addPin = {};
        // my pins
        thisCtrl.myPins = [];
        // pin events (like click) handler
        thisCtrl.markerEvents = {};

        // logout method
        thisCtrl.logout = logout;
        // add new pin method
        thisCtrl.addNewPin = addNewPin;

        initModel();
        function initModel() {

            // instance of gmap
            thisCtrl.map = {
                center: {latitude: 0, longitude: 0},
                zoom: 3,
                pan: 1,
                control: {},
                options: {
                    disableDoubleClickZoom: true,
                },
                mapEvents: {
                    dblclick: function (mapModel, eventName, args) {

                        var latLng = args[0].latLng;
                        thisCtrl.addPin.model = {
                            latitude: latLng.lat(),
                            longitude: latLng.lng()
                        };
                        thisCtrl.addPin.pinTitle = 'Azaza title!';
                        thisCtrl.addPin.pinDescription = '';
                        thisCtrl.addPin.show = true;
                        // from documentation: scope apply required because
                        // this event handler is outside of the angular domain
                        $scope.$evalAsync();
                    }
                }
            };

            // instance of pin info window
            thisCtrl.pinInfo = {
                show: false,
                closeClick: function () {
                    this.show = false;
                },
                options: {},
                title: ''
            };

            // instance of add pin window
            thisCtrl.addPin = {
                show: false,
                closeClick: function () {
                    this.show = false
                },
                options: {},
                title: 'Add new pin!',
                pinTitle: '',
                pinDescription: ''
            };

            // instance of pin event handler
            thisCtrl.markerEvents = {
                click: function (marker, eventName, model) {
                    thisCtrl.pinInfo.model = model;
                    thisCtrl.pinInfo.title = model.name;
                    thisCtrl.pinInfo.description = model.description;
                    thisCtrl.pinInfo.userName = model.userName;
                    thisCtrl.pinInfo.created = model.created;
                    thisCtrl.pinInfo.show = true;
                }
            };

            // gets current user for userService
            userService.getCurrentUser()
                .then(function (result) {

                    thisCtrl.firstName = result.fullName;
                });

            // gets pins for current user
            pinService.getMyPins()
                .then(function (response) {

                    response.items.forEach(function (pin) {
                        thisCtrl.myPins.push({
                            id: pin.id,
                            latitude: pin.location.y,
                            longitude: pin.location.x,
                            name: pin.name,
                            description: pin.description,
                            userName: pin.userName,
                            created: dateFormat(new Date(pin.created), "default"),
                            options: {
                                labelContent: pin.name,
                                labelAnchor: '0 0',
                                labelVisible: true,
                                labelClass: 'marker-label'
                            }
                        });
                    });
                });
        }

        function logout() {

            authService.logout();
        }

        function addNewPin() {

            var pin = {
                description: thisCtrl.addPin.pinTitle,
                name: thisCtrl.addPin.pinDescription,
                location: {
                    "x": thisCtrl.addPin.model.longitude,
                    "y": thisCtrl.addPin.model.latitude,
                }
            };

            pinService.addPin(pin);
            thisCtrl.addPin.show = false;
        }
    }

})();