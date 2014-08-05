var F3_ANALYSIS = (function() {

    var CONFIG = {
        placeholder: 'container',
        lang: 'E',
        prefix: 'http://168.202.28.210:8080/analysis/',

        datasource: 'faostat2',

        baseurl: 'http://168.202.28.210:8080',

        domain: 'IG',
        baseurl_country: '/wds/rest/procedures/countries',
        baseurl_dates: '/wds/rest/procedures/years',

        theme: 'faostat',
        html_structure: 'http://168.202.28.210:8080/analysis/analysis.html',

        // Tiles
        placeholder_tiles: 'container_tiles',
        html_structure_tiles: 'http://168.202.28.210:8080/analysis/analysis-tiles.html',

        // Views
        placeholder_view: 'container_views',

        // I18N
        I18N_URL: "http://168.202.28.210:8080/faostat-gateway/static/faostat/I18N/",

        // IF null create tiles
        default_view: null,
        view_config: {}
    };

    function init(config) {

        /* Store user preferences. */
        CONFIG = $.extend(true, CONFIG, config);

        /**
         * Read and store settings for web-services
         */
        $.getJSON(CONFIG.prefix + 'config/analysis-configuration.json', function (data) {

            // MERGE data with CONFIG
            CONFIG = $.extend(true, CONFIG, data);

            // LOAD I18N
            var I18NLang = '';
            switch (CONFIG.lang) {
                case 'F' : I18NLang = 'fr';break;
                case 'S' :I18NLang = 'es'; break;
                default: I18NLang = 'en'; break;
            }

            $.i18n.properties({
                name: 'I18N',
                path: CONFIG.I18N_URL,
                mode: 'both',
                language: I18NLang,
                callback: function () {
                    $('#' + CONFIG.placeholder).load(CONFIG.html_structure, function () {
                        loadLabels();
                        if ( !CONFIG.default_view)
                                loadTilesGUI()
                        else
                            loadView(CONFIG.default_view, CONFIG.view_config)
                    });

                }
            });

        });
    }

    function loadLabels() {
        $("#pageTitle").html($.i18n.prop('_analysis'));
    }

    function loadTilesGUI() {
        $("#" + CONFIG.placeholder_view).hide();
        // TODO: tiles
        $('#' + CONFIG.placeholder_tiles).load(CONFIG.html_structure_tiles, function () {
            $("#ghg-overview").click(function() { loadView("ghg-overview") });
            $("#ghg-country-profile").click(function() {  loadView("ghg-country-profile") } );
            $("#ghg-indicators").click(function() { loadView("ghg-indicators") });
            $("#ghg-geo-referenced-data").click(function() { loadView("ghg-geo-referenced-data") });
            $('#_overview_image').attr('src', $.i18n.prop('_overview_image'));
            $('#_quality_image').attr('src', $.i18n.prop('_quality_image'));
            $('#_indicators_image').attr('src', $.i18n.prop('_indicators_image'));
            $('#_data_image').attr('src', $.i18n.prop('_data_image'));
        });
    };

    function loadView(view) {
        // Hide Tiles container TODO: check hide
        $("#" + CONFIG.placeholder_tiles).hide();


        // creating the configuration object for the different modules
        var view_config = {
            lang : CONFIG.lang
        }
        switch(view) {
            case 'ghg-overview':
                $("#" + CONFIG.placeholder_tiles).hide();
                GHG_OVERVIEW.init(view_config);
                break;
            case 'ghg-indicators':
                $("#" + CONFIG.placeholder_tiles).hide();
                GHG_COUNTRY_PROFILE.init_indicators(view_config)
                break;
            case 'ghg-country-profile':
                $("#" + CONFIG.placeholder_tiles).hide();
                GHG_COUNTRY_PROFILE.init(view_config)
                break;
            case 'ghg-geo-referenced-data':
                $("#" + CONFIG.placeholder_tiles).hide();
                GHG_COUNTRY_PROFILE.init_geo_referenced(view_config)
                break;
        }
    };

    return {
        init: init
    };

})();