const express = require("express");
const { router } = require("./controller/requestHandler");

const path = require("path");
const { allowedNodeEnvironmentFlags } = require("process");
const PORT = 8000;
var app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./assets")));

app.use(router);

app.listen(PORT, () => {
  console.log("App running on http://localhost:" + PORT);
});

