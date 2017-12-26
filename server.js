/**
* @description : Main entry point for the server
* @author : Saket Joshi
* @version : 1.0
*/

"use strict";

// Setup the environment constants
var ENV_DEV = "DEV";
var ENV_PROD = "PROD";

// Set the node environment variable
process.env.VERSION = ENV_DEV;

// List out all the dependencies for the NodeJs server
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var https = require("https");
var app = express();
var mongodb = require("mongodb").MongoClient;

// API endpoints for the crypto-api
var API_ENDPOINT = "https://min-api.cryptocompare.com/data/";
var MONGODB_CONNECTION = ENV_DEV.match(process.env.VERSION)
        ? "mongodb://root:root@ds147534.mlab.com:47534/tradexmonitor-dev"
        : "mongodb://<dbuser>:<dbpassword>@server/tradexmonitor-db";


// Setup the database structure
var db = db || {
    collections: {
        users: {
            name: "users",
            validator: {
                $and: [
                    { name: { $type: "string" } },
                    { username: { $type: "string" } },
                    { password: { $type: "string" } },
                    { email: { $type: "string" } },
                    { resetSecret: { $type: "string" } },
                    { status: { $in: [ "Confirmed", "Unconfirmed", "Inactive" ] } },
                    { lastLogin: { $type: "long" } },
                ]
            },
            createCollection: function () {
                // Method to create a new collection of a user
                db.conn.createCollection(
                    this.name,
                    { validator: this.validator }
                );
            },
            insert: function (data) {
                // Method to insert a new user
                return db.conn.collection(this.name)
                    .insertOne(data);
            },
            setInactive: function (username) {
                // Method to set the user as inactive
                // Accepts username of the record to be set as inactive
                return db.conn.collection(this.name)
                    .updateOne({
                        username: username
                    }, {
                        $set: {
                            status: "Inactive"
                        },
                        $currentDate: {
                            lastModified: true
                        }
                    }
                );
            },
            fetch: function (username) {
                // Method to get the details of a user
                // Accepts username of the user to fetch
                return db.conn.collection(this.name)
                    .findOne({ username: username });
            },
            fetchAll: function () {
                // Method to fetch all the users
                return db.conn.collection(this.name)
                    .find({});
            },
            update: function (data, oldData) {
                // Method to update a user record
                // Accepts oldData parameter to identify user to update based on username
                // data parameter holds new information
                return db.conn.collection(this.name)
                    .replaceOne({
                        username: oldData.username
                    }, data
                );
            }
        },
        tradeHistory: {
            name: "tradeHistory",
            validator: {
                $and: [
                    { transactionType: { $in: [ "Sale", "Purchase" ] } },
                    { source: { $type: "string" } },
                    { dest: { $type: "string" } },
                    { value: { $type: "double" } },
                    { username: { $type: "string" } },
                    { timestamp: { $type: "long" } },
                    { comments: { $type: "string" } }
                ]
            },
            createCollection: function () {
                // Method to create a new collection of a user
                db.conn.createCollection(
                    this.name,
                    { validator: this.validator }
                );
            },
            insert: function (data) {
                // Method to insert a new trading history record
                return db.conn.collection(this.name)
                    .insertOne(data);
            },
            delete: function (data) {
                // Method to delete trading history record
                // Accepts data parameter to perform matching based on transaction type,
                // source & destination currencies and timestamp
                return db.conn.collection(this.name)
                    .deleteOne({
                        transactionType: data.transactionType,
                        source: data.source,
                        dest: data.dest,
                        timestamp: data.timestamp
                    });
            },
            fetch: function (user, coin, timestamp) {
                // Method to get the details of a trading history
                // Performs matching based on the username, coin and the transaction timestamp
                return db.conn.collection(this.name)
                    .findOne({
                        username: user,
                        source: coin,
                        timestamp: timestamp
                    });
            },
            fetchAll: function () {
                // Method to fetch all the trade history records
                return db.conn.collection(this.name)
                    .find({});
            },
            update: function (data, oldData) {
                // Method to update a trading history record
                // Accepts oldData param to perform matching on existing record based on
                // transaction type, source & destination currencies and timestamp
                // data parameter contains the new value
                return db.conn.collection(this.name)
                    .replaceOne({
                        transactionType: oldData.transactionType,
                        source: oldData.source,
                        dest: oldData.dest,
                        timestamp: oldData.timestamp
                    }, data
                );
            }
        },
        coinHistory: {
            name: "coinHistory",
            validator: {
                $and: [
                    { currency: { $type: "string" } },
                    { value: { $type: "double" } },
                    { timestamp: { $type: "long" } }
                ]
            },
            createCollection: function () {
                // Method to create a new collection of a user
                db.conn.createCollection(
                    this.name,
                    { validator: this.validator }
                );
            },
            insert: function (data) {
                // Method to insert a coin history record
                return db.conn.collection(this.name)
                    .insertOne(data);
            },
            delete: function (data) {
                // Method to delete the coin history record
                // Performs matching based on the currency name and the timestamp
                return db.conn.collection(this.name)
                    .deleteOne({
                        currency: data.currency,
                        timestamp: data.timestamp
                    });
            },
            fetch: function (coin, timestamp) {
                // Method to get the details of a coin history
                // Performs matching based on the currency name and the timestamp
                return db.conn.collection(this.name)
                    .findOne({
                        currency: coin,
                        timestamp: timestamp
                    });
            },
            fetchAll: function () {
                // Method to fetch all coin history records
                return db.conn.collection(this.name)
                    .find({});
            },
            update: function (data, oldData) {
                // Method to update a coin history record
                // oldData param contains old value to be updated
                // Performs matching based on the currency name and the timestamp
                // Accepts data param that contains the new values
                return db.conn.collection(this.name)
                    .replaceOne({
                        currency: oldData.currency,
                        timestamp: oldData.timestamp
                    }, data
                );
            }
        },
        createAllCollections: function () {
            // Create all the collections one after the another
            // try {
                db.collections.users.createCollection();
                db.collections.tradeHistory.createCollection();
                db.collections.coinHistory.createCollection();
            // } catch (ex) {
            //     return ex;
            // }

            return true;
        }
    },
    connect: function (callback) {
        // Setup the mongodb connection
        mongodb.connect(MONGODB_CONNECTION, callback);
    }
};

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
    console.log("Environment - " + process.env.VERSION);
    db.connect(function(err, conn) {
        if (err) {
            // Connection unsuccessful
            console.error("Could not setup connection to database");
            db.conn = undefined;
        } else {
            // Connection successful
            db.conn = conn;
            db.collections.createAllCollections();
            
            db.collections.coinHistory.insert({
                currency: "BTC",
                value: 123.456,
                timestamp: new Date().getTime()
            }).then(function(result) {
                console.log(result);
            });
            
            console.log("Connection setup and all collections created");
        }
    });
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