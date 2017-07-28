app.controller("TickerController", ["$scope", "requestFactory", function ($scope, requestFactory) {

    $scope.messages = [];

    $scope.sessionInfo = {};
    
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