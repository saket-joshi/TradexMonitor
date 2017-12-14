app.controller("TickerController", ["$scope", "requestFactory", function ($scope, requestFactory) {

    // Initialize all the modules in the app
    $scope.$on("$viewContentLoaded", function () {
        google.charts.load("current", {
            packages: ["line", "corechart"]
        });

        // On load of charts API, send out a broadcast signal
        // so that the child controllers will listen to this signal
        // and set the promise for charts to resolved
        google.charts.setOnLoadCallback($scope.$broadcast("CHARTS_LOADED"));
      
        // Header - Statistical Analysis dropdown
        jQ("#header-dropdown").dropdown();

        // Currency exchange dropdowns
        jQ(".currency-convert .ui.fluid.selection.dropdown").dropdown({
            onChange: function (value, text, $choice) {
                $scope.$broadcast("ASSIGN_DROPDOWN", {
                    value: value,
                    var: $choice.attr("data-bind-to")
                });
            }
        });
    });

    $scope.messages = [];

    $scope.addMessage = function (text, type, strength) {
        type = type || "LOG";
        strength = strength || 2;

        // Add this message to the top
        $scope.messages.unshift({
            text: text,
            type: type,
            strength: strength
        });

        // Return current message position
        return $scope.messages.length - 1;
    }

    $scope.removeMessage = function (id) {
        // Remove the message and return the Id
        // If provided Id is not present, then returns -1
        return $scope.messages.splice(id, 1);
    }


}]);