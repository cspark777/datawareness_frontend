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

    function setCookie(cname, cvalue, hours) {
        var d = new Date();
        d.setTime(d.getTime() + (hours*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getAuthID(auth_data_arr, curr_data){
        for(var i=0; i<auth_data_arr.length; i++){
            if(auth_data_arr[i].auth_type[0].authenticationType == curr_data.authenticationType)
            {
                return auth_data_arr[i].value;
            }
        }
    }

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
            alert(response.statusText);
            window.location.href = origin + "login.html";            
            //callback(response);            
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
            callback("error");
        });
    }  

    function AddDataApi(url, data, token, db, callback){
        var _url = url + "?subscription=" + db;
        var form = new FormData();
        $.each(data, function(key, val){
            form.append(key, val);
        });
        

        var settings = {
            "url": _url,
            "method": "POST",
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
            callback("error");
        });
        

        //callback(100); //return inserted id
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
            callback("success");
        }).fail(function(response){            
            callback("error");            
        });
    }

    function bulkAddAPI(url, data, token, db, callback){
        recursiveAdd = function(_index){
            var len = data.length;
            if(_index >= len){
                callback();
                return;
            }

            AddDataApi(url, data[_index], token, db, function(response){
                if(response == "error"){
                    console.log("add error");
                }
                else{
                    console.log("add success");
                }
                recursiveAdd(_index+1);
            });
        }

        recursiveAdd(0);
    }

    function bulkUpdateAPI(url, data, token, db, callback){
        recursiveUpdate = function(_index){
            var len = data.length;
            if(_index >= len){
                callback();
                return;
            }

            var _url = url + "/" + data[_index].ID;

            UpdateDataAPI(_url, data[_index], token, db, function(response){
                if(response == "error"){
                    console.log("update error");
                }
                else{
                    console.log("update success");
                }
                recursiveUpdate(_index+1);
            });
        }

        recursiveUpdate(0);
    }

    function bulkDeleteAPI(url, data, token, db, callback){
        recursiveDelete = function(_index){
            var len = data.length;
            if(_index >= len){
                callback();
                return;
            }

            var _url = url + "/" + data[_index].ID;

            deleteDataAPI(_url, token, db, function(response){
                if(response == "error"){
                    console.log("update error");
                }
                else{
                    console.log("update success");
                }
                recursiveDelete(_index+1);
            });
        }

        recursiveDelete(0);
    }