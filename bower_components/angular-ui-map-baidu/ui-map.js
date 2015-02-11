/**!
 * The MIT License
 *
 * Copyright (c) 2013 the angular-ui-map-baidu Team, http://anypossiblew.github.io/ui-map-baidu
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * angular-ui-map-baidu
 * https://github.com/anypossiblew/ui-map-baidu
 *
 * @authors https://github.com/anypossiblew/ui-map-baidu/graphs/contributors
 */
'use strict';
(function () {
  var app = angular.module('ui.map', ['ui.event']);

  /**
   * Setup map events from a map object to trigger on a given element too,
   * then we just use ui-event to catch events from an element
   *
   * @param scope
   * @param eventsStr
   * @param mapObject
   * @param element
   * @param eventListeners
   */
  function bindMapEvents(scope, eventsStr, mapObject, element, eventListeners) {
    angular.forEach(eventsStr.split(' '), function (eventName) {
      eventListeners[eventName] = function (event) {
        element.triggerHandler('map-' + eventName, event);
        //We create an $apply if it isn't happening. we need better support for this
        //We don't want to use timeout because tons of these events fire at once,
        //and we only need one $apply
        if (!scope.$$phase) {
          scope.$apply();
        }
      }
      //Prefix all map events with 'map-', so eg 'click'
      //for the map doesn't interfere with a normal 'click' event
      mapObject.addEventListener(eventName, eventListeners[eventName]);
    });
  }

  /**
   * remove map object added event listeners
   *
   * @param scope
   * @param eventListeners
   * @param mapObject
   */
  function removeMapEvents(scope, eventListeners, mapObject) {
    angular.forEach(eventListeners, function (listener, eventName) {
      mapObject.removeEventListener(eventName, listener);
    });
  }

  app.value('uiMapConfig', {
    initDelay: 200
  })
    .directive('uiMap', ['uiMapConfig', '$window', '$parse', '$timeout',
      function (uiMapConfig, $window, $parse, $timeout) {
        var mapEvents = 'click dblclick rightclick rightdblclick maptypechange mousemove mouseover mouseout '
          + 'movestart moving moveend zoomstart zoomend addoverlay addcontrol removecontrol removeoverlay '
          + 'clearoverlays dragstart dragging dragend addtilelayer removetilelayer load resize hotspotclick '
          + 'hotspotover hotspotout tilesloaded touchstart touchmove touchend longpress';
        var options = uiMapConfig || {};
        return {
          restrict: 'EA',
          transclude: true,
          template: '<div class="map-canvas"></div><div ng-transclude></div>',
          link: function (scope, elm, attrs) {

            var map,
                // map's event listeners
                mapEventListeners = {};

            // options
            var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
            // map cache
            var uiMapCacheElm = attrs.uiMapCache,
                uiMapCache    = uiMapCacheElm + "Map";

            var mapElem = elm.find(".map-canvas");
            mapElem.css("width", "100%");
            mapElem.css("height", "100%");

            scope.$on("map.loaded", function (e, type) {
              if (type == "baidu" && !map) {
                initMap();
              }
            });

            if ($window.BMap && $window.BMap.Map) {
              $timeout(function () {
                initMap();
              }, opts.initDelay);
            }

            function initMap() {
              if (uiMapCacheElm && $window[uiMapCacheElm]) {
                // get ui-map cache object
                mapElem.replaceWith($window[uiMapCacheElm]);
                map = $window[uiMapCache];
              } else {
                map = new BMap.Map(mapElem[0], opts);
                // init map's center
                if (opts.ngCenter &&
                  angular.isNumber(opts.ngCenter.lat) &&
                  angular.isNumber(opts.ngCenter.lng) &&
                  angular.isNumber(opts.ngZoom)) {
                  map.centerAndZoom(new BMap.Point(opts.ngCenter.lng, opts.ngCenter.lat), opts.ngZoom);
                } else if (opts.ngCenter &&
                  angular.isNumber(opts.ngCenter.lat) &&
                  angular.isNumber(opts.ngCenter.lng)) {
                  map.setCenter(new BMap.Point(opts.ngCenter.lng, opts.ngCenter.lat));
                } else if (angular.isNumber(opts.ngZoom)) {
                  map.setZoom(opts.ngZoom);
                }

                /*********************** add baidu Map plugins ****************/
                if (opts.scrollzoom) {
                  map.addControl(new BMap.NavigationControl());
                  map.enableScrollWheelZoom();
                }
                if (opts.toolbar) {
                  map.addControl(new BMap.ScaleControl());
                  map.addControl(new BMap.MapTypeControl());
                }
                if (opts.overview) {
                  map.addControl(new BMap.OverviewMapControl());
                }
                /*********************** end add baidu Map plugins ****************/
              }
              var model = $parse(attrs.uiMap);
              //Set scope variable for the map
              model.assign(scope, map);
              bindMapEvents(scope, mapEvents, map, elm, mapEventListeners);

              // set ui-map cache object
              if (uiMapCacheElm) {
                // remove map event listeners and cache map element on controller destroy.
                scope.$on("$destroy", function () {
                  removeMapEvents(scope, mapEventListeners, map);
                  if (!$window[uiMapCacheElm]) {
                    $window[uiMapCache] = map;
                    $window[uiMapCacheElm] = mapElem[0];
                  }
                });
              }
            }
          }
        };
      }
    ]);
  app.value('uiMapInfoWindowConfig', {})
    .directive('uiMapInfoWindow', ['uiMapInfoWindowConfig', '$window', '$parse', '$compile',
      function (uiMapInfoWindowConfig, $window, $parse, $compile) {
        var infoWindowEvents = 'close open maximize restore clickclose';
        var options = uiMapInfoWindowConfig || {};
        return {
          link: function (scope, elm, attrs) {
            var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
            var eventListeners = {};
            var model = $parse(attrs.uiMapInfoWindow);
            var infoWindow = model(scope);

            scope.$on("map.loaded", function (e, type) {
              if (type == "baidu" && !infoWindow) {
                initInfoWindow();
              }
            });

            if ($window.BMap && $window.BMap.Map) {
              initInfoWindow();
            }

            function initInfoWindow() {
              if (!infoWindow) {
                infoWindow = new $window.BMap.InfoWindow(elm[0], opts);
                model.assign(scope, infoWindow);
              }
              bindMapEvents(scope, infoWindowEvents, infoWindow, elm, eventListeners);
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
            var eventListeners = {};
            if (newObject) {
              bindMapEvents(scope, events, newObject, elm, eventListeners);
            }
          });
        }
      };
    }]);
  }

  mapOverlayDirective('uiMapMarker', 'click dblclick mousedown mouseup mouseout mouseover remove infowindowclose '
  + 'infowindowopen dragstart dragging dragend rightclick');
  mapOverlayDirective('uiMapPolyline', 'click dblclick mousedown mouseup mouseout mouseover remove lineupdate');
  mapOverlayDirective('uiMapPolygon', 'click dblclick mousedown mouseup mouseout mouseover remove lineupdate');
  mapOverlayDirective('uiMapCircle', 'click dblclick mousedown mouseup mouseout mouseover remove lineupdate');
//    mapOverlayDirective('uiMapGroundOverlay', 'map_changed visible_changed click mousedown mousemove mouseout mouseover mouseup rightclick');

  app.provider('uiMapLoadParams', function uiMapLoadParams() {
    var params = {};

    this.setParams = function (ps) {
      params = ps;
    };

    this.$get = function uiMapLoadParamsFactory() {

      return params;
    };
  })
    .directive('uiMapAsyncLoad', ['$window', '$parse', 'uiMapLoadParams',
      function ($window, $parse, uiMapLoadParams) {
        return {
          restrict: 'A',
          link: function (scope, element, attrs) {

            $window.mapbaiduLoadedCallback = function mapbaiduLoadedCallback() {
              scope.$broadcast("map.loaded", "baidu");
            };

            var params = angular.extend({}, uiMapLoadParams, scope.$eval(attrs.uiMapAsyncLoad));

            params.callback = "mapbaiduLoadedCallback";

            if (!($window.BMap && $window.BMap.Map)) {
              var script = document.createElement("script");
              script.type = "text/javascript";
              script.src = "http://api.map.baidu.com/api?" + param(params);
              document.body.appendChild(script);
            } else {
              mapbaiduLoadedCallback();
            }
          }
        }
      }]);

  /**
   * 序列化js对象
   *
   * @param a
   * @param traditional
   * @returns {string}
   */
  function param(a, traditional) {
    var prefix,
      s = [],
      add = function (key, value) {
        // If value is a function, invoke it and return its value
        value = angular.isFunction(value) ? value() : ( value == null ? "" : value );
        s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
      };

    // If an array was passed in, assume that it is an array of form elements.
    if (angular.isArray(a) || ( a.jquery && !angular.isObject(a) )) {
      // Serialize the form elements
      angular.forEach(a, function () {
        add(this.name, this.value);
      });

    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for (prefix in a) {
        buildParams(prefix, a[prefix], traditional, add);
      }
    }

    // Return the resulting serialization
    return s.join("&").replace(r20, "+");
  }

  var r20 = /%20/g;

  function buildParams(prefix, obj, traditional, add) {
    var name;

    if (angular.isArray(obj)) {
      // Serialize array item.
      angular.forEach(obj, function (v, i) {
        if (traditional || rbracket.test(prefix)) {
          // Treat each array item as a scalar.
          add(prefix, v);

        } else {
          // Item is non-scalar (array or object), encode its numeric index.
          buildParams(prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add);
        }
      });

    } else if (!traditional && angular.isObject(obj)) {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
      }

    } else {
      // Serialize scalar item.
      add(prefix, obj);
    }
  }

  var decode = decodeURIComponent;
}());
