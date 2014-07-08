var F3_ANALYSIS = (function() {

    var CONFIG = {
        placeholder: 'container',
        lang: 'E',
        prefix: 'http://168.202.28.214:8080/analysis/',

        datasource: 'faostat2',

        baseurl: 'http://faostat3.fao.org',

        // http://faostat3.fao.org/wds/rest/procedures/years/faostat/IG/E

        domain: 'IG',
        baseurl_country: '/wds/rest/procedures/countries',
        baseurl_dates: '/wds/rest/procedures/years',


        theme: 'faostat',
        html_structure: 'http://168.202.28.214:8080/analysis/analysis.html',

        // Tiles
        placeholder_tiles: 'container_tiles',
        html_structure_tiles: 'http://168.202.28.214:8080/analysis/analysis-tiles.html',

        // Views
        placeholder_view: 'container_views',

        // IF null create tiles
        default_view: null,
        view_config: {}
    };

    function init(config) {

        /* Store user preferences. */
        CONFIG = $.extend(true, CONFIG, config);

        if ( !CONFIG.default_view) {
            /**
             * Read and store settings for web-services
             */
            $.getJSON(CONFIG.prefix + 'config/analysis-configuration.json', function (data) {

                // MERGE data with CONFIG
                CONFIG = $.extend(true, CONFIG, data);

                // TODO: LOAD I18N

                // TODO: LOAD interface
                $('#' + CONFIG.placeholder).load(CONFIG.html_structure, function () {
                    loadTilesGUI()
                });

            });
        }
        else {
            loadView(CONFIG.default_view, CONFIG.view_config)
        }
    };

    function loadTilesGUI() {
        $("#" + CONFIG.placeholder_view).hide();
        // TODO: tiles
        $('#' + CONFIG.placeholder_tiles).load(CONFIG.html_structure_tiles, function () {
            // TODO: onclick?

            // TODO: dynamic
            $("#ghg-overview").click(function() { loadView("ghg-overview") });
            $("#ghg-country-profile").click(function() {  loadView("ghg-country-profile") } );
        });
    };

    function loadView(view, view_config) {
        // Hide Tiles container TODO: check hide
        $("#" + CONFIG.placeholder_tiles).hide();

        switch(view) {
            case 'ghg-overview':
                $("#" + CONFIG.placeholder_tiles).hide();
                GHG_OVERVIEW.init(view_config);
                break;
            case 'ghg-country-profile':
                $("#" + CONFIG.placeholder_tiles).hide();
                GHG_COUNTRY_PROFILE.init(view_config)
                break;;
        }
    };

    return {
        init            :   init
    };

})();