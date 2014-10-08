define(['jquery',
        'mustache',
        'text!tiled-analysis/js/ghg-qa-qc/html/templates.html',
        'text!tiled-analysis/js/ghg-qa-qc/config/selectors.json',
        'text!tiled-analysis/js/ghg-qa-qc/config/ghg_verification_chart_template.json',
        'text!tiled-analysis/js/ghg-qa-qc/config/items_tab_map.json',
        'text!tiled-analysis/js/ghg-qa-qc/config/charts_configuration.json',
        'i18n!tiled-analysis/js/ghg-qa-qc/nls/translate',
        'chosen',
        'highcharts',
        'highcharts_exporting',
        'bootstrap'], function ($,
                                Mustache,
                                templates,
                                selectors_configuration,
                                chart_template,
                                items_tab_map,
                                charts_configuration,
                                translate) {

    'use strict';

    function GHG_QA_QC() {

        this.CONFIG = {
            lang            :   'E',
            datasource      :   'faostat',
            url_procedures  :   'http://faostat3.fao.org/wds/rest/procedures/countries/faostat/GT',
            url_data        :   'http://faostat3.fao.org/wds/rest/table/json',
            url_editor      :   'http://fenixapps.fao.org/repository/ghg-editor/',
            url_i18n        :   'http://fenixapps2.fao.org/ghg/ghg-editor/I18N/',
            url_listboxes   :   'http://faostat3.fao.org/wds/rest/procedures/usp_GetListBox/',
            default_colors  :   ['#379bcd', '#76BE94', '#744490', '#E10079', '#2D1706', '#F1E300', '#F7AE3C', '#DF3328']
        };

    }

    GHG_QA_QC.prototype.init = function(config) {

        /* Extend default configuration. */
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);

        /* Cast configuration files. */
        selectors_configuration = $.parseJSON(selectors_configuration);
        chart_template = $.parseJSON(chart_template);
        items_tab_map = $.parseJSON(items_tab_map);
        charts_configuration = $.parseJSON(charts_configuration);

        /* Load GHG-QA/QC structure. */
        var view = {
            'tab_verification_label': translate.verification,
            'tab_qaqc_label': translate.qa_qc,
            'ghg_verification_areas_label': translate.areas,
            'ghg_verification_groups_label': translate.domains
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

        /* Populate groups. */
        this.create_groups_selector('groups', 'ghg_verification_groups_list', selectors_configuration.groups[0].target);

    };

    GHG_QA_QC.prototype.create_groups_selector = function(selector_code, selector_id) {

        /* Variables. */
        var target = null;

        /* Populate drop-down. */
        $('#' + selector_id).append('<option value="null">' + translate.please_select + '</option>');
        for (var i = 0; i < selectors_configuration[selector_code].length; i++) {
            target = selectors_configuration[selector_code][i].target;
            var s = '<option value="';
            s += selectors_configuration[selector_code][i].code;
            s += '">';
            s += selectors_configuration[selector_code][i].label[this.CONFIG.lang];
            s += '</option>';
            $('#' + selector_id).append(s);
        }

        /* Initiate Chosen. */
        $('#' + selector_id).trigger('chosen:updated');

        /* On-change listener. */
        $('#' + selector_id).change({'module': this}, function (e) {
            e.data.module.on_group_change(selector_id);
        });

    };

    GHG_QA_QC.prototype.on_group_change = function(selector_id) {

        /* Read the selected option. */
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
            'agsoils': translate.ag_soils
        };
        var template = $(templates).filter('#' + template_id).html();
        var render = Mustache.render(template, view);
        $('#ghg_verification_content').html(render);

        /* Render charts and tables tabs: Agricultural Total */
        if (option_selected == 'ghg_qa_qc_verification_agri_total_structure') {
            var at = ['gt', 'agsoils', 'ge', 'gm', 'gr', 'gb', 'gh'];
            for (var i = 0; i < at.length; i++)
                this.create_charts_and_tables_tabs(at[i] + '_charts_and_tables', at[i]);
        }

        /* Render charts and tables tabs: Land Use */
        if (option_selected == 'ghg_qa_qc_verification_land_use_structure') {
            var lu = ['gl', 'gf', 'gc', 'gg', 'gi'];
            for (i = 0; i < lu.length; i++)
                this.create_charts_and_tables_tabs(lu[i] + '_charts_and_tables', lu[i]);
        }

    };

    GHG_QA_QC.prototype.create_charts_and_tables_tabs = function(id, domain_code) {
        var view = {
            'charts_label': translate.charts,
            'tables_label': translate.tables,
            'id_charts_content': domain_code + '__charts_content',
            'id_tables_content': domain_code +'_tables_content',
            'id_tables_content_faostat': domain_code +'_tables_content_faostat',
            'id_tables_content_nc': domain_code +'_tables_content_nc',
            'id_tables_content_difference': domain_code +'_tables_content_difference',
            'id_tables_content_norm_difference': domain_code +'_tables_content_norm_difference',
            'href_charts': domain_code + '_charts',
            'href_tables': domain_code + '_tables'
        };
        var template = $(templates).filter('#charts_and_tables').html();
        var render = Mustache.render(template, view);
        $('#' + id).html(render);
        this.read_charts_table_configuration(domain_code);
    };

    GHG_QA_QC.prototype.read_charts_table_configuration = function(domain_code) {

        /* 'this' wrapper for asynchronous functions. */
        var _this = this;

        /* Load configurations for the given domain. */
        var config = charts_configuration[domain_code];

        /* Load items. */
        $.ajax({

            type: 'GET',
            dataType: 'json',
            url: this.CONFIG.url_listboxes + this.CONFIG.datasource + '/' + domain_code + '/3/1/' + this.CONFIG.lang,

            success: function (response) {

                /* Cast response to JSON. */
                var items = response;
                if (typeof items == 'string')
                    items = $.parseJSON(response);

                /* Remove items contained in the blacklist. */
                for (var i = items.length - 1 ; i >= 0 ; i--)
                    if ($.inArray(items[i][0], config.items_blacklist) > -1)
                        items.splice(i, 1);

                /* Process results. */
                _this.process_charts_table_configuration(domain_code, config, items);

            },

            error : function(err) {
                var items = [];
                for (var i = 0 ; i < config.totals.length ; i++) {
                    var item = [];
                    item.push(config.totals[i].item.code);
                    item.push(translate[config.totals[i].item.label]);
                    item.push('TOTAL');
                    item.push(config.totals[i].gunf_code);
                    items.push(item);
                }
                _this.process_charts_table_configuration(domain_code, config, items);
            }

        });

    };

    GHG_QA_QC.prototype.process_charts_table_configuration = function(domain_code, config, items) {

        var links = [];

        /* Add items listed as totals. */
        for (i = config.totals.length - 1; i >= 0 ; i--)
            items.splice(0, 0, [config.totals[i].item.code,
                                translate[config.totals[i].item.label],
                                'TOTAL',
                                config.totals[i].gunf_code]);

        /* Prepare items for the template. */
        var mustache_items = [];
        var td_ids = [];

        /* Iterate over items. */
        for (i = 0; i < items.length; i++) {

            /* Create objects for templating. */
            var add_to_template = false;
            var tmp = {};
            tmp.item = items[i][1];
            tmp['data_not_available'] = translate.data_not_available;
            tmp['tab_link'] = items[i][0] + '_anchor';
            if ($.inArray(items[i][0] + '_anchor', links) < 0) {
                links.push(items[i][0] + '_anchor');
                add_to_template = true;
            }

            /* Totals may have different elements. */
            try {

                if (items[i][2] == 'TOTAL') {
                    for (var j = 0; j < config.totals[i].element_codes.length; j++) {
                        var td_id = domain_code + '_' + items[i][0] + '_' + config.totals[i].element_codes[j];
                        td_id += '_TOTAL' + '_' + items[i][3];
                        tmp['col' + j] = td_id;
                        td_ids.push(td_id);
                    }
                }

                /* Standard elements are applied for the items. */
                else {
                    for (var j = 0; j < config.elements.length; j++) {
                        var td_id = domain_code + '_' + items[i][0] + '_' + config.elements[j];
                        tmp['col' + j] = td_id;
                        td_ids.push(td_id);
                    }
                }

                } catch(e) {

                }

            /* Add to the items for templating. */
            if (add_to_template)
                mustache_items.push(tmp);

        }

        /* Load and render the template. */
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

        /* Populate charts table. */
        this.populate_charts_table(td_ids);

        /* Load table's template */
        switch (domain_code) {

            /* Agriculture Total tables. */
            case 'gt':
                this.load_table_template('gt_tables_content_faostat', translate.faostat, 1990, 2012, 'gt_faostat', 'faostat');
                this.load_table_template('gt_tables_content_nc', translate.nc, 1990, 2012, 'gt_nc', 'nc');
                this.load_table_template('gt_tables_content_difference', translate.difference, 1990, 2012, 'gt_difference', 'difference');
                this.load_table_template('gt_tables_content_norm_difference', translate.norm_difference, 1990, 2012, 'gt_norm_difference', 'norm_difference');
                break;

            /* Agricultural Soils tables. */
            case 'agsoils':
                this.load_agsoils_table_template('agsoils_tables_content', translate.faostat, 1990, 2013, 'prefix', 'faostat');
                break;
        }


        /* Link to tabs. */
        for (var i = 0; i < items.length; i++) {
            $('#' + items[i][0] + '_anchor').click({'items': items, 'i': i}, function(event) {
                var group = items_tab_map[event.data.items[event.data.i][0]].group;
                var tab = items_tab_map[event.data.items[event.data.i][0]].tab;
                $('#' + group + ' a[href="#' + tab + '"]').tab('show');
            });
        }

    };

    GHG_QA_QC.prototype.load_agsoils_table_template = function(render_id, label, start_year, end_year, id_prefix, datasource) {

        var categories = [
            {'category_code': '4.D', 'category_label': translate.ag_soils},
            {'category_code': '4.D.1', 'category_label': translate.direct_soil_emissions},
            {'category_code': '4.D.1.1', 'category_label': translate.gy},
            {'category_code': '4.D.1.2', 'category_label': translate.gu},
            {'category_code': '4.D.1.4', 'category_label': translate.gp},
            {'category_code': '4.D.1.5', 'category_label': translate.gv}
        ];
        var years = [];
        var inputs = [];

        for (var i = start_year ; i < end_year ; i++)
            years.push({'year': i});

        for (var j = start_year; j < end_year; j++) {
            var id = datasource + '_' + j;
            inputs.push({
                'input_4d': id + '_4d',
                'input_4d1': id + '_4d1',
                'input_4d11': id + '_4d11',
                'input_4d12': id + '_4d12',
                'input_4d14': id + '_4d14',
                'input_4d15': id + '_4d15'
            });
        }

        /* Load and render the template. */
        var view = {
            'title': label,
            'code_title_label': translate.code,
            'category_title_label': translate.category,
            'categories': categories,
            'years': years,
            'inputs': inputs
        };
        var template = $(templates).filter('#ag_soils_table').html();
        var render = Mustache.render(template, view);
        $('#' + render_id).html(render);

        this.populate_agsoils_tables(this.CONFIG.country_code, datasource);

    };

    GHG_QA_QC.prototype.populate_agsoils_tables = function(country_code, datasource) {
        switch (datasource) {
            case 'faostat':
                this.populate_agsoils_tables_faostat(country_code);
                break;
            case 'nc':
                this.populate_tables_nc(country_code);
                break;
            case 'difference':
                this.populate_tables_difference(country_code);
                break;
            case 'norm_difference':
                this.populate_tables_norm_difference(country_code);
                break;
        }
    };

    GHG_QA_QC.prototype.populate_agsoils_tables_faostat = function(country_code) {
        var query_config = [
            {item: '1709', element: '7231'},
            {item: '5056', element: '7235'},
            {item: '3102', element: '72353'},
            {item: '1755', element: '72351'},
            {item: '1712', element: '72352'},
            {item: '6729', element: '72318'},
            {item: '1755', element: '72350'},
            {item: '5057', element: '7237'}
        ];
        for (var z = 0 ; z < query_config.length ; z++) {
            var sql = {
                'query': "SELECT A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value, D.ElementCode " +
                    "FROM Data AS D, Area AS A, Element AS E, Item I " +
                    "WHERE D.AreaCode = '" + country_code + "' " +
                    "AND D.ElementCode IN (" + query_config[z].element + ") " +
                    "AND D.ItemCode IN (" + query_config[z].item + ") " +
                    "AND D.Year IN (1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, " +
                    "2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, " +
                    "2010, 2011, 2012) " +
                    "AND D.AreaCode = A.AreaCode " +
                    "AND D.ElementListCode = E.ElementListCode " +
                    "AND D.ItemCode = I.ItemCode " +
                    "GROUP BY A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value, D.ElementCode"
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
                type: 'POST',
                url: url_data,
                data: data,
                success: function (response) {
                    var json = response;
                    if (typeof json == 'string')
                        json = $.parseJSON(response);
                    for (var i = 0; i < json.length; i++) {
                        var item = json[i][3];
                        var element = json[i][6];
                        var y = json[i][4];
                        var v = json[i][5];
                        var crf = null;
                        switch (element) {
                            case '7231':
                                crf = '4d';
                                break;
                            case '7235':
                                crf = '4d1';
                                break;
                            case '72353':
                                crf = '4d11';
                                break;
                            case '72351':
                                crf = '4d12';
                                break;
                            case '72352':
                                crf = '4d14';
                                break;
                            case '72318':
                                crf = '4d15';
                                break;
                        }
                        var value = parseFloat(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        $('#faostat_' + y + '_' + crf).html(value);
                    }
                }
            });
        }
    };

    GHG_QA_QC.prototype.populate_tables_faostat = function(country_code) {
        var sql = {
            'query': "SELECT A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value " +
                "FROM Data AS D, Area AS A, Element AS E, Item I " +
                "WHERE D.DomainCode = 'GT' " +
                "AND D.AreaCode = '" + country_code + "' " +
                "AND D.ElementListCode = '7231' " +
                "AND D.ItemCode IN ('5058', '5059', '5060', '5066', '5067', '1709', '1711'," +
                "'5056', '1755', '1712', '6729', '5057') " +
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
                    var value = parseFloat(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    $('#gt_faostat_' + crf + '_' + y).html(value);
                }
            }
        });
    };

    /* Create the tables through Mustache templating. */
    GHG_QA_QC.prototype.load_table_template = function(render_id, label, start_year, end_year, id_prefix, datasource) {

        /* This... */
        var _this = this;

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
            left_table_id: id_prefix + '_left_table',
            right_table_id: id_prefix + '_right_table',
            years: years,
            title: label,
            inputs_4: inputs_4,
            inputs_4A: inputs_4A,
            inputs_4B: inputs_4B,
            inputs_4C: inputs_4C,
            inputs_4D: inputs_4D,
            inputs_4E: inputs_4E,
            inputs_4F: inputs_4F,
            _code: translate.code,
            _category: translate.category,
            _agriculture: translate.gt,
            _enteric_fermentation: translate.ge,
            _manure_management: translate.gm,
            _rice_cultivation: translate.gr,
            _agricultural_soils: translate.ag_soils,
            _prescribed_burning_of_savannas: translate.gh,
            _field_burning_of_agricultural_residues: translate.gb,
            _direct_soil_emissions: translate.direct_soil_emissions,
            _synthetic_fertilizers: translate.gy,
            _manure_applied_to_soils: translate.gu,
            _crop_residues: translate.ga,
            _cultivation_of_histosols: translate.gv
        };

        /* Load the template. */
        var template = $(templates).filter('#g1_table').html();

        /* Substitute placeholders. */
        var render = Mustache.render(template, view);

        /* Render the HTML. */
        $(document.getElementById(render_id)).html(render);

        /* Populate table. */
        this.populate_tables(this.CONFIG.country_code, datasource);

    };

    GHG_QA_QC.prototype.populate_tables = function(country_code, datasource) {
        switch (datasource) {
            case 'faostat':
                this.populate_tables_faostat(country_code);
                break;
            case 'nc':
                this.populate_tables_nc(country_code);
                break;
            case 'difference':
                this.populate_tables_difference(country_code);
                break;
            case 'norm_difference':
                this.populate_tables_norm_difference(country_code);
                break;
        }
    };

    GHG_QA_QC.prototype.populate_tables_norm_difference = function(country_code) {
        var sql = {
            'query': 'select code, year, NormPerDiff from UNFCCC_Comparison where areacode = ' + country_code
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
            type: 'POST',
            url: this.CONFIG.url_data,
            data: data,
            success: function (response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                for (var i = 0; i < json.length; i++) {
                    var id = 'gt_norm_difference_' + json[i][0].replace('.', '') + '_' + json[i][1];
                    var value = parseFloat(json[i][2]);
                    if (isNaN(value))
                        $('#' + id).html();
                    else
                        $('#' + id).html(value.toFixed(2));
                }
            }
        });
    };

    GHG_QA_QC.prototype.populate_tables_difference = function(country_code) {
        var sql = {
            'query': 'select code, year, PerDiff from UNFCCC_Comparison where areacode = ' + country_code
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
            type: 'POST',
            url: this.CONFIG.url_data,
            data: data,
            success: function (response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                for (var i = 0; i < json.length; i++) {
                    var id = 'gt_difference_' + json[i][0].replace('.', '') + '_' + json[i][1];
                    var value = parseFloat(json[i][2]);
                    if (isNaN(value))
                        $('#' + id).html();
                    else
                        $('#' + id).html(value.toFixed(2));
                }
            }
        });
    };

    GHG_QA_QC.prototype.populate_tables_nc = function(country_code) {
        var sql = {
            'query': 'select code, year, gunfvalue from UNFCCC_Comparison where areacode = ' + country_code
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
            type: 'POST',
            url: this.CONFIG.url_data,
            data: data,
            success: function (response) {
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                for (var i = 0; i < json.length; i++) {
                    var id = 'gt_nc_' + json[i][0].replace('.', '') + '_' + json[i][1];
                    var value = parseFloat(json[i][2]);
                    if (isNaN(value))
                        $('#' + id).html();
                    else
                        $('#' + id).html(value.toFixed(2));
                }
            }
        });
    };

    GHG_QA_QC.prototype.populate_tables_faostat = function(country_code) {
        var sql = {
            'query': "SELECT A.AreaNameS, E.ElementListNameS, I.ItemNameS, I.ItemCode, D.Year, D.value " +
                     "FROM Data AS D, Area AS A, Element AS E, Item I " +
                     "WHERE D.DomainCode = 'GT' " +
                     "AND D.AreaCode = '" + country_code + "' " +
                     "AND D.ElementListCode = '7231' " +
                     "AND D.ItemCode IN ('5058', '5059', '5060', '5066', '5067', '1709', '1711'," +
                                        "'5056', '1755', '1712', '6729', '5057') " +
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
                    var value = parseFloat(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    $('#gt_faostat_' + crf + '_' + y).html(value);
                }
            }
        });
    };

    GHG_QA_QC.prototype.populate_charts_table = function(td_ids) {

        /* Iterate over the charts table cells. */
        for (var i = 0 ; i < td_ids.length ; i++) {

            /* Read parameters. */
            var params = td_ids[i].split('_');
            var domain_code = params[0];
            var item_code = params[1];
            var element_code = params[2];
            var gunf_code = null;
            var series_definition = [];

            /* FAOSTAT chart definition. */
            var faostat = {
                name: 'FAOSTAT',
                domain: domain_code,
                country: this.CONFIG.country_code,
                item: item_code,
                element: element_code,
                datasource: 'faostat',
                type: 'line',
                enableMarker: false,
                gunf_code: null
            };

            /* UNFCCC chart definition. */
            var unfccc = {
                name: 'NC',
                domain: 'GT',
                country: this.CONFIG.country_code,
                item: '4',
                element: null,
                datasource: 'nc',
                type: 'scatter',
                enableMarker: true,
                gunf_code: null
            };

            /* Additional parameters for 'total' charts. */
            if ($.inArray('TOTAL', params) > -1) {
                gunf_code = params[4];
                unfccc.gunf_code = gunf_code;
                faostat.gunf_code = gunf_code;
                faostat.domain = charts_configuration.domains_map[domain_code];
            }

            /* Create chart. */
            series_definition.push(faostat);
            if (gunf_code != null)
                series_definition.push(unfccc);
            this.createChart(td_ids[i], '', series_definition, false, this.CONFIG.default_colors);

        }

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
                    _this.on_group_change('ghg_verification_groups_list');
                });
            }
        });
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

    /* Charts template. */
    GHG_QA_QC.prototype.createChart = function(chart_id, title, series, add_user_data, colors) {
        var _this = this;
        var p = chart_template;
        var custom_p = {
            chart: {
                events: {
                    load: function() {
                        for (var i = 0 ; i < series.length ; i++) {
                            var chart_series = this.series[i];
                            _this.plotSeries(chart_series,
                                             series[i].datasource,
                                             series[i].domain,
                                             series[i].country,
                                             series[i].item,
                                             series[i].element,
                                             series[i].gunf_code);
                        }
                    }
                },
                type: 'line'
            },
            colors: colors,
            tooltip: {
                formatter: function() {
                    var s = [];
                    $.each(this.points, function(i, point) {
                        var value = parseFloat(point.y).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        var tmp = '';
                        tmp += '<b>';
                        tmp += point.series.name;
                        tmp += ':</b> ';
                        tmp += value;
                        tmp += ' (' + point.x + ')';
                        s.push(tmp);
                    });
                    return s.join('<br>');
                },
                shared: true
            }
        };
        custom_p.series = [];
        for (var i = 0 ; i < series.length ; i++) {
            custom_p.series[i] = {};
            custom_p.series[i].name = series[i].name;

        }
        p = $.extend(true, {}, p, custom_p);
        $(document.getElementById(chart_id)).highcharts(p);

        /* Create chart. */
        var chart = $('#' + chart_id).highcharts();

    };

    /* Query DB and prepare the payload for the charts. */
    GHG_QA_QC.prototype.plotSeries = function(series, datasource, domain_code, country, item, element, gunf_code) {

        var _this = this;
        var sql = {};
        var db_domain_code = domain_code;

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
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);
                _this.prepare_chart_data(series, json, datasource, domain_code, item, element);
            },
            error: function (e, b, c) {

            }
        });
    };

    GHG_QA_QC.prototype.prepare_chart_data = function (series, db_data, datasource, domain_code, item, element) {
        var data = [];
        switch (datasource) {
            case 'faostat':
                for (var i = db_data.length - 1 ; i >= 0 ; i--) {
                    var tmp = [];
                    var year = parseInt(db_data[i][4]);
                    tmp.push(year);
                    tmp.push(parseFloat(db_data[i][5]));
                    data.push(tmp);
                }
                break;
            case 'nc':
                for (var i = db_data.length - 1 ; i >= 0 ; i--) {
                    var tmp = [];
                    if (db_data[i].length > 1) {
                        var year = parseInt(db_data[i][0]);
                        tmp.push(year);
                        tmp.push(parseFloat(db_data[i][1]));
                    } else {
                        var year = parseInt(db_data[i][0]);
                        tmp.push(year);
                        tmp.push(null);
                    }
                    data.push(tmp);
                }
                break;
        }

        if (data.length > 0) {

            /* Add data to the chart. */
            series.setData(data);

            /* Make it scatter for UNFCCC. */
            if (series.name == 'NC') {
                series.update({
                    marker: {
                        enabled: true
                    },
                    type: 'scatter',
                    lineWidth: 0
                });
            }

        }

        else {
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