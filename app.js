const express = require("express");
const { router } = require("./controller/requestHandler");
const path = require("path");
const { allowedNodeEnvironmentFlags } = require("process");
const PORT = 8000;
var app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./assets")));
// ian's change: require this module before app.use(sessionn());
const session = require("express-session");

//Create sessions always before app.use(router) for it to know there is session to use
app.use(session({
    secret: "session_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(router);

app.listen(PORT, () => {
  console.log("App running on http://localhost:" + PORT);
});


