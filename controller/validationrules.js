//define the validation rules for registration
const { check, validationResult } = require("express-validator");

let validationRule = [
    //check the fields() of the body 
    check("username").exists().trim().escape(),
    //min 8, one lower case, one uppercase, one special character
   check("password").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"),
    check("email").trim().isEmail().escape(),
];

module.exports = { validationRule};