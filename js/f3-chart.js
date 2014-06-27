var F3_CHART = (function() {

    function createPie(obj, data) {

        data = (typeof data == 'string')? $.parseJSON(data): data;

        if ( data == '') {
            UIUtils.noValuesFoundPanel( obj.id )
        }
        else {

            var categories = [];
            for (var i = 0 ; i < data ; i++)
                categories.push(data[i][0]);

            var series = [];
            series[0] = {};
            series[0].name = obj.title;
            series[0].type = 'pie';
            series[0].data = [];
            for (var i = 0 ; i < data.length ; i++) {
                var tmp = [];
                tmp[0] = data[i][0];
                tmp[1] = parseFloat(data[i][1]);
                series[0].data.push(tmp);
            }

            var payload = {};
            payload.engine = 'highcharts';
            payload.keyword = 'FAOSTAT_DEFAULT_PIE';
            payload.renderTo = obj.id;
            payload.categories = categories;
            payload.series = series;

            console.log(payload)
            FENIXCharts.plot(payload);
        }
    };

    return {
        createPie: createPie
    };

})();
