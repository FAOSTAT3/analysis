define(['jquery'], function ($) {

    'use strict';

    function GHG_DATA() {

        this.CONFIG = {
            lang: 'E'
        }

    }

    GHG_DATA.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        var src = 'http://fenixapps.fao.org/repository/countrystat/view_ghg.html?tab=ghg_burned_areas_savanna';
        var iframe = ' <iframe src="'+ src +'" width="100%" height="1700px" frameborder="0"></iframe> ';
        $('#tiles_container').html(iframe);

    };

    return new GHG_DATA();

});