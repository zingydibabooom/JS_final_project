//define the validation rules for registration
const { check, validationResult } = require("express-validator");

let validationRule = [
    //check the fields() of the body 
    check("username").exists().trim().escape(),
    //min 8, one lower case, one uppercase, one special character
   check("password").matches(/^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d]).*$/,),
    check("email").trim().isEmail().escape(),
];


module.exports = { validationRule, validationResult };

