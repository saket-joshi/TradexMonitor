app.controller("TickerController", [
    "$scope",
    "$rootScope",
    "requestFactory",
    function ($scope, $rootScope, requestFactory) {

    // Session information object
    $scope.session = {};
    $scope.session.user = { __isValid: true, __isNew: false };

    // Adding UI handlers for request load/complete
    $rootScope.$on("cfpLoadingBar:started", function () {
        $scope.__isLoading = true;
    });

    $rootScope.$on("cfpLoadingBar:completed", function () {
        $scope.__isLoading = false;
    });

    // Method to show signin popup
    $scope.showSigninPopup = function () {
        jQ("#md-sign-in")
            .modal({
                closable: false,
                onApprove: function () {
                    // Override the standard behavior of closing the popup
                    return false;
                }
            })
            .modal("show");
        $scope.session.user = { __isValid: true, __isNew: false };
    }

    // Method to lookup for a particular user
    $scope.lookupUser = function () {
        var username = $scope.session.user.userName;

        if (!username) return;

        requestFactory.users.find(username)
            .then(function success (data) {
                $scope.session.user.__isValid = data.__valid;
            }, function error (err) {

            });
    }

    // Method to signin the user
    $scope.doSignin = function () {
        if (!$scope.session.user.__isValid) return;
        if (!$scope.session.user.password) return;

        var username = $scope.session.user.userName;
        var password = $scope.session.user.password;

        requestFactory.users.login(username, password)
            .then(function success (data) {
                if (data.__login) {
                    $scope.session.user.name = data.user.name;
                    $scope.session.user.email = data.user.email;
                    $scope.session.user.status = data.user.status;
                    jQ("#md-sign-in").modal("hide");
                    $scope.session.message = null;
                } else {
                    $scope.session.message = {
                        header: "Login failed!",
                        message: "Check your username/password combo"
                    };
                }
            }, function error (err) {

            });
    }

    // Method to add a new user
    $scope.doSignUp = function () {
        var user = $scope.session.user;
        user.firstName = user.firstName || "";
        user.lastName = user.lastName || "";

        var newUser = {
            name: user.firstName + user.lastName,
            username: user.userName,
            password: user.password,
            email: user.email,
            resetSecret: user.resetKey,
            status: "Unconfirmed",
            lastLogin: new Date().getTime()
        };
    }

    // Method to set the form to show new user fields
    $scope.showNewUserFields = function () {
        $scope.session.user.__isNew = true;
    }

    // Initialize all the modules in the app
    $scope.$on("$viewContentLoaded", function () {
        google.charts.load("current", {
            packages: ["line", "corechart"]
        });

        // On load of charts API, send out a broadcast signal
        // so that the child controllers will listen to this signal
        // and set the promise for charts to resolved
        google.charts.setOnLoadCallback($scope.$broadcast("CHARTS_LOADED"));
      
        // Header - Statistical Analysis dropdown
        jQ("#header-dropdown").dropdown();

        // Currency exchange dropdowns
        jQ(".currency-convert .ui.fluid.selection.dropdown").dropdown({
            onChange: function (value, text, $choice) {
                $scope.$broadcast("ASSIGN_DROPDOWN", {
                    value: value,
                    var: $choice.attr("data-bind-to")
                });
            }
        });
    });

    $scope.messages = [];

    $scope.addMessage = function (text, type, strength) {
        type = type || "LOG";
        strength = strength || 2;

        // Add this message to the top
        $scope.messages.unshift({
            text: text,
            type: type,
            strength: strength
        });

        // Return current message position
        return $scope.messages.length - 1;
    }

    $scope.removeMessage = function (id) {
        // Remove the message and return the Id
        // If provided Id is not present, then returns -1
        return $scope.messages.splice(id, 1);
    }


}]);