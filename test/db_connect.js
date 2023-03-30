const mysql = require("mysql2");
// credentials / authentication for connecting to database
let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "LXLfE8JL",
    database: "Final_assignment"
});
// attempts to open a connection with given credentials;
// report error if any
connection.connect(function (err) {
    if (err) throw err;
    // const query = `INSERT INTO user_credential(user_id, user_name, user_password, user_email)
    //                VALUES (${username}, ${password}, ${email});`

});
// 
const query = 'SELECT COLUMN_NAME, DATA_TYPE, TABLE_NAME FROM \
    information_schema.COLUMNS WHERE TABLE_SCHEMA = \'Final_assignment\';'
connection.query(query, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
});
connection.end();