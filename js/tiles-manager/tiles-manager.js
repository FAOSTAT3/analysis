define([
    'jquery',
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
            base_url: null,
            url_analysis_home: null,
            url_images: 'images/',
            breadcrumb_buffer: []
        };

    }

    TILESMGR.prototype.init = function(config, tile_code) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);
        this.CONFIG.url_analysis_home = 'http://' + this.CONFIG.base_url + '/analysis/*/*/';

        /* Convert tiles configuration to JSON, if needed. */
        if (typeof tiles_configuration == 'string')
            tiles_configuration = $.parseJSON(tiles_configuration);

        /* Load tiles structure. */
        var view = {
            url_analysis_home: this.CONFIG.url_analysis_home + this.CONFIG.lang,
            analysis_label: translate.analysis
        };
        var template = $(templates).filter('#analysis_structure').html();
        var render = Mustache.render(template, view);
        $('#container').html(render);

        /* Update the breadcrumb. */
        this.update_breadcrumb();

        /* Load tiles. */
        this.show_tiles(tile_code);

    };

    TILESMGR.prototype.show_tiles = function(tile_code) {

        /* Fix the tile code, if needed. */
        tile_code = tile_code == null ? 'main' : tile_code;
        var _this = this;

        /* Add listener to the tab. */
        try {
            if (tiles_configuration[tile_code].label_code != null) {
                /* Update the breadcrumb buffer. */
                this.add_to_breadcrumb_buffer(tile_code, translate[tiles_configuration[tile_code].label_code]);
                this.update_breadcrumb();

                /* Add listener to the tile. */
                $('#' + tile_code + '_breadcrumb').click(function () {
                    _this.show_tiles(tile_code);
                });

            }
        } catch(e) {

        }

        /* Show section/module. */
        switch (tiles_configuration[tile_code]['type']) {
            case 'section':
                this.show_section(tile_code);
                break;
            case 'module':
                this.show_module(tile_code);
                break;
        }

    };

    TILESMGR.prototype.add_to_breadcrumb_buffer = function(tile_code, tile_label) {

        var add = true;

        for (var i = 0 ; i < this.CONFIG.breadcrumb_buffer.length ; i++) {
            if (this.CONFIG.breadcrumb_buffer[i].tile_code == tile_code) {
                add = false;
                this.CONFIG.breadcrumb_buffer = this.CONFIG.breadcrumb_buffer.slice(0, (1+i));
                break;
            }
        }

        if (add) {
            var tmp = {
                'tile_code': tile_code,
                'tile_label': tile_label
            };
            this.CONFIG.breadcrumb_buffer.push(tmp);
        }

    };

    TILESMGR.prototype.update_breadcrumb = function() {

        /* Reset the breadcrumb. */
        $('#analysis_breadcrumb').empty();

        /* Add the root. */
        var home_url = this.CONFIG.url_analysis_home + this.CONFIG.lang;
        var s1 = '<li><a href="' + home_url + '">' + translate.analysis + '</a></li>';
        $('#analysis_breadcrumb').append(s1);

        /* Re-create the breadcrumb. */
        for (var i = 0 ; i < this.CONFIG.breadcrumb_buffer.length ; i++) {
            var _this = this;
            var tile_code = this.CONFIG.breadcrumb_buffer[i].tile_code;
            var s1 = '<li><a style="cursor: pointer;" id="' + this.CONFIG.breadcrumb_buffer[i].tile_code + '_breadcrumb">';
            s1 += this.CONFIG.breadcrumb_buffer[i].tile_label + '</a></li>';
            $('#analysis_breadcrumb').append(s1);
            $('#' + tile_code + '_breadcrumb').click({tile_code: tile_code}, function (e) {
                $('#analysis_breadcrumb').empty();
                _this.show_tiles(e.data.tile_code);
            });
        }

    };

    TILESMGR.prototype.show_module = function(tile_code) {
        var _this = this;
        if (tiles_configuration[tile_code]['require'] != null) {
            $('#tiles_container').empty();
            require([tiles_configuration[tile_code]['require']], function (module) {
                console.log(module);
                try {
                    module.init({'lang': _this.CONFIG.lang});
                }catch (e) {
                    // TODO: remove it. This is done to handle geobricks_ui_distribution
                    var m = new module()
                    var config = $.extend(true, {}, tiles_configuration[tile_code]["module_config"],
                        {
                            'placeholder': 'tiles_container',
                            //'lang': _this.CONFIG.lang_iso2
                            'lang': "EN"
                        }
                    );
                    m.init(config);
                }
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
            var template = null;
//            console.log()
//            console.debug(tiles_configuration[tiles_configuration[tile_code].tiles[0]]['type']);
//            console.debug(tile_code);
//            if (tiles_configuration[tile_code].tiles[0]['type'] == null) {
//                template = $(templates).filter('#main_tile_structure').html();
//            } else {
            switch (tiles_configuration[tiles_configuration[tile_code].tiles[0]]['type']) {
                case 'section':
                    console.log('#main_tile_structure');
                    template = $(templates).filter('#main_tile_structure').html();
                    break;
                case 'module':
                    console.log('#module_tile_structure');
                    template = $(templates).filter('#module_tile_structure').html();
                    view.tile_img = this.CONFIG.url_images + tiles_configuration[tiles_configuration[tile_code].tiles[0]]['img'];
                    break;

            }
//            }
//            var template = $(templates).filter('#main_tile_structure').html();
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