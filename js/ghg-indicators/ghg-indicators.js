define(['jquery'], function ($) {

    'use strict';

    function GHG_INDICATORS() {

        this.CONFIG = {
            lang: 'E'
        }

    }

    GHG_INDICATORS.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);
        $('#tiles_container').html('<center><img style="width: 800px; height: 240px;" src="http://fenixapps2.fao.org/faostat-ghg/modules/tiled-analysis/images/ghg_indicators.png"></center>');

    };

    return new GHG_INDICATORS();

});