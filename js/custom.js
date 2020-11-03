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
        block_ui();
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

                var api_method = am["APIMethod"];

                var api_type = am["APIType"];

                var loop_based_int_start_from = am["LoopBasedOnINTStartFrom"];
                var loop_based_int_last = am["LoopBasedOnINTLast"];

                var loop_class = "";
                if(api_type != "LoopBasedOnINT"){
                    loop_class = "td-disable-content";                    
                }
                loop_based_int_start_from = '<div class="' + loop_class + '">' + loop_based_int_start_from + '</div>';
                loop_based_int_last = '<div class="' + loop_class + '">' + loop_based_int_last + '</div>';

                var enabled = "";
                if(am["Enabled"] == 1){
                    enabled = '<input type="checkbox" class="enable-btn" checked>';
                }
                else{
                    enabled = '<input type="checkbox" class="enable-btn">';
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
        "fnDrawCallback": function (e) {
            $('#maintable>tbody>tr td:nth-child(3)').editable({
                url: '',
                type: 'textarea', 
                mode: 'inline',
                showbuttons: true, 
            });
            $('#maintable>tbody>tr td:nth-child(3)').editable('disable');
            
            $('#maintable>tbody>tr td:nth-child(5), td:nth-child(6)').editable({
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
            $('#maintable>tbody>tr td:nth-child(5), td:nth-child(6)').editable('disable');

            $('#maintable>tbody>tr td:nth-child(4)').editable({
                url: '', 
                type:'select',               
                mode: 'inline',
                showbuttons: false,                 
                source: [ 
                 {value: 0, text: 'Auth type1'},
                 {value: 1, text: 'Auth type2'},
                 {value: 2, text: 'Auth type3'},
                 {value: 3, text: 'Auth type4'},
                 {value: 4, text: 'Auth type5'}                 
               ]
            });
            $('#maintable>tbody>tr td:nth-child(4)').editable('disable');

            $('#maintable>tbody>tr td:nth-child(2)').on("click", function(e){  
                if(e.currentTarget.parentElement["children"][7]["children"][1].style["display"] == "none"){
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
                var pos = g_clicked_method_name_td.position();
                var top = main_table_body_pos.top - main_table_div_pos.top + pos.top;
                var left = main_table_body_pos.left - main_table_div_pos.left + pos.left;

                var width = g_clicked_method_name_td.width() + 20;
                
                $("#api_method_name_select_div").css({top: top+5, left: left+3, display: 'block', width: width});   

                $("#api_method_name_select").val('');             
                $("#api_method_name_select").select2('open', {tags:true});                
            });
        }      
    });

    $("div.toolbar").html('<a class="btn add-method-btn">Add</a>');
    $(document.querySelector('.add-method-btn')).on('click', function(e){
        $("#emm_api_source_id").val("");
        $("#emm_api_method_id").val("");
        $("#emm_api_method").val("");
        $("#emm_enabled").prop("checked", false);

        block_ui();

        $("#emm_api_source").destroySelect2();
        $("#emm_api_source").select2({tags: false});

        getGetDataFromAPI(URL_API_SOURCES, token, db, function(response){
            var api_sources = response;
            var uniq_api_source_names = [];

            $("#emm_api_source").destroySelect2();
            for(var i=0; i<api_sources.length; i++){
                if(uniq_api_source_names.indexOf(api_sources[i].APISource) == -1){
                    $("#emm_api_source").append("<option value='"+ api_sources[i].ID +"'>"+ api_sources[i].APISource +"</option>"); 
                    uniq_api_source_names.push(api_sources[i].APISource);
                }
                
            }
            $("#emm_api_source").select2({tags: false});
            $("#emm_api_source").val(api_sources[0]);

            getGetDataFromAPI(URL_API_METHODS + "/" + 6, token, db, function(response){
                var api_methods = response;
                $("#emm_api_method_name").destroySelect2();
                for(var i=0; i<api_methods.length; i++){
                    $("#emm_api_method_name").append("<option value='"+ api_methods[i].ID +"'>"+ api_methods[i].APIMethodName +"</option>");
                }
                $("#emm_api_method-name").select2({tags: true});
                $("#edit_method_modal").modal("show");
                unblock_ui();
            });
        });
    });

    $(document).on('click', "#maintable_wrapper tbody>tr a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "api-source-edit-btn"){            
            var sourceid = target.data("sourceid");            
            open_apisource_modal(sourceid);            
        }
        else if(btn_class == "edit-btn"){
            console.log(e);
            $(e.currentTarget.parentElement).css('display', 'none');
            $(e.currentTarget.parentElement.parentElement).find(".method-save-div").css("display", "block");

            $(e.currentTarget.closest("tr")["children"][2]).editable("enable");
            $(e.currentTarget.closest("tr")["children"][3]).editable("enable");
            if($(e.currentTarget.closest("tr")["children"][3]).text() == "LoopBasedOnINT"){
                $(e.currentTarget.closest("tr")["children"][4]).editable("enable");
                $(e.currentTarget.closest("tr")["children"][5]).editable("enable");
            }
        }
        else if(btn_class=="cancel-btn"){
            var method_data = JSON.parse(decodeURIComponent($(e.currentTarget.closest("tr")["children"][1]["children"][0]).data("json")));

            $(e.currentTarget.closest("tr")["children"][1]["children"][0]).text(method_data["APIMethodName"]);
            $(e.currentTarget.closest("tr")["children"][2]).text(method_data["APIMethod"]);
            $(e.currentTarget.closest("tr")["children"][3]).text(method_data["APIType"]);
            $(e.currentTarget.closest("tr")["children"][4]["children"][0]).text(method_data["LoopBasedOnINTStartFrom"]);
            $(e.currentTarget.closest("tr")["children"][5]["children"][0]).text(method_data["LoopBasedOnINTLast"]);
            if(method_data["Enabled"] == 1){
                $(e.currentTarget.closest("tr")["children"][6]["children"][0]).prop('checked', true);
            }
            else{
                $(e.currentTarget.closest("tr")["children"][6]["children"][0]).prop('checked', false);
            }

            $(e.currentTarget.parentElement).css('display', 'none');
            $(e.currentTarget.parentElement.parentElement).find(".method-edit-div").css("display", "block");

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
            $('#asm_auth_table tbody td:nth-child(1), td:nth-child(2)').editable({
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
    $("#emm_api_source").on('select2:select', function(e){
        var emm_api_source_id = $("#emm_api_source").val();
        block_ui();
        getGetDataFromAPI(URL_API_METHODS + "/" + 6, token, db, function(response){
            var api_methods = response;
            $("#emm_api_method_name").destroySelect2();
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
            $('#epm_table tbody td:nth-child(2), td:nth-child(3)').editable({
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
            $('#ehm_table tbody td:nth-child(1), td:nth-child(2)').editable({
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

    init_maintable();    



})(jQuery)