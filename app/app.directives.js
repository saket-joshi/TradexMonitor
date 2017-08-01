app.directive("chart", ["$timeout", function($timeout) {
    return {
        restrict: "E",
        scope: {
            type: "=",
            data: "=",
            options: "=",
            sizeX: "=width" || 600,
            sizeY: "=height" || 400,
            promise: "="
        },
        link: function (scope, element, attrs) {
            // Create the map for chart type to functions
            var TYPE_TO_CHART_MAP = {
                line: function() {
                    var chart = new google.charts.Line(element.find("div")[0]);
                    chart.draw(
                        google.visualization.arrayToDataTable(scope.data),
                        google.charts.Line.convertOptions(scope.options)
                    );
                },
                pie: function() {
                    var chart = new google.visualization.PieChart(element.find("div")[0]);
                    chart.draw(
                        google.visualization.arrayToDataTable(scope.data),
                        scope.options
                    );
                }
            };

            // Render the chart here
            (function drawChart() {
                // Check if the charts have been loaded or not
                if (scope.promise) {
                    TYPE_TO_CHART_MAP[scope.type]();
                } else {
                    // If not, then add a timeout and retry drawing the chart
                    $timeout(function() {
                        drawChart();
                    }, 1000);
                }
            })();
        },
        template: "<div style='height: {{sizeY}}px; width: {{sizeX}}px'></div>"
    };
}]);