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