$(document).ready(function () {

});

function collect(){
    console.log("run");
    const userName = document.querySelector('#username');
    const passWord = document.querySelector('#password');
    const email = document.querySelector('#email');
    console.log(userName, passWord, email);
};
// const collectRegiData= document.querySelector('#submitBtn');





// require("dotenv").config();
// const DBCONFIG = {
// host: process.env.DB_HOST, 
// database: process.env.DB_NAME,
// user: process.env.DB_USERNAME,
// password: process.env.DB_PASSWORD
// };

// const connection = mysql.createConnection( DBCONFIG ); 
// connection.connect(function(err) {
//     const query = "INSERT INTO user_credential(\
//         username, password, email\
//     ) VALUES (\
//         userName, passWord, email\
//     );"

//     connection.query(query, function (err, result, fields) {
//         console.log(result);
//   });
//  });

//  connection.end();

// form.addEventListener('button', e=> {
//     e.preventDefault();
// });