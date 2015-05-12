define(['jquery'], function ($) {

    'use strict';

    function GHG_INDICATORS() {

        this.CONFIG = {
            placeholder: 'tiles_container',
            lang: 'E'
        }

    }

    GHG_INDICATORS.prototype.init = function(config) {
        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        var html = "<div class='container-fluid'> <div class='row'><div class='col-xs-12'><h1>Indicators</h1><center><img style='width: 800px; height: 240px;' src='http://fenixapps2.fao.org/faostat-ghg/modules/tiled-analysis/images/ghg_indicators.png'></center></div></div>";
        $('#'+ this.CONFIG.placeholder).html(html);

    };

    return GHG_INDICATORS;

});