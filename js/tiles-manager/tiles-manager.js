define(['jquery',
        'mustache',
        'text!analysis/html/templates.html',
        'bootstrap'], function ($, Mustache, templates) {

    var global = this;

    global.TILESMGR = function() {

        var CONFIG = {

        };

        var init = function(config) {

            /* Extend default configuration. */
            CONFIG = $.extend(true, {}, CONFIG, config);

            /* Fetch data providers. */
            alert('pippo');

        };


        return {
            init: init
        };
    };

});