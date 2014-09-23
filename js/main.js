require.config({

    baseUrl: 'http://168.202.28.57:8080',

    paths: {
        bootstrap: '//fenixapps.fao.org/repository/js/bootstrap/3.2/js/bootstrap.min',
        chosen: '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        highcharts: '//fenixapps.fao.org/repository/js/highcharts/4.0.4/js/highcharts',
        jquery: '//code.jquery.com/jquery-1.10.1.min',
        mustache: '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache',
        'jquery.power.tip': '//fenixapps.fao.org/repository/js/jquery.power.tip/1.1.0/jquery.powertip.min',
        'text': 'analysis/js/libs/text',
        F3_CHART: 'analysis/js/libs/commons/f3-chart',
        GHG_QA_QC: 'analysis/js/ghg-qa-qc/ghg-qa-qc',
        GHG_OVERVIEW: 'analysis/js//ghg-overview/ghg-overview',
        TILESMGR: 'analysis/js/tiles-manager/tiles-manager'

    },

    shim: {
        bootstrap: ['jquery'],
        chosen: ['jquery'],
        highcharts: ['jquery'],
        underscore: {
            exports: '_'
        },
        'jquery.power.tip': ['jquery']
    }

});

require(["TILESMGR"], function () {
    TILESMGR().init()
});