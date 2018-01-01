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
            insert: function (data, callback) {
                // Method to insert a new user
                db.conn.collection(this.name)
                    .insertOne(data, callback);
            },
            setInactive: function (username, callback) {
                // Method to set the user as inactive
                // Accepts username of the record to be set as inactive
                db.conn.collection(this.name)
                    .updateOne({
                        username: username
                    }, {
                        $set: {
                            status: "Inactive"
                        },
                        $currentDate: {
                            lastModified: true
                        }
                    },
                    callback
                );
            },
            fetch: function (username, callback) {
                // Method to get the details of a user
                // Accepts username of the user to fetch
                db.conn.collection(this.name)
                    .findOne({ username: username }, callback);
            },
            fetchAll: function (callback) {
                // Method to fetch all the users
                db.conn.collection(this.name)
                    .find({}).toArray(callback);
            },
            update: function (data, oldData, callback) {
                // Method to update a user record
                // Accepts oldData parameter to identify user to update based on username
                // data parameter holds new information
                db.conn.collection(this.name)
                    .replaceOne({
                        username: oldData.username
                    },
                    data,
                    callback
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
                // Method to create a new collection of a trade history
                db.conn.createCollection(
                    this.name,
                    { validator: this.validator }
                );
            },
            insert: function (data, callback) {
                // Method to insert a new trading history record
                db.conn.collection(this.name)
                    .insertOne(data, callback);
            },
            delete: function (data, callback) {
                // Method to delete trading history record
                // Accepts data parameter to perform matching based on transaction type,
                // source & destination currencies and timestamp
                db.conn.collection(this.name)
                    .deleteOne({
                        transactionType: data.transactionType,
                        source: data.source,
                        dest: data.dest,
                        timestamp: data.timestamp
                    }, callback);
            },
            fetch: function (user, coin, timestamp, callback) {
                // Method to get the details of a trading history
                // Performs matching based on the username, coin and the transaction timestamp
                db.conn.collection(this.name)
                    .findOne({
                        username: user,
                        source: coin,
                        timestamp: timestamp
                    }, callback);
            },
            fetchAll: function (username, callback) {
                // Method to fetch all the trade history records
                db.conn.collection(this.name)
                    .find({
                        username: username
                    }).toArray(callback);
            },
            update: function (data, oldData, callback) {
                // Method to update a trading history record
                // Accepts oldData param to perform matching on existing record based on
                // transaction type, source & destination currencies and timestamp
                // data parameter contains the new value
                db.conn.collection(this.name)
                    .replaceOne({
                        transactionType: oldData.transactionType,
                        source: oldData.source,
                        dest: oldData.dest,
                        timestamp: oldData.timestamp
                    },
                    data,
                    callback
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
            insert: function (data, callback) {
                // Method to insert a coin history record
                db.conn.collection(this.name)
                    .insertOne(data, callback);
            },
            delete: function (data, callback) {
                // Method to delete the coin history record
                // Performs matching based on the currency name and the timestamp
                db.conn.collection(this.name)
                    .deleteOne({
                        currency: data.currency,
                        timestamp: data.timestamp
                    }, callback);
            },
            fetch: function (coin, timestamp, callback) {
                // Method to get the details of a coin history
                // Performs matching based on the currency name and the timestamp
                db.conn.collection(this.name)
                    .findOne({
                        currency: coin,
                        timestamp: timestamp
                    }, callback);
            },
            fetchAll: function (coin, callback) {
                // Method to fetch all coin history records
                db.conn.collection(this.name)
                    .find({
                        currency: coin
                    }).toArray(callback);
            },
            update: function (data, oldData, callback) {
                // Method to update a coin history record
                // oldData param contains old value to be updated
                // Performs matching based on the currency name and the timestamp
                // Accepts data param that contains the new values
                db.conn.collection(this.name)
                    .replaceOne({
                        currency: oldData.currency,
                        timestamp: oldData.timestamp
                    },
                    data,
                    callback
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
        mongodb.connect(MONGODB_CONNECTION, function(err, conn) {
            if (conn) {
                // Connection successful
                db.conn = conn;
            }
            callback(err, conn);
        });
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
            // Create all the necessary collections
            db.collections.createAllCollections();
            // Close the connection
            db.conn.close();

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

// Setup the endpoint for user lookup
app.get("/db/users/find", function (req, res) {
    var username = req.query.un;
    
    db.connect(function () {
        db.collections.users.fetch(username, function (err, result) {
            if (result) {
                if (result._id) {
                    respondSuccess(req, res, { __valid: true });
                } else {
                    respondSuccess(req, res, { __valid: false });
                }
            } else {
                console.error(err);
                respondFailure(req, res, err);
            }

            db.conn.close();
        });
    });
});

// Setup the endpoint for user insert
app.post("/db/users/add", function (req, res) {
    var user = req.body;
    
    db.connect(function () {
        db.collections.users.insert(user, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for setting the user inactive
app.post("/db/users/:username/deactivate", function (req, res) {
    var username = req.params.username;

    db.connect(function () {
        db.collections.users.setInactive(username, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for getting all users
app.get("/db/users/all", function (req,res) {
    db.connect(function () {
        db.collections.users.fetchAll(function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for updating a user value
app.post("/db/users/:username/update", function (req, res) {
    var username = req.params.username;
    var newValue = req.body;

    db.connect(function () {
        db.collections.users.update(username, newValue, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for adding a new trade history record
app.post("/db/trade/add", function (req, res) {
    var trade = req.body;

    db.connect(function () {
        db.collections.tradeHistory.insert(trade, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for deleting a trade history record
app.post("/db/trade/delete", function (req,res) {
    var trade = req.body;

    db.connect(function () {
        db.collections.tradeHistory.delete(trade, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for fetching a trade history record
app.get("/db/trade/fetch", function (req, res) {
    var username = req.query.un;
    var src = req.query.src;
    var ts = req.query.ts;

    db.connect(function () {
        db.collections.tradeHistory.fetch(username, src, ts, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for fetching all trade history records for current user
app.get("/db/trade/fetch/all", function (req, res) {
    var username = req.query.un;

    db.connect(function () {
        db.collections.tradeHistory.fetchAll(username, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for updating an existing history record
app.post("/db/trade/update", function (req,res) {
    var trade = req.body.oldData;
    var newValue = req.body.newValue;

    db.connect(function () {
        db.collections.tradeHistory.update(newValue, trade, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for adding a new coin history record
app.post("/db/history/add", function (req,res) {
    var history = req.body;

    db.connect(function () {
        db.collections.coinHistory.insert(history, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for deleting a coin history record
app.post("/db/history/delete/:currency/:timestamp", function (req,res) {
    var src = req.params.currency;
    var ts = req.params.timestamp;

    db.connect(function () {
        db.collections.coinHistory.delete({
            currency: src,
            timestamp: ts
        }, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for fetching a coin history record
// @TODO - Identify if this is necessary...

// Setup the endpoint for fetching all coin history records for the given coin
app.get("/db/history/all", function (req,res) {
    var src = req.query.src;

    db.connect(function () {
        db.collections.coinHistory.fetchAll(src, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});

// Setup the endpoint for updating an coin history record
app.post("/db/history/update/:currency/:timestamp", function (req,res) {
    var src = req.params.currency;
    var ts = req.params.timestamp;
    var newValue = req.body;

    db.connect(function () {
        db.collections.coinHistory.update({
            currency: src,
            timestamp: ts
        }, function (err, result) {
            if (result) {
                respondSuccess(req, res, result)
            } else {
                console.error(err);
                respondFailure(req, res, err)
            }
        });

        db.conn.close();
    })
});