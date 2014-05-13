'use strict';
(function () {
    var app = angular.module('ui.map', ['ui.event']);
    //Setup map events from a google map object to trigger on a given element too,
    //then we just use ui-event to catch events from an element
    function bindMapEvents(scope, eventsStr, mapObject, element) {
        angular.forEach(eventsStr.split(' '), function (eventName) {
            //Prefix all googlemap events with 'map-', so eg 'click'
            //for the baidu map doesn't interfere with a normal 'click' event
            mapObject.addEventListener(eventName, function (event) {
                element.triggerHandler('map-' + eventName, event);
                //We create an $apply if it isn't happening. we need better support for this
                //We don't want to use timeout because tons of these events fire at once,
                //and we only need one $apply
                if (!scope.$$phase) {
                    scope.$apply();
                }
            });
        });
    }

    app.value('uiMapConfig', {})
        .directive('uiMap', [
        'uiMapConfig',
        '$parse',
        function (uiMapConfig, $parse) {
            var mapEvents = 'click dblclick rightclick rightdblclick maptypechange mousemove mouseover mouseout '
                +'movestart moving moveend zoomstart zoomend addoverlay addcontrol removecontrol removeoverlay '
                +'clearoverlays dragstart dragging dragend addtilelayer removetilelayer load resize hotspotclick '
                +'hotspotover hotspotout tilesloaded touchstart touchmove touchend longpress';
            var options = uiMapConfig || {};
            return {
                restrict: 'A',
                controller: function ($scope, $element) {
                },
                link: function (scope, elm, attrs) {
                    var map;

                    var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
                    if (opts.uiMapCache && window[attrs.uiMapCache]) {
                        elm.replaceWith(window[attrs.uiMapCache]);
                        map = window[attrs.uiMapCache+"Map"];
                    } else {

                        map = new window.BMap.Map(elm[0], opts);

                        // 上海市
                        map.centerAndZoom(new BMap.Point(121.491, 31.233), 11);

                        /*********************** add baidu Map plugins ****************/
                        if(opts.scrollzoom) {
                            map.addControl(new BMap.NavigationControl());
                            map.enableScrollWheelZoom();
                        }
                        if(opts.toolbar) {
                            map.addControl(new BMap.ScaleControl());
                            map.addControl(new BMap.MapTypeControl());
                        }
                        if(opts.overview) {
                            map.addControl(new BMap.OverviewMapControl());
                        }
                        /*********************** end add baidu Map plugins ****************/
                    }
                    var model = $parse(attrs.uiMap);
                    //Set scope variable for the map
                    model.assign(scope, map);
                    bindMapEvents(scope, mapEvents, map, elm);
                }
            };
        }
    ]);
    app.value('uiMapInfoWindowConfig', {})
        .directive('uiMapInfoWindow', [
        'uiMapInfoWindowConfig',
        '$parse',
        '$compile',
        function (uiMapInfoWindowConfig, $parse, $compile) {
            var infoWindowEvents = 'close open maximize restore clickclose';
            var options = uiMapInfoWindowConfig || {};
            return {
                link: function (scope, elm, attrs) {
                    var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
                    var model = $parse(attrs.uiMapInfoWindow);
                    var infoWindow = model(scope);
                    if (!infoWindow) {
                        infoWindow = new window.BMap.InfoWindow(elm[0], opts);
                        model.assign(scope, infoWindow);
                    }
                    bindMapEvents(scope, infoWindowEvents, infoWindow, elm);
                    /* The info window's contents dont' need to be on the dom anymore,
                     google maps has them stored.  So we just replace the infowindow element
                     with an empty div. (we don't just straight remove it from the dom because
                     straight removing things from the dom can mess up angular) */
                    elm.replaceWith('<div></div>');
                    //Decorate infoWindow.open to $compile contents before opening
                    var _redraw = infoWindow.redraw;
                    infoWindow.redraw = function open(a1, a2, a3, a4, a5, a6) {
                        $compile(elm.contents())(scope);
                        _redraw.call(infoWindow, a1, a2, a3, a4, a5, a6);
                    };
                }
            };
        }
    ]);
    /*
     * Map overlay directives all work the same. Take map marker for example
     * <ui-map-marker="myMarker"> will $watch 'myMarker' and each time it changes,
     * it will hook up myMarker's events to the directive dom element.  Then
     * ui-event will be able to catch all of myMarker's events. Super simple.
     */
    function mapOverlayDirective(directiveName, events) {
        app.directive(directiveName, [function () {
            return {
                restrict: 'A',
                link: function (scope, elm, attrs) {
                    scope.$watch(attrs[directiveName], function (newObject) {
                        if (newObject) {
                            bindMapEvents(scope, events, newObject, elm);
                        }
                    });
                }
            };
        }]);
    }

    mapOverlayDirective('uiMapMarker', 'click dblclick mousedown mouseup mouseout mouseover remove infowindowclose '
        +'infowindowopen dragstart dragging dragend rightclick');
    mapOverlayDirective('uiMapPolyline', 'click dblclick mousedown mouseup mouseout mouseover remove lineupdate');
    mapOverlayDirective('uiMapPolygon', 'click dblclick mousedown mouseup mouseout mouseover remove lineupdate');
    mapOverlayDirective('uiMapCircle', 'click dblclick mousedown mouseup mouseout mouseover remove lineupdate');
//    mapOverlayDirective('uiMapGroundOverlay', 'map_changed visible_changed click mousedown mousemove mouseout mouseover mouseup rightclick');
}());