var express = require("express");
var app = express();

const portNumber = 5000;

app.use(express.static("public"));
// app.use('/images', express.static(__dirname + '/Images'));
app.use("/", express.static(__dirname + "/"));
// console.log(__dirname);

var server = app.listen(portNumber);
console.log("we're fucking doing it on port " + portNumber);
