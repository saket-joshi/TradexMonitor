app.controller("homeCtrl", ["$scope", "requestFactory", function ($scope, requestFactory) {

    $scope.$on("ASSIGN_DROPDOWN", function(event, data) {
        $scope.$apply(function() {
            $scope.exchangeParams[data.var] = data.value;
        });
    });

    $scope.currentTime = Date.now();
    $scope.exchangeParams = {};
    $scope.currencies = {
        src: [{
            id: "BTC",
            name: "Bitcoin"
        }, {
            id: "ETH",
            name: "Ethereum"
        }, {
            id: "LTC",
            name: "Litecoin"
        }]
    };

    requestFactory.getAllCurrency()
        .then(function success(res) {
            $scope.currencies.dest = res.data.data;
        }, function error(err) {
            console.error("Error at homeCtrl", err);
            $scope.$parent.addMessage(err.toString(), "ERROR");
        });

    $scope.getExchangeRate = function() {
        requestFactory.getExchange($scope.exchangeParams.srcId)
            .then(function success(res) {
                $scope.exchangeRate = res.data.data.rates[$scope.exchangeParams.destId];
                
                if (isUndefinedOrNull($scope.exchangeRate)) {
                    $scope.$parent.addMessage("Exchange is not possible at the moment");
                    return;
                }

            }, function error (err) {
                console.error("Error at homeCtrl", err);
                $scope.$parent.addMessage(err.toString(), "ERROR");
            });
    }

}]);