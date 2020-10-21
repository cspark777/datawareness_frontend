/* 

1. Add your custom JavaScript code below
2. Place the this code in your template:

*/

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

    function setCookie(cname, cvalue, hours) {
        var d = new Date();
        d.setTime(d.getTime() + (hours*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    var origin = getOrigin();

    var $form = $('#login-form');
    $form.submit( function(event) {
        
        $.ajax({
            type: 'POST',
            url: "https://testadminapi.webdatawarehouse.com/api/token",
            data: $form.serialize(),
            success: function( response ) {
                console.log( response );
                //here is to get subscription part
                var subscription = "devWebdatawarehouse";
                
                setCookie("token", response["access"], 1);
                setCookie("db", subscription);

                window.location.href = origin + "main.html";
            },
            error: function (xhr, ajaxOptions, thrownError) {
                if(thrownError == "Unauthorized"){
                    alert("Login information is not correct, please check again...");
                }
            }
        });
        
        event.preventDefault;
        return false;
    });

})(jQuery)