

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            self.vue.img_url = reader.result;
        }, false);
        if (file) {
            reader.readAsDataURL(file);
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
        self.vue.show_img = true;
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);

        console.log("compensate for latency");
        var add = function () {
            $.post(add_image_url,
                {
                    image_url: get_url,
                },
                function (data) {
                    self.vue.user_images.unshift(data.user_images);
                    enumerate(self.vue.user_images);
                })
        }
        setTimeout(add, 1500);
        // TODO: recursive method to wait for ajax status of get_url, instead of timeout
    };

    function get_user_images_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx,
        };
        return user_images_url + "&" + $.param(pp);
    }

    self.get_user_images = function (user_id) {
        $.getJSON(get_user_images_url(0, 1), {
            user_id: user_id,
        },
            function (data) {
                console.log(user_id);
                //console.log(data.user_images);
                self.vue.user_images = data.user_images;
                enumerate(self.vue.user_images);
        })
    };

    self.get_users = function () {
        $.getJSON(get_user_url, function (data) {
            self.vue.users = data.users;
            enumerate(self.vue.users);
        })
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            user_images: [],
            users: [],
            is_uploading: false,
            img_url: null,
            show_img: false,
            self_page: true // Leave it to true, so initially you are looking at your own images.
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            get_user_images: self.get_user_images,
        }

    });

    self.get_user_images();
    self.get_users();

    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
