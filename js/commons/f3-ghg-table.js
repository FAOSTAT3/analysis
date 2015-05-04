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
          decimal_values: 0,
          add_first_column: true
        };

        function initCountryProfile(config, years, json) {
            CONFIG = $.extend(true, CONFIG, config);

            if ( CONFIG.prefix == null )
                CONFIG.prefix = CONFIG.placeholder;

            CONFIG.rows_content = countRows(json)

            createHtmlTitle(CONFIG.placeholder)
            createTableCountryProfile(CONFIG.placeholder, CONFIG.table, years, json);
        };

        function createTableCountryProfile(id, table, years) {
            var s = '<div style="overflow: auto; padding-top:10px; width:100%">';
            s += '<table class="dataTable">'

            // Headers
            s += "<thead>"
            s += "<th>Code</th>"
            s += "<th>Sector</th>"
            years.forEach(function(y) {
                s += "<th>"+ y+" </th>"
            });
            s += "</thead>"

            // Rows
            s += "<tbody>"
            for( var i=0; i < table.length; i++) {
                s += "<tr>"
                s += "<td>"+ table[i].unfccc_code +"</td>"
                s += "<td>"+ table[i].label +"</td>"
                years.forEach(function(y) {
                    s += "<td id='" + CONFIG.prefix + "_"+ table[i].code +"_"+ y+"'></td>"
                });
                s += "</tr>"
            }

            s += "</tbody>"
            s += "</table>"
            s += "</div>"
            $("#" + id).append(s);
        }

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
            var exportID = CONFIG.prefix + "_export_data";
            var html =
                "<div class='row'>" +
                    "<div class='col-xs-12 col-sm-8 col-md-8 col-lg-8'><h1>" + CONFIG.title + "</h1></div>" +
                    "<div class='col-xs-12 col-sm-4 col-md-4 col-lg-4'><h1 id="+ exportID +" style='text-align: right; cursor:pointer;'><i class='fa fa-download'></i>"+ $.i18n.prop('_export') +"</h1></div>" +
                "</div>";
            $("#" + id).append(html);

            $('#' + exportID).on('click', function() {
                exportTableToCSV($("#" + id), CONFIG.title.toLocaleLowerCase() + ' data.csv')
            });
        };

        function createHtmlTable(id, years) {
            var s = '<div style="overflow: auto; padding-top:10px; width:100%">';
            s += '<table class="dataTable">'

            // Headers
            s += "<thead>"
            s += "<tr>"
            if ( CONFIG.add_first_column )
                s += "<th>" + CONFIG.header.column_0 + "</th>"
            s += "<th>" + CONFIG.header.column_1 + "</th>"
            // Average
            s += "<th>" + $.i18n.prop('_avg') + " "+ years[0] + "-" + years[years.length-1] + "</th>"
            years.forEach(function(y) {
                s += "<th>" + y + "</th>"
            });
            s += "</tr>"
            s += "</thead>"


            // Rows
            s += "<tbody>"
            var classDiv="";
            var count = 0;
            for( var i=0; i < CONFIG.rows_content; i++) {
                classDiv="hor-minimalist-b_row" + ((i % 2) +1);
                s += "<tr>"
                if ( CONFIG.add_first_column )
                    s += "<td class='"+ classDiv+"' id='" + CONFIG.prefix + "_" + i +"_0'>-</td>"
                s += "<td class='"+ classDiv+"' id='" + CONFIG.prefix + "_" + i +"_1'>-</td>"
                s += "<td class='"+ classDiv+"' id='" + CONFIG.prefix + "_avg_" + i + "'>-</td>"
                years.forEach(function (y) {
                    s += "<td class='"+ classDiv+"' id='" + CONFIG.prefix + "_" + i + "_" + y + "'>-</td>"
                });
                s += "</tr>"
                count++;
            }

            // Total
            classDiv="hor-minimalist-b_row" + ((count % 2) +1);
            s += "<tr>"
            if ( CONFIG.add_first_column )
                s += "<td style='font-weight:bold;' class='"+ classDiv +"' id='" + CONFIG.prefix + "_total_0'>" + CONFIG.total.column_0 + "</td>"
            s += "<td style='font-weight:bold;' class='"+ classDiv +"' id='" + CONFIG.prefix + "_total_1'>" + CONFIG.total.column_1 + "</td>"
            s += "<td style='font-weight:bold;' class='"+ classDiv+"' id='" + CONFIG.prefix + "_total_avg'>-</td>"
            years.forEach(function(y) {
                s += "<td style='font-weight:bold;' class='"+ classDiv+"' id='" + CONFIG.prefix + "_total_" + y + "'>-</td>"
            });
            s += "</tr>"
            s += "</tbody>"
            s += "</table>"
            s += "</div>"
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
            // Add Yearly Totals
            var sum = 0.0
            for (var year in columnsValues) {
                $("#" +  CONFIG.prefix + "_total_" + year).html(Number(columnsValues[year]).toFixed(CONFIG.decimal_values))
            }
            $("#" +  CONFIG.prefix + "_total_avg").html(Number(totalAvg).toFixed(CONFIG.decimal_values))
        }

        /**
         * The first column (or if add_first_column is enabled is the serie)
         * @param json
         * @returns {number}
         */
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
            rows++;
            return rows;
        }

        function createExportButton(id) {
            // add export button

            // call exportTable on click

        }

        function exportTableToCSV($table, filename) {
            var $headers = $table.find('tr:has(th)'),
                $rows = $table.find('tr:has(td)')

            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
                ,tmpColDelim = String.fromCharCode(11) // vertical tab character
                ,tmpRowDelim = String.fromCharCode(0) // null character

            // actual delimiter characters for CSV format
                ,colDelim = '","'
                ,rowDelim = '"\r\n"';

            // Grab text from table into CSV formatted string
            var csv = '"';
            csv += formatRows($headers.map(grabRow));
            csv += rowDelim;
            csv += formatRows($rows.map(grabRow)) + '"';

            // Data URI
            //var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

            var a = document.createElement('a');
           // a.href = 'data:text/csv;charset=utf-8,\n' + encodeURIComponent(csv);
            a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
            a.target = '_blank';
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            //------------------------------------------------------------
            // Helper Functions
            //------------------------------------------------------------
            // Format the output so it has the appropriate delimiters
            function formatRows(rows){
                return rows.get().join(tmpRowDelim)
                    .split(tmpRowDelim).join(rowDelim)
                    .split(tmpColDelim).join(colDelim);
            }
            // Grab and format a row from the table
            function grabRow(i,row){

                var $row = $(row);
                //for some reason $cols = $row.find('td') || $row.find('th') won't work...
                var $cols = $row.find('td');
                if(!$cols.length) $cols = $row.find('th');

                return $cols.map(grabCol)
                    .get().join(tmpColDelim);
            }
            // Grab and format a column from the table
            function grabCol(j,col){
                var $col = $(col),
                    $text = $col.text();
                return $text.replace('"', '""'); // escape double quotes
            }
        }



        return {
            init: init,
            initCountryProfile: initCountryProfile
        };
    };

})();