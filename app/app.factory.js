app.factory("requestFactory", ["$http", "$q", function($http, $q) {

    var API_ENDPOINT = "/api/";
    var DB_ENDPOINT = "/db/";

    var requestFactory = {};

    // Method to form a request and respond
    function doRespond(method, endpoint, params, headers) {
        // Forming the HTTP request config here
        var config = {
            method: method,
            url: endpoint
        };

        if (params) {
            config.params = params;
        }

        if (headers) {
            config.headers = headers;
        }

        // Turn to async and send request
        var deferred = $q.defer();
        $http(config)
        .then(function(response) {
            deferred.resolve(response.data);
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    requestFactory.getAllCurrency = function () {
        return doRespond("GET", API_ENDPOINT + "currencies");
    },
    requestFactory.getExchange = function (src, dest) {
        return doRespond("GET", API_ENDPOINT + "exchange", { src: src, dest: dest });
    },
    requestFactory.lookupUser = function (username) {
        return doRespond("GET", DB_ENDPOINT + "users/find", { un: username });
    }

    return requestFactory;

}]);
