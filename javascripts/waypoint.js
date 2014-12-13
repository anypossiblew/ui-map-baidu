/**
 * Created by any on 2014/6/20.
 */
'use strict';

angular.module('waypoint', [])
    .factory('safeApply', ['$rootScope', function($rootScope) {
        return function($scope, fn) {
            var phase = $scope.$root && $scope.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if (fn) {
                    $scope.$eval(fn);
                }
            } else {
                if (fn) {
                    $scope.$apply(fn);
                } else {
                    $scope.$apply();
                }
            }
        }
    }])
    .directive('waypoint', ['$log', '$timeout', '$parse', 'safeApply',
        function ($log, $timeout, $parse, safeApply) {

        var defaults = {
            stuckClass: 'stuck',
            direction: 'down right'
        };

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                var options;
                var opt = scope.$eval(attrs.waypoint || "{}");
                options = angular.extend({}, $.fn.waypoint.defaults, defaults, opt);

                var onWaypoint = $parse(attrs.onWaypoint);

                $timeout( function() {

                    $( element ).waypoint(function(direction) {
                        if(onWaypoint) {
                            safeApply(scope, function() {
                                onWaypoint(scope, {$direction: direction, $element: element});
                            });
                        }
                        scope.$emit('waypointEvent', direction, opt.target);
                    }, options);
                }, 500);

                attrs.$observe('waypointRefresh', function ( data ) {
                    $.waypoints('refresh');
                });
                attrs.$observe('waypointEnable', function ( data ) {
                    if(data && data == "true") {
                        $( element ).waypoint('enable');
                    }else {
                        $( element ).waypoint('disable');
                    }
                });
            }
        }
    }])
    .directive('waypointSticky', ['$log', '$timeout', function ($log, $timeout) {

        var defaults = {
                wrapper: '<div class="sticky-wrapper" />',
                stuckClass: 'stuck',
                direction: 'down right'
                },
            wrap = function($elements, options) {
                var $parent;

                $elements.wrap(options.wrapper);
                $parent = $elements.parent();
                return $parent.data('isWaypointStickyWrapper', true);
            };

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                $log.debug("waypoint sticky...");

                var $wrap, options, originalHandler, opt, $sticky;

                opt = scope.$eval(attrs.waypointSticky || "{}");

                options = $.extend({}, $.fn.waypoint.defaults, defaults, opt);
                $wrap = wrap(element, options);

                originalHandler = options.handler;
                $sticky = $(element);
                options.handler = function(direction) {
                    var shouldBeStuck;

                    shouldBeStuck = options.direction.indexOf(direction) !== -1;
                    $wrap.height(shouldBeStuck ? $sticky.outerHeight() : '');

                    $sticky.toggleClass(options.stuckClass, shouldBeStuck);

                    if (originalHandler != null) {
                        return originalHandler.call(element, direction);
                    }
                };

                $timeout(function() {
                    $wrap.waypoint(options);
                    $sticky.data('stuckClass', options.stuckClass);
                }, 1000);

                scope.$on('waypoint-refresh', function ( data ) {
                    $.waypoints('refresh');
                });

                attrs.$observe('waypointEnable', function ( data ) {
                    if(data && data == "true") {
                        $sticky.waypoint('enable');
                    }else {
                        $sticky.waypoint('disable');
                    }
                });

            }
        }
    }])

    .directive('waypointInfinite', ['$log', '$timeout', function ($log, $timeout) {

        var defaults;

        defaults = {
            container: 'auto',
            offset: 'bottom-in-view',
            loadingClass: 'infinite-loading',
            onBeforePageLoad: $.noop
        };

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                $log.debug("waypoint infinite...");

                var $container, opts, options;

                options = scope.$eval(attrs.waypointInfinite || "{}");

                opts = $.extend({}, $.fn.waypoint.defaults, defaults, options);

                $container = opts.container === 'auto' ? element : angular.element(opts.container);
                opts.handler = function(direction) {

                    if (direction === 'down' || direction === 'right') {

                        scope[opts.onBeforePageLoad]().then(function() {
                            $container.removeClass(opts.loadingClass);
                            $.waypoints('refresh');
                        });
                        $container.addClass(opts.loadingClass);
                    }else {
                        $.waypoints('refresh');
                        $.waypoints('viewportHeight');
                    }
                };
                $(element).waypoint(opts);

                attrs.$observe('waypointDisable', function ( data ) {
                    if(data && data == "true") {
                        $(element).waypoint('destroy');
                    }
                });
            }
        }
    }])
;