
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    /**************************************** Profile Picture ********************************************/

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val("");
    };

    self.upload_picture = function (event) {
        // Reads the file.
        var file = document.getElementById('file_input').files[0];
        if (file) {
            // Gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));

                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };

    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.vue.show_pic = true;
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);

        var add = function () {
            $.post(add_profile_picture_url,
                {
                    profile_picture_url: get_url,
                },
                function (data) {})
        };
        setTimeout(add, 1000);

        // TODO: recursive method to wait for ajax status of get_url, instead of timeout
    };

    /*
    function get_profile_picture_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
        };
        return profile_picture_url + "&" + $.param(pp);
    }

    self.get_profile_picture = function (user_id) {
        $.getJSON(get_profile_picture_url(0, 1), {
            user_id: user_id,
        },
            function (data) {
                console.log(user_id);
                self.vue.profile_picture = data.profile_picture;
        })
    };
    */


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_uploading: false,
            pic_url: null,
            show_pic: false,
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_picture: self.upload_picture,
        }

    });

    //self.get_profile_picture();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});


