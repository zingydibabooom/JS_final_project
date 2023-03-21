const express = require("express");

$("#submit")[0].addEventListener("click", function (event) {
    event.preventDefault();
    console.log();
})
function collect() {
    console.log("run");
    const userName = document.querySelector('#username').value;
    const passWord = document.querySelector('#password').value;
    const email = document.querySelector('#email').value;
    console.log(userName, passWord, email);

    require("dotenv").config();
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
        ${userName}, ${passWord}, ${email}\
    );`

        connection.query(query, function (err, result, fields) {
            console.log(result);
        });
        connection.end();
    });
}

