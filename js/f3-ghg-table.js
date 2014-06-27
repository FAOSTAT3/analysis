// Wrap code with module pattern.
(function() {
    var global = this;

    // widget constructor function
    global.F3_GHG_TABLE = function() {

    /** TODO: check how many series there are and create the rows based on the series that are currently in the json **/

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
        decimal_values: 0,

        add_first_column: true
    };

    function init(config, years, json) {
        CONFIG = $.extend(true, CONFIG, config);

        if ( CONFIG.prefix == null )
            CONFIG.prefix = CONFIG.placeholder;

        CONFIG.rows_content = countRows(json)

        createHtmlTitle(CONFIG.placeholder);
        createHtmlTable(CONFIG.placeholder, years, json);
        fillTable(json);
    };

    function createHtmlTitle(id) {
        $("#" + id).append("<div>" + CONFIG.title + " </div>");
    };

    function createHtmlTable(id, years) {
        var s = "<table>"

        // Headers
        s += "<tr>"
            if ( CONFIG.add_first_column )
                s += "<td>" + CONFIG.header.column_0 + "<td>"
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
            if ( CONFIG.add_first_column )
                s += "<td id='" + CONFIG.prefix + "_" + i +"_0'>X<td>"
            s += "<td id='" + CONFIG.prefix + "_" + i +"_1'><td>"
            s += "<td id='" + CONFIG.prefix + "_avg_" + i + "'>X<td>"
            years.forEach(function (y) {
                s += "<td id='" + CONFIG.prefix + "_" + i + "_" + y + "'>X<td>"
            });
            s += "</tr>"
        }

        // Total
        s += "<tr>"
            if ( CONFIG.add_first_column )
                s += "<td id='" + CONFIG.prefix + "_total_0'>" + CONFIG.total.column_0 + " <td>"
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



        var sumRow = 0.0
        var totalValuesRow = 0.0;

        var columnsValues = {}
        var totalValuesColumns = 0.0;

        var totalAvg = 0.0; //It's a SUM of the AVG

        // if add_first_column
        var index = (CONFIG.add_first_column )? 1: 0;
        var first_column_value = (CONFIG.add_first_column )? json[0][0]: null;

        // the first serie
        var serie = json[0][index]

        for(var i=0; i < json.length; i++) {
            // Update Row
            if ( serie != json[i][index]) {

                addRow(row, serie, sumRow, totalValuesRow, first_column_value)
                totalAvg += sumRow / totalValuesRow;

                // Reset Values
                serie = json[i][index];
                first_column_value = ( CONFIG.add_first_column)? json[i][index -1]: null;
                row++;
                totalValuesRow = 0;
                sumRow = 0;
            }

            var value = Number((parseFloat(json[i][index + 2])).toFixed(CONFIG.decimal_values));

            // Insert Year value
            $("#" + CONFIG.prefix + "_" + row +"_" + json[i][index + 1]).html(value);

            // Row Count (For the Avg)
            sumRow += value;
            totalValuesRow+= 1;

            // Column Count ( for Avg and Yearly Avg)
            totalValuesColumns += value;
            columnsValues[json[i][index + 1]] = ( columnsValues[json[i][index + 1]])? columnsValues[json[i][index + 1]] += value: value;
        }

        // add The last row
        var first_column_value = ( CONFIG.add_first_column)? json[json.length-1][index-1]: null;
        addRow(row, serie, sumRow, totalValuesRow, first_column_value)

        // add Totals
        totalAvg += sumRow / totalValuesRow;
        addTotals(columnsValues, totalAvg)
    }

    function addRow(row, serie, sumRow, totalValuesRow, first_column_value) {
        if ( first_column_value )
            $("#" + CONFIG.prefix + "_" + row +"_0").html(first_column_value);
        $("#" + CONFIG.prefix + "_" + row +"_1").html(serie);
        $("#" + CONFIG.prefix + "_avg_" + row +"").html(Number(sumRow / totalValuesRow).toFixed(CONFIG.decimal_values));
    }

    function addTotals(columnsValues, totalAvg) {
        console.log(columnsValues);
        console.log(totalAvg);

        // Add Yearly Totals
        var sum = 0.0
        for (var year in columnsValues) {
            $("#" +  CONFIG.prefix + "_total_" + year).html(Number(columnsValues[year]).toFixed(CONFIG.decimal_values))
        }

        $("#" +  CONFIG.prefix + "_total_avg").html(Number(totalAvg).toFixed(CONFIG.decimal_values))
    }

    function countRows(json) {
        var index = (CONFIG.add_first_column )? 1: 0;
        var serie = json[0][index]
        var rows = 0;
        for(var i=0; i < json.length; i++) {
            // Update Row
            if ( serie != json[i][index]) {
                serie = json[i][index];
                rows++;

            }
        }
        return rows;
    }

    return {
        init: init
    };

};

})();