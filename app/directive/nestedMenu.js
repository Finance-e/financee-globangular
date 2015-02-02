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