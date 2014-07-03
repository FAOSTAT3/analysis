var GHG_OVERVIEW = (function() {

    var CONFIG = {
        placeholder: 'container_view',
        lang: 'E',
        prefix: 'http://168.202.28.214:8080/analysis/',

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
        html_structure: 'http://168.202.28.214:8080/analysis/ghg-overview-structure.html',
        I18N_URL: 'http://168.202.28.214:8080/faostat-gateway/static/faostat/I18N/',

        // Default Values of the comboboxes
        default_country : [2],
        default_from_year : [1990],
        default_to_year : [2010],

        // JSON resources
        baseurl_resources_ghg_overview: '/resources/json/ghg_overview.json',

        // selectors IDs
        selector_country_list : "fx_country_list",
        selector_from_year_list : "fx_from_year_list",
        selector_to_year_list : "fx_to_year_list"
    };

    function init(config) {

        // get configuration changes
        CONFIG = $.extend(true, CONFIG, config);

        // Load interface
        $('#' + CONFIG.placeholder).load(CONFIG.html_structure, function () {

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
            populateView(CONFIG.selector_from_year_list, url_years, CONFIG.default_from_year, "100%", false, {disable_search_threshold: 10});
            populateView(CONFIG.selector_to_year_list, url_years, CONFIG.default_to_year, "100%", false, {disable_search_threshold: 10});

        });
    };


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
            },
            error: function (a, b, c) {console.log(a + " " + b + " " + c); }
        });
    };


    function updateView() {
        var json = CONFIG.resources_json;

        // update views
        updateWorldBox(json)
        updateContinentBox(json)
        updateRegionBox(json)
        updateCountryBox(json)

        updateTableWorld(json)
    }

    function updateWorldBox(json) {
        var obj = {
            lang : CONFIG.lang,
            elementcode: "'" + CONFIG.elementcode + "'",
            itemcode: CONFIG.itemcode,
            fromyear: CONFIG.selected_from_year,
            toyear : CONFIG.selected_to_year,
            domaincode : "'" + CONFIG.domaincode + "'",
            aggregation : CONFIG.selected_aggregation
        }

        // Create Title
        var json_total = json.world_total;
        var total_obj = obj;
        total_obj.areacode = "'5000'"
        json_total = $.parseJSON(replaceValues(json_total, total_obj))

        // Create Pie
        var json_chart = json.world_chart;
        var chart_obj = obj;
        chart_obj.areacode = "'5100', '5200', '5300', '5400', '5500'"
        json_chart =  $.parseJSON(replaceValues(json_chart, chart_obj))

        createTitle("fx_world_total", json_total.sql)
        createChart("fx_world_chart", json_chart.sql)
    }

    function updateContinentBox(json) {
        // TODO: get the Continent code
        var code =  "'5400'"
        updateAreasBox(json, "fx_continent", code)

        var id = "fx_continent_table"
        var config = {
            placeholder : id,
            title: "By Continent",
            header: {
                column_0: "Continent",
                column_1: "Category"
            },
            content: {
                column_0: ""
            },
            total: {
                column_0: "Total",
                column_1: "Agriculture Total"
            },
            add_first_column: true
        }
        updateAreasTable(json, code, config)
    }

    function updateRegionBox(json) {
        // TODO: get the Region code
        var code =  "'5402'"

        updateAreasBox(json, "fx_region", code)

        var id = "fx_region_table";
        var config = {
            placeholder : id,
            title: "By Region",
            header: {
                column_0: "Region",
                column_1: "Category"
            },
            content: {
                column_0: ""
            },
            total: {
                column_0: "Total",
                column_1: "Agriculture Total"
            },
            add_first_column: true
        }
        console.log("Update region");
        updateAreasTable(json, code, config)
    }

    function updateCountryBox(json) {
        var codes = ""
        var areacodeCount = 0;
        if (typeof CONFIG.selected_areacodes == "object") {
            for (var i = 0; i < CONFIG.selected_areacodes.length; i++) {
                codes += "'" + CONFIG.selected_areacodes[i] + "'"
                if (i < CONFIG.selected_areacodes.length - 1)
                    codes += ","

                areacodeCount+=1;
            }
        }
        else
            codes = CONFIG.selected_areacodes

        // Update the Country Box
        updateAreasBox(json, "fx_country", codes)

        var id = "fx_country_table"
        var config = {
            placeholder : id,
            title: "By Country",
            header: {
                column_0: "Country",
                column_1: "Category"
            },
            content: {
                column_0: ""
            },
            total: {
                column_0: "Total",
                column_1: "Agriculture Total"
            },
            add_first_column: true
        }
        updateAreasTable(json, codes, config)
    }

    function updateAreasBox(json, id, areacode) {
        var obj = {
            lang : CONFIG.lang,
            elementcode: "'" + CONFIG.elementcode + "'",
            itemcode: CONFIG.itemcode,
            fromyear: CONFIG.selected_from_year,
            toyear : CONFIG.selected_to_year,
            domaincode : "'" + CONFIG.domaincode + "'",
            aggregation : CONFIG.selected_aggregation
        }

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

    function createTitle(id, sql) {
        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                $("#" + id + "_element").html(response[0][0])
                $("#" + id + "_value").html(response[0][1])
            },
            error : function(err, b, c) {}
        });
    }

    function createChart(id, sql) {
        var data = {};
        data.datasource = CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.decimalNumbers = '2';
        data.json = JSON.stringify(sql);
        $.ajax({
            type : 'POST',
            url : CONFIG.baseurl + CONFIG.baseurl_data,
            data : data,
            success : function(response) {
                response = (typeof data == 'string')? $.parseJSON(response): response;
                F3_CHART.createPie({ renderTo : id, title: "title"}, response)
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
        var obj = {
            lang : CONFIG.lang,
            elementcode: "'" + CONFIG.elementcode + "'",
            itemcode: CONFIG.itemcode,
            fromyear: CONFIG.selected_from_year,
            toyear : CONFIG.selected_to_year,
            domaincode : "'" + CONFIG.domaincode + "'",
            aggregation : CONFIG.selected_aggregation
        }

        var json_total = json.world_table;
        // TODO: Modify the JSON with the right attributes

       var total_obj = obj;
       json_total = $.parseJSON(replaceValues(json_total, total_obj))

        var config = {
            placeholder : "fx_world_table",
            title: "World",
            header: {
                column_0: "",
                column_1: "Continent"
            },
            content: {
                column_0: "World"
            },
            total: {
                column_0: "World",
                column_1: "Grand Total"
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
        var obj = {
            lang : CONFIG.lang,
            elementcode: "'" + CONFIG.elementcode + "'",
            itemcode: CONFIG.itemcode,
            fromyear: CONFIG.selected_from_year,
            toyear : CONFIG.selected_to_year,
            domaincode : "'" + CONFIG.domaincode + "'",
            aggregation : CONFIG.selected_aggregation
        }

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
        init: init
    };

})();