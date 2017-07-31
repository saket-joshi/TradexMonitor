app.factory("requestFactory", ["$http", function($http) {

    var COINBASE_ENDPOINT = "/coinbase/";
    var SF_META_URL = "/services/meta/";
    var SF_DATA_URL = "/services/data/";

    var client_id = "3MVG9d8..z.hDcPLlRr8GWxQufOOqwjkXqhGkuh8bc67.Txbf2egAgCv34cSLWA8lU76NQR7rxWEEmSxmaJJ.";
    var client_secret = "3354555950090244631";

    var requestFactory = {};

    requestFactory.getAllCurrency = function() {
        var request = {
            method: "GET",
            url: COINBASE_ENDPOINT + "currencies"
        };

        return $http(request);
    },

    requestFactory.getExchange = function (srcCurrency) {
        var request = {
            method: "GET",
            url: COINBASE_ENDPOINT + "exchange-rates",
            params: {
                currency: srcCurrency
            }
        };

        return $http(request);
    },

    requestFactory.describe = function () {
        var request = {
            method: "GET",
            url: SF_META_URL + "describe",
            withCredentials: true
        };

        return $http(request);
    }

    return requestFactory;

}]);
