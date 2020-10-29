/* 

1. Add your custom JavaScript code below
2. Place the this code in your template:

*/

(function ($) {
	"use strict"

    var URL_API_METHODS = "https://testadminapi.webdatawarehouse.com/api/APIMethods";
    var URL_API_SOURCES = "https://testadminapi.webdatawarehouse.com/api/APISources";
    var URL_API_PARAMETERS = "https://testadminapi.webdatawarehouse.com/api/APIParameters";

    function block_ui(){
        /*
        $.blockUI({ css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff' 
        } }); 
        */
    }

    function unblock_ui(){
        //$.unblockUI();
    }

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
        var _url = url + "?subscription=" + db;
        var settings = {
            "url": _url,
            "method": "GET",
            "timeout": 0,
            "headers": {"Authorization": "Bearer " + token
            },
        };

        $.ajax(settings).done(function (response) {            
            callback(response);
        }).fail(function(response){
            //callback("[]");
            //token is expired, go to login
            window.location.href = origin + "login.html";
        });
    }


    function init_maintable(){
        block_ui();
        //getGetDataFromAPI("https://testadminapi.webdatawarehouse.com/api/APISources", token, db, function(response){
        //getGetDataFromAPI("sampledata/apimethods.txt", token, db, function(response){
        getGetDataFromAPI("https://testadminapi.webdatawarehouse.com/api/APIMethods", token, db, function(response){
            //var apimethods = JSON.parse(response);
            var apimethods = response;
            for(var i=0; i<apimethods.length; i++){
                var am = apimethods[i];
                
                var api_source = '<a class="aipsource-edit-btn" href="javascript:;" data-sourceid="' + am["APISourceID"] + '">' + am["APISource"] + '</a>';            var api_method_name = am["APIMethodName"];
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
            unblock_ui();
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
        getGetDataFromAPI(URL_API_METHODS, token, db, function(response){
            var api_methods = response;

            //remove duplicated method names
            var api_method_names = [];
            for(var i=0; i<api_methods.length; i++){
                if(api_method_names.indexOf(api_methods[i].APIMethodName) == -1){
                    api_method_names.push(api_methods[i].APIMethodName);
                }
            }

            getGetDataFromAPI(URL_API_SOURCES, token, db, function(response){
                var api_sources = response;

                $("#emm-api-source").select2("destroy");
                for(var i=0; i<api_sources.length; i++){
                    $("#emm-api-source").append("<option value='"+ api_sources[i].id +"'>"+ api_sources[i].APISource +"</option>");                      
                }
                $("#emm-api-source").select2({tags: false});

                $("#emm-api-method-name").select2("destroy");
                for(var i=0; i<api_method_names.length; i++){
                    $("#emm-api-method-name").append("<option value='"+ i +"'>"+ api_method_names[i] +"</option>");                           
                }
                $("#emm-api-method-name").select2({tags: true});
                
            });
        });

        $("#edit-method-modal").modal("show");
    });
    
    $(document).on('click', "#edit-method-modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "emm-add-source-btn"){
            open_add_apisource_modal("sampledata/apisource.txt", token, db);
        }
        else if(btn_class == "emm-add-method-name-btn"){
            $("#amnm-name").val('');            
            
            $("#add-method-name-modal").modal("show");

            var left = document.body.clientWidth/2 - 150;
            var left_str = left + 'px';
            $("#add-method-name-modal .modal-dialog").css("margin-left", left_str);
        }
        else if(btn_class == "emm-edit-parameter-btn"){
            var esm_apisource_id = $("#esm_apisource_id").val();
            if(esm_apisource_id == ""){
                //new
                epm_table.clear();
                $("#edit-parameter-modal").modal("show");
            }
            else{
                open_edit_parameter_modal("sampledata/apiparameter.txt", token, db);    
            }
            
            
            var left = document.body.clientWidth/2 - 150;
            var left_str = left + 'px';
            $("#edit-parameter-modal .modal-dialog").css("margin-left", left_str);
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

    $("#emm-api-source").select2({tags: false});
    $("#emm-api-method-name").select2({tags: true});
    $("#emm-api-load-type").select2({tags: false});

    function open_add_apisource_modal(url, token, db){
        block_ui();        
        $("#esm_apisource_id").val("");
        $("#esm-title").text("Add APISource");
        $("#esm-endpoint").val("");   
        $("#esm-outputxml").prop("checked", false);
        $("#esm-enabled").prop("checked", false);
        esm_auth_table.clear();  

        unblock_ui();      
        $("#edit-source-modal").modal("show"); 
    }

    function open_edit_apisource_modal(url, token, db){
        block_ui();
        getGetDataFromAPI(url, token, db, function(response){
            //var as = JSON.parse(response);
            var as = response;
            $("#esm_apisource_id").val(as["ID"]);
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
            unblock_ui();      
            $("#edit-source-modal").modal("show");
        });
    }

    function open_edit_parameter_modal(url, token, db){
        getGetDataFromAPI(url, token, db, function(response){
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

    $(document).on('click', "#maintable_wrapper tbody a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "aipsource-edit-btn"){            
            var sourceid = target.data("sourceid");
            var url = "https://testadminapi.webdatawarehouse.com/api/APISources/" + sourceid;
            open_edit_apisource_modal(url, token, db);            
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
            open_edit_parameter_modal("sampledata/apiparameter.txt", token, db);
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