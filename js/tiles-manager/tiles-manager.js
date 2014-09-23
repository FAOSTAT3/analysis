define(['jquery',
        'require',
        'mustache',
        'text!analysis/js/tiles-manager/html/templates.html',
        'text!analysis/js/tiles-manager/config/tiles_configuration.json',
        'bootstrap'], function ($, require, Mustache, templates, tiles_configuration) {

    'use strict';

    function TILESMGR() {

        this.CONFIG = {
            lang: 'E',
            url_analysis_home: 'http://168.202.28.57:8080/faostat-gateway/go/to/analysis/Q/QC/',
            url_images: 'http://168.202.28.57:8080/analysis/images/'
        };

    }

    TILESMGR.prototype.init = function(config, tile_code) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Convert tiles configuration to JSON, if needed. */
        if (typeof tiles_configuration == 'string')
            tiles_configuration = $.parseJSON(tiles_configuration);

        /* Load tiles structure. */
        var view = {
            url_analysis_home: this.CONFIG.url_analysis_home + this.CONFIG.lang
        };
        var template = $(templates).filter('#analysis_structure').html();
        var render = Mustache.render(template, view);
        $('#container').html(render);

        /* Load tiles. */
        this.show_tiles(tile_code);

    };

    TILESMGR.prototype.show_tiles = function(tile_code) {
        tile_code = tile_code == null ? 'main' : tile_code;
        switch (tiles_configuration[tile_code]['type']) {
            case 'section':
                this.show_section(tile_code);
                break;
            case 'module':
                this.show_module(tile_code);
                break;
        }
    };

    TILESMGR.prototype.show_module = function(tile_code) {
        $('#tiles_container').empty();
        require(["ANALYSIS_GHG_QA_QC"], function() {
            GHG_QA_QC().init();
        });
    };

    TILESMGR.prototype.show_section = function(tile_code) {

        /* Clear the presentation area. */
        $('#tiles_container').empty();

        /* Create tiles reading the configuration file. */
        for (var i = 0; i < tiles_configuration[tile_code]['tiles'].length; i += 2) {

            var child_1 = tiles_configuration[tiles_configuration[tile_code]['tiles'][i]];
            var view = {};
            var template = null;
            var render = null;

            /* 2 tile per row. */
            if (i + 1 < tiles_configuration[tile_code]['tiles'].length) {
                var child_2 = tiles_configuration[tiles_configuration[tile_code]['tiles'][i + 1]];
                view = {
                    tile_img_src_1: this.CONFIG.url_images + this.CONFIG.lang + child_1.img,
                    tile_img_src_2: this.CONFIG.url_images + this.CONFIG.lang + child_2.img,
                    tile_2_id: child_1.id,
                    tile_3_id: child_2.id
                };
                template = $(templates).filter('#tile_double_row_structure').html();
                render = Mustache.render(template, view);
            }

            /* 1 tile per row. */
            else {
                view = {
                    tile_img_src_1: this.CONFIG.url_images + this.CONFIG.lang + child_1.img,
                    tile_1_id: child_1.id
                };
                template = $(templates).filter('#tile_single_row_structure').html();
                render = Mustache.render(template, view);
            }

            /* Render the template. */
            $('#tiles_container').append(render);
        }

        /* Add click listeners to the tiles. */
        var _this = this;
        for (var i = 0; i < tiles_configuration[tile_code]['tiles'].length; i++) {
            var child = tiles_configuration[tiles_configuration[tile_code]['tiles'][i]];
            $('#' + child.id).click(function () {
                _this.show_tiles(this.id);
            });
        }

    };

    return new TILESMGR();

});