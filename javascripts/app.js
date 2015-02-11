'use strict';

angular.module('uiMapBaiduApp', ['ui.map', 'waypoint', 'ui.router'])
    .config(['uiMapLoadParamsProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider',
        function (uiMapLoadParamsProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

            //$locationProvider.html5Mode(true);

            uiMapLoadParamsProvider.setParams({
                v: '2.0',
                ak: 'kp3ODQt4pkpHMW2Yskl2Lwee'// your map's develop key
            });

            $urlRouterProvider.otherwise("/cache");

            $stateProvider
                .state('cache', {
                    url: "/cache",
                    templateUrl: "partials/cache.html",
                    controller: "MapCacheCtrl"
                })
                .state('nocache', {
                    url: "/nocache",
                    templateUrl: "partials/nocache.html",
                    controller: "MapNoCacheCtrl"
                })
        }])
    .controller('MapCtrl', ['$scope', function ($scope) {
        //$scope.mapOptions = {
        //    ngCenter: {
        //        lat: 33,
        //        lng: 111
        //    },
        //    ngZoom: 5
        //};
    }])
    .controller('MapCacheCtrl', ['$scope', function ($scope) {
        $scope.myMarkers = [];

        $scope.mapOptions = {
            ngCenter: {
                lat: 33,
                lng: 111
            },
            ngZoom: 5,
            // map plugin config
            toolbar: true,
            scrollzoom: true,
            maptype: true,
            overview: true,
            locatecity: true,
            // map-self config
            resizeEnable: true
        };

        $scope.$watch('myMap', function (map) {
            if (map) {
                map.setCurrentCity("上海");
                map.enableDragging();
            }
        });

        $scope.addMarker = function ($event, $params) {
            var marker = new BMap.Marker(
                $params[0].point
            );

            $scope.myMarkers.push(marker);
            $scope.myMap.addOverlay(marker)
        };

        $scope.setZoomMessage = function (zoom) {
            $scope.zoomMessage = 'You just zoomed to ' + zoom + '!';
            console.log(zoom, 'zoomed');
        };

        $scope.openMarkerInfo = function (e, marker) {
            e.preventDefault();
            e.stopPropagation();
            $scope.currentMarker = marker;
            $scope.currentMarkerLat = marker.getPosition().lat;
            $scope.currentMarkerLng = marker.getPosition().lng;

            $scope.myMap.addOverlay($scope.myInfoWindow);
            $scope.myMap.openInfoWindow($scope.myInfoWindow, marker.getPosition());
        };

        $scope.setMarkerPosition = function (marker, lat, lng) {
            marker.setPosition(new BMap.Point(lng, lat));
        };
    }])
    .controller('MapNoCacheCtrl', ['$scope', function ($scope) {
        $scope.myMarkers = [];

        $scope.mapOptions = {
            ngCenter: {
                lat: 33,
                lng: 111
            },
            ngZoom: 5,
            // map plugin config
            toolbar: true,
            scrollzoom: true,
            maptype: true,
            overview: true,
            locatecity: true,
            // map-self config
            resizeEnable: true
        };

        $scope.$watch('myMap', function (map) {
            map && map.setCurrentCity("上海");
        });

        $scope.addMarker = function ($event, $params) {
            var marker = new BMap.Marker(
                $params[0].point
            );

            $scope.myMarkers.push(marker);
            $scope.myMap.addOverlay(marker)
        };

        $scope.setZoomMessage = function (zoom) {
            $scope.zoomMessage = 'You just zoomed to ' + zoom + '!';
            console.log(zoom, 'zoomed');
        };

        $scope.openMarkerInfo = function (e, marker) {
            e.preventDefault();
            e.stopPropagation();
            $scope.currentMarker = marker;
            $scope.currentMarkerLat = marker.getPosition().lat;
            $scope.currentMarkerLng = marker.getPosition().lng;

            $scope.myMap.addOverlay($scope.myInfoWindow);
            $scope.myMap.openInfoWindow($scope.myInfoWindow, marker.getPosition());
        };

        $scope.setMarkerPosition = function (marker, lat, lng) {
            marker.setPosition(new BMap.Point(lng, lat));
        };
    }]);
