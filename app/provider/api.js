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