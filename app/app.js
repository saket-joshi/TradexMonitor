var app = angular.module("currencyTicker", [
    "ngRoute",
    "ngCookies"
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