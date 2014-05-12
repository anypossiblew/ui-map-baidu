# qq map for angular ui [![Build Status](https://secure.travis-ci.org/yeoman/generator-jquery.svg?branch=master)](https://travis-ci.org/yeoman/generator-jquery)

本项目使用Yeoman generator生成的，过程如下：
## 创建项目过程
- Prepare: `npm install -g yo grunt-cli bower`
- Install: `npm install -g generator-angular`
- Run: `yo angular`
- Perform a build: `grunt`
- Run local server: `grunt serve`

## Usage
You can get it from [Bower](http://bower.io/)

```sh
bower install angular-ui-map-qq
```

This will copy the UI.Map.qq files into a `bower_components` folder, along with its dependencies. Load the script files in your application:

```html
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<script type="text/javascript" src="bower_components/angular-ui-utils/modules/event/event.js "></script>
<script type="text/javascript" src="bower_components/angular-ui-map-qq/ui-map.js"></script>
<script charset="utf-8" src="http://map.qq.com/api/js?v=2.exp&key=YOUR_KEY"></script>
```

__Make sure to listen to the [callback parameter when loading the qq Maps API](http://open.map.qq.com/javascript_v2/case-run.html#sample-map-async) !
The API must be fully loaded before this module !__
Here we name this callback `init`. To load your angular app after the Gaode Maps API you can start it with [angular.bootstrap](http://docs.angularjs.org/api/angular.bootstrap).

```javascript
function init() {
  angular.bootstrap(document.getElementById("map"), ['app.ui-map']);
}
```

Add the UI.Map.qq module as a dependency to your application module :

```javascript
var myAppModule = angular.module('app.ui-map', ['ui.map']);
```

Finally, add the directive to your html:

```html
<section id="map" ng-controller="MapCtrl" >
  <div ui-map="myMap" ui-options="mapOptions" class="map-canvas"></div>
</section>
```
Note that `myMap` will be a [qq.maps.Map class](http://open.map.qq.com/javascript_v2/doc/map.html), and `mapOptions` a [qq.maps.MapOptions object](http://open.map.qq.com/javascript_v2/doc/mapoptions.html) (see [below](#options)).

To see something it's better to add some CSS, like

```css
.map-canvas { height: 400px; }
```

## Options

[qq.maps.MapOptions object](http://open.map.qq.com/javascript_v2/doc/mapoptions.html) can be passed through the main directive attribute`ui-map`.

```javascript
myAppModule.controller('MapCtrl', ['$scope', function ($scope) {
    $scope.mapOptions = {
      center: new qq.maps.LatLng(lat, lng),
      // ui map config
      uiMapCache: true // 是否使用缓存来缓存此map dom，而不是每次链接跳转来都重新创建
    };
  }]);
```

### UI.Event

[UI.Event](http://angular-ui.github.io/ui-utils/#/event) allows you to specify custom behavior over user events. You just need to prefix the official event by __map-__ to bind a callback to it.

For example, the _click_ or *idle* event of the [qq.maps.Map class](http://open.map.qq.com/javascript_v2/doc/map.html) can be used through the UI.Event object keys __map-click__ and **map-idle** :

```html
<section id="map" ng-controller="MapCtrl" >
  <div  ui-map="myMap"ui-options="mapOptions" class="map-canvas"
        ui-event="{'map-click': 'addMarker($event, $params)', 'map-idle': 'setZoomMessage(myMap.getZoom())' }"
  ></div>
</section>
```


## Testing

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use grunt:

```sh
npm install -g grunt-cli
npm install && bower install
grunt
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `test\karma.conf.js`


### Grunt Serve

We have one task to serve them all !

```sh
grunt serve
```

It's equal to run separately:

* `grunt connect:server` : giving you a development server at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

* `grunt karma:server` : giving you a Karma server to run tests (at [http://localhost:9876/](http://localhost:9876/) by default). You can force a test on this server with `grunt karma:unit:run`.

* `grunt watch` : will automatically test your code and build your demo.  You can demo generation with `grunt build:gh-pages`.