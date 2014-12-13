# Angular ui for baidu map  
[![GitHub version](https://badge.fury.io/gh/anypossiblew%2Fui-map-baidu.svg)](http://badge.fury.io/gh/anypossiblew%2Fui-map-baidu)
[![Bower version](https://badge.fury.io/bo/angular-ui-map-baidu.png)](http://badge.fury.io/bo/angular-ui-map-baidu)  

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
bower install angular-ui-map-baidu
```

This will copy the UI.Map.baidu files into a `bower_components` folder, along with its dependencies. Load the script files in your application:

```html
<script type="text/javascript" src="bower_components/angular/angular.js"></script>
<script type="text/javascript" src="bower_components/angular-ui-utils/modules/event/event.js "></script>
<script type="text/javascript" src="bower_components/angular-ui-map-baidu/ui-map.js"></script>
<script type="text/javascript" src="http://api.map.baidu.com/api?v=1.5&ak=您的密钥"></script>
```

### 异步加载Map
#### 方法一
__Make sure to listen to the [callback parameter when loading the baidu Maps API](http://developer.baidu.com/map/jsdevelop-1.htm#.E5.BC.82.E6.AD.A5.E5.8A.A0.E8.BD.BD) !
The API must be fully loaded before this module !__
Here we name this callback `init`. To load your angular app after the baidu Maps API you can start it with [angular.bootstrap](http://docs.angularjs.org/api/angular.bootstrap).

```javascript
function init() {
  angular.bootstrap(document.getElementById("map"), ['app.ui-map']);
}
```
#### 方法二
如下在module config中加入加载地图链接所需要的参数
```javascript
myAppModule.config(['uiMapLoadParamsProvider', function (uiMapLoadParamsProvider) {
                      uiMapLoadParamsProvider.setParams({
                          v: '2.0',
                          ak:'xxxx'
                      });
                }]);
```
并在html顶层dom加上 ui-map-async-load
```html
<body ng-controller="MapCtrl" ui-map-async-load>
  <div ui-map="myMap" ui-options="mapOptions" class="map-canvas"></div>
</body>
```


Add the UI.Map.baidu module as a dependency to your application module :

```javascript
var myAppModule = angular.module('app.ui-map', ['ui.map']);
```

Finally, add the directive to your html:

```html
<section id="map" ng-controller="MapCtrl" >
  <div ui-map="myMap" ui-options="mapOptions" class="map-canvas"></div>
</section>
```
Note that `myMap` will be a [BMap.Map class](http://developer.baidu.com/map/reference/index.php?title=Class:%E6%A0%B8%E5%BF%83%E7%B1%BB/Map), and `mapOptions` a [BMap.MapOptions object](http://developer.baidu.com/map/reference/index.php?title=Class:%E6%A0%B8%E5%BF%83%E7%B1%BB/MapOptions) (see [below](#options)).

To see something it's better to add some CSS, like

```css
.map-canvas { height: 400px; }
```

## Options

[BMap.MapOptions object](http://developer.baidu.com/map/reference/index.php?title=Class:%E6%A0%B8%E5%BF%83%E7%B1%BB/MapOptions) can be passed through the main directive attribute`ui-map`.

```javascript
myAppModule.controller('MapCtrl', ['$scope', function ($scope) {
    $scope.mapOptions = {
      enableMapClick: false,
      // ui map config
      uiMapCache: true // 是否使用缓存来缓存此map dom，而不是每次链接跳转来都重新创建
    };
  }]);
```

### UI.Event

[UI.Event](http://angular-ui.github.io/ui-utils/#/event) allows you to specify custom behavior over user events. You just need to prefix the official event by __map-__ to bind a callback to it.

For example, the _click_ or *moveend* event of the [BMap.Map class](http://developer.baidu.com/map/reference/index.php?title=Class:%E6%A0%B8%E5%BF%83%E7%B1%BB/Map) can be used through the UI.Event object keys __map-click__ and **map-moveend** :

```html
<section id="map" ng-controller="MapCtrl" >
  <div  ui-map="myMap"ui-options="mapOptions" class="map-canvas"
        ui-event="{'map-click': 'addMarker($event, $params)', 'map-moveend': 'setZoomMessage(myMap.getZoom())' }"
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
