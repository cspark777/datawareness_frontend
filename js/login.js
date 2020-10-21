/* 

1. Add your custom JavaScript code below
2. Place the this code in your template:

*/

(function ($) {
	"use strict"

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
                
                var url = 'main.html';
                var form = $('<form action="' + url + '" method="post">' +
                  '<input type="text" name="access" value="' + response["access"] + '" />' +
                  '<input type="text" name="refresh" value="' + response["refresh"] + '" />' + 
                  '<input type="text" name="db" value="' + subscription + '" />' +
                  '</form>');
                $('body').append(form);
                form.submit();
            },
            error: function (xhr, ajaxOptions, thrownError) {
            	console.log("error");
            }
    	});
    	
	    event.preventDefault;
	    return false;
	});

})(jQuery)