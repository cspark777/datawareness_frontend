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

    var origin = getOrigin();
    var token = getCookie("token");
    var db = getCookie("db");

    if(token == ""){
        //window.location.href = origin + "login.html";
        db = "devWebdatawarehouse";
    }

    // ===== init part

    $("#subscription-name").html("<h4>" + db + "</h4>");
    // =====

    function getGetDataFromAPI(url, token, db, callback){
        var form = new FormData();
        form.append("db", db);

        var settings = {
            "url": url,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Authorization": "Bearer " + token
            },
            "processData": false,
            "mimeType": "multipart/form-data",
            "contentType": false,
            "data": form
        };

        $.ajax(settings).done(function (response) {            
            callback(response);
        }).fail(function(response){
            callback("[]");
        });
    }


    function init_maintable(){
        getGetDataFromAPI("sampledata/apimethods.txt", token, db, function(response){
            var apimethods = JSON.parse(response);
            for(var i=0; i<apimethods.length; i++){
                var am = apimethods[i];
                
                var api_source = '<a class="aipsource-edit-btn" href="javascript:;" data-source="' + am["APISource"] + '">' + am["APISource"] + '</a>';            var api_method_name = am["APIMethodName"];
                var api_method = am["APIMethod"];
                var api_type = am["APIType"];
                var loop_based_int_start_from = am["LoopBasedOnINTStartFrom"];
                var loop_based_int_last = am["LoopBasedOnINTLast"];

                var enabled = "";
                if(am["Enabled"] == 1){
                    enabled = '<input type="checkbox" class="enable-btn" checked>';
                }
                else{
                    enabled = '<input type="checkbox" class="enable-btn">';
                }
                
                var _delete = '<a href="javascript:;" class="delete-btn">delete</a>';

                maintable.row.add([
                    api_source, api_method_name, api_method, api_type, loop_based_int_start_from, loop_based_int_last, enabled, _delete
                    ]).draw( false );
            }
            maintable.columns.adjust().draw();
        });        
    }

    var maintable = $('#maintable').DataTable({
        
        "scrollX":        true,        
        //"paging":         false,   
        //"autoWidth": false,
        "columns" : [
            { width : '50px' },
            { width : '100px' },
            { width : '300px' },
            { width : '100px' },        
            { width : '100px' },
            { width : '100px' },
            { width : '30px' },
            { width : '30px' }
        ],
        "dom": "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-5 toolbar'><'col-sm-12 col-md-3'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"      
    });
    $("div.toolbar").html('<a class="btn add-method-btn">Add</a>');
    $(document.querySelector('.add-method-btn')).on('click', function(e){
        $("#edit-method-modal").modal("show");
    });

    $(document).on('click', "#edit-method-modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "emm-add-source-btn"){
            open_add_apisource_modal("sampledata/apisource.txt", token, db);
        }
    });


    


    var esm_auth_table = $('#esm-auth-table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',                
    });

    var ehm_table = $('#ehm-table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',                
    });

    var epm_table = $('#epm-table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',                
    });

    function open_add_apisource_modal(url, token, db){
        getGetDataFromAPI(url, token, db, function(response){
            var as = JSON.parse(response);
            $("#esm-title").text("Edit " + as["APISource"]);
            $("#esm-endpoint").val(as["APIEndpoint"]);

            if(as["OutputIsXML"] == 0){
                $("#esm-outputxml").prop("checked", false);
            }
            else{
                $("#esm-outputxml").prop("checked", true);
            }

            if(as["Enabled"] == 0){
                $("#esm-enabled").prop("checked", false);
            }
            else{
                $("#esm-enabled").prop("checked", true);
            }

            var auth = JSON.parse(as["Authentication"]);
            esm_auth_table.clear();            

            for (var k in auth[0]["credentials"]){
                if (typeof auth[0]["credentials"][k] !== 'function') {
                    esm_auth_table.row.add([
                        k, auth[0]["credentials"][k], 
                        '<a href="javascript:;" class="delete-btn"> Delete </a>'
                        ]).draw(true);         
                }
            }                
            $("#edit-source-modal").modal("show");
        });
    }

    $(document).on('click', "#maintable_wrapper tbody a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "aipsource-edit-btn"){
            open_add_apisource_modal("sampledata/apisource.txt", token, db);
        }
    });

    $('#edit-source-modal').on('shown.bs.modal', function(){        
        esm_auth_table.columns.adjust().draw();
    });

    $(document).on('click', "#edit-source-modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "esm-edit-header-btn"){
            getGetDataFromAPI("sampledata/apiheader.txt", token, db, function(response){
                var ah = JSON.parse(response);
                $("#ehm-title").text("Edit " + ah[0]["APISource"] + " headers");
                ehm_table.clear();
                for (var i=0; i<ah.length; i++){                
                    ehm_table.row.add([
                        ah[i]["Header"], ah[i]["Value"], 
                        '<a href="javascript:;" class="delete-btn"> Delete </a>'
                        ]).draw(true);                         
                }
                $("#edit-header-modal").modal("show");
            });
            
        }
        else if(btn_class == "esm-edit-parameter-btn"){
            getGetDataFromAPI("sampledata/apiparameter.txt", token, db, function(response){
                var ap = JSON.parse(response);
                $("#epm-title").text("Edit " + ap[0]["APISource"] + " parameters");
                epm_table.clear();
                for (var i=0; i<ap.length; i++){                
                    epm_table.row.add([
                        ap[i]["APIMethod"], ap[i]["Parameter"], ap[i]["DefaultValue"], 
                        '<a href="javascript:;" class="delete-btn"> Delete </a>'
                        ]).draw(true);                         
                }
                $("#edit-parameter-modal").modal("show");
            });           
        }
    });
    $('#edit-header-modal').on('shown.bs.modal', function(){        
        ehm_table.columns.adjust().draw();
    });
    $('#edit-parameter-modal').on('shown.bs.modal', function(){        
        epm_table.columns.adjust().draw();
    });

    init_maintable();    



})(jQuery)