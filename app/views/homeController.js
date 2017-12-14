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

    $scope.exchangeParams = {};
  
    $scope.currencies = {
        dest: [{
            Name: "INR",
            FullName: "Indian Rupee"
        }, {
            Name: "USD",
            FullName: "US Dollar"
        }, {
            Name: "JPY",
            FullName: "Japanese Yen"
        }, {
            Name: "CAD",
            FullName: "Canadian Dollar"
        }, {
            Name: "GBP",
            FullName: "Pound Sterling"
        }, {
            Name: "AED",
            FullName: "United Arab Emirates Dirham"
        }]
    };

    requestFactory.getAllCurrency()
        .then(function success(res) {
            $scope.currencies.src = res.Data;
        }, function error(err) {
            $scope.$parent.addMessage(JSON.stringify(err), "ERROR");
        });

    $scope.getExchangeRate = function() {
        requestFactory.getExchange($scope.exchangeParams.srcId, $scope.exchangeParams.destId)
            .then(function success(res) {
                console.log("exchange rate-", res);
                $scope.exchangeRate = res[$scope.exchangeParams.destId];
                
                if (isUndefinedOrNull($scope.exchangeRate)) {
                    $scope.$parent.addMessage("Exchange is not possible at the moment", "WARN");
                    return;
                }

            }, function error (err) {
                $scope.$parent.addMessage(JSON.stringify(err), "ERROR");
            });
    }

}]);