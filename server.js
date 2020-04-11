require("dotenv").config();
var path = require("path");
var express = require("express");
var webpack = require("webpack");
var faker = require("faker");

var app = express();

console.log(new Date(), ' Environment : ' + process.env.NODE_ENV);
app.use(express.static(path.join(__dirname, "dist")));

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Express server listening on *:" + port);
});