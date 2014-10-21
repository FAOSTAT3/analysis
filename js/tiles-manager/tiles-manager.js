define(['jquery',
        'require',
        'mustache',
        'text!tiled-analysis/js/tiles-manager/html/templates.html',
        'text!tiled-analysis/js/tiles-manager/config/tiles_configuration.json',
        'i18n!tiled-analysis/js/tiles-manager/nls/translate',
        'bootstrap'], function ($, require, Mustache, templates, tiles_configuration, translate) {

    'use strict';

    function TILESMGR() {

        this.CONFIG = {
            lang: 'E',
            url_analysis_home: 'http://168.202.28.57:8080/faostat-gateway/go/to/analysis/Q/QC/',
            url_images: '/faostat-ghg/modules/tiled-analysis/images/'
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

        /* Fix the tile code, if needed. */
        tile_code = tile_code == null ? 'main' : tile_code;
        var _this = this;

        /* Update the breadcrumb. */
        if (tiles_configuration[tile_code].label_code != null) {
            var s1 = '<li><a id="' + tile_code + '_breadcrumb">';
            s1 += translate[tiles_configuration[tile_code].label_code] + '</a></li>';
            $('#analysis_breadcrumb').append(s1);
            $('#' + tile_code + '_breadcrumb').click(function () {
                _this.show_tiles(tile_code);
            });
        }

        /* */
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
        var _this = this;
        if (tiles_configuration[tile_code]['require'] != null) {
            $('#tiles_container').empty();
            require([tiles_configuration[tile_code]['require']], function (module) {
                module.init({'lang': _this.CONFIG.lang});
            });
        } else {
            alert('This module has not been implemented yet.');
        }
    };

    TILESMGR.prototype.show_section = function(tile_code) {

        /* Clear the presentation area. */
        $('#tiles_container').empty();

        /* Create tiles reading the configuration file. */
        for (var i = 0; i < tiles_configuration[tile_code]['tiles'].length; i ++) {

            var child_1 = tiles_configuration[tiles_configuration[tile_code]['tiles'][i]];
            var view = {};
            var template = null;
            var render = null;

            /* Render the template. */
            var view = {
                tile_img: this.CONFIG.url_images + 'ghg-logo-tile.png',
                tile_id: child_1.id,
                tile_title: translate[child_1.tile_title],
                tile_description: translate[child_1.tile_description],
                tile_button: translate[child_1.tile_button]
            };
            var template = $(templates).filter('#main_tile_structure').html();
            var render = Mustache.render(template, view);
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