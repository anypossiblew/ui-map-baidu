'use strict';

angular.module('uiMapBaiduApp', ["ui.map"])
  .config(function () {
  })
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
            map.setCurrentCity("上海");
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

        $scope.openMarkerInfo = function (e) {
            e.preventDefault();
            $scope.currentMarker = e;
            $scope.currentMarkerLat = e.point.lat;
            $scope.currentMarkerLng = e.point.lng;

            $scope.myMap.addOverlay($scope.myInfoWindow);
            $scope.myMap.openInfoWindow($scope.myInfoWindow, e.point);
        };

        $scope.setMarkerPosition = function (marker, lat, lng) {
            marker.setPosition(new BMap.Point(lng, lat));
        };
    }]);
