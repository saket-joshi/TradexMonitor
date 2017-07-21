app.factory("requestFactory", ["$http", function($http) {

    var coinbase_endpoint = "";
    var sf_endpoint_prod = "https://login.salesforce.com";
    var sf_endpoint_test = "https://test.salesforce.com";

    var client_id = "3MVG9d8..z.hDcPLlRr8GWxQufOOqwjkXqhGkuh8bc67.Txbf2egAgCv34cSLWA8lU76NQR7rxWEEmSxmaJJ.";
    var client_secret = "3354555950090244631";

    var requestFactory = {};

    requestFactory.getAllCurrency = function() {
        var request = {
            method: "GET",
            url: coinbase_endpoint + "currencies"
        };

        return $http(request);
    },

    requestFactory.getExchange = function (srcCurrency) {
        var request = {
            method: "GET",
            url: coinbase_endpoint + "exchange-rates",
            params: {
                currency: srcCurrency
            }
        };

        return $http(request);
    },

    requestFactory.loginToSf = function (username, password, isTestUrl) {
        var request = {
            method: "POST",
            url: isTestUrl == true ? sf_endpoint_test : sf_endpoint_prod,
            data: {
                body: "grant_type=password&client_id=" + client_id + "&client_secret=" + client_secret + "&username=" + username + "&password=" + password
            }
        };

        return $http(request);
    }

    return requestFactory;

}]);
