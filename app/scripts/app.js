'use strict';

angular.module('uiMapBaiduApp', ["ui.map"])
    .config(['uiMapLoadParamsProvider', function (uiMapLoadParamsProvider) {
        uiMapLoadParamsProvider.setParams({
            v: '2.0',
            ak:'xxxx'// your map's develop key
        });
    }])
    .controller('MapCtrl', ['$scope', function ($scope) {
        $scope.myMarkers = [];

        $scope.mapOptions = {
            // map plugin config
            toolbar: true,
            scrollzoom: true,
            maptype: true,
            overview: true,
            locatecity: true,
            // map-self config
            resizeEnable: true,
            // ui map config
            uiMapCache: false
        };

        $scope.$watch('myMap', function(map) {
            map&&map.setCurrentCity("上海");
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
