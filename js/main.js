/* 

1. Add your custom JavaScript code below
2. Place the this code in your template:

*/

(function ($) {
    "use strict"

    var URL_API_METHODS = "https://testadminapi.webdatawarehouse.com/api/APIMethods";
    var URL_API_SOURCES = "https://testadminapi.webdatawarehouse.com/api/APISources";
    var URL_API_HEADERS = "https://testadminapi.webdatawarehouse.com/api/APIHeaders";
    var URL_API_PARAMETERS = "https://testadminapi.webdatawarehouse.com/api/APIParameters";
    var URL_API_TYPES = "https://testadminapi.webdatawarehouse.com/api/APITypes";
    var URL_AUTH_TYPES = "https://testadminapi.webdatawarehouse.com/api/AuthenticationTypes";

    var g_api_type_select_data = [];
    var g_api_LoopBasedOnINT_id = 0;
    var g_auth_type = [];

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-right",
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    function block_ui(){
        
        $.blockUI({ css: { 
            border: 'none', 
            padding: '15px', 
            backgroundColor: '#000', 
            '-webkit-border-radius': '10px', 
            '-moz-border-radius': '10px', 
            opacity: .5, 
            color: '#fff'
        } }); 
        
    }

    function unblock_ui(){
        $.unblockUI();
    }

    $.fn.destroySelect2 = function () {
        $.each(this, function () {
            try {
                if (!(this).data('select2')) {
                    $(this).select2('destroy');
                }
            } catch (e) {
            }
        });
    };

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

    var g_clicked_method_name_td = null;
    var g_clicked_method_name_td_text = "";
    var is_changed_method_name_td = 0;

    if(token == ""){
        //window.location.href = origin + "login.html";
        db = "devWebdatawarehouse";
    }

    // ===== init part

    $("#subscription_name").html("<h4>" + db + "</h4>");
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
            //window.location.href = origin + "login.html";
            //alert(response.statusText);
            callback(response);            
        });
    }

    function UpdateDataAPI(url, data, token, db, callback){
        var _url = url + "?subscription=" + db;
        var form = new FormData();
        $.each(data, function(key, val){
            form.append(key, val);
        });
        

        var settings = {
            "url": _url,
            "method": "PUT",
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
            callback(response);
        });;
    }    

    function deleteDataAPI(url, token, db, callback){
        var _url = url + "?subscription=" + db;
        var settings = {
            "url": _url,
            "method": "DELETE",
            "timeout": 0,
            "headers": {
            "Authorization": "Bearer " + token
            },
        };

        $.ajax(settings).done(function (response) {
            callback(response);
        }).fail(function(response){            
            callback(response);            
        });
    }

    /*
    $(window).on('resize', function () {
        $(".table").each(function(index){
            $(this).DataTable().columns.adjust().draw();
        });
    });
    */

    //========= Main table ================
    function init_maintable(){        
        //getGetDataFromAPI("https://testadminapi.webdatawarehouse.com/api/APISources", token, db, function(response){
        //getGetDataFromAPI("sampledata/apimethods.txt", token, db, function(response){
        getGetDataFromAPI(URL_API_METHODS, token, db, function(response){
            //var apimethods = JSON.parse(response);
            var api_method_select_data = [];
            var uniq_method_name = [];
            var apimethods = response;
            for(var i=0; i<apimethods.length; i++){
                var am = apimethods[i];

                var method_data_str = encodeURIComponent(JSON.stringify(am));
                
                var api_source = '<a class="api-source-edit-btn" href="javascript:;" data-sourceid="' + am["APISourceID"] + '">' + am["APISource"] + '</a>';

                var api_method_name = '<a class="api-method-edit-btn" href="javascript:;" data-json="' + method_data_str + '" data-methodid="' + am["ID"] + '">' + am["APIMethodName"] + '</a>';

                var api_method = '<div class="td-api-method">' + am["APIMethod"] + '</div>';

                var api_type = '<div class="td-api-type">' + am["APIType"] + '</div>';

                var loop_based_int_start_from = am["LoopBasedOnINTStartFrom"];
                var loop_based_int_last = am["LoopBasedOnINTLast"];

                var loop_class = "";
                if(am["APIType"] != "LoopBasedOnINT"){
                    loop_class = "td-disable-content";                    
                }
                loop_based_int_start_from = '<div class="td-loop-start ' + loop_class + '">' + loop_based_int_start_from + '</div>';
                loop_based_int_last = '<div class="td-loop-last ' + loop_class + '">' + loop_based_int_last + '</div>';

                var enabled = "";
                if(am["Enabled"] == 1){
                    enabled = '<input type="checkbox" class="enable-btn" disabled checked>';
                }
                else{
                    enabled = '<input type="checkbox" class="enable-btn" disabled>';
                }
                
                var edit_delete = '<div class="method-edit-div">' + 
                            '<a href="javascript:;" class="edit-btn" title="Edit API Method" data-methodid="' + am["ID"] + '"><i class="fa fa-edit"></i></a>' +
                            '<a href="javascript:;" class="delete-btn" title="Delete API Method"  data-methodid="' + am["ID"] + '"><i class="fa fa-trash-alt"></i></a></div>';

                var save_cancel = '<div class="method-save-div" style="display:none;">' + 
                            '<a href="javascript:;" class="save-btn" title="Save changed API Method"  data-methodid="' + am["ID"] + '"><i class="fa fa-save"></i></a>' + 
                            '<a href="javascript:;" class="cancel-btn" title="Cancel API Method change" data-methodid="' + am["ID"] + '"><i class="fa fa-window-close"></i></a>' + '</div>';

                

                maintable.row.add([
                    api_source, api_method_name, api_method, api_type, loop_based_int_start_from, loop_based_int_last, enabled, edit_delete + save_cancel
                    ]);

                //
                if(uniq_method_name.indexOf(am["APIMethodName"])==-1){
                    var new_data = {'id': am["ID"], 'text': am["APIMethodName"]};
                    api_method_select_data.push(new_data);

                    $('#api_method_name_select').append($('<option>', {
                        value: am["ID"],
                        text: am["APIMethodName"]
                    }));

                    uniq_method_name.push(am["APIMethodName"]);                    
                }                
            }
            $('#api_method_name_select').select2({'tags':true});
            
            $("#api_method_name_select").on('select2:select', function (e) {
                var selected_name = $("#api_method_name_select").find(':selected').text();
                $('#api_method_name_select option:selected').removeAttr('selected');
                //g_clicked_method_name_td.html(selected_name);                    
                //$("#api_method_name_select_div").css({display: 'none'});                
            });

            $("#api_method_name_select_div .icon-check").on('click', function (e) {
                var selected_name = $("#api_method_name_select").find(':selected').text();
                $('#api_method_name_select option:selected').removeAttr('selected');
                g_clicked_method_name_td.html(selected_name);                    
                $("#api_method_name_select_div").css({display: 'none'});    
                is_changed_method_name_td = 1;
                g_clicked_method_name_td_text = "";            
            });
            $("#api_method_name_select_div .icon-x").on('click', function (e) {
                var selected_name = $("#api_method_name_select").find(':selected').text();
                $('#api_method_name_select option:selected').removeAttr('selected');
                g_clicked_method_name_td.html(g_clicked_method_name_td_text);
                $("#api_method_name_select_div").css({display: 'none'});                
                is_changed_method_name_td = 0;
            });

            maintable.columns.adjust().draw();
            unblock_ui();
        });        
    }

    var maintable = $('#maintable').DataTable({        
        "scrollX":        true,        
        //"paging":         false,   
        //"autoWidth": false,
        "columns" : [
            { title: 'API Source', width : '10%' },
            { title: 'API Method Name', width : '20%' },
            { title: 'API Method', width : '40%' },
            { title: 'API Type', width : '10%' },        
            { title: 'Start From', width : '5%' },
            { title: 'Last', width : '5%' },
            { title: 'Enabled', width : '5%' },
            { title: 'Action', width : '5%' }            
        ],
        "dom": "<'row'<'col-sm-12 col-md-4'l><'col-sm-12 col-md-5 toolbar'><'col-sm-12 col-md-3'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    });

    $("div.toolbar").html('<a class="btn add-method-btn">Add</a>');
    $(document.querySelector('.add-method-btn')).on('click', function(e){
        $("#emm_api_source_id").val("");
        $("#emm_api_method_id").val("");
        $("#emm_api_method").val("");
        $("#emm_enabled").prop("checked", false);

        block_ui();

        getGetDataFromAPI(URL_API_SOURCES, token, db, function(response){
            var api_sources = response;
            var uniq_api_source_names = [];

            $("#emm_api_source").html("").destroySelect2();
            for(var i=0; i<api_sources.length; i++){
                if(uniq_api_source_names.indexOf(api_sources[i].APISource) == -1){
                    $("#emm_api_source").append("<option value='"+ api_sources[i].ID +"'>"+ api_sources[i].APISource +"</option>"); 
                    uniq_api_source_names.push(api_sources[i].APISource);
                }                
            }
            
            $("#emm_api_source").select2({tags: false});
            $("#emm_api_source").val(api_sources[0].ID);

            var source_id = api_sources[0].ID;
            var url = URL_API_SOURCES + "/" + source_id + "/APIMethods";
            getGetDataFromAPI(url, token, db, function(response){
                var api_methods = response;
                $("#emm_api_method_name").html("").destroySelect2();
                for(var i=0; i<api_methods.length; i++){
                    $("#emm_api_method_name").append("<option value='"+ api_methods[i].ID +"'>"+ api_methods[i].APIMethodName +"</option>");
                }
                $("#emm_api_method-name").select2({tags: true});
                unblock_ui();
                $("#edit_method_modal").modal("show"); 
            });                          
        });
    });

    $(document).on('click', "#maintable tbody>tr a", function(e){
        
        var target = $(e.currentTarget);     
        var tr = $(e.currentTarget.closest("tr"));       
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "api-source-edit-btn"){            
            var sourceid = target.data("sourceid");            
            open_apisource_modal(sourceid);            
        }
        else if(btn_class == "edit-btn"){
            console.log(e);
            $(e.currentTarget.parentElement).css('display', 'none');
            $(e.currentTarget.parentElement.parentElement).find(".method-save-div").css("display", "block");

            tr.find(".td-api-method").editable({
                url: '',
                type: 'textarea', 
                mode: 'inline',
                showbuttons: true, 
            });

            tr.find(".td-api-type").editable({
                url: '', 
                type:'select',               
                mode: 'inline',
                showbuttons: false,                 
                source: g_api_type_select_data,
            });  

            tr.find(".td-api-type").on('save', function(e, params) 
            {
                if(params.newValue == g_api_LoopBasedOnINT_id){
                    tr.find(".td-loop-start").removeClass("td-disable-content");
                    tr.find(".td-loop-last").removeClass("td-disable-content");
                    tr.find(".td-loop-start").editable("enable");
                    tr.find(".td-loop-last").editable("enable");
                }
                else{
                    tr.find(".td-loop-start").addClass("td-disable-content");
                    tr.find(".td-loop-last").addClass("td-disable-content");

                    tr.find(".td-loop-start").text("0");
                    tr.find(".td-loop-last").text("0");
                    tr.find(".td-loop-start").editable("disable");                    
                    tr.find(".td-loop-last").editable("disable");
                }
            });

            tr.find(".td-loop-start").editable({
                url: '',
                type: 'text', 
                mode: 'inline',
                showbuttons: false,
                validate: function(value) {
                    if ($.isNumeric(value) == '') {
                        return 'Only numbers are allowed';
                    }
                } 
            });

            tr.find(".td-loop-last").editable({
                    url: '',
                    type: 'text', 
                    mode: 'inline',
                    showbuttons: false,
                    validate: function(value) {
                        if ($.isNumeric(value) == '') {
                            return 'Only numbers are allowed';
                        }
                    } 
                }); 

            if(tr.find(".td-api-type").text() != "LoopBasedOnINT")
            {                
                tr.find(".td-loop-start").editable('disable');
                tr.find(".td-loop-last").editable('disable');
            }

            tr.find(".enable-btn").prop("disabled", false);

        }
        else if(btn_class=="cancel-btn"){
            var method_data = JSON.parse(decodeURIComponent(tr.find(".api-method-edit-btn").data("json")));

            tr.find(".api-method-edit-btn").text(method_data["APIMethodName"]);

            tr.find(".td-api-method").text(method_data["APIMethod"]);
            tr.find(".td-api-type").text(method_data["APIType"]);
            tr.find(".td-loop-start").text(method_data["LoopBasedOnINTStartFrom"]);
            tr.find(".td-loop-last").text(method_data["LoopBasedOnINTLast"]);
            if(method_data["Enabled"] == 1){
                tr.find(".enable-btn").prop('checked', true);
            }
            else{
                tr.find(".enable-btn").prop('checked', false);
            }

            tr.find(".enable-btn").prop("disabled", true);

            tr.find(".td-api-method").editable("destroy");
            tr.find(".td-api-type").editable("destroy");
            tr.find(".td-loop-start").editable("destroy");
            tr.find(".td-loop-last").editable("destroy");
            
            $("#api_method_name_select_div").css("display", "none");


            $(e.currentTarget.parentElement).css('display', 'none');
            $(e.currentTarget.parentElement.parentElement).find(".method-edit-div").css("display", "block");

        }
        else if(btn_class=="save-btn"){
            console.log("sss");
            var method_id = tr.find(".api-method-edit-btn").data("methodid");
            var method_name = tr.find(".api-method-edit-btn").text();
            var method = tr.find(".td-api-method").text();
            var API_type = tr.find(".td-api-type").text();
            var loop_start = tr.find(".td-loop-start").text();
            var loop_last = tr.find(".td-loop-last").text();
            var is_enable = 0;
            if(tr.find(".enable-btn").prop('checked')) is_enable = 1;

            var data = {
                "APIMethodName": method_name,
                "APIMethod": method,
                "APIType": API_type,
                "LoopBasedOnINTStartFrom": loop_start,
                "LoopBasedOnINTLast": loop_last,
                "Enabled": is_enable
            };

            var url = URL_API_METHODS + "/" + method_id;
            UpdateDataAPI(url, data, token, db, function(response){
                console.log(response);
            });


        }
        else if(btn_class == "delete-btn"){
            var method_id = target.data("methodid");
            bootbox.confirm("Are you sure to delete the API Method?", function(result) {
                if(result){
                    deleteDataAPI(URL_API_METHODS + "/" + method_id, token, db, function(response){
                        unblock_ui();
                        if(response == 1){//success
                            var $toast = toastr["success"]("The Method is deleted.", "Success");
                        }
                        else{
                            var $toast = toastr["error"]("Error is occurred.", "Error");
                        }
                    });
                }
            }); 
        }
        else if(btn_class == "api-method-edit-btn"){
            if(tr.find(".method-edit-div").css("display") == "block"){
                return;
            }
            if(g_clicked_method_name_td != null){
                if(is_changed_method_name_td == 1){
                    is_changed_method_name_td = 0;                    
                }
                else{
                    g_clicked_method_name_td.html(g_clicked_method_name_td_text);
                }    
            }                
            
            g_clicked_method_name_td = $(e.target); 
            g_clicked_method_name_td_text = g_clicked_method_name_td.html();
            g_clicked_method_name_td.html("");

            var main_table_div_pos = $("#main_table_div").offset();
            var main_table_body_pos = $("#maintable").parent().offset();
            // e.preventDefault();
            var td = $(e.currentTarget.closest("td"));
            var pos = td.position();
            var top = main_table_body_pos.top - main_table_div_pos.top + pos.top;
            var left = main_table_body_pos.left - main_table_div_pos.left + pos.left;

            var width = td.width() + 20;
            
            $("#api_method_name_select_div").css({top: top+5, left: left+3, display: 'block', width: width});   

            $("#api_method_name_select").val('');             
            $("#api_method_name_select").select2('open', {tags:true});   
        }
    });
    
    //$("#api_method_name_select").select2({tags: true});
    $("#emm_api_source").select2({tags: false});
    $("#emm_api_method_name").select2({tags: true});
    $("#emm_api_load_type").select2({tags: false});

    //========= API Source Modal =================================
    var asm_auth_table = $('#asm_auth_table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',    
        "columns": [            
            { width : '200px' },
            { width : '200px' },
            { width : '50px' },
        ],        
        "fnDrawCallback": function () {
            $('#asm_auth_table>tbody>td:nth-child(1), #asm_auth_table>tbody>td:nth-child(2)').editable({
               url: '',
               type: 'text', 
               mode: 'inline',
               showbuttons: false,               
            });
        }            
    });

    $("#add_api_auth_btn").on("click", function(a){        
        asm_auth_table.row.add( ["", "", ""]).draw();
    });

    function open_apisource_modal(api_source_id){
        block_ui();

        if(api_source_id == ""){ //add source modal
            var left = document.body.clientWidth/2 - 150;
            var left_str = left + 'px';
            $("#api_source_modal .modal-dialog").css("margin-left", left_str);
            $("#api_source_modal .modal-dialog").css("margin-top", "10px");

            $("#asm_apisource_id").val("");
            $("#asm_title").text("Add APISource");
            $("#asm_endpoint").val("");   
            $("#asm_outputxml").prop("checked", false);
            $("#asm_enabled").prop("checked", false);
            asm_auth_table.clear();  

            unblock_ui();      
            $("#api_source_modal").modal("show"); 

        }
        else{ //edit source modal
            var url = URL_API_SOURCES + "/" + api_source_id;
            getGetDataFromAPI(url, token, db, function(response){
                //var as = JSON.parse(response);
                var as = response;
                $("#asm_apisource_id").val(as["ID"]);
                $("#asm_title").text("Edit " + as["APISource"]);
                $("#asm_endpoint").val(as["APIEndpoint"]);

                if(as["OutputIsXML"] == 0){
                    $("#asm_outputxml").prop("checked", false);
                }
                else{
                    $("#asm_outputxml").prop("checked", true);
                }

                if(as["Enabled"] == 0){
                    $("#asm_enabled").prop("checked", false);
                }
                else{
                    $("#asm_enabled").prop("checked", true);
                }
                as["Authentication"] = as["Authentication"].replaceAll("\\", "");
                var auth = JSON.parse(as["Authentication"]);
                asm_auth_table.clear();            

                for (var k in auth[0]["credentials"]){
                    if (typeof auth[0]["credentials"][k] !== 'function') {
                        asm_auth_table.row.add([
                            k, auth[0]["credentials"][k], 
                            '<a href="javascript:;" class="delete-btn"> Delete </a>'
                            ]);         
                    }
                }          
                asm_auth_table.columns.adjust().draw();
                unblock_ui();      
                $("#api_source_modal").modal("show");
            });
        }
        
    }

    $('#api_source_modal').on('shown.bs.modal', function(){        
        asm_auth_table.columns.adjust().draw();
    });

    $(document).on('click', "#api_source_modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");

        if(btn_class == "asm-edit-header-btn"){
            var asm_apisource_id = $("#asm_apisource_id").val();
            if(asm_apisource_id == ""){
                //new
                ehm_table.clear();
                $("#edit_header_modal").modal("show");
            }
            else{
                open_edit_header_modal("sampledata/apiheader.txt", token, db);    
            }            
        }
    });


    //=========  Edit API Method modal
    $("#emm_api_source").on('change', function(e){
        block_ui();

        var selected_source_id = $(e.currentTarget).val();
        var url = URL_API_SOURCES + "/" + selected_source_id + "/APIMethods";
        getGetDataFromAPI(url, token, db, function(response){
            var api_methods = response;
            $("#emm_api_method_name").html("").destroySelect2();
            for(var i=0; i<api_methods.length; i++){
                $("#emm_api_method_name").append("<option value='"+ api_methods[i].ID +"'>"+ api_methods[i].APIMethodName +"</option>");
            }
            $("#emm_api_method-name").select2({tags: true});
            
            unblock_ui();
        });    
    });

    $(document).on('click', "#edit_method_modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");

        var api_source_id = $("#emm_api_source_id").val();
        var api_method_id = $("#emm_api_method_id").val();
        var api_method_name = $("#emm_api_method_name").val();
            
        if(btn_class == "emm-add-source-btn"){
            open_apisource_modal("");
        }
        else if(btn_class == "emm-add-method-name-btn"){
            $("#amnm_name").val('');            
            
            $("#add_method_name_modal").modal("show");

            var left = document.body.clientWidth/2 - 150;
            var left_str = left + 'px';
            $("#add_method_name_modal .modal-dialog").css("margin-left", left_str);
        }
        else if(btn_class == "emm-edit-parameter-btn"){
            if((api_method_name == "") || (api_method_name == null)){
                alert("Please select API Method Name");
                return;
            }

            var left = document.body.clientWidth/2 - 150;
            var left_str = left + 'px';
            $("#edit_parameter_modal .modal-dialog").css("margin-left", left_str);

            $("#epm_api_source_id").val(api_source_id);
            $("#epm_api_method_id").val(api_method_id);
            $("#epm_api_method_name").val(api_method_name);

            if(api_method_id == ""){
                //new
                epm_table.clear();
                $("#edit_parameter_modal").modal("show");
            }
            else{
                open_edit_parameter_modal("sampledata/apiheader.txt", token, db);    
            }            

        }
    });  

    $(document).on('click', "#emm_save_btn", function(e){

    }); 

    //=========
    

    //----- edit parameter modal
    
    function open_edit_parameter_modal(url, token, db){
        getGetDataFromAPI(url, token, db, function(response){
            var ap = JSON.parse(response);
            $("#epm_title").text("Edit " + ap[0]["APISource"] + " parameters");
            epm_table.clear();
            for (var i=0; i<ap.length; i++){                
                epm_table.row.add([
                    ap[i]["APIMethod"], ap[i]["Parameter"], ap[i]["DefaultValue"], 
                    '<a href="javascript:;" class="delete-btn"> Delete </a>'
                    ]);
            }
            epm_table.columns.adjust().draw();
            unblock_ui();
            $("#edit_parameter_modal").modal("show");
        });   
    }

    var epm_table = $('#epm_table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',          
        "fnDrawCallback": function () {
            $('#epm_table>tbody>td:nth-child(2), #epm_table>tbody>td:nth-child(3)').editable({
               url: '',
               type: 'text', 
               mode: 'inline',
               showbuttons: false,               
            });
        }
        
    });

    $("#add_api_parameter_btn").on("click", function(a){
        var api_method_name = $("#epm_api_method_name").val();
        epm_table.row.add( [api_method_name, "", "", ""] ).draw();
    });

    //-------- edit header modal
    var ehm_table = $('#ehm_table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',        
        "fnDrawCallback": function () {
            $('#ehm_table>tbody>td:nth-child(1), #ehm_table>tbody>td:nth-child(2)').editable({
               url: '',
               type: 'text', 
               mode: 'inline',
               showbuttons: false,
            });
        }            
    });

    function open_edit_header_modal(url, token, db){
        getGetDataFromAPI(url, token, db, function(response){
            var ah = JSON.parse(response);
            $("#ehm_title").text("Edit " + ah[0]["APISource"] + " headers");
            ehm_table.clear();
            for (var i=0; i<ah.length; i++){                
                ehm_table.row.add([
                    ah[i]["Header"], ah[i]["Value"], 
                    '<a href="javascript:;" class="delete-btn"> Delete </a>'
                    ]);                         
            }
            ehm_table.columns.adjust().draw();
            unblock_ui();
            $("#edit_header_modal").modal("show");
        });
    }

    $("#add_api_header_btn").on("click", function(a){        
        ehm_table.row.add( ["", "", ""] ).draw();
    });

    //----------
    

    

    
    $('#edit_header_modal').on('shown.bs.modal', function(){        
        ehm_table.columns.adjust().draw();
    });
    $('#edit_parameter_modal').on('shown.bs.modal', function(){        
        epm_table.columns.adjust().draw();
    });

    block_ui();
    getGetDataFromAPI(URL_API_TYPES, token, db, function(response){        
        $.each(response, function(index, val){ 
            var data = {value:val.id, text:val.LoadType, desc:val.LoadTypeDescription};
            g_api_type_select_data.push(data);
            if(val.LoadType == "LoopBasedOnINT"){
                g_api_LoopBasedOnINT_id = val.id;
            }
        });

        //init emm_api_load_type
        $("#emm_api_load_type").html("");
        for(var i=0; i<g_api_type_select_data.length; i++){
            $("#emm_api_load_type").append("<option value='"+ g_api_type_select_data[i].value +"'>"+ g_api_type_select_data[i].text +"</option>");                
        }
        $("#emm_api_load_type_desc").attr('title', g_api_type_select_data[0].desc);     

        $("#emm_api_load_type").on('change', function(e){
            var type_id = $(e.currentTarget).val();
            if($("#emm_api_load_type option:selected").text() == "LoopBasedOnINT"){
                $("#loopbasedint_relevant_div").css("display", "block");
                $("#emm_start_from").val("0");
                $("#emm_last").val("0");
            }
            else{
                $("#loopbasedint_relevant_div").css("display", "none");
            }

            $.each(g_api_type_select_data, function(index, val){
                if(val.value == type_id){
                    $("#emm_api_load_type_desc").attr('title', val.desc);        
                }
            })
            
        });

        getGetDataFromAPI(URL_AUTH_TYPES, token, db, function(response){ 
            $.each(response, function(index, val){ 
                var data = {value:val.id, text:val.AuthenticationTypeDescription, auth_type: val.AuthenticationType};
                g_auth_type.push(data);
                if(val.LoadType == "LoopBasedOnINT"){
                    g_api_LoopBasedOnINT_id = val.id;
                }
            });
            init_maintable();    
        })
        
    });
    



})(jQuery)