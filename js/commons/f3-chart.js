var F3_CHART = (function() {

    var COLORS = [ //Colori delle charts
        '#379bcd',
        '#76BE94',
        '#744490',
        '#E10079',
        '#2D1706',
        '#F1E300',
        '#F7AE3C',
        '#DF3328'
    ]

    var FENIX_COLORS = ['#1f678a','#92a8b7','#5eadd5','#6c79db','#a68122','#ffd569','#439966','#800432','#067dcc',
            '#1f678a','#92a8b7','#5eadd5','#6c79db','#a68122','#ffd569','#439966','#800432','#067dcc'
    ]

    function createPie(obj, data) {

        var data = (typeof data == 'string') ? $.parseJSON(data) : data;

        var colors = obj.colors || FENIX_COLORS;

        if (data == '') {
            UIUtils.noValuesFoundPanel(payload.renderTo = obj.renderTo)
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
        }

        var chart = {
            chart: {
                type: 'pie', //Tipo di grafico:  area, areaspline, boxplot, bubble, column, line, pie, scatter, spline

                renderTo: obj.renderTo,
                alignTicks: false,
                backgroundColor: '#FFFFFF', //Colore di background
                //borderColor: '#3fa8da', //Colore bordo intorno
                //borderWidth: 1, //Spessore bordo intorno
                //borderRadius: 0, //Smusso bordo intorno
                //margin: [5,5,5,5], //Margine intorno (vince sullo spacing)
                spacing: [20, 1, 1, 1],//Spacing intorno (molto simile al margin - Di default il bottom è 15, qui l'ho messo a 10 per essere uguale agli altri)
                //plotBackgroundColor: 'red', //Colore di background solo area chart
                plotBorderColor: '#ffffff', //Colore bordo intorno solo area chart
                plotBorderWidth: 0, //Spessore bordo intorno solo area chart
                //showAxes: false, //Mostra gli assi quando le serie sono aggiunte dinamicamente
                style: {
                    fontFamily: 'Roboto', // Font di tutto
                    fontSize: '12px', // La dimensione qui vale solo per i titoli
                    fontWeight: 300 // Con Roboto è molto bello giocare con i pesi
                },
                zoomType: 'xy', //Attiva lo zoom e stabilisce in quale dimensione
                //selectionMarkerFill: 'rgba(0,0,0,0.25)',//Colore di fonfo della selezione per lo zoom (trasparente per far vedere sotto)
                resetZoomButton: {
                    position: {
                        align: 'right', //Allineamento zoom orizzontale
                        //verticalAlign:'middle' //Allineamento zoom verticale
                        x: -10 //Posizione del pulsante rispetto all'allineamento (valori positivi > destra) e al PLOT

                    },
                    theme: {
                        fill: '#FFFFFF', //Colore di background pulsante reset zoom
                        stroke: '#666666', //Colore di stroke pulsante reset zoom
                        width: 60, //Larghezza del pulsante reset
                        //r:0, //Smusso pulsante reset zoom
                        style: {
                            textAlign: 'center', //CSS style aggiunto da me per centrare il testo
                            fontSize: 10
                        },
                        states: {
                            hover: {
                                fill: '#e6e6e6', //Colore di background hover pulsante reset zoom
                                stroke: '#666666', //Colore di stroke hover pulsante reset zoom
                                style: {
                                    //color: 'white' //Colore testo hover pulsante reset zoom
                                }
                            }
                        }
                    }

                }
            },
            colors: colors,
            credits: {
                enabled: false //Attiva o disattiva il link di HighCharts dalla chart
            },
            exporting: {
                enabled: false
            },
            navigation: { //Modifica lo stile dei bottoni e spesso del solo bottone dell'esportazione (lo sfondo)
                buttonOptions: {
                    theme: {
                        'stroke-width': 1, // Peso stroke del bottone
                        stroke: '#666666', // Colore stroke del bottone
                        r: 0, // Smusso stroke del bottone,
                        states: {
                            hover: {
                                stroke: '#666666', // Press stroke del bottone
                                fill: '#e6e6e6' // Rollover del bottone
                            },
                            select: {
                                stroke: '#666666', // Press stroke del bottone
                                fill: '#e6e6e6' // Press Fill del bottone
                            }
                        }
                    }
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'middle',
                layout: 'vertical',

                itemMarginTop: 5,
                itemMarginBottom: 5,
                itemStyle: {
                    cursor: 'pointer',
                    color: '#666666',
                    fontSize: '11px',
                    fontWeight: 300
                },
                itemWidth: 150,
                itemHiddenStyle: { //Colore dell'elemento legenda quando è disattivato
                    color: '#eeeeee'
                },
                itemHoverStyle: { //Colore dell'elemento legenda in rollover
                    color: '#3ca7da'
                }
            },
            plotOptions: {
                pie: {
                    borderWidth: 1,
                    startAngle: -45,
                    dataLabels: {
                        enabled: false,
                        softConnector: false
                    }
                }
            },
            //END
            title: {
                enabled: false,
                text: null,
                x: -20 //center
            },
            subtitle: {
                text: null,
                x: -20
            },
            tooltip: {
                valueSuffix: 'M',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 1,
                shadow: false
            },
            series: [
                {
                    showInLegend: true,
                    data: series[0].data
                }
            ]
        }

        var c = new Highcharts.Chart(chart);
    }


    function createTimeserie(chart, type, s) {

        var s = (typeof s == 'string') ? $.parseJSON(s) : s;

        /* colors */
        var colors = chart.colors || COLORS;


        var data = [];
        for (var i = 0; i < s.length; i++) {
            var obj = s[i];
            if (typeof s[i] == 'string') {
                obj = $.parseJSON(s[i]);
            }
            for (var j = 0; j < obj.length; j++) {
                data.push(obj[j]);
            }
        }
        if (data.length <= 0) {
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
            for (var i = 0; i < data.length; i++) {
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
            for (var key in vectors) {
                for (var i = 0; i < vectors[key].dates.length; i++) {
                    // if the year still is not in the hashmap, add it
                    if (y.get(vectors[key].dates[i]) == null) {
                        y.put(vectors[key].dates[i], vectors[key].dates[i]);
                        yearsList.push(parseInt(vectors[key].dates[i]));
                    }
                }
            }

            /** TODO: get min year, get max year. check if the years are always sorted**/
            yearsList = yearsList.sort();
            var years = []
            for (var i = yearsList[0]; i <= yearsList[yearsList.length - 1 ]; i++) {
                years.push(i.toString());
            }

            // check if it's just one year (X-axis), in that case force to bar chart (if it's not column/bar)
            if (years.length <= 1 && type != 'bar' && type != 'column') {
                type = 'column';
            }

            /** TODO: Collect the MUs in the other cycle, Collect measurement units */
            $.each(vectors, function (k, v) {
                if ($.inArray(vectors[k].mus[0], mus) < 0)
                    mus.push(vectors[k].mus[0]);
            });

            var index = 0;
            $.each(vectors, function (k, v) {

                var s = {};
                s.name = k;
                s.type = type;
                s.yAxis = $.inArray(vectors[k].mus[0], mus);

                // data should be the same length of the years
                s.data = [];
                // if the data is contained in the hashmap
                for (var i = 0; i < years.length; i++) {
                    if (vectors[k].values.get(years[i]) != null) {
                        s.data.push(parseFloat(vectors[k].values.get(years[i])));
                    }
                    else
                        s.data.push(null);
                }
                s.marker = {
                    enabled: true, //Attiva o disattiva i marker
                    //symbol: 'url(http://www.mentaltoy.com/resources/logoChart.png)', //Questo paramentro carica un simbolo personalizzato. Si può anche avere una chart con marker diverse sulle linee
                    symbol: 'circle', // Tipologia di marker
                    radius: 2,
                    lineWidth: 1,
                    lineColor: colors[index],
                    fillColor: '#FFFFFF',
                    states: {
                        hover: {
                            enabled: true, // Attiva o disattiva il marker quando si passa sopra la chart
                            symbol: 'circle',
                            fillColor: '#FFFFFF',
                            lineColor: '#3ca7da',
                            radius: 3,
                            lineWidth: 2
                        }
                    }
                }
                index++;
                series.push(s);
                console.log(index);
            });

            /** Create a Y-Axis for each measurement unit */
            for (var i = 0; i < mus.length; i++) {
                var a = {};
                a.title = {};
                a.title.text = mus[i];
                a.title.style = {};
                a.title.style.color = colors[i];
                if (i > 0)
                    a.opposite = true;
                a.labels = {};
                a.labels.style = {};
                a.labels.style.color = colors[i];
                yAxis.push(a);
            }
        }




        var chartRenderer = {
            chart: {
                type: type, //Tipo di grafico:  area, areaspline, boxplot, bubble, column, line, pie, scatter, spline
                renderTo: chart.renderTo,
                alignTicks: false,
                backgroundColor: '#FFFFFF', //Colore di background
                spacing: [20, 1, 1, 1],//Spacing intorno (molto simile al margin - Di default il bottom è 15, qui l'ho messo a 10 per essere uguale agli altri)
                //plotBackgroundColor: 'red', //Colore di background solo area chart
                plotBorderColor: '#ffffff', //Colore bordo intorno solo area chart
                plotBorderWidth: 0, //Spessore bordo intorno solo area chart
                //showAxes: false, //Mostra gli assi quando le serie sono aggiunte dinamicamente
                style: {
                    fontFamily: 'Roboto', // Font di tutto
                    fontSize: '12px', // La dimensione qui vale solo per i titoli
                    fontWeight: 300 // Con Roboto è molto bello giocare con i pesi
                },
                zoomType: 'xy', //Attiva lo zoom e stabilisce in quale dimensione
                //selectionMarkerFill: 'rgba(0,0,0,0.25)',//Colore di fonfo della selezione per lo zoom (trasparente per far vedere sotto)
                resetZoomButton: {
                    position: {
                        align: 'right', //Allineamento zoom orizzontale
                        //verticalAlign:'middle' //Allineamento zoom verticale
                        x: -10 //Posizione del pulsante rispetto all'allineamento (valori positivi > destra) e al PLOT

                    },
                    theme: {
                        fill: '#FFFFFF', //Colore di background pulsante reset zoom
                        stroke: '#666666', //Colore di stroke pulsante reset zoom
                        width: 60, //Larghezza del pulsante reset
                        //r:0, //Smusso pulsante reset zoom
                        style: {
                            textAlign: 'center', //CSS style aggiunto da me per centrare il testo
                            fontSize: 10
                        },
                        states: {
                            hover: {
                                fill: '#e6e6e6', //Colore di background hover pulsante reset zoom
                                stroke: '#666666', //Colore di stroke hover pulsante reset zoom
                                style: {
                                    //color: 'white' //Colore testo hover pulsante reset zoom
                                }
                            }
                        }
                    }

                }
            },
            colors: colors,
            credits: {
                enabled: false //Attiva o disattiva il link di HighCharts dalla chart
            },
            exporting: {
                enabled: false
            },
            navigation: { //Modifica lo stile dei bottoni e spesso del solo bottone dell'esportazione (lo sfondo)
                buttonOptions: {
                    theme: {
                        'stroke-width': 1, // Peso stroke del bottone
                        stroke: '#666666', // Colore stroke del bottone
                        r: 0, // Smusso stroke del bottone,
                        states: {
                            hover: {
                                stroke: '#666666', // Press stroke del bottone
                                fill: '#e6e6e6' // Rollover del bottone
                            },
                            select: {
                                stroke: '#666666', // Press stroke del bottone
                                fill: '#e6e6e6' // Press Fill del bottone
                            }
                        }
                    }
                }
            },
            legend: { //Modifica style della legenda
                enabled: true, //Attiva la legenda
                floating: false, // IMPORTANTE - Permette alla plot area di stare sotto alla legenda - si guadagna molto spazio


                backgroundColor: '#FFFFFF', //Colore di sfondo della legenda

                align: 'center', //Allineamento orizzontale del box della legenda (left, center, right)
                verticalAlign: 'bottom', //allineamento verticale della legenda (top, middle, bottom)

                borderWidth: 0, //Spessore bordo della legenda

                symbolPadding: 10, //Distanza tra simbolo e legenda (default 5)


                itemStyle: {
                    cursor: 'pointer',
                    color: '#666666',
                    fontSize: '11px',
                    fontWeight: 300
                },
                itemHiddenStyle: { //Colore dell'elemento legenda quando è disattivato
                    color: '#eeeeee'
                },
                itemHoverStyle: { //Colore dell'elemento legenda in rollover
                    color: '#3ca7da'
                },
                navigation: { //Paginazione Legenda - stilizzazione
                    activeColor: '#3ca7da', //Colore freccia attiva legenda
                    inactiveColor: '#666666', //Colore freccia disattiva legenda
                    arrowSize: 8, //Dimensioni freccia
                    animation: true, //Attiva/Disattiva animazione
                    style: { //Stile CSS applicato solo alla navigazione della legenda
                        color: '#666666',
                        fontSize: '10px'
                    }
                }
            },
            plotOptions: {
                series: {
                    allowPointSelect: true, //Permette di selezionare i punti della chart
                    pointPlacement: "on", //Per partire dall'origine
                    animation: { // Configura l'animazione di entrata
                        duration: 1000,
                        easing: 'swing'
                    },
                    connectNulls: true,
                    cropThreshold: 3,
                    lineWidth: 1, // IMPORTANTE - Cambia lo spessore delle linee della chart
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    fillColor: {
                        linearGradient: [0, 0, 0, 350],
                        stops: [
                            [0, 'rgba(55, 155, 205,0.5)'],
                            [1, 'rgba(255,255,255,0)']
                        ]
                    }

                }
            },
            //END


            title: {
                enabled: false,
                text: null,
                x: -20 //center
            },
            subtitle: {
                text: null,
                x: -20
            },
            xAxis: {
                categories: years,
                gridLineWidth: 1, // IMPORTANTE - Attiva le linee verticali
                lineColor: '#e0e0e0',
                tickColor: '#e0e0e0',
                gridLineColor: '#eeeeee',
                minTickInterval: 5,
                tickmarkPlacement: 'on',
                labels: {
                    y: 25,
                    style: {
                        color: '#666666',
                        fontWeight: '300',
                        fontSize: 12
                    }
                }
                /*plotLines: [{ //linea custom possono essere anche più di una, è un array
                 color: '#666666',
                 width: 1,
                 value: 11.5,
                 dashStyle: 'dash',
                 zIndex: 3
                 }, { //linea custom possono essere anche più di una, è un array
                 color: '#FFFFFF',
                 width: 1,
                 value: 11.5,
                 zIndex: 2
                 }]*/
            },
            yAxis: {
                gridLineWidth: 1, // IMPORTANTE - Attiva le linee verticali
                lineWidth: 1,
                //tickWidth: 1,
                lineColor: '#e0e0e0',
                gridLineColor: '#eeeeee',
                labels: {
                    style: {
                        color: '#666666',
                        fontWeight: '300',
                        fontSize: 11
                    }
//                    formatter: function () {
//                        return this.value / 1000000 + ' B';
//                    }
                },
                title: {
                    enabled: false,
                    text: 'null'
                },
                plotLines: [
                    {
                        value: 0,
                        width: 1
                    }
                ]
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 1,
                shadow: false,
                shared : true,
                crosshairs: true,
                valueDecimals: 2,
                valuePrefix: '',
                valueSuffix: ''
            },
            series: series
        }

        var c = new Highcharts.Chart(chartRenderer);
    }


    return {
        createPie: createPie,
        createTimeserie: createTimeserie
    };

})();

