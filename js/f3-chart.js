var F3_CHART = (function() {

    function createPie(obj, data) {

        data = (typeof data == 'string')? $.parseJSON(data): data;

        if ( data == '') {
            UIUtils.noValuesFoundPanel( obj.id )
        }
        else {

            var categories = [];
            for (var i = 0; i < data; i++)
                categories.push(data[i][0]);

            var series = [];
            series[0] = {};
            series[0].name = obj.title;
            series[0].type = 'pie';
            series[0].data = [];
            for (var i = 0; i < data.length; i++) {
                var tmp = [];
                tmp[0] = data[i][0];
                tmp[1] = parseFloat(data[i][1]);
                series[0].data.push(tmp);
            }

            var payload = {};
            payload.engine = 'highcharts';
            payload.keyword = 'FAOSTAT_DEFAULT_PIE';
            payload.renderTo = obj.renderTo;
            payload.categories = categories;
            payload.series = series;
            FENIXCharts.plot(payload);
        }

    };

    /**
     * @param chart Parameters stored in the JSON
     * @param type 'column', 'line'
     * @param s series
     */
    function createTimeserie(chart, type, s) {
        s = (typeof s == 'string')? $.parseJSON(s): s;

        var data = [];
        for (var i=0; i < s.length; i++) {
            var obj = s[i];
            if (typeof s[i] == 'string')    {
                obj = $.parseJSON(s[i]);
            }
            for (var j=0; j < obj.length; j++) {
                data.push(obj[j]);
            }
        }
        if ( data.length <=0 ) {
            // no series found.
            //FAOSTATCompareUIUtils.noValuesFoundPanel( chart.renderTo)
        }
        else {
            var series = [];
            var yAxis = [];

            /** Initiate variables */
            var check = [];
            var mus = [];
            var ind = data[0][1];
            var count = 0;
            var maxLength = 0;
            var maxLengthIND = data[0][1];
            var maxLengthIDX = "";

            /** Re-shape data into 'vectors' */
            var vectors = {};
            vectors[ind] = {};
            vectors[ind].dates = [];
            vectors[ind].mus = [];
            vectors[ind].values = new Hashtable();


            /** Create a vector for each indicator */
            for (var i = 0 ; i < data.length ; i++) {
                if (data[i][1] == ind) {
                    count++;
                    vectors[ind].dates.push(data[i][0]);
                    vectors[ind].mus.push(data[i][3]);
                    vectors[ind].values.put(data[i][0], data[i][2]);
                } else {
                    check.push(count);
                    if (count > maxLength) {
                        maxLength = count;
                        maxLengthIDX = check.length - 1;
                        maxLengthIND = ind;
                    }
                    ind = data[i][1];
                    vectors[ind] = [];
                    vectors[ind].dates = [];
                    vectors[ind].mus = [];
                    vectors[ind].values = new Hashtable();
                    count = 1;
                    vectors[ind].dates.push(data[i][0]);
                    vectors[ind].mus.push(data[i][3]);
                    vectors[ind].values.put(data[i][0], data[i][2]);
                }
            }
            check.push(count);

            /** Collect all the years */
            var y = new Hashtable();
            var yearsList = [];
            for(var key in vectors) {
                for (var i = 0 ; i < vectors[key].dates.length ; i++) {
                    // if the year still is not in the hashmap, add it
                    if (y.get(vectors[key].dates[i]) == null ) {
                        y.put(vectors[key].dates[i], vectors[key].dates[i]);
                        yearsList.push(parseInt(vectors[key].dates[i]));
                    }
                }
            }

            /** TODO: get min year, get max year. check if the years are always sorted**/
            yearsList = yearsList.sort();
            var years = []
            for(var i=yearsList[0]; i <= yearsList[yearsList.length -1 ]; i++) {
                years.push(i.toString());
            }

            // check if it's just one year (X-axis), in that case force to bar chart (if it's not column/bar)
            if ( years.length <= 1 && type != 'bar' && type != 'column') {
                type = 'column';
            }

            /** TODO: Collect the MUs in the other cycle, Collect measurement units */
            $.each(vectors, function(k, v) {
                if ($.inArray(vectors[k].mus[0], mus) < 0)
                    mus.push(vectors[k].mus[0]);
            });

            $.each(vectors, function(k, v) {
                var s = {};
                s.name = k;
                s.type = type;
                s.yAxis = $.inArray(vectors[k].mus[0], mus);

                // data should be the same length of the years
                s.data = [];
                // if the data is contained in the hashmap
                for(var i =0; i < years.length; i++) {
                    if (vectors[k].values.get(years[i]) != null ) {
                        s.data.push(parseFloat(vectors[k].values.get(years[i])));
                    }
                    else
                        s.data.push(null);
                }
                series.push(s);
            });

            /** Create a Y-Axis for each measurement unit */
            for (var i = 0 ; i < mus.length ; i++) {
                var a = {};
                a.title = {};
                a.title.text = mus[i];
                a.title.style = {};
                a.title.style.color = FENIXCharts.COLORS[i];
                if (i > 0)
                    a.opposite = true;
                a.labels = {};
                a.labels.style = {};
                a.labels.style.color = FENIXCharts.COLORS[i];
                yAxis.push(a);
            }

            /** Create chart */
            var payload = {};
            payload.engine = 'highcharts';
            payload.keyword = 'FAOSTAT_DEFAULT_DOUBLE_AXES_BAR';
            payload.renderTo = chart.renderTo;
            payload.categories = years;
            payload.title = '';
            payload.credits = chart.credits;
            payload.yaxis = {};
            payload.yaxis = yAxis;
            payload.xaxis = {};
            if (chart.xaxis != null) {
                payload.xaxis.rotation = chart.xaxis.rotation;
                payload.xaxis.fontSize = chart.xaxis.fontSize;
            }

            payload.series = series;
            try {
                FENIXCharts.plot(payload);
            }catch (e) {
                console.log(e);
            }
        }
    }

    return {
        createPie: createPie,
        createTimeserie: createTimeserie
    };

})();
