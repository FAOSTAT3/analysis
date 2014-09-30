define(['jquery',
        'mustache',
        'text!tiled-analysis/js/ghg-qa-qc/html/templates.html',
        'text!tiled-analysis/js/ghg-qa-qc/config/selectors.json',
        'text!tiled-analysis/js/ghg-qa-qc/config/ghg_verification_chart_template.json',
        'text!tiled-analysis/js/ghg-qa-qc/config/domain_elements_map.json',
        'text!tiled-analysis/js/ghg-qa-qc/config/domain_items_map.json',
        'i18n!tiled-analysis/js/libs/nls/translate',
        'chosen',
        'highcharts',
        'bootstrap'], function ($,
                                Mustache,
                                templates,
                                selectors_configuration,
                                chart_template,
                                domain_elements_map,
                                domain_items_map,
                                translate) {

    'use strict';

    function GHG_QA_QC() {

        this.CONFIG = {
            lang            :   'E',
            data            :   null,
            datasource      :   'faostat',
            base_url        :   'http://168.202.28.57:8080/ghg',
            url_procedures  :   'http://faostat3.fao.org/wds/rest/procedures/countries/faostat/GT',
            url_data        :   'http://faostat3.fao.org/wds/rest/table/json',
            url_editor      :   'http://fenixapps.fao.org/repository/ghg-editor/',
            url_i18n        :   'http://fenixapps2.fao.org/ghg/ghg-editor/I18N/',
            colors: {
                chart_1 : ['green', 'green'],
                chart_2 : ['red', 'red', 'brown', 'brown'],
                chart_3 : ['yellow', 'yellow'],
                chart_4 : ['blue', 'blue'],
                chart_5 : ['red', 'red', 'green', 'green']
            },
            default_colors: [
                '#379bcd',
                '#76BE94',
                '#744490',
                '#E10079',
                '#2D1706',
                '#F1E300',
                '#F7AE3C',
                '#DF3328'
            ],
            url_listboxes: 'http://faostat3.fao.org/wds/rest/procedures/usp_GetListBox/',
            json_domain_elements_map: $.parseJSON(domain_elements_map)
        };

    }

    GHG_QA_QC.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);
        var _this = this;

        /* Load GHG-QA/QC structure. */
        var view = {
            'tab_verification_label': translate.verification,
            'tab_qaqc_label': translate.qa_qc,
            'ghg_verification_areas_label': translate.areas,
            'ghg_verification_groups_label': translate.groups
        };
        var template = $(templates).filter('#ghg_qa_qc_verification_structure').html();
        var render = Mustache.render(template, view);
        $('#tiles_container').html(render);

        /* Initiate Chosen. */
        $('.chosen').chosen({
            disable_search_threshold: 10,
            allow_single_deselect: true
        });

        /* Populate areas. */
        this.create_area_item_element_selector('GT', 1, 'ghg_verification_areas_list', null);

        /* Cast selectors configuration to JSON. */
        if (typeof selectors_configuration == 'string')
            selectors_configuration = $.parseJSON(selectors_configuration);

        /* Populate groups. */
        this.create_groups_selector('groups', 'ghg_verification_groups_list', selectors_configuration.groups[0].target);

    };

    GHG_QA_QC.prototype.create_groups_selector = function(selector_code, selector_id) {

        /* Variables. */
        var _this = this;
        var target = null;

        /* Populate drop-down. */
        $('#' + selector_id).append('<option value="null">' + translate.please_select + '</option>');
        try {
            for (var i = 0; i < selectors_configuration[selector_code].length; i++) {
                target = selectors_configuration[selector_code][i].target;
                var s = '<option value="';
                s += selectors_configuration[selector_code][i].code;
                s += '">';
                s += selectors_configuration[selector_code][i].label[this.CONFIG.lang];
                s += '</option>';
                $('#' + selector_id).append(s);
            }
        } catch (e) {
            this.create_area_item_element_selectors(selector_code);
        }

        /* Initiate Chosen. */
        $('#' + selector_id).trigger('chosen:updated');

        /* On-change listener. */
        $('#' + selector_id).change(function () {
            _this.on_group_change(selector_id);
        });

    };

    GHG_QA_QC.prototype.on_group_change = function(selector_id) {

        var option_selected = $('#' + selector_id + ' option:selected').val();

        /* Render domain tabs. */
        $('#ghg_verification_content').empty();
        var template_id = option_selected;
        var view = {
            'gt': translate.gt,
            'ge': translate.ge,
            'gm': translate.gm,
            'gr': translate.gr,
            'gy': translate.gy,
            'gu': translate.gu,
            'gp': translate.gp,
            'ga': translate.ga,
            'gv': translate.gv,
            'gb': translate.gb,
            'gh': translate.gh,
            'gl': translate.gl,
            'gf': translate.gf,
            'gc': translate.gc,
            'gg': translate.gg,
            'gi': translate.gi,
            'ag_soils': translate.ag_soils
        };
        var template = $(templates).filter('#' + template_id).html();
        var render = Mustache.render(template, view);
        $('#ghg_verification_content').html(render);

        /* Render charts and tables tabs: Land Use */
        if (option_selected == 'ghg_qa_qc_verification_land_use_structure') {
            var lu = ['gl', 'gf', 'gc', 'gg', 'gi'];
            for (var i = 0; i < lu.length; i++)
                this.create_charts_and_tables_tabs('land_use_' + lu[i] + '_charts_and_tables', lu[i]);
        }

        /* Render charts and tables tabs: Agricultural Soils */
        if (option_selected == 'ghg_qa_qc_verification_agri_soils_structure') {
            var as = ['gt', 'gy', 'gu', 'gp', 'ga', 'gv'];
            for (var i = 0; i < as.length; i++)
                this.create_charts_and_tables_tabs('agri_soils_' + as[i] + '_charts_and_tables', as[i]);
        }

        /* Render charts and tables tabs: Agricultural Total */
        if (option_selected == 'ghg_qa_qc_verification_agri_total_structure') {
            var at = ['gt', 'ag_soils', 'ge', 'gm', 'gr', 'gy', 'gu', 'gp', 'ga', 'gv', 'gb', 'gh', 'gn'];
            for (var i = 0; i < at.length; i++)
                this.create_charts_and_tables_tabs('agri_total_' + at[i] + '_charts_and_tables', at[i]);
        }

    };

    GHG_QA_QC.prototype.create_charts_and_tables_tabs = function(id, domain_code) {
        var view = {
            'charts_label': translate.charts,
            'tables_label': translate.tables,
            'id_charts_content': domain_code + '__charts_content',
            'id_tables_content': domain_code +'_tables_content',
            'href_charts': 'agri_total_' + domain_code + '_charts',
            'href_tables': 'agri_total_' + domain_code + '_tables'
        };
        var template = $(templates).filter('#charts_and_tables').html();
        var render = Mustache.render(template, view);
        $('#' + id).html(render);
        if (domain_code == 'ag_soils') {
            this.create_charts_and_tables_ag_soils();
        } else {
            this.create_charts_get_elements(domain_code);
        }
    };

    GHG_QA_QC.prototype.create_charts_and_tables_ag_soils = function() {
        var items = [
            ['1709', translate.ag_soils],
            ['5061', translate.gy],
            ['5062', translate.gu],
            ['5063', translate.gp],
            ['5064', translate.ga],
            ['6759', translate.gv]
        ];
        var elements = ['7231', '7143'];
        var mustache_items = [];
        for (var i = 0; i < items.length; i++) {
            var tmp = {};
            tmp.item = items[i][1];
            tmp['data_not_available'] = translate.data_not_available;
            for (var j = 0; j < elements.length; j++) {
                tmp['col' + j] = 'ag_soils' + '_' + items[i][0] + '_' + elements[j];
            }
            mustache_items.push(tmp);
        }
        var view = {
            'item': translate.item,
            'emissions': translate.emissions,
            'emissions_activity': translate.emissions_activity,
            'emissions_factor': translate.emissions_factor,
            'items': mustache_items
        };
        var template = $(templates).filter('#charts_structure').html();
        var render = Mustache.render(template, view);
        $('#ag_soils__charts_content').html(render);
        for (var q = 0 ; q < elements.length ; q++)
            for (var z = 0; z < items.length; z++)
                this.query_db_for_charts(this.CONFIG.datasource, 'ag_soils', items[z][0], elements[q]);
    };

    GHG_QA_QC.prototype.create_charts_get_elements = function (domain_code) {
        this.create_charts_get_items(domain_code, this.CONFIG.json_domain_elements_map[domain_code]);
    };

    GHG_QA_QC.prototype.create_charts_get_items = function(domain_code, elements) {
        var _this = this;
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: this.CONFIG.url_listboxes + this.CONFIG.datasource + '/' + domain_code + '/3/1/' + this.CONFIG.lang,
            success: function (response) {
                var items = response;
                if (typeof items == 'string')
                    items = $.parseJSON(response);

                /* Special behaviour for Agriculture Total. */
                if (domain_code == 'gt') {

                    /* Add Agriculture Total itself as item. */
                    items.splice(0, 0, ["1711", translate.gt, "80", "+"]);

                    /* Remove the Agricultural Soils items. */
                    var ag_soils = ['5061', '5062', '5063', '5064', '6759'];
                    for (var i = 0 ; i < items.length ; i++) {
                        if ($.inArray(items[i][0], ag_soils) > -1)
                            items.splice(i, 1);
                    }

                }
                _this.create_charts(domain_code, elements, items);
            }
        });
    };

    GHG_QA_QC.prototype.create_charts = function(domain_code, elements, items) {
        var mustache_items = [];
        for (var i = 0; i < items.length; i++) {
            var tmp = {};
            tmp.item = items[i][1];
            tmp['data_not_available'] = translate.data_not_available;
            tmp['tab_link'] = items[i][0] + '_anchor';
            try {
                for (var j = 0; j < elements.length; j++) {
                    tmp['col' + j] = domain_code + '_' + items[i][0] + '_' + elements[j];
                }
            } catch(e) {

            }
            mustache_items.push(tmp);
        }
        var view = {
            'item': translate.item,
            'emissions': translate.emissions,
            'emissions_activity': translate.emissions_activity,
            'emissions_factor': translate.emissions_factor,
            'items': mustache_items
        };
        var template = $(templates).filter('#charts_structure').html();
        var render = Mustache.render(template, view);
        $('#' + domain_code + '__charts_content').html(render);
        try {
            for (var q = 0; q < elements.length; q++)
                for (var z = 0; z < items.length; z++)
                    this.query_db_for_charts(this.CONFIG.datasource, domain_code, items[z][0], elements[q]);
        } catch(e) {

        }

        for (var i = 0; i < items.length; i++) {
            $('#' + items[i][0] + '_anchor').click(function() {
//                alert('hallo from ' + this.id);
                $('#agri_total_tab a[href="#agri_total_ag_soils"]').tab('show');
            });
        }

    };

    GHG_QA_QC.prototype.query_db_for_charts = function(datasource, domain_code, item_code, element_code) {

        var add_user_data = false;
        var gunf_code = $.parseJSON(domain_items_map)[domain_code];

        var series_1 = [];
        series_1.push({
            name: $.i18n.prop('_agriculture_total') + ' (FAOSTAT)',
            domain: domain_code,
            country: this.CONFIG.country_code,
            item: item_code,
            element: element_code,
            datasource: 'faostat',
            type: 'line',
            enableMarker: false,
            gunf_code: gunf_code
        });
        if (domain_code == 'gt' || domain_code == 'gl' || domain_code == 'ag_soils') {
            if (domain_code == 'ag_soils') {
                gunf_code = $.parseJSON(domain_items_map)[item_code];
            }
            series_1.push({
                name: $.i18n.prop('_agriculture_total') + ' (NC)',
                domain: 'GT',
                country: this.CONFIG.country_code,
                item: '4',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true,
                gunf_code: gunf_code
            });
        }
        var colors = this.CONFIG.colors.chart_1;
        this.createChart(domain_code + '_' + item_code + '_' + element_code, '<b>That is my title</b>', series_1, add_user_data, colors);

    };

    GHG_QA_QC.prototype.populate_chart = function(series) {

    };

    GHG_QA_QC.prototype.create_area_item_element_selectors = function(domain_code) {
        this.create_area_item_element_selector(domain_code, 3, 'ghg_verification_items_list');
        this.create_area_item_element_selector(domain_code, 2, 'ghg_verification_elements_list');
    };

    GHG_QA_QC.prototype.create_area_item_element_selector = function(domain_code, listbox, selector_id, default_code) {
        var _this = this;
        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: 'http://faostat3.fao.org/wds/rest/procedures/usp_GetListBox/faostat2/' + domain_code + '/' + listbox + '/1/' + this.CONFIG.lang,
            success: function (response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                $('#' + selector_id).append('<option value="null">' + translate.please_select + '</option>');
                for (var i = 0 ; i < json.length ; i++) {
                    var s = '<option value="' + json[i][0] + '" ';
                    if (json[i][0] == default_code)
                        s += 'selected ';
                    s += '>' + json[i][1] + '</option>';
                    $('#' + selector_id).append(s);
                }
                $('#' + selector_id).trigger('chosen:updated');
                $('#' + selector_id).change(function() {
                    _this.CONFIG.country_code = $('#' + selector_id + ' option:selected').val();
                });
            }
        });
    };

    GHG_QA_QC.prototype.translate = function() {
        var ids = ['_ghg_country_profile_label', '_select_a_country_label', '_ghg_editor_label', '_ghg_editor_button', '_charts_label'];
        for (var i = 0 ; i < ids.length ; i++) {
            try {
                document.getElementById(ids[i]).innerHTML = $.i18n.prop(ids[i]);
            } catch (e) {

            }
        }
    };

    GHG_QA_QC.prototype.init_ghg_editor = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Load i18n for the editor outside the Gateway. */
        $.i18n.properties({
            name: 'I18N',
            path: this.CONFIG.url_i18n,
            mode: 'both',
            language: 'es'
        });

        /* Initiate tables. */
        this.createTable('country_new_data', true, 'Country New Data', 1990, 2012, 'country_new_data', this.addDataToCharts);
        this.createTable('emissions_db_nc', false, 'Base de datos de Emisiones - NC', 1990, 2012, 'emissions_db_nc');
        this.createTable('emissions_db_faostat', false, 'Base de datos de Emisiones - FAOSTAT ', 1990, 2012, 'emissions_db_faostat');
        this.createTable('cnd_fs_difference', false, '% Diferencia (FAOSTAT)', 1990, 2012, 'cnd_fs_difference');
        this.createTable('normalised_cnd_fs_difference', false, 'Diferencia normalizada % (FAOSTAT)', 1990, 2012, 'normalised_cnd_fs_difference');
        this.createTable('cnd_nc_difference', false, '% Diferencia (NC)', 1990, 2012, 'cnd_nc_difference');
        this.createTable('normalised_cnd_nc_difference', false, 'Diferencia normalizada % (NC)', 1990, 2012, 'normalised_cnd_nc_difference');

        /* Initiate Chosen. */
        $('.selector').chosen({
            disable_search_threshold: 10,
            allow_single_deselect: true
        });

        $.ajax({

            type        :   'GET',
            dataType    :   'json',
            url         :   this.CONFIG.url_procedures + '/' + this.CONFIG.lang,

            success: function (response) {

                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                var s = '<option selected>Please Select a Country...</option>';
                for (var i = 0 ; i < json.length ; i++)
                    s += '<option value="' + json[i][0] + '">' + json[i][1] + '</option>';
                document.getElementById('country_selector').innerHTML = s;
                $('#country_selector').trigger('chosen:updated');

            },

            error: function (err, b, c) {

            }

        });

        /* Create charts and load tables on country selection change. */
        $('#country_selector').on('change', function() {
            var country_code = $('#country_selector').find(":selected").val();
            this.createChartsAndPopulateTable(country_code, false, true);
        });

        /* Load configuration files. */
        document.getElementById('files').addEventListener('change', this.handlefilescatter, false);

        /* Translate ther UI. */
        this.translate();

    };

    GHG_QA_QC.prototype.createChartsAndPopulateTable = function(country_code, update_tables, add_user_data) {
        this.createCharts(country_code, add_user_data);
        if (update_tables) {
            this.populate_tables(country_code, this.updateTables);
        } else {
            this.populate_tables(country_code);
        }
    };

    GHG_QA_QC.prototype.updateTables = function() {
        setTimeout(function() {
            $('#emissions_db_faostat_right_table tr > th > div').each(function() {
                var k = $(this).attr('id');
                try {
                    var year = k.substring(1 + k.lastIndexOf('_'));
                    var crf_code = k.substring('emissions_db_faostat_'.length, k.lastIndexOf('_'));
                    var faostat = parseFloat(document.getElementById('emissions_db_faostat_' + crf_code + '_' + year).innerHTML);
                    var nc = parseFloat(document.getElementById('emissions_db_nc_' + crf_code + '_' + year).innerHTML);
                    if (!isNaN(faostat) && !isNaN(nc)) {
                        var perc_diff = ((nc - faostat) / faostat * 100).toFixed(2);
                        var perc_diff_col = (perc_diff >= 0) ? 'green' : 'red';
                        document.getElementById('cnd_fs_difference_' + crf_code + '_' + year).innerHTML = perc_diff + '%';
                        $('#cnd_fs_difference_' + crf_code + '_' + year).css('color', perc_diff_col);
                        var tot = parseFloat(document.getElementById('emissions_db_faostat_4_' + year).innerHTML);
                        var norm_diff = ((nc - faostat) / tot * 100).toFixed(2);
                        var norm_diff_col = (norm_diff >= 0) ? 'green' : 'red';
                        document.getElementById('normalised_cnd_fs_difference_' + crf_code + '_' + year).innerHTML = norm_diff + '%';
                        $('#normalised_cnd_fs_difference_' + crf_code + '_' + year).css('color', norm_diff_col);
                    }
                } catch (e) {

                }
            });
        }, 1000);
    };

    GHG_QA_QC.prototype.createCharts = function(country, add_user_data) {

        /* Chart 1 Definition. */
        var series_1 = [
            {
                name: $.i18n.prop('_agriculture_total') + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '1711',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_agriculture_total') + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            }
        ];
        var colors = this.CONFIG.colors.chart_1;
        this.createChart('chart_1', '<b>' + $.i18n.prop('_agriculture_total') + '</b>', series_1, add_user_data, colors);

        /* Chart 2 Definition. */
        var series_2 = [
            {
                name: $.i18n.prop('_enteric_fermentation') + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '5058',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_enteric_fermentation') + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4.A',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            },
            {
                name: $.i18n.prop('_manure_management') + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '5059',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_manure_management') + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4.B',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            }
        ];
        var colors = this.CONFIG.colors.chart_2;
        this.createChart('chart_2', '<b>' + $.i18n.prop('_enteric_fermentation') + ' ' + $.i18n.prop('_and') + ' ' + $.i18n.prop('_manure_management') + '</b>', series_2, add_user_data, colors);

        /* Chart 3 Definition. */
        var series_3 = [
            {
                name: $.i18n.prop('_rice_cultivation') + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '5060',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_rice_cultivation') + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4.C',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            }
        ];
        var colors = this.CONFIG.colors.chart_3;
        this.createChart('chart_3', '<b>' + $.i18n.prop('_rice_cultivation') + '</b>', series_3, add_user_data, colors);

        /* Chart 4 Definition. */
        var series_4 = [
            {
                name: $.i18n.prop('_agricultural_soils') + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '1709',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_agricultural_soils')  + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4.D',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            }
        ];
        var colors = this.CONFIG.colors.chart_4;
        this.createChart('chart_4', '<b>' + $.i18n.prop('_agricultural_soils') + '</b>', series_4, add_user_data, colors);

        /* Chart 5 Definition. */
        var series_5 = [
            {
                name: $.i18n.prop('_prescribed_burning_of_savannas')  + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '5067',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_prescribed_burning_of_savannas')  + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4.E',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            },
            {
                name: $.i18n.prop('_field_burning_of_agricultural_residues')  + ' (FAOSTAT)',
                domain: 'GT',
                country: country,
                item: '5066',
                element: '7231',
                datasource: 'faostat',
                type: 'line',
                enableMarker: false
            },
            {
                name: $.i18n.prop('_field_burning_of_agricultural_residues')  + ' (NC)',
                domain: 'GT',
                country: country,
                item: '4.F',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true
            }
        ];
        var colors = this.CONFIG.colors.chart_5;
        this.createChart('chart_5', '<b>' + $.i18n.prop('_prescribed_burning_of_savannas') + ' ' + $.i18n.prop('_and') + ' ' + $.i18n.prop('_field_burning_of_agricultural_residues') + '</b>', series_5, add_user_data, colors);

    };

    /* Charts template. */
    GHG_QA_QC.prototype.createChart = function(chart_id, title, series, add_user_data, colors) {
        var _this = this;
        var p = $.parseJSON(chart_template);
        var custom_p = {
            chart: {
                events: {
                    load: function() {
                        for (var i = 0 ; i < series.length ; i++) {
                            var chart_series = this.series[i];
                            _this.plotSeries(chart_series, series[i].datasource, series[i].domain, series[i].country, series[i].item, series[i].element, series[i].gunf_code);
                        }
                    }
                }
            },
            colors: _this.CONFIG.default_colors
        };
        custom_p.series = [];
        for (var i = 0 ; i < series.length ; i++) {
            custom_p.series[i] = {};
            custom_p.series[i].name = series[i].name;
        }
        p = $.extend(true, {}, p, custom_p);
        $('#' + chart_id).highcharts(p);

        var chart = $('#' + chart_id).highcharts();
        try {

            for (var i = 0; i < series.length; i++) {
                if (chart.series[i].name.indexOf('NC') > -1) {
                    chart.series[i].update({
                        marker: {
                            enabled: true
                        },
                        type: 'scatter'
                    });
                } else if (chart.series[i].name.indexOf('FAOSTAT') > -1) {
                    chart.series[i].update({
                        marker: {
                            enabled: false
                        },
                        type: 'line'
                    });
                }
            }

            if (add_user_data) {
                var chart = $('#' + chart_id).highcharts();
                var number_of_series = series.length;
                var user_series = number_of_series / 2;
                for (var i = 0; i < user_series; i++) {
                    chart.addSeries({
                        name: chart.series[i].name.replace('(FAOSTAT)', '(User Data)')
                    });
                }
            }

            chart.redraw();

        } catch(e) {

        }

    };

    /* Query DB and prepare the payload for the charts. */
    GHG_QA_QC.prototype.plotSeries = function(series, datasource, domain_code, country, item, element, gunf_code) {
        var _this = this;
        var sql = {};
        var db_domain_code = domain_code;
        if (db_domain_code == 'ag_soils')
            db_domain_code = 'gt';
        switch (datasource) {
            case 'faostat':
                sql['query'] = "SELECT A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value " +
                    "FROM Data AS D, Area AS A, Element AS E, Item I " +
                    "WHERE D.DomainCode = '" + db_domain_code + "' AND D.AreaCode = '" + country + "' " +
                    "AND D.ElementListCode = '" + element + "' " +
                    "AND D.ItemCode IN ('" + item + "') " +
                    "AND D.Year IN (1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, " +
                    "2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, " +
                    "2010, 2011, 2012) " +
                    "AND D.AreaCode = A.AreaCode " +
                    "AND D.ElementListCode = E.ElementListCode " +
                    "AND D.ItemCode = I.ItemCode " +
                    "GROUP BY A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value " +
                    "ORDER BY D.Year DESC ";
                break;
            case 'nc':
                sql['query'] = "SELECT year, GUNFValue " +
                               "FROM UNFCCC_Comparison " +
                               "WHERE areacode = " + country + " " +
                               "AND code = '" + gunf_code + "' " +
                               "AND year IN (1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, " +
                                            "2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, " +
                                            "2010, 2011, 2012) " +
                               "ORDER BY year DESC ";
                break;
        }
        var data = {};
        data.datasource = 'faostat';
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = 2;
        data.json = JSON.stringify(sql);
        data.cssFilename = '';
        data.nowrap = false;
        data.valuesIndex = 0;
        $.ajax({
            type    :   'POST',
            url     :   this.CONFIG.url_data,
            data    :   data,
            success: function (response) {
                _this.prepare_chart_data(series, response, datasource, domain_code, item, element);
            },
            error: function (e, b, c) {

            }
        });
    };

    GHG_QA_QC.prototype.prepare_chart_data = function (series, db_data, datasource, domain_code, item, element) {
        var json = db_data;
        if (typeof json == 'string')
            json = $.parseJSON(db_data);
        var data = [];
        switch (datasource) {
            case 'faostat':
                for (var i = json.length - 1 ; i >= 0 ; i--) {
                    var tmp = [];
                    var year = parseInt(json[i][4]);
                    tmp.push(year);
                    tmp.push(parseFloat(json[i][5]));
                    data.push(tmp);
                }
                break;
            case 'nc':
                for (var i = json.length - 1 ; i >= 0 ; i--) {
                    var tmp = [];
                    if (json[i].length > 1) {
                        var year = parseInt(json[i][0]);
                        tmp.push(year);
                        tmp.push(parseFloat(json[i][1]));
                    } else {
                        var year = parseInt(json[i][0]);
                        tmp.push(year);
                        tmp.push(null);
                    }
                    data.push(tmp);
                }
                break;
        }
        if (data.length > 0) {
            series.setData(data);
        } else {
            $('#' + domain_code + '_' + item + '_' + element).html(translate.data_not_available);
        }
    };

    /* Show or hide a section. */
    GHG_QA_QC.prototype.showHideTable = function(left_table_id, right_table_id, label_id) {
        if ($('#' + left_table_id).css('display') == 'none') {
            $('#' + left_table_id).css('display', 'block');
            $('#' + left_table_id).animate({opacity: 1});
            $('#' + label_id).removeClass('fa fa-expand').addClass('fa fa-compress');
        } else {
            $('#' + left_table_id).animate(
                {opacity: 0}, function() {
                    $('#' + left_table_id).css('display', 'none');
                });
            $('#' + label_id).removeClass('fa fa-compress').addClass('fa fa-expand');
        }
        if ($('#' + right_table_id).css('display') == 'none') {
            $('#' + right_table_id).css('display', 'block');
            $('#' + right_table_id).animate({opacity: 1});
        } else {
            $('#' + right_table_id).animate(
                {opacity: 0}, function() {
                    $('#' + right_table_id).css('display', 'none');
                });
        }
    };

    /* Show or hide a section. */
    GHG_QA_QC.prototype.showHideCharts = function() {
        if ($('#charts_container').css('display') == 'none') {
            $('#charts_container').css('display', 'block');
            $('#charts_container').animate({opacity: 1});
            $('#charts_collapse_button').removeClass('fa fa-expand').addClass('fa fa-compress');
        } else {
            $('#charts_container').animate(
                {opacity: 0}, function() {
                    $('#charts_container').css('display', 'none');
                });
            $('#charts_collapse_button').removeClass('fa fa-compress').addClass('fa fa-expand');
        }
    };

    /* Create the tables through Mustache templating. */
    GHG_QA_QC.prototype.createTable = function(render_id, is_editable, title, start_year, end_year, id_prefix, callback) {

        /* Create time-range and inputs. */
        var years = [];
        var inputs_4 = [];
        var inputs_4A = [];
        var inputs_4B = [];
        var inputs_4C = [];
        var inputs_4D = [];
        var inputs_4E = [];
        var inputs_4F = [];
        for (var i = start_year; i <= end_year; i++) {
            years.push({'year': i});
            inputs_4.push({'input_id_4': id_prefix + '_4_' + i});
            inputs_4A.push({'input_id_4A': id_prefix + '_4A_' + i});
            inputs_4B.push({'input_id_4B': id_prefix + '_4B_' + i});
            inputs_4C.push({'input_id_4C': id_prefix + '_4C_' + i});
            inputs_4D.push({'input_id_4D': id_prefix + '_4D_' + i});
            inputs_4E.push({'input_id_4E': id_prefix + '_4E_' + i});
            inputs_4F.push({'input_id_4F': id_prefix + '_4F_' + i});
        }

        /* Define placeholders. */
        var view = {
            section_name: id_prefix,
            spinning_id: id_prefix + '_spinning',
            collapse_id: id_prefix + '_collapse_button',
            title: title,
            left_table_id: id_prefix + '_left_table',
            right_table_id: id_prefix + '_right_table',
            years: years,
            inputs_4: inputs_4,
            inputs_4A: inputs_4A,
            inputs_4B: inputs_4B,
            inputs_4C: inputs_4C,
            inputs_4D: inputs_4D,
            inputs_4E: inputs_4E,
            inputs_4F: inputs_4F,
            _code: $.i18n.prop('_code'),
            _category: $.i18n.prop('_category'),
            _agriculture: $.i18n.prop('_agriculture'),
            _enteric_fermentation: $.i18n.prop('_enteric_fermentation'),
            _manure_management: $.i18n.prop('_manure_management'),
            _rice_cultivation: $.i18n.prop('_rice_cultivation'),
            _agricultural_soils: $.i18n.prop('_agricultural_soils'),
            _prescribed_burning_of_savannas: $.i18n.prop('_prescribed_burning_of_savannas'),
            _field_burning_of_agricultural_residues: $.i18n.prop('_field_burning_of_agricultural_residues')
        };

        /* Load the right template. */
        var template = null;
        if (is_editable)
            template = $(templates).filter('#g1_table_editable').html();
        else
            template = $(templates).filter('#g1_table').html();

        /* Substitute placeholders. */
        var render = Mustache.render(template, view);

        /* Render the HTML. */
        document.getElementById(render_id).innerHTML = render;

        /* Bind show/hide function. */
        $('#' + id_prefix + '_collapse_button').on('click', function () {
            this.showHideTable(id_prefix + '_left_table', id_prefix + '_right_table', id_prefix + '_collapse_button');
        });

        /* Bind callback (if any) */
        if (callback != null)
            callback();

    };

    GHG_QA_QC.prototype.addDataToCharts = function() {
        this.addDataToSingleChart(['country_new_data_4_'], [2], 'chart_1');
        this.addDataToSingleChart(['country_new_data_4A_', 'country_new_data_4B_'], [4, 5], 'chart_2');
        this.addDataToSingleChart(['country_new_data_4C_'], [2], 'chart_3');
        this.addDataToSingleChart(['country_new_data_4D_'], [2], 'chart_4');
        this.addDataToSingleChart(['country_new_data_4E_', 'country_new_data_4F_'], [4, 5], 'chart_5');
    };

    GHG_QA_QC.prototype.addDataToSingleChart = function(input_prefixes, series_indices, chart_id) {

        /* Iterate over all the needed rows. */
        for (var z = 0 ; z < input_prefixes.length ; z++) {

            /* Store series index. */
            $('input[id^=' + input_prefixes[z] + ']').data({series_idx: series_indices[z]});

            $('input[id^=' + input_prefixes[z] + ']').keyup(function () {

                /* Add points to the chart. */
                var inputs = $('input[id^=' + this.id.substring(0, this.id.lastIndexOf('_')) + ']');
                var data = [];
                var chart = $('#' + chart_id).highcharts();
                for (var i = 0; i < inputs.length; i++) {
                    var year = Date.UTC(parseInt(inputs[i].id.substring(1 + inputs[i].id.lastIndexOf('_'))));
                    var value = parseFloat($(inputs[i]).val());
                    if (!isNaN(value) && value >= 0) {
                        var tmp = [year, value];
                        data.push(tmp);
                    } else {
                        var tmp = [year, null];
                        data.push(tmp);
                    }
                }

                /* Add points to the chart. */
                try {
                    chart.series[$.data(this, 'series_idx')].update({data: data});
                } catch (e) {
                    alert('Please select a country.')
                }

                /* Update Tables. */
                var value = parseFloat($(this).val());
                if (!isNaN(value)) {

                    var year = this.id.substring(1 + this.id.lastIndexOf('_'));
                    var crf = this.id.substring('country_new_data_'.length, this.id.lastIndexOf('_'));
                    var faostat = parseFloat(document.getElementById('emissions_db_faostat_' + crf + '_' + year).innerHTML);
                    var nc = parseFloat(document.getElementById('emissions_db_nc_' + crf + '_' + year).innerHTML);
                    var tot = parseFloat(document.getElementById('emissions_db_faostat_4_' + year).innerHTML);

                    var diff = (100 * (value - faostat) / faostat).toFixed(2);
                    var color = (diff >= 0) ? 'green' : 'red';
                    document.getElementById('cnd_fs_difference_' + crf + '_' + year).innerHTML = isNaN(diff) ? '' : diff + '%';
                    $('#cnd_fs_difference_' + crf + '_' + year).css('color', color);

                    var norm = (100 * (value - faostat) / tot).toFixed(2);
                    color = (norm >= 0) ? 'green' : 'red';
                    document.getElementById('normalised_cnd_fs_difference_' + crf + '_' + year).innerHTML = norm + '%';
                    $('#normalised_cnd_fs_difference_' + crf + '_' + year).css('color', color);

                    diff = (100 * (value - nc) / nc).toFixed(2);
                    color = (diff >= 0) ? 'green' : 'red';
                    document.getElementById('cnd_nc_difference_' + crf + '_' + year).innerHTML = diff + '%';
                    $('#cnd_nc_difference_' + crf + '_' + year).css('color', color);

                    tot = parseFloat(document.getElementById('emissions_db_faostat_4_' + year).innerHTML);
                    norm = (100 * (value - nc) / tot).toFixed(2);
                    color = (norm >= 0) ? 'green' : 'red';
                    document.getElementById('normalised_cnd_nc_difference_' + crf + '_' + year).innerHTML = norm + '%';
                    $('#normalised_cnd_nc_difference_' + crf + '_' + year).css('color', color);

                }

            });
        }
    };

    GHG_QA_QC.prototype.populateTable_EmissionsDatabaseNC = function(country_code, callback) {
        var sql = {
            'query' : 'select code, year, gunfvalue from UNFCCC_Comparison where areacode = ' + country_code
        };
        var data = {};
        data.datasource = 'faostat';
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = 2;
        data.json = JSON.stringify(sql);
        data.cssFilename = '';
        data.nowrap = false;
        data.valuesIndex = 0;
        $.ajax({
            type    :   'POST',
            url     :   this.CONFIG.url_data,
            data    :   data,
            success : function(response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                for (var i = 0 ; i < json.length ; i++) {
                    var id = 'emissions_db_nc_' + json[i][0].replace('.', '') + '_' + json[i][1];
                    try {
                        document.getElementById(id).innerHTML = (json[i].length > 2) ? json[i][2] : '';
                    } catch (e) {

                    }
                }
                if (callback != null)
                    callback();
            },
            error : function(err, b, c) { }
        });
    };

    GHG_QA_QC.prototype.populate_tables = function(country_code, callback) {

        var sql = {
            'query' : "SELECT A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value " +
                "FROM Data AS D, Area AS A, Element AS E, Item I " +
                "WHERE D.DomainCode = 'GT' AND D.AreaCode = '" + country_code + "' " +
                "AND D.ElementListCode = '7231' " +
                "AND D.ItemCode IN ('5058', '5059', '5060', '5066', '5067', '1709', '1711') " +
                "AND D.Year IN (1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, " +
                "2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, " +
                "2010, 2011, 2012) " +
                "AND D.AreaCode = A.AreaCode " +
                "AND D.ElementListCode = E.ElementListCode " +
                "AND D.ItemCode = I.ItemCode " +
                "GROUP BY A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value"
        };
        var data = {};
        data.datasource = 'faostat';
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = 2;
        data.json = JSON.stringify(sql);
        data.cssFilename = '';
        data.nowrap = false;
        data.valuesIndex = 0;

        var url_data = this.CONFIG.url_data;

        $.ajax({

            type    :   'POST',
            url     :   url_data,
            data    :   data,

            success : function(response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                for (var i = 0 ; i < json.length ; i++) {
                    var item = json[i][3];
                    var y = json[i][4];
                    var v = json[i][5];
                    var crf = null;
                    switch (item) {
                        case '1711': crf = '4';  break;
                        case '5058': crf = '4A'; break;
                        case '5059': crf = '4B'; break;
                        case '5060': crf = '4C'; break;
                        case '1709': crf = '4D'; break;
                        case '5067': crf = '4E'; break;
                        case '5066': crf = '4F'; break;
                    }
                    document.getElementById('emissions_db_faostat_' + crf + '_' + y).innerHTML = v;
                }

                var sql = {
                    'query' : 'select code, year, gunfvalue from UNFCCC_Comparison where areacode = ' + country_code
                };
                var data = {};
                data.datasource = 'faostat';
                data.thousandSeparator = ',';
                data.decimalSeparator = '.';
                data.decimalNumbers = 2;
                data.json = JSON.stringify(sql);
                data.cssFilename = '';
                data.nowrap = false;
                data.valuesIndex = 0;

                $.ajax({

                    type    :   'POST',
                    url     :   url_data,
                    data    :   data,

                    success : function(response) {
                        var json = response;
                        if (typeof json == 'string')
                            json = $.parseJSON(response);
                        for (var i = 0 ; i < json.length ; i++) {
                            var id = 'emissions_db_nc_' + json[i][0].replace('.', '') + '_' + json[i][1];
                            try {
                                document.getElementById(id).innerHTML = (json[i].length > 2) ? json[i][2] : '';
                            } catch (e) {

                            }
                        }
                        if (callback != null)
                            callback();
                    },

                    error : function(err, b, c) {

                    }

                });

            },

            error: function (e, b, c) {
                console.log(e);
                console.log(b);
                console.log(c);
            }

        });

    };

    GHG_QA_QC.prototype.populateTable_EmissionsDatabaseFAOSTAT = function(country_code) {
        var sql = {
            'query' : "SELECT A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value " +
                "FROM Data AS D, Area AS A, Element AS E, Item I " +
                "WHERE D.DomainCode = 'GT' AND D.AreaCode = '" + country_code + "' " +
                "AND D.ElementListCode = '7231' " +
                "AND D.ItemCode IN ('5058', '5059', '5060', '5066', '5067', '1709', '1711') " +
                "AND D.Year IN (1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, " +
                "2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, " +
                "2010, 2011, 2012) " +
                "AND D.AreaCode = A.AreaCode " +
                "AND D.ElementListCode = E.ElementListCode " +
                "AND D.ItemCode = I.ItemCode " +
                "GROUP BY A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value"
        }
        var data = {};
        data.datasource = 'faostat';
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = 2;
        data.json = JSON.stringify(sql);
        data.cssFilename = '';
        data.nowrap = false;
        data.valuesIndex = 0;
        $.ajax({
            type    :   'POST',
            url     :   CONFIG.url_data,
            data    :   data,
            success : function(response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                for (var i = 0 ; i < json.length ; i++) {
                    var item = json[i][3];
                    var y = json[i][4];
                    var v = json[i][5];
                    var crf = null;
                    switch (item) {
                        case '1711': crf = '4';  break;
                        case '5058': crf = '4A'; break;
                        case '5059': crf = '4B'; break;
                        case '5060': crf = '4C'; break;
                        case '1709': crf = '4D'; break;
                        case '5067': crf = '4E'; break;
                        case '5066': crf = '4F'; break;
                    }
                    document.getElementById('emissions_db_faostat_' + crf + '_' + y).innerHTML = v;
                }
            },
            error: function (e, b, c) {
                console.log(e);
                console.log(b);
                console.log(c);
            }
        });
    };

    GHG_QA_QC.prototype.exportData = function() {
        var data = {};
        var inputs = $('input[id^=country_new_data_]');
        for (var i = 0 ; i < inputs.length ; i++)
            data[inputs[i].id] = $(inputs[i]).val();
        data.country_code = $('#country_selector').find(":selected").val();
        var a = document.createElement('a');
        a.href = 'data:application/json,' + JSON.stringify(data);
        a.target = '_blank';
        a.download = $('#country_selector').find(":selected").val() + '_country_data.json';
        document.body.appendChild(a);
        a.click();
    };

    GHG_QA_QC.prototype.handlefilescatter = function(e) {
        var files = e.target.files;
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var json = $.parseJSON(e.target.result);
                    for (var key in json) {
                        var value = parseFloat(json[key]);
                        if (!isNaN(value) && value >= 0)
                            $('#' + key).val(value);
                    }
                    this.createChartsAndPopulateTable(json.country_code);
                };
            })(f);
            reader.readAsText(f);
        }
    };

    return new GHG_QA_QC();

});