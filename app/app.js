var app = angular.module("currencyTicker", [
    "ngRoute"
]);

app.config(function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl: "views/homeContent.html",
        controller: "homeCtrl"
    });
});