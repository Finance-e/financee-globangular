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
