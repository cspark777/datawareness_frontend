(function ($) {
    "use strict"

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

    block_ui();
    $.ajax(settings).done(function (response) { 
    	console.log(response);
        setCookie("subscriptions", response);
        if(response.length == 1){
            setCookie("db", response[0]);
            window.location.href = origin + "main.html";
            return;
        }
        for(var i=0; i<response.length; i++){
            $('#subscription').append($('<option>', {
                        value: response[i],
                        text: response[i]
                    }));    
        }    
        unblock_ui();   
        
    }).fail(function(response){
        alert("Get subscriptions is failed. Please login again.");
        window.location.href = origin + "login.html";
    });

    $("#select_subscription").on("click", function(e){
        var subscription = $('#subscription').val();
        setCookie("db", subscription);
        window.location.href = origin + "main.html";
    });

})(jQuery)