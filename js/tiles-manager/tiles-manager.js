define(['jquery',
        'mustache',
        'text!analysis/html/templates.html',
        'text!analysis/config/tiles_configuration.json',
        'bootstrap'], function ($, Mustache, templates, tiles_configuration) {

    var global = this;

    global.TILESMGR = function() {

        var CONFIG = {
            lang: 'E',
            url_analysis_home: 'http://168.202.28.57:8080/faostat-gateway/go/to/analysis/Q/QC/',
            url_images: 'http://168.202.28.57:8080/analysis/images/'
        };

        var init = function(config, tile_code) {

            /* Extend default configuration. */
            CONFIG = $.extend(true, {}, CONFIG, config);

            /* Convert tiles configuration to JSON, if needed. */
            if (typeof tiles_configuration == 'string')
                tiles_configuration = $.parseJSON(tiles_configuration);

            /* Load tiles structure. */
            var view = {
                url_analysis_home: CONFIG.url_analysis_home + CONFIG.lang
            };
            var template = $(templates).filter('#analysis_structure').html();
            var render = Mustache.render(template, view);
            $('#container').html(render);

            /* Load tiles. */
            show_tiles(tile_code);

        };

        var show_tiles = function(tile_code) {
            $('#tiles_container').empty();
            for (var i = 0 ; i < tiles_configuration[tile_code].length ; i += 2) {
                var view = {};
                var template = null;
                var render = null;
                if (i + 1 < tiles_configuration[tile_code].length) {
                    view = {
                        tile_img_src_1: CONFIG.url_images + CONFIG.lang + tiles_configuration[tile_code][i]['img'],
                        tile_img_src_2: CONFIG.url_images + CONFIG.lang + tiles_configuration[tile_code][1 + i]['img'],
                        tile_2_id: tiles_configuration[tile_code][i]['tile'],
                        tile_3_id: tiles_configuration[tile_code][1 + i]['tile']
                    };
                    var template = $(templates).filter('#tile_double_row_structure').html();
                    var render = Mustache.render(template, view);
                } else {
                    view = {
                        tile_img_src_1: CONFIG.url_images + CONFIG.lang + tiles_configuration[tile_code][i]['img'],
                        tile_1_id: tiles_configuration[tile_code][i]['tile']
                    };
                    var template = $(templates).filter('#tile_single_row_structure').html();
                    var render = Mustache.render(template, view);
                }
                $('#tiles_container').append(render);
            }
            for (var i = 0 ; i < tiles_configuration[tile_code].length ; i++) {
                $('#' + tiles_configuration[tile_code][i]['tile']).click(function() {
                    show_tiles(this.id);
                });
            }
        };

        return {
            init: init
        };
    };

});