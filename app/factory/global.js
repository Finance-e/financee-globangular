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
