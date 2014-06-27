var GHG_COUNTRY_PROFILE = (function() {

    var CONFIG = {
        placeholder: 'container_view',
        lang: 'E',
        prefix: 'http://168.202.28.214:8080/analysis/',

        // DATASOURCE
        datasource: 'faostat',

        // Values used in the queries
        domaincode: 'GT',
        itemcode: "'1711','1709','5066','5067','5058','5059','5060'",
        elementcode: '7231',
        selected_aggregation : "AVG",

        // SP URLs
        baseurl: 'http://faostat3.fao.org',
        baseurl_data: '/wds/rest/table/json',
        baseurl_countries: '/wds/rest/procedures/countries',
        baseurl_years: '/wds/rest/procedures/years',

        // Structures and Labels
        html_structure: 'http://168.202.28.214:8080/analysis/ghg-country-profile-structure.html',
        I18N_URL: 'http://168.202.28.214:8080/faostat-gateway/static/faostat/I18N/',

        // Default Values of the comboboxes
        default_country : [2],
        default_from_year : [1990],
        default_to_year : [2010],

        // JSON resources
        baseurl_resources_ghg_country_profile: '/resources/json/ghg_country_profile.json',

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
            var url = CONFIG.prefix + CONFIG.baseurl_resources_ghg_country_profile;
            CONFIG.selected_areacodes = CONFIG.default_country;
            CONFIG.selected_from_year = CONFIG.default_from_year;
            CONFIG.selected_to_year = CONFIG.default_to_year;
            $.ajax({
                url: url,
                type: 'GET',
                success: function (response) {
                   CONFIG.baseurl_resources_ghg_country_profile_json = (typeof response == 'string')? $.parseJSON(response): response;
                   updateView()
                },
                error: function (a, b, c) {}
            });

            // Populate DropDowns
            var url_country = CONFIG.baseurl + CONFIG.baseurl_countries + "/" + CONFIG.datasource + "/" + CONFIG.domaincode + "/" + CONFIG.lang
            var url_years = CONFIG.baseurl + CONFIG.baseurl_years + "/" + CONFIG.datasource + "/" + CONFIG.domaincode + "/" + CONFIG.lang
            populateView(CONFIG.selector_country_list,url_country, CONFIG.default_country, "200px", false, {disable_search_threshold: 10});
            populateView(CONFIG.selector_from_year_list, url_years, CONFIG.default_from_year, "100px", false, {disable_search_threshold: 10});
            populateView(CONFIG.selector_to_year_list, url_years, CONFIG.default_to_year, "100px", false, {disable_search_threshold: 10});

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
        var json = CONFIG.baseurl_resources_ghg_country_profile_json;
        updateChart(json, "first")
        updateChart(json, "second")
        updateChart(json, "third")
        updateChart(json, "fourth")
    }

    /**
     *
     *
     * @param json
     * @param id used as ID reference and ID in the jsonfile
     */
    function updateChart(json, id) {
        var obj = {
            lang : CONFIG.lang.toUpperCase(),
            elementcode: "'" + CONFIG.elementcode + "'",
            itemcode: CONFIG.itemcode,
            fromyear: CONFIG.selected_from_year,
            toyear : CONFIG.selected_to_year,
            domaincode : "'" + CONFIG.domaincode + "'",
            aggregation : CONFIG.selected_aggregation
        }

        var codes = ""
        for ( var i =0; i < CONFIG.selected_areacodes.length; i++) {
            codes += "'" + CONFIG.selected_areacodes[i] + "'"
            if ( i < CONFIG.selected_areacodes.length - 1)
                codes += ","
        }

        var json_obj = json[id];
        var total_obj = obj;
        total_obj.areacode = codes
        json_obj = $.parseJSON(replaceValues(json_obj, total_obj))

        $('#' + id + "_title").html(json_obj.title[CONFIG.lang.toUpperCase()]);
        createChart(id + "_chart", json_obj.sql)
    }


    function createChart(id, sql) {
        $('#' + id).html("<i class='fa fa-refresh fa-spin fa-5x'></i>");
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
                var test = []
                test.push(response)
                F3_CHART.createTimeserie({ renderTo : id, title: "title"}, 'line', test)
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