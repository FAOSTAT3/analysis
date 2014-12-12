define(
    //['jquery'],
    function () {

    'use strict';

    function GHG_DATA() {

        this.CONFIG = {
            lang: 'E'
        }

    }

    GHG_DATA.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        // var src = 'http://fenixapps.fao.org/repository/countrystat/view_ghg.html?tab=ghg_burned_areas_savanna';
        //var src = 'http://168.202.28.214:7070/fnx_maps_playground/index_dev.html#distribution/en';
        var src = 'http://168.202.39.41/fnx_maps/ghg.html#distribution/en';
        var iframe = ' <iframe src="'+ src +'" width="970px" height="1450px" frameborder="0"></iframe> ';
        $('#tiles_container').html(iframe);

    };

    return new GHG_DATA();

});
