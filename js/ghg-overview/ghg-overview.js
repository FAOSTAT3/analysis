var GHG_OVERVIEW = (function() {

    var CONFIG = {
        placeholder: 'container_view',
        lang: 'E',
        prefix: 'http://fenixapps2.fao.org/ghg/analysis/',

        // DATASOURCE
        datasource: 'faostat',

        // Values used in the queries
        domaincode: 'GT',
        itemcode: "'1709','5066','5067','5058','5059','5060'",
        elementcode: '7231',
        selected_aggregation : "AVG",

        // SP URLs
        baseurl: 'http://faostat3.fao.org',
        baseurl_data: '/wds/rest/table/json',
        baseurl_countries: '/wds/rest/procedures/countries',
        baseurl_years: '/wds/rest/procedures/years',

        // Structures and Labels
        html_structure: 'http://fenixapps2.fao.org/ghg/analysis/ghg-overview-structure.html',
        I18N_URL: 'http://fenixapps2.fao.org/ghg/faostat-gateway/static/faostat/I18N/',

        // Default Values of the comboboxes
        default_country : [49,60,138],
//        default_country : [23,44,48,49,56,60,89,95,138,157,166,169],
        default_from_year : [1990],
        default_to_year : [2010],

        // JSON resources
        baseurl_resources_ghg_overview: '/resources/json/ghg_overview.json',

        // selectors IDs
        selector_country_list : "fx_country_list",
        selector_from_year_list : "fx_from_year_list",
        selector_to_year_list : "fx_to_year_list",
        decimal_values : 2
    };

    function init(config) {

        // get configuration changes
        CONFIG = $.extend(true, CONFIG, config);

        // Load interface
        $('#' + CONFIG.placeholder).load(CONFIG.html_structure, function () {

            // Multilanguage
            loadLabels()

            // Default View
            var url = CONFIG.prefix + CONFIG.baseurl_resources_ghg_overview;
            CONFIG.selected_areacodes = CONFIG.default_country;
            CONFIG.selected_from_year = CONFIG.default_from_year;
            CONFIG.selected_to_year = CONFIG.default_to_year;
            $.ajax({
                url: url,
                type: 'GET',
                success: function (response) {
                    CONFIG.resources_json = (typeof response == 'string')? $.parseJSON(response): response;
                    updateView()
                },
                error: function (a, b, c) {}
            });

            // Populate DropDowns
            var url_country = CONFIG.baseurl + CONFIG.baseurl_countries + "/" + CONFIG.datasource + "/" + CONFIG.domaincode + "/" + CONFIG.lang
            var url_years = CONFIG.baseurl + CONFIG.baseurl_years + "/" + CONFIG.datasource + "/" + CONFIG.domaincode + "/" + CONFIG.lang
            populateView(CONFIG.selector_country_list,url_country, CONFIG.default_country, "100%", true, {disable_search_threshold: 10});
            populateViewYears(CONFIG.selector_from_year_list, 1990, 2010, CONFIG.default_from_year, "100%", false, {disable_search_threshold: 10});
            populateViewYears(CONFIG.selector_to_year_list, 1990, 2010, CONFIG.default_to_year, "100%", false, {disable_search_threshold: 10});
        });
    };

    function loadLabels() {
//        $("#fs_label_area").html($.i18n.prop('_area'));
        $("#fs_label_area").html($.i18n.prop('_select_a_country'));
        $("#fs_label_fromyear").html($.i18n.prop('_fromyear'));
        $("#fs_label_toyear").html($.i18n.prop('_toyear'));
        $("#fs_label_world").html($.i18n.prop('_world'));
        $("#fs_label_continent").html($.i18n.prop('_continents'));
        $("#fs_label_region").html($.i18n.prop('_regions'));
        $("#fs_label_agriculture_total").html($.i18n.prop('_agriculture_total'));
        $("#fs_label_country").html($.i18n.prop('_countries'));
        $("#fs-overview-tables-button").html($.i18n.prop('_show_hide_table_breakdown'));
        $("#fx_world_total_item").html($.i18n.prop('_agriculture_total'));

        $("#overview_chart_ag_total").html($.i18n.prop('_agriculture_total'));
        $("#overview_chart_ag_total").append(" (" + $.i18n.prop('_country_region') + ")");
        $("#overview_chart_ef_mm").html($.i18n.prop('_enteric_fermentation') + " " + $.i18n.prop('_and') + " " + $.i18n.prop('_manure_management'));
        $("#overview_chart_ef_mm").append(" (" + $.i18n.prop('_sum_of_countries') + ")");
        $("#overview_chart_ag_rc").html($.i18n.prop('_agricultural_soils') + " " + $.i18n.prop('_and') + " " + $.i18n.prop('_rice_cultivation'));
        $("#overview_chart_ag_rc").append(" (" + $.i18n.prop('_sum_of_countries') + ")");
        $("#overview_chart_bc_bs").html($.i18n.prop('_burning_crops_residues') + " " + $.i18n.prop('_and') + " " +  $.i18n.prop('_burning_savanna'));
        $("#overview_chart_bc_bs").append(" (" + $.i18n.prop('_sum_of_countries') + ")");

        $("#fx_ghg_overview_title").html($.i18n.prop('_ghg_overview_title'));
    }

    function showHideTables() {
        $('#fs-overview-tables').toggle();
    }

    function populateView(id, url, default_code, dropdown_width, multiselection, chosen_parameters) {
        $.ajax({
            url         :   url,
            type        :   'GET',
            dataType    :   'json',
            success: function (response) {
                $('#' + id).empty();
                response = (typeof data == 'string')? $.parseJSON(response): response;

                var ddID = id + "_dd";
                // TODO: dynamic width
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
                    CONFIG.selected_areacodes = $('#' + CONFIG.selector_country_list + "_dd").val()
                    CONFIG.selected_from_year = $('#' + CONFIG.selector_from_year_list + "_dd").val()
                    CONFIG.selected_to_year = $('#' + CONFIG.selector_to_year_list + "_dd").val()
                    updateView();
                });

                $('#' + ddID).chosen(chosen_parameters);

                /** update countries list **/
                updateCountryListNames()
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c); }
        });
    };

    function populateViewYears(id, fromyear, toyear, default_code, dropdown_width, multiselection, chosen_parameters) {

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

                $('#' + id).on('change', function() {
                    CONFIG.selected_areacodes = $('#' + CONFIG.selector_country_list + "_dd").val()
                    CONFIG.selected_areanames = $('#' + CONFIG.selector_country_list + "_dd option:selected")
                    CONFIG.selected_from_year = $('#' + CONFIG.selector_from_year_list + "_dd").val()
                    CONFIG.selected_to_year = $('#' + CONFIG.selector_to_year_list + "_dd").val()
                    updateView();
                });

                $('#' + ddID).chosen(chosen_parameters);
    };


    function updateView() {
        var json = CONFIG.resources_json;

        // update views
        updateWorldBox(json)
        updateContinentBox(json)
        updateSubRegionBox(json)
        updateCountryBox(json)

        updateTableWorld(json)

        updateChartsByCountries(json);

        // this changes the div with the names of the countries
        updateCountryListNames();
    }

    function updateWorldBox(json) {
        var obj = getconfugirationObject()

        var arecode = "'5000'"

        // Create Title
        var json_total = json.world_total;
        var total_obj = obj;
        total_obj.areacode = arecode
        json_total = $.parseJSON(replaceValues(json_total, total_obj))

        // Create Pie
//        var json_chart = json.world_chart;
//        var chart_obj = obj;
//        chart_obj.areacode = "'5100', '5200', '5300', '5400', '5500'"
//        json_chart =  $.parseJSON(replaceValues(json_chart, chart_obj))

        var json_chart = json.byarea_chart;
        var chart_obj = obj;
        chart_obj.areacode = arecode
        json_chart =  $.parseJSON(replaceValues(json_chart, chart_obj))

        createTitle("fx_world_total", json_total.sql)
        createChart("fx_world_chart", json_chart.sql)
    }

    function updateContinentBox(json) {
        var obj = getconfugirationObject()

        // Getting Area Codes
        var codes = getQueryAreaCodes()

        // Replacing Query Object
        var json_total = json.query_regions;
        var total_obj = obj;
        total_obj.areacode = codes
        json_total = $.parseJSON(replaceValues(json_total, total_obj))

        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(json_total.sql);
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
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
                    title: $.i18n.prop('_by_continent'),
                    header: {
                        column_0: $.i18n.prop('_region'),
                        column_1: $.i18n.prop('_category')
                    },
                    content: {
                        column_0: ""
                    },
                    total: {
                        column_0: $.i18n.prop('_total'),
                        column_1:  $.i18n.prop('_agriculture_total')
                    },
                    add_first_column: true
                }
                updateAreasBox(json, id, code, areanames)
                updateAreasTable(json, code, config)
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c); }
        });
    }

    function updateSubRegionBox(json) {
        var obj = getconfugirationObject();

        // Getting Area Codes
        var codes = getQueryAreaCodes()

        // Replacing Query Object
        var json_total = json.query_sub_regions;
        var total_obj = obj;
        total_obj.areacode = codes
        json_total = $.parseJSON(replaceValues(json_total, total_obj))

        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(json_total.sql);
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
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
                        column_0: $.i18n.prop('_region'),
                        column_1: $.i18n.prop('_category')
                    },
                    content: {
                        column_0: ""
                    },
                    total: {
                        column_0:$.i18n.prop('_total'),
                        column_1: $.i18n.prop('_agriculture_total')
                    },
                    add_first_column: true
                }
                updateAreasBox(json, id, code, areanames)
                updateAreasTable(json, code, config)

                updateTimeserieAgricultureTotal(json, code)
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c); }
        });
    }

    function updateChartsByCountries(json) {
        var obj = getconfugirationObject();
        var areacodes = getQueryAreaCodes();

        // Create Second Chart
        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5058', '5059'"
        json_total = $.parseJSON(replaceValues(json_total, total_obj))
        createChart("fx_second_chart", json_total.sql, 'timeserie')

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'1709', '5060'"
        json_total = $.parseJSON(replaceValues(json_total, total_obj))
        createChart("fx_third_chart", json_total.sql, 'timeserie')

        var json_total = json.byitem_chart
        var total_obj = obj;
        total_obj.areacode = areacodes
        total_obj.itemcode = "'5066', '5067'"
        json_total = $.parseJSON(replaceValues(json_total, total_obj))
        createChart("fx_fourth_chart", json_total.sql, 'timeserie')
    }

    /** TODO: not hardcoded **/
    function updateCountryListNames() {
        var areanames = $('#' + CONFIG.selector_country_list + "_dd option:selected")
        var label = ""
        if ( typeof areanames == "object") {
            for (var i = 0; i < areanames.length; i++) {
                label +=  areanames[i].text
                if (i < areanames.length - 1)
                    label += ", "
            }
        }
        else
            label = CONFIG.selected_areacodes;
        $('#fx_country_total_name').html(label)
    }

    function updateCountryBox(json) {
        var codes = getQueryAreaCodes()

        var id = "fx_country"
        var id_table = id + "_table"
        var config = {
            placeholder : id_table,
            title: $.i18n.prop('_by_country'),
            header: {
                column_0: $.i18n.prop('_country'),
                column_1: $.i18n.prop('_category')
            },
            content: {
                column_0: ""
            },
            total: {
                column_0:$.i18n.prop('_total'),
                column_1: $.i18n.prop('_agriculture_total')
            },
            add_first_column: true
        }
        updateAreasBox(json, id, codes, null)
        updateAreasTable(json, codes, config)
    }


    function updateAreasBox(json, id, areacode, areanames) {
        if ( areanames )
            $("#" + id + "_total_name").html(areanames)

        var obj = getconfugirationObject();

        // Create Title
        var json_total = json.byarea_total;
        var total_obj = obj;
        total_obj.areacode = areacode
        json_total = $.parseJSON(replaceValues(json_total, total_obj))

        // Create Pie
        var json_chart = json.byarea_chart;
        var chart_obj = obj;
        chart_obj.areacode = areacode
        json_chart =  $.parseJSON(replaceValues(json_chart, chart_obj))

        createTitle(id + "_total", json_total.sql)
        createChart(id + "_chart", json_chart.sql)
    }

    function updateTimeserieAgricultureTotal(json, regions) {
        var obj = getconfugirationObject();
        var areacodes = getQueryAreaCodes();

        var areas_query = areacodes + ',' + regions;

        // Create Title
        var json_total = json.agriculture_total_chart
        var total_obj = obj;
        total_obj.areacode = areas_query
        json_total = $.parseJSON(replaceValues(json_total, total_obj))
       createChart("fx_agriculture_total_chart", json_total.sql, 'timeserie')
    }

    function createTitle(id, sql) {
        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        console.log(JSON.stringify(sql));
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                $("#" + id + "_element").html(response[0][0])
                var value = Number(parseFloat(response[0][1]).toFixed(CONFIG.decimal_values)).toLocaleString();
                $("#" + id + "_value").html(value)
            },
            error : function(err, b, c) {}
        });
    }

    function createChart(id, sql, type) {
        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        //console.log(JSON.stringify(sql));
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                switch(type) {
                    case "pie" :  F3_CHART.createPie({ renderTo : id, title: "title"}, response); break;
                    case "timeserie" :
                        // FIX for the chart engine
                        var chart = []
                        chart.push(response)
                        F3_CHART.createTimeserie({ renderTo : id, title: "title"}, 'line', chart); break;
                    default: F3_CHART.createPie({ renderTo : id, title: "title"}, response); break;
                }

            },
            error : function(err, b, c) {}
        });
    }

    function updateTableWorld(json) {
        var years = []
        if ( typeof CONFIG.selected_from_year == 'object') {
            years.push(CONFIG.selected_from_year[0])
            for ( var i = CONFIG.selected_from_year[0]+1; i <= CONFIG.selected_to_year[0]; i++) {
                years.push(i)
            }

        }
        else{
            years.push(parseInt(CONFIG.selected_from_year))
            for ( var i = parseInt(CONFIG.selected_from_year)+1; i <= parseInt(CONFIG.selected_to_year); i++) {
                years.push(i)
            }
        }
        var obj = getconfugirationObject();

        var json_total = json.world_table;
        // TODO: Modify the JSON with the right attributes

       var total_obj = obj;
       json_total = $.parseJSON(replaceValues(json_total, total_obj))

        var config = {
            placeholder : "fx_world_table",
            title: $.i18n.prop('_world'),
            header: {
                column_0: "",
                column_1: $.i18n.prop('_continent')
            },
            content: {
                column_0: $.i18n.prop('_world')
            },
            total: {
                column_0: $.i18n.prop('_world'),
                column_1: $.i18n.prop('_grand_total')
            },
            add_first_column: false
        }
       createTable(json_total.sql, years, config)
    }

    function updateAreasTable(json, areacode, config) {
        var years = []
        if ( typeof CONFIG.selected_from_year == 'object') {
            years.push(CONFIG.selected_from_year[0])
            for ( var i = CONFIG.selected_from_year[0]+1; i <= CONFIG.selected_to_year[0]; i++) {
                years.push(i)
            }

        }
        else{
            years.push(parseInt(CONFIG.selected_from_year))
            for ( var i = parseInt(CONFIG.selected_from_year)+1; i <= parseInt(CONFIG.selected_to_year); i++) {
                years.push(i)
            }
        }
        var obj = getconfugirationObject();

        // Create Title
        var json_total = json.byarea_table;
        var total_obj = obj;
        total_obj.areacode = areacode
        json_total = $.parseJSON(replaceValues(json_total, total_obj))

        createTable(json_total.sql, years, config)
    }


    function createTable(sql, years, config) {
        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        console.log(JSON.stringify(sql));
        var table = new F3_GHG_TABLE();
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                $("#" + config.placeholder).empty();
                table.init(config, years, response)
            },
            error : function(err, b, c) {}
        });
    }

    function createTimeserieAgricultureTotal(json) {
        var obj = getconfugirationObject();
        var codes = getQueryAreaCodes();

        /** TODO: **/
        var json_obj = json[id];
        var total_obj = obj;
        total_obj.areacode = codes
        json_obj = $.parseJSON(replaceValues(json_obj, total_obj))

        $('#' + id + "_title").html(json_obj.title[CONFIG.lang.toUpperCase()]);
        createChart(id + "_chart", json_obj.sql)
    }

    function getconfugirationObject() {
        var obj = {
            lang : CONFIG.lang.toUpperCase(),
            elementcode: "'" + CONFIG.elementcode + "'",
            itemcode: CONFIG.itemcode,
            fromyear: CONFIG.selected_from_year,
            toyear : CONFIG.selected_to_year,
            domaincode : "'" + CONFIG.domaincode + "'",
            aggregation : CONFIG.selected_aggregation
        }
        return obj;
    }

    function getQueryAreaCodes() {
        var codes = ""
        if ( typeof CONFIG.selected_areacodes == "object") {
            for (var i = 0; i < CONFIG.selected_areacodes.length; i++) {
                codes += "'" + CONFIG.selected_areacodes[i] + "'"
                if (i < CONFIG.selected_areacodes.length - 1)
                    codes += ","
            }
        }
        else
            codes = CONFIG.selected_areacodes;
        return codes;
    }

    function replaceValues(response, obj) {
        var json = (typeof data == 'string') ? response : JSON.stringify(response);
        for (var key in obj) {
            json = replaceAll(json, "{{" + key.toUpperCase() + "}}", obj[key])
        }
        return json
    };

    function replaceAll(text, stringToFind, stringToReplace) {
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

    return {
        init: init,
        showHideTables: showHideTables
    };

})();