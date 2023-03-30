//define the validation rules for registration
const { check, validationResult } = require("express-validator");

let validationRule = [
    //check the fields() of the body 
    check("username").exists().trim().escape(),
    // check(password).mixedCase().numbers().letters().min(8),
    check("email").trim().isEmail().escape(),
];

module.exports = { validation };