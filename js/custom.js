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
            },
            error: function (xhr, ajaxOptions, thrownError) {
            	console.log("error");
            }
    	});
    	
	    event.preventDefault;
	    return false;
	});

})(jQuery)