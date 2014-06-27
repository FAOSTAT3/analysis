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
        I18N_URL: 'http://168.202.28.214:8080/faostat-gateway/static/faostat/I18N/',

        // IF null create tiles
        default_view: null
    };

    function init(config) {

        /* Store user preferences. */
        CONFIG = $.extend(true, CONFIG, config);

        if ( !CONFIG.default_view ) {
            /**
             * Read and store settings for web-services
             */
            $.getJSON(CONFIG.prefix + 'config/analysis-configuration.json', function (data) {

                // MERGE data with CONFIG
                CONFIG = $.extend(true, CONFIG, data);

                // TODO: LOAD I18N

                // TODO: LOAD interface
                $('#' + CONFIG.placeholder).load(CONFIG.html_structure, function () {
                    console.log("bella");
                });

            });
        }
        else {
            // TODO: load view
        }
    };

    function loadTiles() {
        // TODO: tiles
    };

    return {
        init            :   init
    };

})();