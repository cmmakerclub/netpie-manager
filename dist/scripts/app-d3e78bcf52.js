!function(){"use strict";angular.module("netpieManager",["ngAnimate","ngCookies","ngTouch","ngSanitize","ngResource","ui.router","ngMaterial","ngStorage"])}(),function(){"use strict";function e(){function e(e){var t=this;t.relativeDate=e(t.creationDate).fromNow()}var t={restrict:"E",templateUrl:"app/components/navbar/navbar.html",scope:{creationDate:"="},controller:e,controllerAs:"vm",bindToController:!0};return e.$inject=["moment"],t}angular.module("netpieManager").directive("acmeNavbar",e)}(),function(){"use strict";function e(e,t,n,a,o,i){function r(){e(function(){c.classAnimation="rubberBand"},4e3)}var c=this;c.classAnimation="",r(),c.clear=function(){a.debug("CLEAR")},c.generate=function(){};var l="netpie_manager",d=o.$default({netpie_manager:{netpie:{}},netpieApp:[]}),m=d[l];i.config=m.netpie,i.latest_device=m.latest_device,i.device_count=m.devices&&m.devices.length||0,c.generate=function(){var e="https://netpie-api.herokuapp.com/api/";e+=i.config.netpie.appKey+"/",e+=i.config.netpie.appSecret+"/",e+=i.config.netpie.appId,e+="?callback=JSON_CALLBACK",i.loading=!0,n.jsonp(e).success(function(e){var t=i.config.netpie.appId;delete e.protocolVersion,delete e.keepalive,e.appId=i.config.netpie.appId,e.appKey=i.config.netpie.appKey,e.appSecret=i.config.netpie.appSecret,e.prefix="/"+t+"/gearname",m.latest_device=e;var n=m.devices||[];n.push(e),a.debug(n),m.devices=n,i.device_count=n.length,i.latest_device=m.latest_device,i.loading=!1,i.failed=!1}).error(function(){a.debug("FAILED"),m.latest_device={},i.loading=!1,i.failed=!0,i.appError="Failed: "+arguments[1]+" "+arguments[0]})}}angular.module("netpieManager").controller("MainController",e),e.$inject=["$timeout","toastr","$http","$log","$localStorage","$scope"]}(),function(){"use strict";function e(e){e.debug("runBlock end")}angular.module("netpieManager").run(e),e.$inject=["$log"]}(),function(){"use strict";function e(e,t){e.state("home",{url:"/",templateUrl:"app/main/main.html",controller:"MainController",controllerAs:"main"}),t.otherwise("/")}angular.module("netpieManager").config(e),e.$inject=["$stateProvider","$urlRouterProvider"]}(),function(){"use strict";angular.module("netpieManager").constant("toastr",toastr).constant("moment",moment)}(),function(){"use strict";function e(e,t){e.debugEnabled(!0),t.options.timeOut=3e3,t.options.positionClass="toast-top-right",t.options.preventDuplicates=!0,t.options.progressBar=!0}angular.module("netpieManager").config(e),e.$inject=["$logProvider","toastr"]}(),angular.module("netpieManager").run(["$templateCache",function(e){e.put("app/main/main.html",'<div layout="column"><md-content layout-padding=""><header><acme-navbar creationdate="main.creationDate"></acme-navbar></header></md-content><md-content md-theme="docs-dark" layout="row"><md-content flex="" md-dynamic-height=""><md-card><md-toolbar layout-align="center center">Detail ({{device_count}})</md-toolbar><md-progress-circular md-mode="indeterminate" ng-show="loading"></md-progress-circular><md-card-content layout="column" md-dynamic-height="" ng-hide="loading" ng-show="!failed"><md-list class="a"><md-subheader class="md-no-sticky">DATA</md-subheader><md-list-item class="md-2-line" ng-repeat="(key, value) in latest_device"><div class="md-list-item-text" layout="column"><h3>{{ key }}</h3><p>{{ value }}</p></div></md-list-item></md-list></md-card-content><h1>{{ appError }}</h1></md-card></md-content><md-content flex="35" layout-fill=""><md-card><md-toolbar layout-align="center center">NETPIE</md-toolbar><md-card-content><md-input-container><label>appKey</label> <input ng-model="config.netpie.appKey"></md-input-container><md-input-container><label>appSecret</label> <input ng-model="config.netpie.appSecret"></md-input-container><md-input-container><label>appId</label> <input ng-model="config.netpie.appId"></md-input-container><md-input-container><md-button class="md-raised md-hue-5" ng-click="main.generate()">Generate</md-button></md-input-container><md-input-container><md-button class="md-raised md-warn" ng-click="main.clear()">Clear</md-button></md-input-container></md-card-content></md-card></md-content></md-content></div>'),e.put("app/components/navbar/navbar.html",'<md-toolbar layout="row" layout-align="center center"><md-button href="https://cmmakerclub.com">CMMAKERCLUB.COM</md-button><section flex="" layout="row" layout-align="left center"><md-button href="#" class="md-raised">Home</md-button><md-button href="#" class="md-raised">About</md-button></section><md-button class="acme-navbar-text">NETPIE AUTH MANAGER</md-button></md-toolbar>')}]);