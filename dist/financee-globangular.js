var globalApp = angular.module('globalApp', ['angular-loading-bar', 'ngAnimate', 'ui.bootstrap']);
(function () {
    'use strict';
    globalApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = true;
    }]);
}());


(function () {
   'use strict';
   globalApp.directive('navMenu', function($location) {
  return function(scope, element, attrs) {
    var links = element.find('a'),
        onClass = attrs.navMenu || 'on',
        routePattern,
        link,
        url,
        currentLink,
        urlMap = {},
        i;

    if (!$location.$$html5) {
      routePattern = /^#[^/]*/;
    }

    for (i = 0; i < links.length; i++) {
      link = angular.element(links[i]);
      url = link.attr('href');

      if ($location.$$html5) {
        urlMap[url] = link;
      } else {
        urlMap[url.replace(routePattern, '')] = link;
      }
    }

    scope.$on('$routeChangeStart', function() {
      var pathLink = urlMap[$location.path()];

      if (pathLink) {
        if (currentLink) {
          currentLink.removeClass(onClass);
        }
        currentLink = pathLink;
        currentLink.addClass(onClass);
      }
    });
  };
});
}());
(function () {
   'use strict';
   globalApp.directive("nestedMenu", ['$compile',function ($compile) {

    return {
            restrict: 'E',
            replace: true,
            scope: {
                menu: '='
            },
            template: '<ul><li ng-repeat="item in menu"><a href="{{item.url}}"><i class="{{item.icon]}}"></i> {{item.name}}</a><span ng-if="item.Children.length > 0"><nestedMenu menu="item.Children"></nestedMenu></span></li></ul>',
            compile: function (el) {
                var contents = el.contents().remove();
                var compiled;
                return function(scope,el){
                    if(!compiled)
                        compiled = $compile(contents);

                    compiled(scope,function(clone){
                        el.append(clone);
                    });
                };
            }
        };

    }]);
}());
(function () {
    'use strict';
    globalApp.directive('ngReallyClick', ['$modal', function($modal) {
      var ModalInstanceCtrl = function($scope, $modalInstance) {
        $scope.ok = function() {
          $modalInstance.close();
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      };

      return {
        restrict: 'A',
        scope:{
          ngReallyClick:"&",
          item:"="
        },
        link: function(scope, element, attrs) {
          element.bind('click', function() {
            var message = attrs.ngReallyMessage || "Você realmente deseja prosseguir ?";
            var modalHtml = '<div class="modal-body">' + message + '</div>';
            modalHtml += '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';
            var modalInstance = $modal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });
            modalInstance.result.then(function() {
              scope.ngReallyClick({item:scope.item}); //raise an error : $digest already in progress
            }, function() {
            });            
          });

        }
      };
    }
  ]);
}());
(function () {
   'use strict';
    globalApp.factory('$cache',[function(){
     var cache = {}; // end urls
     return {
         get : function(name){
             return this.has(name)?cache[name]:"";
         },
         save : function(name, data){
             cache[name] = data;
         },
         drop : function(name){
             if(this.has(name)){cache.splice (name, 1);}
         },
         has: function(name){
             return (typeof cache[name] !== 'undefined');
         }
     };
    }]);
}());
(function () {
   'use strict';
    globalApp.factory('$global',['$http','cfpLoadingBar',function($http, cfpLoadingBar){
        var requesting = {};
        var isFunction = function(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        };
        var stop = function(url){
            requesting[url] = false;
            cfpLoadingBar.complete();
        };
        var getMsgErro = function(data, status){
            //console.log(data, status);
            var s = (typeof status !== 'undefined')?status:'0';
            var out = {'erro':'Falha ao acessar serviço!', 'status':s};
            return out;
        };
        return {
            request : function(url,callback, vars){
                if(typeof requesting[url] === 'undefined'){requesting[url] = false;}
                if(false === isFunction(callback)){return;}
                if(requesting[url] === true){return;}
                requesting[url] = true;
                cfpLoadingBar.start();
                if(angular.isDefined(vars)){
                    $http.post(url,$.param(vars),{headers:{'Content-Type': 'application/x-www-form-urlencoded'}})
                        .success(function(data){
                            stop(url);
                            callback(data);
                        })
                        .error(function(data, status){
                            stop(url);
                            callback(getMsgErro(data, status));
                        });
                }
                else{
                    $http.get(url)
                        .success(function(data){
                            stop(url);
                            callback(data);
                        })
                        .error(function(data, status){
                            stop(url);
                            callback(getMsgErro(data, status));
                        });
                }
            }
        };
    }]);

}());
(function () {
   'use strict';
    globalApp.factory('$newtab',[function(){
        return {
            open: function(url, data, method, target) {
                var form = document.createElement("form");
                form.action = url;
                form.method = method || 'post';
                form.target = target || "_blank";
                if (data) {
                  for (var key in data) {
                    var input = document.createElement("textarea");
                    input.name = key;
                    input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
                    form.appendChild(input);
                  }
                }
                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();
            }
        };
    }]);
}());
(function () {
   'use strict';
   globalApp.filter('dateToISO', function() {
        return function(input) {
            if(input === null || input === "0000-00-00" || input === "0000-00-00 00:00:00"){return "";}
            input = new Date(input).toISOString();
            return input;
        };
    });
}());

(function () {
   'use strict';
    globalApp.provider('$api', function() {
            this.services       = {};
            this.check          = {};
            this.inverseservice = {};
            this.quene          = [];
            this.cList          = false;
            this.restricted     = false;
            this.pecbk          = null;
            this.getVariables   = '';
            this.registerServices = function(serv){
                this.check    = {permissions:[]};
                for(var i in serv){
                    serv[i].permission = true;
                    if(typeof serv[i].urltype === 'undefined'){continue;}
                    if(serv[i].urltype        !== "common"   ){continue;}
                    this.check.permissions.push(serv[i].url);
                    this.inverseservice[serv[i].url] = i;
                }
                this.services = serv;
            };
            this.cacheList = function(bool){
                this.cList = bool;
            };
            this.concatInUrl = function(getVariables){
                this.getVariables = getVariables;
            };
            this.permissionLocation = function(location){
                this.pecbk = location;
            };

            this.$get = ['$cache','$global','$location', function ($cache,$global,$location) {
                function execCallback(self, callback, service, fn, params){
                    if(typeof self.services[service] === 'undefined'){
                        console.log('undefined service');
                        return;
                    }
                    if(typeof self.services[service].permission === 'undefined'){self.services[service].permission = true;}
                    if(self.services[service].permission === false){
                        var location = self.pecbk;
                        if(location !== null){$location.path('/'+location); }
                        return message_erro("Você não tem permissão para acessar esta página");
                    }
                    return callback(self,service, fn, params);
                }
                function restrictServices(self, callback, service, fn, params) {
                    if(self.restricted === true){ 
                        if(self.quene.length === 0){return execCallback(self, callback, service, fn, params);}
                        self.quene.push([callback, service, fn, params]);
                        return;
                    }
                    self.quene.push([callback, service, fn, params]);
                    self.restricted = true;

                    var url = getBaseURL('usuario/perfil/userpermissions&ajax=1');
                    $global.request(url, function(data){
                        for(var i in data){
                            if(typeof self.inverseservice[data[i]] === 'undefined'){continue;}
                            var k = self.inverseservice[data[i]];
                            self.services[k].permission = false;
                        }
                        for(var j in self.quene){
                            execCallback(self, self.quene[j][0], self.quene[j][1],self.quene[j][2],self.quene[j][3]);
                        }
                       self.quene = [];
                    }, self.check);
                }
                function getBaseURL(filename) {
                    var base = window.location.protocol+"//"+window.location.host+"/";
                    if(typeof(filename) !== 'undefined'){base += filename;}
                    return base;
                }
                function hat_callback(json, force){
                    if(typeof json.status !== "undefined"){
                        if(json.status === '1' || json.status === 1){
                            if(typeof(json.success) !== 'undefined'){message_success(json.success, 5000);}
                            else {message_alert("Dados inseridos sem confirmação do servidor. Não é possível determinar se a operação foi concluída com sucesso!");}
                            return true;
                        }
                        else{
                            if(typeof(json.erro) !== 'undefined'){message_erro(json.erro, 5000);}
                            else {message_alert("Falha ao salvar dados no servidor. Não é possível determinar qual o tipo de falha que ocorreu!");}
                            return false;
                        }
                    }
                    if(force === true){
                        message_erro("Falha ao receber resposta do servidor!");
                        return false;
                    }
                    return true;
                }

                function serviceExists(service, type){
                    if(typeof (this.services[service]) === 'undefined'){
                        console.log("Service " + service + " doesn't exists!");
                        return false;
                    }
                    if(this.services[service].type === type){return true;}
                    console.log('Method '+type+' is incorrect for service '  + service + '. Use method ' + this.services[service].type+".");
                    return false;
                }

                function executeCallback(service,fn, params){
                    if(typeof(fn) !== 'function'){return true;}
                    if($cache.has(service+"/"+params)){
                        fn($cache.get(service+"/"+params));
                        return true;
                    }
                    return false;
                }        

                function get(self, service, fn, params){
                    if(typeof params !== 'string'){params = '';}
                    else{params = "/"+params;}
                    if(false === self.serviceExists(service, 'get')){return;}
                    if(true  === self.executeCallback(service, fn,params)){return;}
                    var url = (self.services[service].urltype === 'cache')?
                            getUrlFiles(self.services[service].url):
                            getBaseURL(self.services[service].url)+params+self.getVariables;
                    $global.request(url, function(data){
                        fn(data);
                        $cache.save(service+'/'+params, data);
                    });

                }

                function save(self, service, fn, params){
                    if(false === self.serviceExists(service, 'save')){return;}
                    if(typeof params === 'undefined'){return;}
                    var url = getBaseURL(self.services[service].url)+self.getVariables;
                    $global.request(url,fn, params);
                }

                function list(self, service, fn, params){
                    if(false === self.serviceExists(service, 'list')){return;}
                    var sf = self;
                    if(sf.cList){
                        var s = service + "_"+params;
                        if($cache.has(s)){
                            fn($cache.get(s));
                            return;
                        }
                    }

                    var url = getBaseURL(self.services[service].url);
                    if(typeof params === 'string'){url+='/'+params;}
                    url+=self.getVariables;

                    $global.request(url, function(data){
                        fn(data);
                        hat_callback(data, false);
                        if(sf.cList){$cache.save(s, data);}
                    });
                }

                function drop(self, service, fn, params){
                    if(typeof params !== 'string'){return;}
                    if(false === self.serviceExists(service, 'drop')){return;}
                    var url = getBaseURL(self.services[service].url);
                    url+='/'+params+self.getVariables;
                    $global.request(url,fn);
                }

                function execute(service, fn, params){
                    restrictServices(this, function(self, service, fn, params){
                        if(typeof (self.services[service]) === 'undefined'){
                            console.log("Service " + service + " doesn't exists!");
                            return false;
                        }
                        switch (self.services[service].type){
                            case 'get':
                                get(self, service, fn, params);
                                break;
                            case 'save':
                                save(self, service, fn, params);
                                break;
                            case 'list':
                                list(self, service, fn, params);
                                break;
                            case 'drop':
                                drop(self, service, fn, params);
                                break;
                            default: console.log('service type: '+self.services[service].type+' doesn\'t exists');
                        }
                    }, service, fn, params);
                }

                return {
                    execute         : execute,
                    executeCallback : executeCallback,
                    serviceExists   : serviceExists,
                    hat_callback    : hat_callback,
                    services        : this.services,
                    check           : this.check,
                    inverseservice  : this.inverseservice,
                    quene           : this.quene,
                    cList           : this.cList,
                    pecbk           : this.pecbk,
                    getVariables    : this.getVariables
                };
            }];
    });
}());