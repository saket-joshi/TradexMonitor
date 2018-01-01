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

        if (method == "GET" && params) {
            config.params = params;
        }

        if (method == "POST" && params) {
            config.data = params;
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
    requestFactory.users = {
        list: function () {
            return doRespond("GET", DB_ENDPOINT + "users/all");
        },
        find: function (username) {
            return doRespond("GET", DB_ENDPOINT + "users/find", { un: username });
        },
        login: function (username, password) {
            return doRespond("GET",
                DB_ENDPOINT + "users/find",
                { un: username, pw: password }
            );
        },
        add: function (data) {
            return doRespond("POST", DB_ENDPOINT + "users/add", data);
        },
        setInactive: function (username) {
            return doRespond("POST", DB_ENDPOINT + "users/" + username);
        },
        update: function (username, data) {
            return doRespond("POST", DB_ENDPOINT + "users/" + username, data);
        }
    },
    requestFactory.trade = {
        add: function (data) {
            return doRespond("POST", DB_ENDPOINT + "trade/add", data);
        },
        delete: function (type, src, dest, ts) {
            return doRespond("POST",
                DB_ENDPOINT + "trade/delete",
                {
                    transactionType: type,
                    source: src,
                    dest: dest,
                    timestamp: ts
                }
            );
        },
        find: function (username, src, ts) {
            return doRespond("GET",
                DB_ENDPOINT + "trade/fetch?un=" + username, { src: src, ts: ts }
            );
        },
        list: function (username) {
            return doRespond("GET",
                DB_ENDPOINT + "trade/fetch", { un: username }
            );
        },
        update: function (oldVal, newVal) {
            return doRespond("POST",
                DB_ENDPOINT + "trade/update",
                {
                    trade: oldVal,
                    newValue: newVal
                }
            );
        }
    },
    requestFactory.history = {
        add: function (history) {
            return doRespond("POST",
                DB_ENDPOINT + "history/add",
                history
            );
        },
        delete: function (currency, ts) {
            return doRespond("POST",
                DB_ENDPOINT + "history/delete/" + currency + "/" + ts
            );
        },
        list: function (currency) {
            return doRespond("GET",
                DB_ENDPOINT + "history/all", { src: currency }
            );
        },
        update: function (currency, ts, newVal) {
            return doRespond("POST",
                DB_ENDPOINT + "history/delete/" + currency + "/" + ts,
                newVal
            );
        }
    };

    return requestFactory;

}]);
