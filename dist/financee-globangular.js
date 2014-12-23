var globalApp = angular.module('globalApp', ['angular-loading-bar', 'ngAnimate', 'ui.bootstrap']);
globalApp.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
}]);
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
            var message = attrs.ngReallyMessage || "Are you sure ?";

            var modalHtml = '<div class="modal-body">' + message + '</div>';
            modalHtml += '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>';

            var modalInstance = $modal.open({
              template: modalHtml,
              controller: ModalInstanceCtrl
            });

            modalInstance.result.then(function() {
              scope.ngReallyClick({item:scope.item}); //raise an error : $digest already in progress
            }, function() {
              //Modal dismissed
            });
            //*/
            
          });

        }
      };
    }
  ]);

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
globalApp.factory('$global',['$http','cfpLoadingBar',function($http, cfpLoadingBar){
    var requesting = {};
    return {
        request : function(url,callback, vars){
            if(typeof requesting[url] === 'undefined'){requesting[url] = false;}
            if(requesting[url] === true){return;}
            requesting[url] = true;
            cfpLoadingBar.start();
            if(angular.isDefined(vars)){
                $http.post(url,$.param(vars),{headers:{'Content-Type': 'application/x-www-form-urlencoded'}})
                    .success(function(data){
                        requesting[url] = false;
                        cfpLoadingBar.complete();
                        callback(data);
                    })
                    .error(function(){
                        requesting[url] = false;
                        cfpLoadingBar.complete();
                        var out = {'erro':'Falha ao acessar serviço!', 'status':'0'};
                        callback(out);
                    });
            }
            else{
                $http.get(url)
                    .success(function(data){
                        requesting[url] = false;
                        cfpLoadingBar.complete();
                        callback(data);
                    })
                    .error(function(){
                        requesting[url] = false;
                        cfpLoadingBar.complete();
                        var out = {'erro':'Falha ao acessar serviço!', 'status':'0'};
                        callback(out);
                    });
            }
        }
    };
}]);

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
globalApp.filter('dateToISO', function() {
    return function(input) {
        if(input === null || input === "0000-00-00" || input === "0000-00-00 00:00:00"){return "";}
        input = new Date(input).toISOString();
        return input;
    };
});

//provider style, full blown, configurable version     
globalApp.provider('$api', function() {

    this.services     = {};
    this.cList        = false;
    this.getVariables = '';
    this.registerServices = function(serv){
        this.services = serv;
    };
    this.cacheList = function(bool){
        this.cList = bool;
    };
    this.concatInUrl = function(getVariables){
        this.getVariables = getVariables;
    };
        
    this.$get = ['$cache','$global', function ($cache,$global) {
            
        function getBaseURL(filename) {
            var base = window.location.protocol+"//"+window.location.host+"/";
            if(typeof(filename) !== 'undefined'){base += filename;}
            return base;
        }
        function serviceExists(service, type){
            //console.log(service);
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

        function hat_callback(json, force){
            if(typeof json.status !== "undefined"){
                if(json.status == '1'){
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

        function get(service, fn, params){
            //var self = this;
            if(typeof params !== 'string'){params = '';}
            else{params = "/"+params;}
            if(false === this.serviceExists(service, 'get')){return;}
            if(true  === this.executeCallback(service, fn,params)){return;}
            var url = (this.services[service].urltype === 'cache')?
                    getUrlFiles(this.services[service].url):
                    getBaseURL(this.services[service].url)+params+this.getVariables;
            $global.request(url, function(data){
                fn(data);
                $cache.save(service+'/'+params, data);
                //self.hat_callback(data, true);
            });
        }

        function save(service, data, fn){
            if(false === this.serviceExists(service, 'set')){return;}
            if(typeof data === 'undefined'){return;}
            var url = getBaseURL(this.services[service].url)+this.getVariables;
            $global.request(url,fn, data);
        }

        function list(service, fn, params){
            if(false === this.serviceExists(service, 'list')){return;}
            var self = this;
            if(this.cList){
                var s = service + "_"+params;
                if($cache.has(s)){
                    fn($cache.get(s));
                    return;
                }
            }
            
            var url = getBaseURL(this.services[service].url);
            if(typeof params === 'string'){url+='/'+params;}
            url+=this.getVariables;

            $global.request(url, function(data){
                fn(data);
                self.hat_callback(data, false);
                if(self.cList){$cache.save(s, data);}
            });
        }

        function drop(service, params, fn){
            if(typeof params !== 'string'){return;}
            if(false === this.serviceExists(service, 'drop')){return;}
            var url = getBaseURL(this.services[service].url);
            url+='/'+params+this.getVariables;
            $global.request(url,fn);
        }
        
        return {
            list            : list,
            drop            : drop,
            save            : save,
            get             : get,
            executeCallback : executeCallback,
            serviceExists   : serviceExists,
            services        : this.services,
            cList           : this.cList,
            getVariables    : this.getVariables
        };
    }];
});