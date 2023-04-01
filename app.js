const express = require("express");
const { router } = require("./controller/requestHandler");
const path = require("path");
const { allowedNodeEnvironmentFlags } = require("process");
const PORT = 8000;
var app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./assets")));

//get the data from the server
const dotenv = require("dotenv");
dotenv.config();
const DBCONFIG = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
};


app.use(router);

app.listen(PORT, () => {
  console.log("App running on http://localhost:" + PORT);
});


module.exports = { DBCONFIG };