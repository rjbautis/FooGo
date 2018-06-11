// This is the js for the default/index.html view.

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
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {
            e._idx = k++;
        });
    };


    // Grab urls from the database table within indices start up to end, rather than all of them
    function get_listings_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        console.log(listings_url + "?" + $.param(pp));
        return listings_url + "?" + $.param(pp);
    }

    // Get listings from database within indices 0 up to 10
    self.get_listings = function() {
        // Return a json containing the database information
        console.log("this category is " + this_category);
        $.getJSON(get_listings_url(0, 10),
            {
                category: this_category,
            },

            function(data) {
                self.vue.listings = data.listings;
                self.vue.logged_in = data.logged_in;

                // Call enumerate function such that the array of listings is reordered by idx
                enumerate(self.vue.listings);
        });
    };


    // Toggles add button
    self.add_listing_button = function () {
        self.vue.is_adding_listing = !self.vue.is_adding_listing;
    };


    // Makes jquery api call to add_listing_url with the submitted form data
    self.add_listing = function () {
        $.post(add_listing_url,
            {
                driver_name: self.vue.form_driver_name,
                post: self.vue.form_post,
                category: this_category,
                food_location: self.vue.form_food_location,
                fee: self.vue.form_fee
            },
            function (data) {
                $.web2py.enableElement($("#add_listing_submit"));
                console.log(data);

                self.vue.listings.unshift(data.title);
                enumerate(self.vue.listings);
                self.vue.is_adding_listing = false;
            });
    };

    // Makes jquery api call to edit_listing_url with the updated/edited driver_name and post content
    self.edit_listing_submit = function () {
        $.post(edit_listing_url,
            {
                driver_name_content: self.vue.edit_driver_name_content,
                post_content: self.vue.edit_post_content,
                id: self.vue.edit_id
            },
            function (data) {
                $.web2py.enableElement($("#edit_listing_submit"));
                self.vue.is_editing_listing = !self.vue.is_editing_listing;
            });
    };


    self.edit_listing = function(listing_idx) {
        // Remember the original listing (in case the user decides to cancel the edit)
        self.vue.original_driver_name = self.vue.listings[listing_idx].driver_name;
        self.vue.original_post = self.vue.listings[listing_idx].post;
        self.vue.original_fee = self.vue.listings[listing_idx].fee;

        self.vue.is_editing_listing = !self.vue.is_editing_listing;
        self.vue.edit_id = self.vue.listings[listing_idx].id;
    };

    self.cancel_edit = function (listing_idx) {
        // if user canceled the edit, let the current listing being edited be returned to original state
        self.vue.listings[listing_idx].driver_name = self.vue.original_driver_name;
        self.vue.listings[listing_idx].post = self.vue.original_post;
        self.vue.listings[listing_idx].fee = self.vue.original_fee;

        self.vue.is_editing_listing = !self.vue.is_editing_listing;
        self.vue.edit_id = 0;

    };

    // Deletes listing from the webpage (and the database using del_memo_url)
    // Uses listing_idx (instantiated by emuerate() function for all listings displayed) instead of memo.id (from database)
    self.delete_listing = function(listing_idx) {
        console.log(listing_idx);
        $.post(del_listing_url,
            {
                listing_id: self.vue.listings[listing_idx].id
            },
            function () {
                self.vue.listings.splice(listing_idx, 1);
                enumerate(self.vue.listings);
            }
        );
        console.log(self.vue.listings);
    };



    /**************************************** Comments ********************************************/

    self.get_listing_comments = function(listing_idx) {
         // Return a json containing the database information
        console.log("the current listing is " + self.vue.listings[listing_idx].id);
        $.getJSON(get_listing_comments_url,
            {
                parent_listing_id: self.vue.listings[listing_idx].id,
            },

            function(data) {
                self.vue.comments = data.comments;

                // Call enumerate function such that the array of listings is reordered by idx
                enumerate(self.vue.comments);
        });
    };

        // Toggles add button
    self.add_comment_button = function (listing_idx) {
        self.vue.is_adding_comment = !self.vue.is_adding_comment;
        // self.get_listing_comments(listing_idx);
    };

    self.add_comment = function(listing_idx) {
        self.vue.is_adding_comment = !self.vue.is_adding_comment;
        self.vue.add_comment_id = self.vue.listings[listing_idx].id;
        console.log("adding");
        self.get_listing_comments(listing_idx);
    };


    self.add_comment_submit = function(listing_idx) {
        console.log(self.vue.listings[listing_idx].id);
        console.log(self.vue.form_commenter_name);
        console.log(self.vue.form_comment);
        $.post(add_comment_url,
            {
                parent_listing_id: self.vue.listings[listing_idx].id,
                commenter_name: self.vue.form_commenter_name,
                written_comment: self.vue.form_comment,
            },
            function (data) {
                $.web2py.enableElement($("#add_comment_submit"));
                console.log(data);
                self.vue.comments.unshift(data.comments);
                enumerate(self.vue.comments);
                // Reset comment fields after submission
                self.vue.form_comment = null;
                self.vue.form_commenter_name = null;
            });
    };

    // Deletes listing from the webpage (and the database using del_memo_url)
    // Uses listing_idx (instantiated by emuerate() function for all listings displayed) instead of memo.id (from database)
    self.delete_comment = function(comment_idx) {
        console.log(self.vue.comments[comment_idx].id);
        $.post(del_comment_url,
            {
                comment_id: self.vue.comments[comment_idx].id
            },
            function () {
                self.vue.comments.splice(comment_idx, 1);
                // if listings length is 10 or less, then we don't need to show loading button
                enumerate(self.vue.comments);
            }
        );
    };

    self.toggle_QR = function(comment_idx) {
        var comment = self.vue.comments[comment_idx];
        comment.showQR = !comment.showQR;
        console.log(comment.id);

        console.log(comment);

        $.post(toggleQR_url,
            {comment_id: self.vue.comments[comment_idx].id},
            function (data) {
                enumerate(self.vue.listings);
                enumerate(self.vue.comments);
                console.log(data);

            })
        // console.log("comment is");
        // console.log(comment.id);
        // console.log(comment);

    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            listings: [],
            logged_in: false,
            form_driver_name: null,
            form_food_location: null,
            form_post: null,
            form_fee: null,
            is_adding_listing: false,
            is_editing_listing: false,
            edit_id: 0,
            edit_driver_name_content: null,
            edit_post_content: null,
            original_driver_name: null,
            original_post: null,
            original_fee: null,
            image_url: null,


            comments: [],
            is_adding_comment: false,
            add_comment_id: 0,
            form_commenter_name: null,
            form_comment: null,

        },
        methods: {
            add_listing_button: self.add_listing_button,
            add_listing: self.add_listing,
            delete_listing: self.delete_listing,
            edit_listing: self.edit_listing,
            edit_listing_submit: self.edit_listing_submit,
            cancel_edit: self.cancel_edit,

            get_listing_comments: self.get_listing_comments,
            add_comment_submit: self.add_comment_submit,
            add_comment: self.add_comment,
            add_comment_button: self.add_comment_button,
            delete_comment: self.delete_comment,
            toggle_QR: self.toggle_QR,
        }

    });

    self.get_listings();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});


