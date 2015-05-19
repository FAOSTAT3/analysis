define([
    'jquery',
    'text!tiled-analysis/js/ghg-overview/html/ghg-overview-structure.html',
    'text!tiled-analysis/js/ghg-overview/config/ghg_overview.json',
    'i18n!tiled-analysis/js/ghg-overview/nls/translate',
    'chosen',
    'highcharts',
    'highcharts_exporting',
    'F3_CHART',
    'F3_GHG_TABLE',
    'FENIXChartsLibrary',
    'jshashtable'
], function ($, template, resources_json, i18n) {

    'use strict';

    function GHG_OVERVIEW() {
        this.CONFIG = {
            resources_json: $.parseJSON(resources_json),
            placeholder: 'tiles_container',
            lang: 'E',
            prefix: 'http://168.202.28.214:8080/analysis/',

            // DATASOURCE
            datasource: 'faostat',

            // Values used in the queries
            domaincode: 'GT',
            itemcode: "'1709','5066','5067','5058','5059','5060'",
            elementcode: '7231',
            selected_aggregation: "AVG",

            // SP URLs
            baseurl: 'http://faostat3.fao.org',
            baseurl_data: '/wds/rest/table/json',
            baseurl_countries: '/wds/rest/procedures/countries',
            baseurl_years: '/wds/rest/procedures/years',

            // Default Values of the comboboxes
            // default_country: [49, 60, 138],
            default_country: [],

            //        default_country : [23,44,48,49,56,60,89,95,138,157,166,169],
            default_from_year: [1990],
            default_to_year: [2012],

            // JSON resources
            //baseurl_resources_ghg_overview: '/resources/json/ghg_overview.json',

            // selectors IDs
            selector_country_list: "fx_country_list",
            selector_from_year_list: "fx_from_year_list",
            selector_to_year_list: "fx_to_year_list",
            selector_domains: "fs_overview_domains",
            decimal_values: 2,

            colors: {
                itemcode: {
                    5058: '#9B2335',
                    5059: '#E15D44',
                    1709: '#5B5EA6',
                    5060: '#EFC050',
                    5066: '#DD4124',
                    5067: '#C3447A'
                }
            },

            alternative_colors: ['#1f678a','#92a8b7','#5eadd5','#6c79db','#a68122','#ffd569','#439966','#800432','#067dcc',
                '#1f678a','#92a8b7','#5eadd5','#6c79db','#a68122','#ffd569','#439966','#800432','#067dcc'
            ]
        };
    }


    GHG_OVERVIEW.prototype.init = function(config){

        // get configuration changes
        this.CONFIG = $.extend(true, this.CONFIG, config);

        // Load interface
        $('#' + this.CONFIG.placeholder).html(template);

        // Multilanguage
        this.loadLabels()

        // Default View
        var url = this.CONFIG.prefix + this.CONFIG.baseurl_resources_ghg_overview;
        this.CONFIG.selected_areacodes = this.CONFIG.default_country;
        this.CONFIG.selected_from_year = this.CONFIG.default_from_year;
        this.CONFIG.selected_to_year = this.CONFIG.default_to_year;

        // Populate DropDowns
        var url_country = this.CONFIG.baseurl + this.CONFIG.baseurl_countries + "/" + this.CONFIG.datasource + "/" + this.CONFIG.domaincode + "/" + this.CONFIG.lang
        var url_years = this.CONFIG.baseurl + this.CONFIG.baseurl_years + "/" + this.CONFIG.datasource + "/" + this.CONFIG.domaincode + "/" + this.CONFIG.lang
        this.populateView(this.CONFIG.selector_country_list,url_country, this.CONFIG.default_country, "100%", true, {disable_search_threshold: 10});
        this.populateViewYears(this.CONFIG.selector_from_year_list, 1990, 2012, this.CONFIG.default_from_year, "100%", false, {disable_search_threshold: 10});
        this.populateViewYears(this.CONFIG.selector_to_year_list, 1990, 2012, this.CONFIG.default_to_year, "100%", false, {disable_search_threshold: 10});
        this.populateDomainDropDown(this.CONFIG.selector_domains,  {disable_search_threshold: 10});

        var _this = this;
        $('#fs-overview-tables-button').on('click', function() {
            _this.showHideTables()
        });
        $('#fs-overview-tables-button-a').on('click', function() {
            _this.showHideTables()
        });

        // load the view if there are areas selected
        if (this.CONFIG.default_country.length > 0) {
            this.updateView();
        }
    };

    GHG_OVERVIEW.prototype.loadLabels = function() {
        $("#fs_label_area").html(i18n.country);
        $("#fs_label_fromyear").html(i18n.fromyear);
        $("#fs_label_toyear").html(i18n.toyear);
        $("#fs_label_domains").html(i18n.sector);

        $("#fs_label_world").html(i18n.world);
        $("#fs_label_continent").html(i18n.continents);
        $("#fs_label_region").html(i18n.regions);
        $("#fs_label_agriculture_total").html(i18n.agriculture_total);
        $("#fs_label_country").html(i18n.countries);
        $("#fs-overview-tables-button").append(i18n.show_hide_table_breakdown);
        $("#fx_world_total_item").html(i18n.agriculture_total);

        $("#overview_chart_ag_total").html(i18n.agriculture_total);
        $("#overview_chart_ag_total").append(" (" + i18n.country_region + ") ");
        //$("#overview_chart_ef_mm").html(i18n.enteric_fermentation') + " " + i18n.and') + " " + i18n.manure_management);
        //$("#overview_chart_ef_mm").append(" (" + i18n.sum_of_countries') + ")");
        //$("#overview_chart_ag_rc").html(i18n.agricultural_soils') + " " + i18n.and') + " " + i18n.rice_cultivation);
        //$("#overview_chart_ag_rc").append(" (" + i18n.sum_of_countries') + ")");
        //$("#overview_chart_bc_bs").html(i18n.burning_crops_residues') + " " + i18n.and') + " " +  i18n.burning_savanna);
        //$("#overview_chart_bc_bs").append(" (" + i18n.sum_of_countries') + ")");

        $("#overview_chart_ef").html(i18n.enteric_fermentation);
        $("#overview_chart_ef").append(" (" + i18n.sum_of_countries + ")");
        $("#overview_chart_mm").html(i18n.manure_management);
        $("#overview_chart_mm").append(" (" + i18n.sum_of_countries + ")");
        $("#overview_chart_ag").html(i18n.agricultural_soils);
        $("#overview_chart_ag").append(" (" + i18n.sum_of_countries + ")");
        $("#overview_chart_rc").html(i18n.rice_cultivation);
        $("#overview_chart_rc").append(" (" + i18n.sum_of_countries + ")");
        $("#overview_chart_bc").html(i18n.burning_crops_residues);
        $("#overview_chart_bc").append(" (" + i18n.sum_of_countries + ")");
        $("#overview_chart_bs").html(i18n.burning_savanna);
        $("#overview_chart_bs").append(" (" + i18n.sum_of_countries + ")");

        $("#fx_ghg_overview_title").html(i18n.ghg_overview_title);

        $("#fs_overview_note").html(i18n.ghg_overview_note);
        $("#fs_overview_subnote").html(i18n.ghg_overview_subnote);
    };

    GHG_OVERVIEW.prototype.showHideTables = function() {
        $('#fs-overview-tables').toggle();
    };

    GHG_OVERVIEW.prototype.populateDomainDropDown = function(id, chosen_parameters) {
        //var html = '<option value="null">' + i18n.please_select') + '</option>';
        var html = '<option>' + i18n.agriculture +'</option>';
        html += '<option disabled>'+ i18n.land_use +'</option>';

        // add html
        $('#' + id).html(html);
        $('#' + id).chosen(chosen_parameters);
    };

    GHG_OVERVIEW.prototype.populateView = function(id, url, default_code, dropdown_width, multiselection, chosen_parameters) {
        var _this = this;
        $.ajax({
            url         :   url,
            type        :   'GET',
            dataType    :   'json',
            success: function (response) {
                $('#' + id).empty();
                var response = (typeof response == 'string')? $.parseJSON(response): response;

                var ddID = id + "_dd";
                var html = '<select ';
                html += (multiselection)? 'multiple': '';
                html += ' id="'+ ddID+'" style="width:' + dropdown_width +'"  class="">';
                for(var i=0; i < response.length; i++) {
                    var selected = false;
                    for (var j = 0; j < default_code.length; j++) {
                        if (default_code[j] == response[i][0]) {
                            // TODO: set default
                            html += '<option selected="selected" value="' + response[i][0] + '">' + response[i][1] + '</option>';
                            selected = true
                            break;
                        }
                    }
                    if (!selected)
                        html += '<option value="' + response[i][0] + '">' + response[i][1] + '</option>';
                }
                html += '</select>';

                // add html
                $('#' + id).html(html);

                $('#' + id).on('change', function() {
                    _this.CONFIG.selected_areacodes = $('#' + _this.CONFIG.selector_country_list + "_dd").val()
                    _this.CONFIG.selected_from_year = $('#' + _this.CONFIG.selector_from_year_list + "_dd").val()
                    _this.CONFIG.selected_to_year = $('#' + _this.CONFIG.selector_to_year_list + "_dd").val()
                    _this.updateView();
                });

                $('#' + ddID).chosen(chosen_parameters);

                /** update countries list **/
                _this.updateCountryListNames()
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c); }
        });
    };

    GHG_OVERVIEW.prototype.populateViewYears = function(id, fromyear, toyear, default_code, dropdown_width, multiselection, chosen_parameters) {
        $('#' + id).empty();

        var ddID = id + "_dd";
        // TODO: dynamic width
        var html = '<select ';
        html += (multiselection)? 'multiple': '';
        html += ' id="'+ ddID+'" style="width:' + dropdown_width +'"  class="">';
        for(var i=toyear; i >= fromyear; i--) {
            var selected = false;
            for (var j = 0; j < default_code.length; j++) {
                if (default_code[j] == i) {
                    // TODO: set default
                    html += '<option selected="selected" value="' + i + '">' + i + '</option>';
                    selected = true
                    break;
                }
            }

            if (!selected)
                html += '<option value="' + i + '">' + i + '</option>';
        }
        html += '</select>';

        // add html
        $('#' + id).html(html);

        var _this = this;
        $('#' + id).on('change', function() {
            _this.CONFIG.selected_areacodes = $('#' + _this.CONFIG.selector_country_list + "_dd").val()
            _this.CONFIG.selected_areanames = $('#' + _this.CONFIG.selector_country_list + "_dd option:selected")
            _this.CONFIG.selected_from_year = $('#' + _this.CONFIG.selector_from_year_list + "_dd").val()
            _this.CONFIG.selected_to_year = $('#' + _this.CONFIG.selector_to_year_list + "_dd").val()
            _this.updateView();
        });

        $('#' + ddID).chosen(chosen_parameters);
    };

    GHG_OVERVIEW.prototype.updateView = function() {
        // hide note panel
        $('#fs_overview_note_panel').hide();

        if (this.CONFIG.selected_areacodes != null) {
            // show panel
            $("#fx_overview_panel").show();

            var json = this.CONFIG.resources_json;

            // update views
            this.updateWorldBox(json)
            this.updateContinentBox(json)
            this.updateSubRegionBox(json)
            this.updateCountryBox(json)

            this.updateTableWorld(json)

            this.updateChartsByCountries(json);

            // this changes the div with the names of the countries
            this.updateCountryListNames();
        }
        else{
            $("#fx_overview_panel").hide();
        }
    }

    GHG_OVERVIEW.prototype.updateWorldBox = function(json) {
        var obj = this.getConfigurationObject()

        var arecode = "'5000'"

        // Create Title
        var json_total = json.world_total;
        var total_obj = obj;
        total_obj.areacode = arecode
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        var json_chart = json.byarea_chart;
        var chart_obj = obj;
        chart_obj.areacode = arecode
        json_chart =  $.parseJSON(this.replaceValues(json_chart, chart_obj))

        this.createTitle("fx_world_total", json_total.sql)
        this.createChart("fx_world_chart", json_chart.sql, "pie")
    }

    GHG_OVERVIEW.prototype.updateContinentBox = function(json) {
        var obj = this.getConfigurationObject()

        // Getting Area Codes
        var codes = this.getQueryAreaCodes()

        // Replacing Query Object
        var json_total = json.query_regions;
        var total_obj = obj;
        total_obj.areacode = codes
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))

        var data = {};
        data.datasource = this.CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(json_total.sql);
        var _this = this;
        $.ajax({
            type : 'POST',
            url : this.CONFIG.baseurl + this.CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                var code = ""
                var areanames = ""
                for ( var i=0; i < response.length; i++) {
                    code += "'"+ response[i][0] +"'"
                    areanames += response[i][1]
                    if ( i < response.length -1) {
                        code += ","
                        areanames += ", "
                    }
                }

                var id = "fx_continent";
                var id_table = "fx_continent_table";
                var config = {
                    placeholder : id_table,
                    title: i18n.by_continent,
                    header: {
                        column_0: i18n.region,
                        column_1: i18n.category,
                    },
                    content: {
                        column_0: ""
                    },
                    total: {
                        column_0: i18n.total,
                        column_1:  i18n.agriculture_total,
                    },
                    add_first_column: true
                }
                _this.updateAreasBox(json, id, code, areanames)
                _this.updateAreasTable(json, code, config)
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c);}
        });
    }

    GHG_OVERVIEW.prototype.updateSubRegionBox = function(json) {
        var obj = this.getConfigurationObject();

        // Getting Area Codes
        var codes = this.getQueryAreaCodes()

        // Replacing Query Object
        var json_total = json.query_sub_regions;
        var total_obj = obj;
        total_obj.areacode = codes
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))

        var data = {};
        data.datasource = this.CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(json_total.sql);
        var _this = this;
        $.ajax({
            type : 'POST',
            url : this.CONFIG.baseurl + this.CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                var code = ""
                var areanames = ""
                for ( var i=0; i < response.length; i++) {
                    code += "'"+ response[i][0] +"'"
                    areanames += response[i][1]
                    if ( i < response.length -1) {
                        code += ","
                        areanames += ", "
                    }
                }

                var id = "fx_region";
                var id_table = id + "_table";
                var config = {
                    placeholder : id_table,
                    title: "By Region",
                    header: {
                        column_0: i18n.region,
                        column_1: i18n.category,
                    },
                    content: {
                        column_0: ""
                    },
                    total: {
                        column_0:i18n.total,
                        column_1: i18n.agriculture_total,
                    },
                    add_first_column: true
                }
                _this.updateAreasBox(json, id, code, areanames)
                _this.updateAreasTable(json, code, config)
                _this.updateTimeserieAgricultureTotal(json, code)
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c); }
        });
    }

    GHG_OVERVIEW.prototype.updateChartsByCountries = function(json) {
        var obj = this.getConfigurationObject();
        var areacodes = this.getQueryAreaCodes();

        // create charts
        //var json_total = json.byitem_chart
        //var total_obj = obj;
        //total_obj.areacode = areacodes
        //total_obj.itemcode = "'5058', '5059'"
        //json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        //this.createChart("fx_chart_1", json_total.sql, 'timeserie')
        //
        //var json_total = json.byitem_chart
        //var total_obj = obj;
        //total_obj.areacode = areacodes
        //total_obj.itemcode = "'1709', '5060'"
        //json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        //this.createChart("fx_chart_2", json_total.sql, 'timeserie')
        //
        //var json_total = json.byitem_chart
        //var total_obj = obj;
        //total_obj.areacode = areacodes
        //total_obj.itemcode = "'5066', '5067'"
        //json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        //this.createChart("fx_chart_3", json_total.sql, 'timeserie')

        // Create Charts by item
        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5058'"
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_chart_0", json_total.sql, 'timeserie', ['#9B2335'])

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5059'"
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_chart_1", json_total.sql, 'timeserie', ['#E15D44'])

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'1709'"
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_chart_2", json_total.sql, 'timeserie', ['#5B5EA6'])

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5060'"
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_chart_3", json_total.sql, 'timeserie', ['#EFC050'])

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5066'"
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_chart_4", json_total.sql, 'timeserie', ['#DD4124'])

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5067'"
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_chart_5", json_total.sql, 'timeserie', ['#C3447A'])

    }

    /** TODO: not hardcoded **/
    GHG_OVERVIEW.prototype.updateCountryListNames = function() {
        var areanames = $('#' + this.CONFIG.selector_country_list + "_dd option:selected")
        var label = ""
        if ( typeof areanames == "object") {
            for (var i = 0; i < areanames.length; i++) {
                label +=  areanames[i].text
                if (i < areanames.length - 1)
                    label += ", "
            }
        }
        else
            label = this.CONFIG.selected_areacodes;
        $('#fx_country_total_name').html(label)
    }

    GHG_OVERVIEW.prototype.updateCountryBox = function(json) {
        var codes = this.getQueryAreaCodes()
        var id = "fx_country"
        var id_table = id + "_table"
        var config = {
            placeholder : id_table,
            title: i18n.by_country,
            header: {
                column_0: i18n.country,
                column_1: i18n.category,
            },
            content: {
                column_0: ""
            },
            total: {
                column_0:i18n.total,
                column_1: i18n.agriculture_total,
            },
            add_first_column: true
        }
        this.updateAreasBox(json, id, codes, null)
        this.updateAreasTable(json, codes, config)
    }

    GHG_OVERVIEW.prototype.updateAreasBox = function(json, id, areacode, areanames) {
        if ( areanames )
            $("#" + id + "_total_name").html(areanames)

        var obj = this.getConfigurationObject();

        // Create Title
        var json_total = json.byarea_total;
        var total_obj = obj;
        total_obj.areacode = areacode
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))

        // Create Pie
        var json_chart = json.byarea_chart;
        var chart_obj = obj;
        chart_obj.areacode = areacode
        json_chart =  $.parseJSON(this.replaceValues(json_chart, chart_obj))

        this.createTitle(id + "_total", json_total.sql)
        this.createChart(id + "_chart", json_chart.sql, "pie")
    }

    GHG_OVERVIEW.prototype.updateTimeserieAgricultureTotal = function(json, regions) {
        var obj = this.getConfigurationObject();
        var areacodes = this.getQueryAreaCodes();
        var areas_query = areacodes + ',' + regions;

        // Create Title
        var json_total = json.agriculture_total_chart
        var total_obj = obj;
        total_obj.areacode = areas_query
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))
        this.createChart("fx_agriculture_total_chart", json_total.sql, 'timeserie')
    }

    GHG_OVERVIEW.prototype.createTitle = function(id, sql) {
        var data = {};
        data.datasource = this.CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        //console.log(JSON.stringify(sql));
        var _this = this;
        $.ajax({
            type : 'POST',
            url : this.CONFIG.baseurl + this.CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                $("#" + id + "_element").html(response[0][0])
                var value = Number(parseFloat(response[0][1]).toFixed(_this.CONFIG.decimal_values)).toLocaleString();
                $("#" + id + "_value").html(value)
            },
            error : function(err, b, c) {}
        });
    }

    GHG_OVERVIEW.prototype.createChart = function(id, sql, type, colors) {
        $('#' + id).show();
        var data = {};
        data.datasource = this.CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        //console.log(JSON.stringify(sql));
        var chartObj = {renderTo: id, title: "title"}
        //if (colors) {
        //    chartObj.colors = colors
        //}
        var _this = this;
        $.ajax({
            type : 'POST',
            url : this.CONFIG.baseurl + this.CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                var response = (typeof data == 'string')? $.parseJSON(response): response;
                if (response.length > 0) {

                    // get colors
                    // TODO: dirty fix
                    chartObj.colors = colors || null;


                    switch (type) {
                        case "pie" :
                            chartObj.serie = {};
                            chartObj.serie.name = i18n.pie_mu;
                            chartObj.colors = colors || _this.getColorsPie(response) || null;
                            F3_CHART.createPie(chartObj, response);
                            break;
                        case "timeserie" :
                            // FIX for the chart engine
                            var chart = []
                            chart.push(response)
                            F3_CHART.createTimeserie(chartObj, 'line', chart);
                            break;
                    }
                }
                else {
                    $('#' + id).html(i18n.no_data_to_display);
                }

            },
            error : function(err, b, c) {}
        });
    };

    GHG_OVERVIEW.prototype.getColorsPie = function(data) {
        if (data[0].length > 4) {
            var colors = []
            for(var i=0; i< data.length; i++) {
                if (this.CONFIG.colors.itemcode[data[i][4]])
                    colors.push(this.CONFIG.colors.itemcode[data[i][4]]);
                else
                    colors.push(alternative_colors[i]);
            }
            return colors;
        }
        else
            return null;
    };

    GHG_OVERVIEW.prototype.updateTableWorld = function(json) {
        var years = []
        if ( typeof this.CONFIG.selected_from_year == 'object') {
            years.push(this.CONFIG.selected_from_year[0])
            for ( var i = this.CONFIG.selected_from_year[0]+1; i <= this.CONFIG.selected_to_year[0]; i++) {
                years.push(i)
            }
        }
        else{
            years.push(parseInt(this.CONFIG.selected_from_year))
            for ( var i = parseInt(this.CONFIG.selected_from_year)+1; i <= parseInt(this.CONFIG.selected_to_year); i++) {
                years.push(i)
            }
        }
        var obj = this.getConfigurationObject();

        var json_total = json.world_table;
        // TODO: Modify the JSON with the right attributes

        var total_obj = obj;
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))

        var config = {
            placeholder : "fx_world_table",
            title: i18n.world,
            header: {
                column_0: "",
                column_1: i18n.continent
            },
            content: {
                column_0: i18n.world
            },
            total: {
                column_0: i18n.world,
                column_1: i18n.grand_total
            },
            add_first_column: false
        }
        this.createTable(json_total.sql, years, config)
    }

    GHG_OVERVIEW.prototype.updateAreasTable = function(json, areacode, config) {
        var years = []
        if ( typeof this.CONFIG.selected_from_year == 'object') {
            years.push(this.CONFIG.selected_from_year[0])
            for ( var i = this.CONFIG.selected_from_year[0]+1; i <= this.CONFIG.selected_to_year[0]; i++) {
                years.push(i)
            }
        }
        else{
            years.push(parseInt(this.CONFIG.selected_from_year))
            for ( var i = parseInt(this.CONFIG.selected_from_year)+1; i <= parseInt(this.CONFIG.selected_to_year); i++) {
                years.push(i)
            }
        }
        var obj = this.getConfigurationObject();

        // Create Title
        var json_total = json.byarea_table;
        var total_obj = obj;
        total_obj.areacode = areacode
        json_total = $.parseJSON(this.replaceValues(json_total, total_obj))

        this.createTable(json_total.sql, years, config)
    }

    GHG_OVERVIEW.prototype.createTable = function(sql, years, config) {
        var data = {};
        data.datasource = this.CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        //console.log(JSON.stringify(sql));
        var table = new F3_GHG_TABLE();
        $.ajax({
            type : 'POST',
            url : this.CONFIG.baseurl + this.CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                $("#" + config.placeholder).empty();
                table.init(config, years, response)
            },
            error : function(err, b, c) {}
        });
    }

    GHG_OVERVIEW.prototype.createTimeserieAgricultureTotal = function(json) {
        var obj = this.getConfigurationObject();
        var codes = this.getQueryAreaCodes();

        /** TODO: **/
        var json_obj = json[id];
        var total_obj = obj;
        total_obj.areacode = codes
        json_obj = $.parseJSON(this.replaceValues(json_obj, total_obj))

        $('#' + id + "_title").html(json_obj.title[this.CONFIG.lang.toUpperCase()]);
        this.createChart(id + "_chart", json_obj.sql, "pie")
    }

    GHG_OVERVIEW.prototype.getConfigurationObject = function() {
        var obj = {
            lang : this.CONFIG.lang.toUpperCase(),
            elementcode: "'" + this.CONFIG.elementcode + "'",
            itemcode: this.CONFIG.itemcode,
            fromyear: this.CONFIG.selected_from_year,
            toyear : this.CONFIG.selected_to_year,
            domaincode : "'" + this.CONFIG.domaincode + "'",
            aggregation : this.CONFIG.selected_aggregation
        }
        return obj;
    }

    GHG_OVERVIEW.prototype.getQueryAreaCodes = function() {
        var codes = ""
        if ( typeof this.CONFIG.selected_areacodes == "object") {
            for (var i = 0; i < this.CONFIG.selected_areacodes.length; i++) {
                codes += "'" + this.CONFIG.selected_areacodes[i] + "'"
                if (i < this.CONFIG.selected_areacodes.length - 1)
                    codes += ","
            }
        }
        else
            codes = this.CONFIG.selected_areacodes;
        return codes;
    }

    GHG_OVERVIEW.prototype.replaceValues = function(response, obj) {
        var json = (typeof data == 'string') ? response : JSON.stringify(response);
        for (var key in obj) {
            json = this.replaceAll(json, "{{" + key.toUpperCase() + "}}", obj[key])
        }
        return json
    };

    GHG_OVERVIEW.prototype.replaceAll = function(text, stringToFind, stringToReplace) {
        try {
            var temp = text;
            var index = temp.indexOf(stringToFind);
            while (index != -1) {
                temp = temp.replace(stringToFind, stringToReplace);
                index = temp.indexOf(stringToFind);
            }
            return temp;
        }catch (e) {
            return text;
        }
    }

    return GHG_OVERVIEW;
});