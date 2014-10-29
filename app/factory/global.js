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
                        callback(data);
                        cfpLoadingBar.complete();
                    })
                    .error(function(){
                        requesting[url] = false;
                        var out = {'erro':'Falha ao acessar serviço!', 'status':'0'};
                        callback(out);
                        cfpLoadingBar.complete();
                    });
            }
            else{
                $http.get(url)
                    .success(function(data){
                        requesting[url] = false;
                        callback(data);
                        cfpLoadingBar.complete();
                    })
                    .error(function(){
                        requesting[url] = false;
                        var out = {'erro':'Falha ao acessar serviço!', 'status':'0'};
                        callback(out);
                        cfpLoadingBar.complete();
                    });
            }
        }
    };
}]);
