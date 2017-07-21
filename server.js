/**
* @description : Main entry point for the server
* @author : Saket Joshi
* @version : 1.0
*/

"use strict";

var path = require("path");
var bodyParser = require("body-parser");
var express = require("express");
var app = express();

// Make available the app folder
app.use(express.static(path.join(__dirname, "app")));

// Start the server on port #3000
app.listen(3000, function() {
    console.log("Node server started on port 3000");
});
