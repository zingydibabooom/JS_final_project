const express = require("express");
const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const path = require("path");
const { allowedNodeEnvironmentFlags } = require("process");
const PORT = 8000;
var app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./assets")));

app.get("/registration", (req, res) => {
    return res.render("registration");
})


app.post("/addUserCredentials", urlencodedParser, validationObject, async(req, res) => {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    console.log(email);
    const { check, validationResult } = require("express-validator");
    let validationObject = [
        check(username).exists().trim().escape(),
        // check(password).mixedCase().numbers().letters().min(8),
        check(email).trim().isEmail().escape(),
    ];
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
     //maybe?
        console.log("error");
    }
});


app.listen(PORT, () => {
    console.log("App running on http://localhost:" + PORT);
});







// $("#submit")[0].addEventListener("click", function (event) {
//     event.preventDefault();
//     console.log();
// })
// function collect() {
//     console.log("run");
//     const userName = document.querySelector('#username').value;
//     const passWord = document.querySelector('#password').value;
//     const email = document.querySelector('#email').value;
//     console.log(userName, passWord, email);

//     const dotenv = require("dotenv");
//     dotenv.config();
//     const DBCONFIG = {
//         host: process.env.DB_HOST,
//         database: process.env.DB_NAME,
//         user: process.env.DB_USERNAME,
//         password: process.env.DB_PASSWORD
//     };

//     const connection = mysql.createConnection(DBCONFIG);
//     connection.connect(function (err) {
//         const query = `INSERT INTO user_credential(\
//         username, password, email\
//     ) VALUES (\
//         ${userName}, ${passWord}, ${email}\
//     );`


//         connection.query(query, function (err, result, fields) {
//             console.log(result);
//         });
//         connection.end();
//     });
// }

