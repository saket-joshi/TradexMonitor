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
var https = require("https");
var app = express();

var __jsCache = {};

// API endpoints for the crypto-api
var API_ENDPOINT = "https://min-api.cryptocompare.com/data/";

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
    res.setHeader("Content-Type", "application/json");
    if (errors) respondFailure(req, res, errors);
    else respondSuccess(req, res, result);
}

var respondFailure = function (req, res, errors, isJson) {
    // @TODO: Implement response for errors
    console.error(errors);
    res.status(400);
    
    if (!isJson) {
        res.send(JSON.stringify(errors));
    } else {
        res.send(errors);
    }
}

var respondSuccess = function (req, res, result, isJson) {
    res.status(200);
    
    if (!isJson) {
        res.send(JSON.stringify(result));
    } else {
        res.send(result);
    }
}

// Handler for responding to server (direct nodejs) requests
var respondServer = function (req, res, serverResponse) {
    var successResponse = "", errorResponse;
    serverResponse.setEncoding('utf8');
    
    // Chunk here is nothing but the response data in plain text
    // so create a string out of that response to get final JSON string
    serverResponse.on("data", function (chunk) {
        successResponse += chunk;
    });

    serverResponse.on("error", function(err) {
        errorResponse = err;
    });

    // Add this listener to indicate the complete response arrival
    serverResponse.on("end", function () {
        res.setHeader("Content-Type", "application/json");
        if (errorResponse) {
            res.setHeader("X-API-Error", true);
            respondFailure(req, res, errorResponse, true);
        } else {
            // If this is an error from api, then specify
            if (JSON.parse(successResponse).errors) {
                res.setHeader("X-API-Error", true);
                return respondFailure(req, res, successResponse, true);
            }

            respondSuccess(req, res, successResponse, true);
        }
    });
}

// Setup the endpoint for listing all currencies
app.get("/api/currencies", function (req, res) {
    var endpoint = API_ENDPOINT + "all/coinlist";
    var request = https.get(endpoint , function (response) {
        respondServer(req, res, response);
    });
});

// Setup the endpoint for exchange rates
app.get("/api/exchange", function (req, res) {
    var endpoint = API_ENDPOINT + "price?fsym=" + req.query.src + "&tsyms=" + req.query.dest;
    var request = https.get(endpoint, function (response) {
        respondServer(req, res, response);
    });
});

// Setup the endpoint for buy rates
app.get("/api/buy", function (req, res) {
    var endpoint = API_ENDPOINT + "prices/" + req.query.buy + "-" + req.query.base + "/buy";
    var request = https.get(endpoint, function (response) {
        respondServer(req, res, response);
    });
});

// Setup the endpoint for sell rates
app.get("/api/sell", function (req, res) {
    var endpoint = API_ENDPOINT + "prices/" + req.query.buy + "-" + req.query.base + "/sell";
    var request = https.get(endpoint, function (response) {
        respondServer(req, res, response);
    });
});