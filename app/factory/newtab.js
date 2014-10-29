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