app.controller("homeCtrl", ["$scope", "requestFactory", function ($scope, requestFactory) {

    // Set the variable for charts API loaded
    $scope.resolveChartsPromise = false;

    // Listen to the charts API load
    // On load, set the promise to resolved
    $scope.$on('CHARTS_LOADED', function() {
        $scope.resolveChartsPromise = true;
    });
    
    // Dummy data for charts
    $scope.data = [
        ['Year', 'Sales', 'Expenses'],
        ['2004',  1000,      400],
        ['2005',  1170,      460],
        ['2006',  660,       1120],
        ['2007',  1030,      540]
    ];

    $scope.options = {
        title: 'Company Performance',
        legend: { position: 'bottom' }
    };

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