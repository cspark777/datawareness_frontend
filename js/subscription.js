(function ($) {
    "use strict"
    function getOrigin(){
        var href = window.location.href;
        var h_arr = href.split('/');
        var origin = "";
        for(var i=0; i<h_arr.length-1;i++){
            origin = origin + h_arr[i] + "/";
        }

        return origin;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var token = getCookie("token");
    var origin = getOrigin();
    var _url = "https://testadminapi.webdatawarehouse.com/api/subscriptions";
    var settings = {
        "url": _url,
        "method": "GET",
        "timeout": 0,
        "headers": {"Authorization": "Bearer " + token
        },
    };

    $.ajax(settings).done(function (response) { 
    	if(responses.length == 1)
        
    }).fail(function(response){
        alert("Get subscriptions is failed. Please login again.");
        window.location.href = origin + "login.html";
    });

})(jQuery)