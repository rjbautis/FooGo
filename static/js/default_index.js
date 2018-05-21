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
    function get_memos_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        console.log(memos_url + "?" + $.param(pp));
        return memos_url + "?" + $.param(pp);
    }

    // Get memos from database within indices 0 up to 10
    self.get_memos = function() {
  
        // Return a json containing the database information
        $.getJSON(get_memos_url(0, 10), function(data) {
            self.vue.memos = data.memos;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;

            // Call enumerate function such that the array of memos is reordered by idx
            enumerate(self.vue.memos);
        })
    };

    // Returns the next 10 memos that have not been loaded on the webpage yet
    self.get_more = function () {
        console.log("HI");
        var num_memos = self.vue.memos.length;

        console.log(num_memos);

        // Using the length of the current list of memos, extend the list with the next 10 memos from db
        $.getJSON(get_memos_url(num_memos, num_memos + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.memos, data.memos);

            // Call enumerate function such that the new array of memos is reordered by idx
            enumerate(self.vue.memos);
        });
    };

    // Toggles add button
    self.add_memo_button = function () {
        self.vue.is_adding_memo = !self.vue.is_adding_memo;
    };


    // Makes jquery api call to add_memo_url with the submitted form data
    self.add_memo = function () {
        $.post(add_memo_url,
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo,
            },
            function (data) {
                $.web2py.enableElement($("#add_memo_submit"));
                self.vue.memos.unshift(data.title);
                enumerate(self.vue.memos);
            });
    };

    // Makes jquery api call to edit_memo_url with the updated/editted title and memo content
    self.edit_memo_submit = function () {
        $.post(edit_memo_url,
            {
                title_content: self.vue.edit_title_content,
                memo_content: self.vue.edit_memo_content,
                id: self.vue.edit_id
            },
            function (data) {
                $.web2py.enableElement($("#edit_memo_submit"));
                self.vue.is_editing_memo = !self.vue.is_editing_memo;
            });
    };


    self.edit_memo = function(memo_idx) {
        // Remember the original memo title and content (in case the user decides to cancel the edit)
        self.vue.original_memo_title = self.vue.memos[memo_idx].title;        
        self.vue.original_memo_content = self.vue.memos[memo_idx].memo;

        self.vue.is_editing_memo = !self.vue.is_editing_memo;
        self.vue.edit_id = self.vue.memos[memo_idx].id;
    };

    self.cancel_edit = function (memo_idx) {
        // if user canceled the edit, let the current memo being edited be returned to original state
        self.vue.memos[memo_idx].title = self.vue.original_memo_title;
        self.vue.memos[memo_idx].memo = self.vue.original_memo_content;
        
        self.vue.is_editing_memo = !self.vue.is_editing_memo;
        self.vue.edit_id = 0;

    };

    // Deletes memo from the webpage (and the database using del_memo_url)
    // Uses memo_idx (instantiated by emuerate() function for all memos displayed) instead of memo.id (from database)
    self.delete_memo = function(memo_idx) {
        // Make a post request by deleting the desired memo from the list of memos and reordering it with enumerate
        console.log(memo_idx);
        $.post(del_memo_url,
            { 
                memo_id: self.vue.memos[memo_idx].id 
            },
            function () {
                self.vue.memos.splice(memo_idx, 1);
                // if memos length is 10 or less, then we don't need to show loading button
                if(self.vue.memos.length < 11) {
                    self.vue.has_more = false;
                }
                enumerate(self.vue.memos);
            }
        );
        console.log(self.vue.memos);
    };
   

    // Toggle's the is_public button on the front end, then makes jquery api call to backend
    self.toggle_public_button = function (memo_idx) {
        var memo = self.vue.memos[memo_idx];
        // Toggles the public icon of the memo
        memo.is_public = !memo.is_public;

        // Makes api call to toggle_public_url
        $.post(toggle_public_url, 
            {  
                memo_id: self.vue.memos[memo_idx].id 
            },
            function (data) {
                enumerate(self.vue.memos);
            }
        )
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            memos: [],
            logged_in: false,
            has_more: false,
            form_title: null,
            form_memo: null,
            form_track: null,
            is_adding_memo: false,
            is_editing_memo: false,
            edit_id: 0,
            edit_title_content: null,
            edit_memo_content: null,
            original_memo_title: null,
            original_memo_content: null
        },
        methods: {
            toggle_public_button: self.toggle_public_button,
            add_memo_button: self.add_memo_button,
            add_memo: self.add_memo,
            delete_memo: self.delete_memo,
            get_more: self.get_more,
            edit_memo: self.edit_memo,
            edit_memo_submit: self.edit_memo_submit,
            cancel_edit: self.cancel_edit,
        }

    });

    self.get_memos();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
