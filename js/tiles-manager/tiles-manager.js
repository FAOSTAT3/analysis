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
            switch (tiles_configuration[tile_code]['type']) {
                case 'section':
                    show_section(tile_code);
                    break;
                case 'module':
                    show_module(tile_code);
                    break;
            }
        };

        var show_module = function(tile_code) {
            $('#tiles_container').empty();
        };

        var show_section = function(tile_code) {
            $('#tiles_container').empty();
            for (var i = 0; i < tiles_configuration[tile_code]['tiles'].length; i += 2) {
                var child_1 = tiles_configuration[tiles_configuration[tile_code]['tiles'][i]];
                var view = {};
                var template = null;
                var render = null;
                if (i + 1 < tiles_configuration[tile_code]['tiles'].length) {
                    var child_2 = tiles_configuration[tiles_configuration[tile_code]['tiles'][i + 1]];
                    view = {
                        tile_img_src_1: CONFIG.url_images + CONFIG.lang + child_1.img,
                        tile_img_src_2: CONFIG.url_images + CONFIG.lang + child_2.img,
                        tile_2_id: child_1.id,
                        tile_3_id: child_2.id
                    };
                    template = $(templates).filter('#tile_double_row_structure').html();
                    render = Mustache.render(template, view);
                } else {
                    view = {
                        tile_img_src_1: CONFIG.url_images + CONFIG.lang + child_1.img,
                        tile_1_id: child_1.id
                    };
                    template = $(templates).filter('#tile_single_row_structure').html();
                    render = Mustache.render(template, view);
                }
                $('#tiles_container').append(render);
            }
            for (var i = 0; i < tiles_configuration[tile_code]['tiles'].length; i++) {
                var child = tiles_configuration[tiles_configuration[tile_code]['tiles'][i]];
                $('#' + child.id).click(function () {
                    show_tiles(this.id);
                });
            }
        };

        return {
            init: init
        };
    };

});