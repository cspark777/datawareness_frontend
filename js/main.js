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
    var g_auth_data_arr = [];

    var g_current_auth_data = null;
    var g_current_auth_data_id = null;
    
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

    var origin = getOrigin();
    var token = getCookie("token");
    var subscriptions = getCookie("subscriptions");
    var db = getCookie("db");

    var g_clicked_method_name_td = null;
    var g_clicked_method_name_td_text = "";
    var is_changed_method_name_td = 0;

    var g_clicked_main_table_tr = null;

/*
    if(token == ""){
        //window.location.href = origin + "login.html";
        db = "devWebdatawarehouse";
    }
*/
    // ===== init part

    $("#subscription_name").html("<h4>" + db + "</h4>");

    var subscriptions_str = getCookie("subscriptions");
    var subscriptions = subscriptions_str.split(",");
    var str = "";
    if(subscriptions.length == 1){
        str = '<span class="subscription-span">' + db + '</span>';
        
    }
    else{
        var str = '<select id="subscription_select">';
        for(var i=0; i<subscriptions.length;i++){
            if(db == subscriptions[i]){
                str = str + '<option value="' + subscriptions[i] + '" selected>' + subscriptions[i] + '</option>';    
            }
            else{
                str = str + '<option value="' + subscriptions[i] + '">' + subscriptions[i] + '</option>';
            }
            
        }
        str = str + '</select>';
    }

    $("#subscription_div").html(str);

    $("#subscription_select").on("change", function(e){
        var subscription = $('#subscription_select').val();
        setCookie("db", subscription);
        window.location.reload();
    });

    // =====

    

    /*
    $(window).on('resize', function () {
        $(".table").each(function(index){
            $(this).DataTable().columns.adjust().draw();
        });
    });
    */

    //========= Main table ================
    function add_new_row_maintable(row_data, row_data_str){
        var api_source = '<a class="api-source-edit-btn" href="javascript:;" data-sourceid="' + row_data["APISourceID"] + '">' + row_data["APISource"] + '</a>';

        var api_method_name = '<a class="api-method-edit-btn" href="javascript:;" data-json="' + row_data_str + '" data-methodid="' + row_data["ID"] + '">' + row_data["APIMethodName"] + '</a>';

        var api_method = '<div class="td-api-method">' + row_data["APIMethod"] + '</div>';

        var api_type = '<div class="td-api-type">' + row_data["APIType"] + '</div>';

        var loop_based_int_start_from = row_data["LoopBasedOnINTStartFrom"];
        var loop_based_int_last = row_data["LoopBasedOnINTLast"];

        var loop_class = "";
        if(row_data["APIType"] != "LoopBasedOnINT"){
            loop_class = "td-disable-content";                    
        }
        loop_based_int_start_from = '<div class="td-loop-start ' + loop_class + '">' + loop_based_int_start_from + '</div>';
        loop_based_int_last = '<div class="td-loop-last ' + loop_class + '">' + loop_based_int_last + '</div>';

        var enabled = "";
        if(row_data["Enabled"] == 1){
            enabled = '<input type="checkbox" class="enable-btn" disabled checked>';
        }
        else{
            enabled = '<input type="checkbox" class="enable-btn" disabled>';
        }
        
        var edit_delete = '<div class="method-edit-div">' + 
                    '<a href="javascript:;" class="edit-btn" title="Edit API Method" data-methodid="' + row_data["ID"] + '"><i class="fa fa-edit"></i></a>' +
                    '<a href="javascript:;" class="delete-btn" title="Delete API Method"  data-methodid="' + row_data["ID"] + '"><i class="fa fa-trash-alt"></i></a></div>';

        var save_cancel = '<div class="method-save-div" style="display:none;">' + 
                    '<a href="javascript:;" class="save-btn" title="Save changed API Method"  data-methodid="' + row_data["ID"] + '"><i class="fa fa-save"></i></a>' + 
                    '<a href="javascript:;" class="cancel-btn" title="Cancel API Method change" data-methodid="' + row_data["ID"] + '"><i class="fa fa-window-close"></i></a>' + '</div>';

        

        maintable.row.add([
            api_source, api_method_name, api_method, api_type, loop_based_int_start_from, loop_based_int_last, enabled, edit_delete + save_cancel
            ]);

    }
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
                
                add_new_row_maintable(am, method_data_str);

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
            g_clicked_main_table_tr = tr;         
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
            block_ui()
            UpdateDataAPI(url, data, token, db, function(response){
                unblock_ui();
                console.log(response);
                if(response != "error"){//success
                    var $toast = toastr["success"]("The Method is saved.", "Success");

                    tr.find(".enable-btn").prop("disabled", true);

                    tr.find(".td-api-method").editable("destroy");
                    tr.find(".td-api-type").editable("destroy");
                    tr.find(".td-loop-start").editable("destroy");
                    tr.find(".td-loop-last").editable("destroy");
                    
                    $("#api_method_name_select_div").css("display", "none");


                    tr.find(".method-save-div").css('display', 'none');
                    tr.find(".method-edit-div").css("display", "block");
                }
                else{
                    var $toast = toastr["error"]("Error is occurred.", "Error");
                }
            });


        }
        else if(btn_class == "delete-btn"){
            var method_id = target.data("methodid");
            bootbox.confirm("Are you sure to delete the API Method?", function(result) {
                if(result){
                    block_ui();
                    deleteDataAPI(URL_API_METHODS + "/" + method_id, token, db, function(response){
                        unblock_ui();
                        var deleted_row = maintable.row(tr);
                        maintable.row(deleted_row).remove().draw();
                        if(response == "success"){//success
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
        bSort: false,        
        "columns": [            
            { width : '200px' },
            { width : '200px' },
            { width : '50px' },
        ],        
        "fnDrawCallback": function () {
            if(this.DataTable().data().length>0){
                $('#asm_auth_table>tbody>tr>td:nth-child(1), #asm_auth_table>tbody>tr>td:nth-child(2)').editable({
                   url: '',
                   type: 'text', 
                   mode: 'inline',
                   showbuttons: false,               
                });    
            }            
        }            
    });

    $("#add_api_auth_btn").on("click", function(a){        
        asm_auth_table.row.add( ["", "", '<a href="javascript:;" class="delete-btn"> <i class="fa fa-trash-alt"></i> </a>']).draw();
    });

    function open_apisource_modal(api_source_id){
        block_ui();

        //init header dialog table
        ehm_table.clear();

        if(api_source_id == ""){ //add source modal
            var left = document.body.clientWidth/2 - 150;
            var left_str = left + 'px';
            $("#api_source_modal .modal-dialog").css("margin-left", left_str);
            $("#api_source_modal .modal-dialog").css("margin-top", "10px");

            $("#asm_apisource_id").val("");
            $("#asm_source_name_div").css("display", "block");
            $("#asm_source_name").val("");

            $("#asm_title").text("Add APISource");
            $("#asm_endpoint").val("");   
            $("#asm_outputxml").prop("checked", false);
            $("#asm_enabled").prop("checked", false);
            asm_auth_table.clear();  
            ehm_table.clear();

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
                $("#asm_source_name_div").css("display", "none");
                $("#asm_source_name").val(as["APISource"]);
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

                if(as["Authentication"] != ""){
                    as["Authentication"] = as["Authentication"].replaceAll("\\", "");    
                }

                var auth = JSON.parse(as["Authentication"]);
                g_current_auth_data = auth[0];

                g_current_auth_data_id = getAuthID(g_auth_data_arr, g_current_auth_data);
                $("#asm_auth_type").val(g_current_auth_data_id);


                asm_auth_table.clear();            

                for (var k in auth[0]["credentials"]){
                    if (typeof auth[0]["credentials"][k] !== 'function') {
                        asm_auth_table.row.add([
                            k, auth[0]["credentials"][k], 
                            '<a href="javascript:;" class="delete-btn"> <i class="fa fa-trash-alt"></i> </a>'
                            ]);         
                    }
                } 

                //asm_auth_table.columns.adjust().draw();

                //get data for header modal
                getGetDataFromAPI(URL_API_HEADERS, token, db, function(response){
                    var ah = response;   
                    var api_headers = [];
                    $("#asm_apiheaders").val(api_headers_str);

                    ehm_table.clear();
                    for (var i=0; i<ah.length; i++){                
                        if(ah[i]["APISourceID"] == api_source_id){
                            var data = {"ID": ah[i]["ID"], "Header": ah[i]["Header"], "Value": ah[i].Value};
                            api_headers.push(data);

                            $("#ehm_title").text("Edit " + ah[i]["APISource"] + " headers");
                            ehm_table.row.add([
                                ah[i]["Header"], ah[i]["Value"], 
                                '<a href="javascript:;" class="delete-btn" data-headerid="' + ah[i]["ID"] + '"><i class="fa fa-trash-alt"></i></a>'
                            ]);                         
                        }                
                    }   

                    var api_headers_str = JSON.stringify(api_headers);
                    $("#asm_apiheaders").val(api_headers_str);

                    unblock_ui();
                    $("#api_source_modal").modal("show"); 
                });                
            });
        }        
    }

    $('#api_source_modal').on('shown.bs.modal', function(){        
        asm_auth_table.columns.adjust().draw();
    });

    $(document).on('click', "#api_source_modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
        var tr = $(e.currentTarget.closest("tr"));

        if(btn_class == "asm-edit-header-btn"){            
            $("#edit_header_modal").modal("show");  
        }
        else if(btn_class == "delete-btn"){            
            bootbox.confirm("Are you sure to delete this API Authentication Parameter?", function(result) {
                if(result){
                    var deleted_row = asm_auth_table.row(tr);
                    asm_auth_table.row(deleted_row).remove().draw();
                }
            }); 
        }
    });

    $("#asm_auth_type").on('change', function(e){
        var selected_auth_id = $(e.currentTarget).val();
        var auth_type_str = $("#asm_auth_type option:selected").data("type");
        var auth_type = JSON.parse(decodeURIComponent(auth_type_str));

        asm_auth_table.clear();
        

        for (var k in auth_type[0]["credentials"]){
            if (typeof auth_type[0]["credentials"][k] !== 'function') {
                asm_auth_table.row.add([
                    k, auth_type[0]["credentials"][k], 
                    '<a href="javascript:;" class="delete-btn"> <i class="fa fa-trash-alt"></i> </a>'
                    ]);         
            }
        }  
        asm_auth_table.draw();
    });


    function process_headers(ori_headers, api_source_id, api_source_name){
        var header_table_trs = $("#ehm_table>tbody").find("tr");

        var new_headers = [];
        var updated_headers = [];
        
        for(var i=0; i<header_table_trs.length; i++){
            var header_td = $(header_table_trs[i]).find("td")[0];
            var value_td = $(header_table_trs[i]).find("td")[1];
            var delete_td = $(header_table_trs[i]).find("td")[2];

            var header = $(header_td).text();
            var value = $(value_td).text();
            var header_id = $(delete_td).find("a").data("headerid");

            var data = {"ID": header_id, "APISourceID": api_source_id, "APISource":api_source_name, "Header": header, "Value": value, "Enabled": 1};

            if(header==""){
                continue;
            }
            else{
                if(header_id == "0"){
                    new_headers.push(data);
                }
                else{
                    for(var j=0; j<ori_headers.length; j++){
                        if(ori_headers[j].ID == header_id){
                            if((ori_headers[j].Header != header) || (ori_headers[j].Value!=value)){
                                updated_headers.push(data);                                
                            }
                            ori_headers.splice(j, 1);
                            break;
                        }
                    }
                }                
            }
        }

        var res_data = {"new_headers": new_headers, "updated_headers": updated_headers, "delete_headers": ori_headers};
        return res_data;

    }

    $("#asm_save_btn").on("click", function(e){//save API source
        
        //get edited data
        var api_source_id = $("#asm_apisource_id").val();
        var api_source_name = $("#asm_source_name").val();
        var api_endpoint = $("#asm_endpoint").val();
        var api_output_xml = 0;
        if($("#asm_outputxml").prop("checked")) api_output_xml = 1;
        var api_auth_type = $("#asm_auth_type option:selected").text();
        
        var auth_table_trs = $("#asm_auth_table>tbody").find("tr");

        var auth_data = {"authenticationType": api_auth_type, "credentials":{}};

        for(var i=0; i<auth_table_trs.length; i++){
            var header_td = $(auth_table_trs[i]).find("td")[0];
            var value_td = $(auth_table_trs[i]).find("td")[1];

            var header = $(header_td).text();
            var value = $(value_td).text();

            if((header==="")||(header === "No data available in table")){
                continue;
            }
            else{
                auth_data["credentials"][header] = value;
            }
        }

        var auth_data_arr = [];
        auth_data_arr.push(auth_data);

        var auth_data_str = JSON.stringify(auth_data_arr);

        var api_enabled = 0;
        if($("#asm_enabled").prop("checked")) api_enabled = 1;

        var api_source_data = {            
            "APIEndpoint": api_endpoint,
            "OutputIsXML": api_output_xml,
            "Authentication": auth_data_str,            
            "Enabled": api_enabled
        };


        if(api_source_id == ""){ //add a new API Source
            
            api_source_data["APISource"] = api_source_name;
            block_ui();
            AddDataApi(URL_API_SOURCES, api_source_data, token, db, function(response){
                if(response != "error"){
                    var res_obj = JSON.parse(response);
                    var api_source_id = res_obj.ID;
                    var headers = process_headers([], api_source_id, api_source_name);
                    bulkAddAPI(URL_API_HEADERS, headers["new_headers"], token, db, function()
                    {
                        var data = {id: api_source_id, text: api_source_name};

                        var newOption = new Option(data.text, data.id, false, false);
                        $('#emm_api_source').append(newOption).trigger('change');

                        var $toast = toastr["success"]("The API Source is saved.", "Success");
                        $("#api_source_modal").modal("hide"); 
                        unblock_ui();  
                    }); 
                }
            });
        }
        else{ //update the API source change
            block_ui();
            var url = URL_API_SOURCES + "/" + api_source_id;
            UpdateDataAPI(url, api_source_data, token, db, function(response){
                console.log(response);
                if(response != "error"){

                    var ori_headers_str = $("#asm_apiheaders").val();
                    var ori_headers = JSON.parse(ori_headers_str);
                    var headers = process_headers(ori_headers, api_source_id, api_source_name);


                    bulkAddAPI(URL_API_HEADERS, headers["new_headers"], token, db, function(){
                        bulkUpdateAPI(URL_API_HEADERS, headers["updated_headers"], token, db, function(){
                            bulkDeleteAPI(URL_API_HEADERS, headers["delete_headers"], token, db, function()
                            {
                                var $toast = toastr["success"]("The API Source is saved.", "Success");
                                $("#api_source_modal").modal("hide"); 
                                unblock_ui();  
                            });
                        });
                    });                                      
                }
            })
        }
    });

    //-------- edit header modal
    var ehm_table = $('#ehm_table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',    
        bSort: false,    
        "fnDrawCallback": function () {
            if(this.DataTable().data().length > 0){
                $('#ehm_table>tbody>tr>td:nth-child(1), #ehm_table>tbody>tr>td:nth-child(2)').editable({
                   url: '',
                   type: 'text', 
                   mode: 'inline',
                   showbuttons: false,
                });
            }            
        }            
    });

    $(document).on('click', "#edit_header_modal a", function(e){
        var target = $(e.currentTarget);      
        var tr = $(e.currentTarget.closest("tr"));
        var btn_class = $(e.currentTarget).attr("class");            
        if(btn_class == "delete-btn"){
            var header_id = target.data("headerid");
            bootbox.confirm("Are you sure to delete this API Header?", function(result) {
                if(result){
                    var deleted_row = ehm_table.row(tr);
                    ehm_table.row(deleted_row).remove().draw();
                }
            }); 
        }
    });

    $("#add_api_header_btn").on("click", function(a){        
        ehm_table.row.add( ["", "", '<a href="javascript:;" class="delete-btn" data-headerid="0"><i class="fa fa-trash-alt"></i></a>'] ).draw();        
    });

    $('#edit_header_modal').on('shown.bs.modal', function(){        
        ehm_table.columns.adjust().draw();
    });

    //----------
    


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
        var api_method_name = $("#emm_api_method_name option:selected").text();
            
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
                $("#edit_parameter_modal").modal("show");
            }
            else{
                //open_edit_parameter_modal("sampledata/apiheader.txt", token, db);    
            }            

        }
    });  

    function process_parameters(ori_parameters, api_source_id, api_source_name, api_method_id, api_method_name){
        var parameter_table_trs = $("#epm_table>tbody").find("tr");

        var new_params = [];
        var updated_params = [];
        
        for(var i=0; i<parameter_table_trs.length; i++){
            var header_td = $(parameter_table_trs[i]).find("td")[1];
            var value_td = $(parameter_table_trs[i]).find("td")[2];
            var delete_td = $(parameter_table_trs[i]).find("td")[3];

            var header = $(header_td).text();
            var value = $(value_td).text();
            var param_id = $(delete_td).find("a").data("parameterid");

            var data = {"ID": param_id, "APISourceID": api_source_id, "APISource": api_source_name, "APIMethodID": api_method_id, "APIMethod": api_method_name, "Parameter": header, "DefaultValue": value, "Enabled": 1};

            if(header==""){
                continue;
            }
            else{
                if(param_id == "0"){
                    new_params.push(data);
                }
                else{
                    for(var j=0; j<ori_parameters.length; j++){
                        if(ori_parameters[j].ID == param_id){
                            if((ori_parameters[j].Parameter != header) || (ori_parameters[j].DefaultValue!=value)){
                                updated_params.push(data);                                
                            }
                            ori_parameters.splice(j, 1);
                            break;
                        }
                    }
                }                
            }
        }

        var res_data = {"new_parameters": new_params, "updated_parameters": updated_params, "delete_parameters": ori_parameters};
        return res_data;

    }
    $(document).on('click', "#emm_save_btn", function(e){
        var api_source_id = $("#emm_api_source").val();
        var api_source_name = $("#emm_api_source option:selected").text();
        var api_method_name = $("#emm_api_method_name option:selected").text();
        var api_method = $("#emm_api_method").val();
        var api_load_type = $("#emm_api_load_type option:selected").text();
        var api_start_from = $("#emm_start_from").val();
        var api_last = $("#emm_last").val();

        var api_method_enabled = 0;
        if($("#emm_enabled").prop("checked")) api_method_enabled = 1;

        var api_method_data = {
            "APISourceID": api_source_id,
            "APISource": api_source_name,
            "APIMethodName": api_method_name,
            "APIMethod": api_method,
            "APIType": api_load_type,
            "LoopBasedOnINTStartFrom": api_start_from,
            "LoopBasedOnINTLast": api_last,
            "Enabled" : api_method_enabled
        };

        //add new method
        block_ui();
        AddDataApi(URL_API_METHODS, api_method_data, token, db, function(response){
            if(response != "error"){
                var res_obj = JSON.parse(response);
                var api_method_id = res_obj.ID;
                var params = process_parameters([], api_source_id, api_source_name, api_method_id, api_method_name);
                bulkAddAPI(URL_API_PARAMETERS, params.new_parameters, token, db, function()
                {
                    //add datatable and refresh
                    

                    var method_data_str = encodeURIComponent(JSON.stringify(res_obj));
                    add_new_row_maintable(res_obj, method_data_str);
                    maintable.draw();
                    var $toast = toastr["success"]("The API Source is saved.", "Success");
                    $("#edit_method_modal").modal("hide"); 
                    unblock_ui();  
                }); 
            }
        });

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
                    '<a href="javascript:;" class="delete-btn" data-parameterid="' + ap[i]["ID"] + '"><i class="fa fa-trash-alt"></a>'
                    ]);
            }            
            unblock_ui();
            $("#edit_parameter_modal").modal("show");
        });   
    }

    var epm_table = $('#epm_table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',   
        bSort: false,       
        "fnDrawCallback": function () {
            if(this.DataTable().data().length > 0){
                $('#epm_table>tbody>tr>td:nth-child(2), #epm_table>tbody>tr>td:nth-child(3)').editable({
                   url: '',
                   type: 'text', 
                   mode: 'inline',
                   showbuttons: false,               
                });
            }            
        }
        
    });

    $("#add_api_parameter_btn").on("click", function(a){
        var api_method_name = $("#epm_api_method_name").val();
        epm_table.row.add( [api_method_name, "", "", '<a href="javascript:;" class="delete-btn" data-parameterid="0"><i class="fa fa-trash-alt"></a>'] ).draw();
    });

    $(document).on('click', "#edit_parameter_modal a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
        var tr = $(e.currentTarget.closest("tr"));
        if(target == "delete-btn"){
            var parameter_id = target.data("parameterid");
            bootbox.confirm("Are you sure to delete this API Parameter?", function(result) {
                if(result){
                    var deleted_row = epm_table.row(tr);
                    epm_table.row(deleted_row).remove().draw();
                }
            }); 
        }
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
            $("#asm_auth_type").html("");

            $.each(response, function(index, val){ 
                var auth_type = JSON.parse(val.AuthenticationType);
                var data = {value:val.id, text:val.AuthenticationTypeDescription, auth_type: auth_type};
                g_auth_data_arr.push(data);  

                $("#asm_auth_type").append('<option value="'+ val.id +'" data-type="' + encodeURIComponent(val.AuthenticationType) + '">'+ val.AuthenticationTypeDescription +'</option>');              
            });


            init_maintable();    
        })
        
    });

})(jQuery)