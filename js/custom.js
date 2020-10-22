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
    }


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
        });
    }


    function init_maintable(maintable, apisources, apimethods){
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
        ]      
    });

    var esm_auth_table = $('#esm-auth-table').DataTable({
        "scrollX": true,
        "scrollY": true,
        "dom": 't',                
    });

    $(document).on('click', "#maintable_wrapper tbody a", function(e){
        var target = $(e.currentTarget);            
        var btn_class = $(e.currentTarget).attr("class");
            
        if(btn_class == "aipsource-edit-btn"){
            var as = {
                "ID": 2,
                "APISource": "cvr",
                "APIEndpoint": "http://distribution.virk.dk/cvr-permanent/virksomhed/",
                "OutputIsXML": 0,
                "Authentication": "[{\"authenticationType\":\"basic\",\"credentials\":{\"UserId\":\"Datawareness_CVR_\",\"Password\":\"123abc\"}}]",
                "SortOrder": 10,
                "Enabled": 42,
                "DateCreated": "2020-06-15T12:44:47.043000Z"
            };

            $("#esm-title").text("Edit " + as["APISource"]);
            $("#esm-endpoint").val(as["APIEndpoint"]);

            if(as["OutputIsXML"] == 0){
                $("#esm-outputxml").prop("checked", false);
            }
            else{
                $("#esm-outputxml").prop("checked", true);
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
        }
    });

    $('#edit-source-modal').on('shown.bs.modal', function(){        
        esm_auth_table.columns.adjust().draw();
    });

    var apisources = [
        {
            "ID": 1,
            "APISource": "economic",
            "APIEndpoint": "https://restapi.e-conomic.com/",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"header\",\"credentials\":{}}]",
            "SortOrder": 5,
            "Enabled": 42,
            "DateCreated": "2020-06-15T12:44:46.997000Z"
        },
        {
            "ID": 2,
            "APISource": "cvr",
            "APIEndpoint": "http://distribution.virk.dk/cvr-permanent/virksomhed/",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"basic\",\"credentials\":{\"UserId\":\"Datawareness_CVR_\",\"Password\":\"123abc\"}}]",
            "SortOrder": 10,
            "Enabled": 42,
            "DateCreated": "2020-06-15T12:44:47.043000Z"
        },
        {
            "ID": 3,
            "APISource": "googlesheets",
            "APIEndpoint": "",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"googlesheets\",\"credentials\":{\"token\": \"-o-VA7K6HyXF2frQ26BUxynjLGwYqu_d2On0Sj_0\", \"refresh_token\": \"A3_E0Yfdqj9xNPSpmvCPU\", \"token_uri\": \"https://oauth2.googleapis.com/token\", \"client_id\": \"0i3v8r2c9.apps.googleusercontent.com\",",
            "SortOrder": 15,
            "Enabled": 0,
            "DateCreated": "2020-09-05T03:49:18.370000Z"
        },
        {
            "ID": 4,
            "APISource": "timelog",
            "APIEndpoint": "https://app1.timelog.com/datawareness/service.asmx/",
            "OutputIsXML": 1,
            "Authentication": "[{\"authenticationType\":\"parameter\",\"credentials\":{}}]",
            "SortOrder": 20,
            "Enabled": 42,
            "DateCreated": "2020-09-05T04:13:06.950000Z"
        },
        {
            "ID": 5,
            "APISource": "upodi",
            "APIEndpoint": "https://api.upodi.io/v3/",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"bearer\",\"credentials\":{\"Bearer\":\"xxx\"}}]",
            "SortOrder": 25,
            "Enabled": 42,
            "DateCreated": "2020-09-05T04:29:17.893000Z"
        },
        {
            "ID": 6,
            "APISource": "upodi_odata",
            "APIEndpoint": "https://odataprovider.azurewebsites.net/api/16febdd9-7a6d-438f-b63c-61861d96ebfb/",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"no auth\",\"credentials\":{}}]",
            "SortOrder": 30,
            "Enabled": 42,
            "DateCreated": "2020-09-05T04:29:39.070000Z"
        },
        {
            "ID": 7,
            "APISource": "wootric",
            "APIEndpoint": "https://api.wootric.com/",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"session bearer\",\"credentials\":{\"grant_type\":\"password\",\"username\":\"pi@testing.dk\",\"password\":\"123mnb\", \"API method\":\"post\", \"url\":\"https://api.wootric.com/oauth/token\"}}]",
            "SortOrder": 17,
            "Enabled": 0,
            "DateCreated": "2020-09-07T12:44:56.093000Z"
        },
        {
            "ID": 9,
            "APISource": "bc",
            "APIEndpoint": "https://api.businesscentral.dynamics.com/v2.0/",
            "OutputIsXML": 0,
            "Authentication": "[{\"authenticationType\":\"basic\",\"credentials\":{\"UserId\":\"myuser\",\"Password\":\"asdfasdf\"}}]",
            "SortOrder": 1,
            "Enabled": 1,
            "DateCreated": "2020-09-04T08:19:32.110000Z"
        }
    ];

    var apimethods = [
        {
            "ID": 6,
            "APISource": "cvr",
            "APIMethodName": "search",
            "APIMethod": "_search",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 1,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-06-15T12:35:57.850000Z"
        },
        {
            "ID": 11,
            "APISource": "economic",
            "APIMethodName": "self",
            "APIMethod": "self",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 5,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-06-15T12:35:58.287000Z"
        },
        {
            "ID": 12,
            "APISource": "timelog",
            "APIMethodName": "GetProjectsRaw",
            "APIMethod": "GetProjectsRaw",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 10,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-09-05T04:14:29.923000Z"
        },
        {
            "ID": 14,
            "APISource": "upodi_odata",
            "APIMethodName": "discountconsumers",
            "APIMethod": "DiscountConsumer?$top=1",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 40,
            "APISample": 1,
            "Enabled": 1,
            "DateCreated": "2020-04-20T18:18:07.323000Z"
        },
        {
            "ID": 16,
            "APISource": "upodi",
            "APIMethodName": "productplancharges",
            "APIMethod": "productplans/7ec7b04c-bf97-43f8-b51b-0acb09ad325e",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 30,
            "APISample": 1,
            "Enabled": 1,
            "DateCreated": "2020-02-17T12:33:46.340000Z"
        },
        {
            "ID": 17,
            "APISource": "googlesheets",
            "APIMethodName": "Budget1",
            "APIMethod": "{\"spreadsheetId\":\"1cRPKZL-cySr0j8QYUaqYV06mZ_7KRZFO36xOs3cM2sg\",\"range\":\"Sheet1!A1:L22\"}",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 35,
            "APISample": 1,
            "Enabled": 1,
            "DateCreated": "2020-09-05T05:02:11.150000Z"
        },
        {
            "ID": 18,
            "APISource": "googlesheets",
            "APIMethodName": "Budget2",
            "APIMethod": "{\"spreadsheetId\":\"1xpo8ShlY2TjfU0wmDQyr-DJM0jBVyE-Psaj4m1PshGA\",\"range\":\"Sheet1!A1:L22\"}",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 17,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-09-07T11:37:10.493000Z"
        },
        {
            "ID": 19,
            "APISource": "wootric",
            "APIMethodName": "end_user",
            "APIMethod": "v1/end_users",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": "[APIData_id]",
            "SortOrder": 17,
            "APISample": 2,
            "Enabled": 0,
            "DateCreated": "2020-09-07T13:02:51.307000Z"
        },
        {
            "ID": 22,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=45&per_page=50&created[lt]=1577836800&sort_order=asc",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": "[APIData_id]",
            "SortOrder": 1,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-14T13:32:21.327000Z"
        },
        {
            "ID": 23,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=1&per_page=50&created[gte]=1598918400&created[lte]=1601510399&sort_order=asc",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 1,
            "KeyColumnDefinition": "[APIData_id]",
            "SortOrder": 3,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-09-14T13:32:21.327000Z"
        },
        {
            "ID": 26,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1575158400&created[lte]=1577750400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 5,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:35.710000Z"
        },
        {
            "ID": 27,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1559347200&created[lte]=1561852800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:36.297000Z"
        },
        {
            "ID": 28,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1543622400&created[lte]=1546214400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:37.180000Z"
        },
        {
            "ID": 29,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1496275200&created[lte]=1498780800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:37.740000Z"
        },
        {
            "ID": 30,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1512086400&created[lte]=1514678400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:38.337000Z"
        },
        {
            "ID": 31,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1527811200&created[lte]=1530316800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:38.930000Z"
        },
        {
            "ID": 32,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1567296000&created[lte]=1569801600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:39.513000Z"
        },
        {
            "ID": 33,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1577836800&created[lte]=1580428800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:40.170000Z"
        },
        {
            "ID": 34,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1535760000&created[lte]=1538265600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:40.763000Z"
        },
        {
            "ID": 35,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1598918400&created[lte]=1601424000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:41.353000Z"
        },
        {
            "ID": 36,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1504224000&created[lte]=1506729600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:41.927000Z"
        },
        {
            "ID": 37,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1519862400&created[lte]=1522454400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:42.523000Z"
        },
        {
            "ID": 38,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1488326400&created[lte]=1490918400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:43.110000Z"
        },
        {
            "ID": 39,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1569888000&created[lte]=1572480000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:43.667000Z"
        },
        {
            "ID": 40,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1585699200&created[lte]=1588204800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:44.273000Z"
        },
        {
            "ID": 41,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1538352000&created[lte]=1540944000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:44.840000Z"
        },
        {
            "ID": 42,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1522540800&created[lte]=1525046400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:45.410000Z"
        },
        {
            "ID": 43,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1554076800&created[lte]=1556582400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:45.977000Z"
        },
        {
            "ID": 44,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1491004800&created[lte]=1493510400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:47.040000Z"
        },
        {
            "ID": 45,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1593561600&created[lte]=1596153600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:48.257000Z"
        },
        {
            "ID": 46,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1561939200&created[lte]=1564531200&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:48.820000Z"
        },
        {
            "ID": 47,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1514764800&created[lte]=1517356800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:49.370000Z"
        },
        {
            "ID": 48,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1530403200&created[lte]=1532995200&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:49.980000Z"
        },
        {
            "ID": 49,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1546300800&created[lte]=1548892800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:50.547000Z"
        },
        {
            "ID": 50,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1596240000&created[lte]=1598832000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:51.107000Z"
        },
        {
            "ID": 51,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1564617600&created[lte]=1567209600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:51.673000Z"
        },
        {
            "ID": 52,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1580515200&created[lte]=1582934400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:52.250000Z"
        },
        {
            "ID": 53,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1506816000&created[lte]=1509408000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:52.843000Z"
        },
        {
            "ID": 54,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1548979200&created[lte]=1551312000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:53.417000Z"
        },
        {
            "ID": 55,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1517443200&created[lte]=1519776000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:54.010000Z"
        },
        {
            "ID": 56,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1588291200&created[lte]=1590883200&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:54.613000Z"
        },
        {
            "ID": 57,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1556668800&created[lte]=1559260800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:55.200000Z"
        },
        {
            "ID": 58,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1498867200&created[lte]=1501459200&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:55.810000Z"
        },
        {
            "ID": 59,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1525132800&created[lte]=1527724800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:56.377000Z"
        },
        {
            "ID": 60,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1590969600&created[lte]=1593475200&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:56.950000Z"
        },
        {
            "ID": 61,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1533081600&created[lte]=1535673600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:57.517000Z"
        },
        {
            "ID": 62,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1501545600&created[lte]=1504137600&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:58.097000Z"
        },
        {
            "ID": 63,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1572566400&created[lte]=1575072000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:58.683000Z"
        },
        {
            "ID": 64,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1583020800&created[lte]=1585612800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:59.267000Z"
        },
        {
            "ID": 65,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1541030400&created[lte]=1543536000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:40:59.923000Z"
        },
        {
            "ID": 66,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1509494400&created[lte]=1512000000&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:41:00.510000Z"
        },
        {
            "ID": 67,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1493596800&created[lte]=1496188800&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:41:01.070000Z"
        },
        {
            "ID": 68,
            "APISource": "wootric",
            "APIMethodName": "response",
            "APIMethod": "v1/responses?page=<INT>&per_page=50&created[gte]=1551398400&created[lte]=1553990400&sort_order=asc",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 1,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 71,
            "APISample": 0,
            "Enabled": 0,
            "DateCreated": "2020-09-23T07:41:01.627000Z"
        },
        {
            "ID": 69,
            "APISource": "economic",
            "APIMethodName": "customers",
            "APIMethod": "customers?skippages=<INT>&pagesize=1000",
            "APIType": "LoopBasedOnINT",
            "LoopBasedOnINTStartFrom": -1,
            "LoopBasedOnINTLast": 8,
            "CreateView": 0,
            "KeyColumnDefinition": null,
            "SortOrder": 5,
            "APISample": 0,
            "Enabled": 1,
            "DateCreated": "2020-09-23T08:13:53.920000Z"
        },
        {
            "ID": 72,
            "APISource": "bc",
            "APIMethodName": "regions",
            "APIMethod": "d7fe13fe-91f8-4625-826d-8b11d0d57852/Production/ODataV4/Company(%27Hjerteforeningen%27)/CampRegion",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 1,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-09-27T10:43:42.770000Z"
        },
        {
            "ID": 73,
            "APISource": "bc",
            "APIMethodName": "taxonomy_member",
            "APIMethod": "d7fe13fe-91f8-4625-826d-8b11d0d57852/Production/ODataV4/Company(%27Hjerteforeningen%27)/CampTaxonomyMemberHJF?$filter=Camp_Last_Modified_Date_Time%20gt%202020-09-24T00:00:00Z",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 3,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-10-04T19:11:35.467000Z"
        },
        {
            "ID": 74,
            "APISource": "bc",
            "APIMethodName": "customer",
            "APIMethod": "d7fe13fe-91f8-4625-826d-8b11d0d57852/Production/ODataV4/Company(%27Hjerteforeningen%27)/CampCustomerHJF?$filter=Last_Modified_Date_Time%20gt%202020-09-24T00:00:00Z",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 5,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-10-04T19:48:57.840000Z"
        },
        {
            "ID": 75,
            "APISource": "bc",
            "APIMethodName": "subscription_member",
            "APIMethod": "d7fe13fe-91f8-4625-826d-8b11d0d57852/Production/ODataV4/Company(%27Hjerteforeningen%27)/CampSubscriptionMemberHJF?$filter=Camp_Last_Modified_Date_Time%20gt%202020-09-24T00:00:00Z",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 7,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-10-04T19:49:18.667000Z"
        },
        {
            "ID": 76,
            "APISource": "bc",
            "APIMethodName": "collection_line",
            "APIMethod": "d7fe13fe-91f8-4625-826d-8b11d0d57852/Production/ODataV4/Company(%27Hjerteforeningen%27)/CampCollectionLineHJF?$filter=Camp_Last_Modified_Date_Time%20gt%202020-09-24T00:00:00Z",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 9,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-10-04T19:49:43.133000Z"
        },
        {
            "ID": 77,
            "APISource": "bc",
            "APIMethodName": "collection_header",
            "APIMethod": "d7fe13fe-91f8-4625-826d-8b11d0d57852/Production/ODataV4/Company(%27Hjerteforeningen%27)/CampCollectionHeaderHJF?$filter=Camp_Last_Modified_Date_Time%20gt%202020-09-24T00:00:00Z",
            "APIType": "Simple",
            "LoopBasedOnINTStartFrom": 0,
            "LoopBasedOnINTLast": 0,
            "CreateView": 1,
            "KeyColumnDefinition": null,
            "SortOrder": 11,
            "APISample": 2,
            "Enabled": 1,
            "DateCreated": "2020-10-04T19:50:06.610000Z"
        }
    ]

    init_maintable(maintable, apisources, apimethods);    



})(jQuery)