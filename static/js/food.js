

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
        console.log(self.vue.logged_in);
        // Return a json containing the database information
        $.getJSON(get_listings_url(0, 10), function(data) {
            self.vue.listings = data.listings;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;

            // Call enumerate function such that the array of listings is reordered by idx
            enumerate(self.vue.listings);
        })
    };

    // Returns the next 10 listings that have not been loaded on the webpage yet
    self.get_more = function () {
        console.log("HI");
        var num_listings = self.vue.listings.length;

        console.log(num_listings);

        // Using the length of the current list of listings, extend the list with the next 10 listings from db
        $.getJSON(get_listings_url(num_listings, num_listings + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.listings, data.listings);

            // Call enumerate function such that the new array of listings is reordered by idx
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
                name: self.vue.form_name,
                category: self.vue.form_category,
                listing: self.vue.form_listing,
            },
            function (data) {
                $.web2py.enableElement($("#add_listing_submit"));
                self.vue.listings.unshift(data.name);
                enumerate(self.vue.listings);
            });
    };

    // Makes jquery api call to edit_listing_url with the updated/editted title and listing content
    self.edit_listing_submit = function () {
        $.post(edit_listing_url,
            {
                title_content: self.vue.edit_title_content,
                listing_content: self.vue.edit_listing_content,
                id: self.vue.edit_id
            },
            function (data) {
                $.web2py.enableElement($("#edit_listing_submit"));
                self.vue.is_editing_listing = !self.vue.is_editing_listing;
            });
    };


    self.edit_listing = function(listing_idx) {
        // Remember the original listing title and content (in case the user decides to cancel the edit)
        self.vue.original_listing_title = self.vue.listings[listing_idx].title;
        self.vue.original_listing_content = self.vue.listings[listing_idx].listing;

        self.vue.is_editing_listing = !self.vue.is_editing_listing;
        self.vue.edit_id = self.vue.listings[listing_idx].id;
    };

    self.cancel_edit = function (listing_idx) {
        // if user canceled the edit, let the current listing being edited be returned to original state
        self.vue.listings[listing_idx].title = self.vue.original_listing_title;
        self.vue.listings[listing_idx].listing = self.vue.original_listing_content;

        self.vue.is_editing_listing = !self.vue.is_editing_listing;
        self.vue.edit_id = 0;

    };

    // Deletes listing from the webpage (and the database using del_listing_url)
    // Uses listing_idx (instantiated by emuerate() function for all listings displayed) instead of listing.id (from database)
    self.delete_listing = function(listing_idx) {
        // Make a post request by deleting the desired listing from the list of listings and reordering it with enumerate
        console.log(listing_idx);
        $.post(del_listing_url,
            {
                listing_id: self.vue.listings[listing_idx].id
            },
            function () {
                self.vue.listings.splice(listing_idx, 1);
                // if listings length is 10 or less, then we don't need to show loading button
                if(self.vue.listings.length < 11) {
                    self.vue.has_more = false;
                }
                enumerate(self.vue.listings);
            }
        );
        console.log(self.vue.listings);
    };


    // Toggle's the is_public button on the front end, then makes jquery api call to backend
    self.toggle_public_button = function (listing_idx) {
        var listing = self.vue.listings[listing_idx];
        // Toggles the public icon of the listing
        listing.is_public = !listing.is_public;

        // Makes api call to toggle_public_url
        $.post(toggle_public_url,
            {
                listing_id: self.vue.listings[listing_idx].id
            },
            function (data) {
                enumerate(self.vue.listings);
            }
        )
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            listings: [],
            logged_in: false,
            has_more: false,
            form_name: null,
            form_category: null,
            form_listing: null,
            form_track: null,
            is_adding_listing: false,
            is_editing_listing: false,
            edit_id: 0,
            edit_title_content: null,
            edit_listing_content: null,
            original_listing_title: null,
            original_listing_content: null
        },
        methods: {
            toggle_public_button: self.toggle_public_button,
            add_listing_button: self.add_listing_button,
            add_listing: self.add_listing,
            delete_listing: self.delete_listing,
            get_more: self.get_more,
            edit_listing: self.edit_listing,
            edit_listing_submit: self.edit_listing_submit,
            cancel_edit: self.cancel_edit,
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
