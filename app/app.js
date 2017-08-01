// Initialize jQuery
var jQ = jQ || {};
if (window.jQuery) {
    jQ = $.noConflict();
}

var app = angular.module("currencyTicker", [
    "ngRoute",
    "ngCookies",
    "angular-loading-bar"
]);

app.config(function($locationProvider, $routeProvider) {
    $routeProvider.when("/home", {
        templateUrl: "views/homeContent.html",
        controller: "homeCtrl"
    });

    $routeProvider.when("/login", {
        templateUrl: "views/auth.html",
        controller: "authCtrl"
    });

    $routeProvider.when("/auth/callback", {
        templateUrl: "views/authCallback.html",
        controller: "authCallbackCtrl"
    });

    $routeProvider.otherwise({
        redirectTo: "/home"
    });
});

// Remove the loading spinner from angular-loading-bar
app.config(["cfpLoadingBarProvider", function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);