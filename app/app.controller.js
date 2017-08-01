app.controller("TickerController", ["$scope", "requestFactory", function ($scope, requestFactory) {

    $scope.messages = [];

    $scope.sessionInfo = {};
    
    // Initialize the Google Charts API
    $scope.$on("$viewContentLoaded", function() {
        google.charts.load("current", {
            packages: ["line", "corechart"]
        });

        // On load of charts API, send out a broadcast signal
        // so that the child controllers will listen to this signal
        // and set the promise for charts to resolved
        google.charts.setOnLoadCallback($scope.$broadcast("CHARTS_LOADED"));
    });

    $scope.addMessage = function (text, type, strength) {
        type = type || "WARN";
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

    $scope.getDescribe = function () {
        requestFactory.describe()
            .then(function (res) {
                console.log(res);
            });
    }

}]);