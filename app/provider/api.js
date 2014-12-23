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