/**
* The logic is to navigate to the Salesforce standard login URL
* Once the login is done, SF itself redirects to the redirect_uri value provided in the login URL
* Note that the redirect_uri should be specified as the callback URL in the connected app
* As a result, different connected apps (and hence different client_ids will be produced for every host of this app)
* Once SF redirects to the redirect_uri, read the params present in the URL and get the access token and instance URL
*/

app.controller("authCtrl", [ "$scope", "$location", "$cookies" , function ($scope, $location, $cookies, $http) {

    // Clear out the previous authentication details
    $cookies.put("SF_ACCESS_TOKEN", "");
    $cookies.put("SF_INSTANCE_URL", "");

    // Set the client id
    var client_id = "3MVG9d8..z.hDcPLlRr8GWxQufAj5gIpZW52gPJul_O2clOXwvHDeevFjN5fhjfJ4HdamR.ojz_lgx1y7KHZK";
    
    // Forming the redirect URL. This is the URL where SF would redirect on successful authentication
    var redirect_uri = ""
        + $location.protocol()
        + "://" + $location.host() + ":" + $location.port()
        + "/#!/auth/callback";

    // The complete URL for SF login
    var url = "https://login.salesforce.com/services/oauth2/authorize?response_type=token&" 
        + "client_id=" + client_id
        + "&redirect_uri=" + redirect_uri;

    console.log("Navigating to ", url);
    // Navigate to SF login URL
    window.location.href = url;

}]);

app.controller("authCallbackCtrl", [ "$scope", "$location", "$cookies", function ($scope, $location, $cookies) {
    // This is the authentication callback controller
    // Parse the URL parameters and get the access token and the instance url
    var params = _.fromPairs(_.map($location.hash().split('&'), function (item) {
        return (item || '').split('=');
    }));

    if (params && params.access_token && params.instance_url) {
        // Authentication success, store the access token and instance url in the cookies
        $cookies.put("SF_ACCESS_TOKEN", params.access_token);
        $cookies.put("SF_INSTANCE_URL", params.instance_url);

        console.log(params.access_token, params.instance_url);

        // Navigate to the home page again
        $location.hash("");
        $location.path("/");
        $location.replace();
    } else {
        console.error("Error authenticating with Salesforce");
    }
}]);

app.controller("authLogoutController", [ "$scope", "$location", "$cookies", function ($scope, $location, $cookies) {
    // Clear out the previous authentication details
    $cookies.put("SF_ACCESS_TOKEN", "");
    $cookies.put("SF_INSTANCE_URL", "");

    $location.hash("");
    $location.path("/");
    $location.replace();

}]);