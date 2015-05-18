var repository = '//fenixapps.fao.org/repository/js/';

require.config({

    baseUrl: 'js/libs',

    paths: {
        //'bootstrap': '//fenixapps.fao.org/repository/js/bootstrap/3.2/js/bootstrap.min',
        //'chosen': '//fenixapps.fao.org/repository/js/chosen/1.0.0/chosen.jquery.min',
        //'highcharts': '//fenixapps.fao.org/repository/js/highcharts/4.0.4/js/highcharts',
        //'jquery': '//code.jquery.com/jquery-1.10.1.min',
        //'mustache': '//cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache',
        //'jquery.power.tip': '//fenixapps.fao.org/repository/js/jquery.power.tip/1.1.0/jquery.powertip.min',
        //'F3_CHART': 'analysis/js/libs/commons/f3-chart',
        //'GHG_QA_QC': 'analysis/js/ghg-qa-qc/ghg-qa-qc',
        //'GHG_OVERVIEW': 'analysis/js//ghg-overview/ghg-overview',
        //'TILESMGR': '../tiles-manager/tiles-manager',
        //'jquery.sticky': 'stickyjs/1.0/jquery.sticky',
        //'ANALYSIS_GHG_QA_QC': '../ghg-qa-qc/ghg-qa-qc',
        //'highcharts': repository + 'highcharts/4.0.4/js/highcharts',
        //'highcharts_exporting' : repository + 'highcharts/4.0.4/js/modules/exporting'
    },

    shim: {
        bootstrap: ['jquery'],
        chosen: ['jquery'],
        highcharts: ['jquery'],
        underscore: {
            exports: '_'
        },
        'jquery.power.tip': ['jquery'],
        'jquery.sticky': { deps :['jquery'] }
    }

});

require(["TILESMGR"], function (TILESMGR) {
    TILESMGR.init()
});