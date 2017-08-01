app.factory("requestFactory", ["$http", function($http) {

    var COINBASE_ENDPOINT = "/coinbase/";
    var SF_META_URL = "/services/meta/";
    var SF_DATA_URL = "/services/data/";

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
            url: COINBASE_ENDPOINT + "exchange",
            params: {
                src: srcCurrency
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
