const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const routes = require("./routes/index");

app.use("/api/v1", routes);

module.exports = app;
