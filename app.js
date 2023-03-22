var mysql = require("mysql");

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


const { check, validationResult } = require("express-validator");
//define the validation rules
let validationRule = [
    //check the fields() of the body 
    check("username").exists().trim().escape(),
    // check(password).mixedCase().numbers().letters().min(8),
    check("email").trim().isEmail().escape(),
];
app.post("/addUserCredentials", urlencodedParser, validationRule, async (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    // console.log(req.body.username);
    // console.log(req.body.email);

    //get the data from the server
    const dotenv = require("dotenv");
    dotenv.config();
    const DBCONFIG = {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
    };

    const connection = mysql.createConnection(DBCONFIG);
    connection.connect(function (err) {
        const query = `INSERT INTO user_credential(\
        username, password, email\
    ) VALUES (\
        ${username}, ${password}, ${email}\
    );`
        console.log(username);

        connection.query(query, function (err, result, fields) {
            console.log(result);

        });
        connection.end();
    });

    //connection builder
    // const QueryBuilder = require('node-querybuilder');
    // const pool = new QueryBuilder(DBCONFIG, 'mysql', 'pool');

    // pool.get_connection(qb => {
    //     qb.select('*')
    //     .get(user_credential, (err, results) => {
    //         qb.disconnect();
    //         console.log("Results:", results);
    //     }
    //     );
    // });

    //Error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log("run");
        const errorArray = errors.array();

        for (let i = 0; i < errorArray.length; i++) {
            console.log(errorArray[i]);
            const currentError = errorArray[i].param;
            if (currentError == 'email') {
                console.log("Please insert proper email address.")
            }
        }
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



