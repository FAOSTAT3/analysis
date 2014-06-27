var F3_GHG_TABLE = (function() {

    var CONFIG = {
        prefix: null,
        placeholder: 'id',

//        title: "Title",
//        header: {
//            column_0: "",
//            column_1: "Continent"
//        },
//        content: {
//            column_0: "World"
//        },
//        total: {
//            column_0: "World",
//            column_1: "Grand Total"
//        },
//        rows_content : 5,
        decimal_values: 0
    };

    function initWorld(config, years, json) {
        CONFIG = $.extend(true, CONFIG, config);

        if ( CONFIG.prefix == null )
            CONFIG.prefix = CONFIG.placeholder;

        createHtmlTitle(CONFIG.placeholder);
        createHtmlTable(CONFIG.placeholder, years, json);
        fillTable(json);
    };

    function createHtmlTitle(id) {
        $("#" + id).append("<div>" + CONFIG.title + " </div>");
    };

    function createHtmlTable(id, years, json) {

        var s = "<table>"

        // Headers
        s += "<tr>"
        s += "<td>" + CONFIG.header.column_1 + "<td>"
        // Average
        s += "<td>Average " + years[0] + "-" + years[years.length-1] + "<td>"
        years.forEach(function(y) {
            s += "<td>" + y + "<td>"
        });
        s += "</tr>"


        // Rows
        for( var i=0; i < CONFIG.rows_content; i++) {
            s += "<tr>"
            s += "<td id='" + CONFIG.prefix + "_" + i +"_1'><td>"
            s += "<td id='" + CONFIG.prefix + "_avg_" + i + "'>X<td>"
            years.forEach(function (y) {
                s += "<td id='" + CONFIG.prefix + "_" + i + "_" + y + "'>X<td>"
            });
            s += "</tr>"
        }

        // Total
        s += "<tr>"
        s += "<td id='" + CONFIG.prefix + "_total_1'>" + CONFIG.total.column_1 + "<td>"
        s += "<td id='" + CONFIG.prefix + "_total_avg'>X<td>"
        years.forEach(function(y) {
            s += "<td id='" + CONFIG.prefix + "_total_" + y + "'>X<td>"
        });
        s += "</tr>"
        s += "</table>"
        $("#" + id).append(s);

    };

    function fillTable(json) {
        var s = ""
        // first column is gave
        var row = 0;

        // the first serie
        var serie = json[0][0]

        var sumRow = 0.0
        var totalValuesRow = 0.0;

        var columnsValues = {}
        var totalValuesColumns = 0.0;

        var totalAvg = 0.0; //It's a SUM of the AVG

        for(var i=0; i < json.length; i++) {
            // Update Row
            if ( serie != json[i][0]) {
                addRow(row, serie, sumRow, totalValuesRow)
                totalAvg += sumRow / totalValuesRow;

                // Reset Values
                serie = json[i][0];
                row++;
                totalValuesRow = 0;
                sumRow = 0;
            }

            var value = Number((parseFloat(json[i][2])).toFixed(CONFIG.decimal_values));

            // Insert Year value
            $("#" + CONFIG.prefix + "_" + row +"_" + json[i][1]).html(value);

            // Row Count (For the Avg)
            sumRow += value;
            totalValuesRow+= 1;

            // Column Count ( for Avg and Yearly Avg)
            totalValuesColumns += value;
            columnsValues[json[i][1]] = ( columnsValues[json[i][1]])? columnsValues[json[i][1]] += value: value;
        }

        // add The last row
        addRow(row, serie, sumRow, totalValuesRow)

        // add Totals
        totalAvg += sumRow / totalValuesRow;
        addTotals(columnsValues, totalAvg)
    }

    function addRow(row, serie, sumRow, totalValuesRow) {
        $("#" + CONFIG.prefix + "_" + row +"_1").html(serie);
        $("#" + CONFIG.prefix + "_avg_" + row +"").html(Number(sumRow / totalValuesRow).toFixed(CONFIG.decimal_values));
    }

    function addTotals(columnsValues, totalAvg) {

        // Add Yearly Totals
        var sum = 0.0
        for (var year in columnsValues) {
            $("#" +  CONFIG.prefix + "_total_" + year).html(Number(columnsValues[year]).toFixed(CONFIG.decimal_values))
        }

        $("#" +  CONFIG.prefix + "_total_avg").html(Number(totalAvg).toFixed(CONFIG.decimal_values))

        // Add Avg Total

    }

    return {
        initWorld: initWorld
    };

})();