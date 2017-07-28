/**
* @description : Main entry point for the server
* @author : Saket Joshi
* @version : 1.0
*/

"use strict";

// List out all the dependencies for the NodeJs server
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var jsforce = require("jsforce");
var https = require("https");
var app = express();

var __jsCache = {};

var COINBASE_API_ENDPOINT = "https://api.coinbase.com/v2/";

// Make available the app folder
app.use(express.static(path.join(__dirname, "app")));

// Parse JSON body for POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// To parse the cookies sent in the request
app.use(cookieParser());

// Start the server on port #3000
app.listen(3000, function() {
    console.log("Node server started on port 3000");
});

// Utility method to simplify request and response
var returnJson = function (req, res, errors, result) {
    if (errors) respondFailure(req, res, errors);
    else respondSuccess(req, res, result);
}

var respondFailure = function (req, res, errors, isJson) {
    // @TODO: Implement response for errors
    console.error(errors);
    res.setHeader("Content-Type", "application/json");
    res.status(400);
    
    if (!isJson) {
        res.send(JSON.stringify(errors));
    } else {
        res.send(errors);
    }
}

var respondSuccess = function (req, res, result, isJson) {
    res.status(200);
    res.setHeader("Content-Type", "application/json");
    
    if (!isJson) {
        res.send(JSON.stringify(result));
    } else {
        res.send(result);
    }
}

// Setup the endpoint for coinbase currencies
app.get("/coinbase/currencies", function (req, res) {
    var request = https.get(COINBASE_API_ENDPOINT + "currencies", function (response) {
        var successResponse = "", errorResponse;
        response.setEncoding('utf8');
        
        // Chunk here is nothing but the response data in plain text
        // so create a string out of that response to get final JSON string
        response.on("data", function (chunk) {
            successResponse += chunk;
        });

        response.on("error", function(err) {
            errorResponse = err;
        });

        // Add this listener to indicate the complete response arrival
        response.on("end", function () {
            if (errorResponse) {
                respondFailure(req, res, errorResponse, true);
            } else {
                respondSuccess(req, res, successResponse, true);
            }
        })
    });
});

// Setup the library for Salesforce connection
var connection = function (req) {
    var options = {
        instanceUrl: req.cookies.SF_INSTANCE_URL,
        accessToken: req.cookies.SF_ACCESS_TOKEN
    };

    // We will check if the access token is already used or not
    // ...i.e. if the connection is already established or not
    // If yes, then we return the existing connection
    // else setup a new connection and store it in the cache
    if (__jsCache[options.accessToken] == null) {    
        __jsCache[options.accessToken] = new jsforce.Connection(options);
    }

    return __jsCache[options.accessToken];
}

// Setup SF endpoints to be used by the app
app.get("/services/meta/describe", function (req, res) {
    connection(req).describeGlobal(function (errors, meta) {
        returnJson(req, res, errors, meta);
    });
});