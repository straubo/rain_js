var express = require("express");
var app = express();

const portNumber = 5000;

app.use(express.static("public"));
app.use("/", express.static(__dirname + "/"));

var server = app.listen(portNumber);
console.log(portNumber + " stars in the night sky");
