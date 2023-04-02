var mysql = require("mysql2");
//use the router class in express
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { validationRule } = require("./validationrules");
const { DBCONFIG } = require("../app"); // app.use(”router“) comes after app.js -> modules.export


//-------------------------------------------- homepage --------------------------------------------//

router.get("/", (req, res)=>{
   return res.render("index");
})


//------------------------------------------------------TO DO: log in --------------------------------------//
router.get("/authentic_logIn", (req, res) => {
    return res.render("log_in");
});

//check if the user's session has expired
function userLoggedIn(req){// return true when user is logged in; false otherwise
     // if a session was once created but expired: return false
     // req.session.user: assigned in the "/log_in" handler method, when user logs in successfully
    return req.session.user !=null;
};

router.get("/", (req, res)=>{ 
    if(userLoggedIn(req)==true){ // code run if user is logged in - session is active
        var user_name = req.session.user;
        res.render("log_in",{ 
            data:{
                user_name,
            }
        })
    }else{ // if not logged in
        res.render("log_in", {messages:{error:null} });
    }
});

router.post("/authentic_logIn", async(req, res) =>{
    //regenerate the session
    req.session.regenerate(function(err){
        if(err) console.log(err);
        //authentication - check user credentials against database
    let connection = mysql.createConnection(DBCONFIG);
    connection.connect(function (err) {
        if (err) throw err;
        else console.log("successful connection")
    });
        const  targetUserName = req.body.login_username;
        const query = `SELECT user_password FROM user_credential WHERE user_name = '${targetUserName}';`;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            else if (result == req.body.password){
            // store user information in session, typically a user id
               req.session.user = req.body.login_username;
            // save the session before redirection to ensure page
            // load does not happen before session is saved
                req.session.save(function(err){
                    if(err)return next(err);
                    res.redirect("/user_homepage");
                })
            }   
     })
    })
});
//-----------------------------------------------------for Log in & Register ----------------------------------//


router.get("/registration", (req, res) => {
    return res.render("registration");
})

router.post("/addUserCredentials", urlencodedParser, validationRule, (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    //if there is no error, open query:
    const query = `INSERT INTO user_credential(\
        user_name, user_password, user_email\
    ) VALUES (\
        '${username}', '${password}', '${email}'\
    );`
    connection.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        connection.end();
    });
    

    //Error messages
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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


//---------------------------------------------------------TO DO start post ----------------------------------------//
// router.get("/create_post", (req, res) => {
//     return res.render("create_post.ejs");
//     insert into post table; get postID;
//     pass the postID to /upload post method
// });

// router.post("/upload", urlencodedParser, validationRule, (req, res) => {

//     let username = req.body.username;
//     let password = req.body.password;
//     let email = req.body.email;
//     //if there is no error, open query:
//     const query = `INSERT INTO user_credential(\
//         user_name, user_password, user_email\
//     ) VALUES (\
//         '${username}', '${password}', '${email}'\
//     );`
//     let connection = mysql.createConnection(DBCONFIG);
//     connection.connect(function (err) {
//         if (err) throw err;
//         else console.log("successful connection")
//     });
//     connection.query(query, function (err, result, fields) {
//         if (err) throw err;
//         console.log(result);
//     });
//     connection.end();
// });

//--------------------------------------------------------image upload-----------------------------------------//
const session = require("express-session");
const flash = require("express-flash");
const fileUpload = require("express-fileupload");
//sharp - resizes the images 
const sharp = require("sharp");
// need to npm install almost any require things apart from fs
//fs/promises--> can use await and dont need to use callback by ourselves
const fs = require("fs/promises");

router.use(
    session({
        secret: "session_secret",
        resave: false,
        saveUninitialized: false,
    })
);

router.use(flash());
router.use(
    fileUpload({
        limits: {
            fileSize: 2000000, // Around 2MB
        },
        abortOnLimit: true,
        //   limitHandler: fileTooBig,
    })
);

// TO DO: change the path to image page
router.get("/create_post", (req, res) => {
    res.render("create_post", { messages: { error: null } });
});

const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];

router.post("/upload", async (req, res) => {
    const image = req.files.pic;

    if (acceptedTypes.indexOf(image.mimetype) >= 0) {
        //where is it going to save the file to
        const imageUploaded = __dirname + "/../assets/uploads/" + image.name;
        //const localFileData = `{_direname}/assets/uploads/${imageFile.name}`;

        //copy the file and do the editting
        // const resizedImagePath =
        //   __dirname + "/assets/uploads/resized/" + image.name;
        const editedFile = __dirname + "/../assets/uploads/resized/" + image.name;
        //   const editedUrl = _dirname+ "uploads/resized/" + image.name;
        console.log(image);

        //resize the picture
        await image.mv(imageUploaded).then(async () => {
            try {
                //this process will take a long time, wait for it to finish
                await sharp(imageUploaded)
                    .resize(750)
                    .toFile(editedFile)
                    .then(() => {
                        //delete the original file
                        //or get rid of  and add: await fs.unlink
                        fs.unlink(imageUploaded, function (err) {
                            if (err) throw err;
                            console.log(imageUploaded + " deleted");

                        });
                    });
                // with fs/promises: await fs.unlink(imageDestinationPath); it deletes the original file 
                //res.send("done") --> work like console.log but on the page
            } catch (error) {
                console.log(error);
            }
            //todo: try res.redirect
            res.redirect("/upload", {
                image: "uploads/resized/" + image.name,
                image_name: image.name,
            });
        });
    } else {
        res.render("create_post", {
            messages: { error: "I don't believe that's an image" },
        });
    }
    //----------------------------------------------connect db for images ----------------------------//
    //build the connection to mysql
    let connection = mysql.createConnection(DBCONFIG);
    connection.connect(function (err) {
        if (err) throw err;
        else console.log("successful connection")
    });
    //if there is no error, open query, insert to table
    const query = `INSERT INTO image (image_name, post_id)\
    VALUES (\
        '${image.name}', '${post_id}'\
    );`
    connection.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
    function fileTooBig(req, res, next) {
        //or res.send?
        res.render("create_post", {
            name: "",
            messages: { error: "Filesize too large" },
        });
    }
    
    connection.end();

});




//--------------------------------------------------------  TO DO: create post ---------------------------------------//


router.post("/post_complete", urlencodedParser, (req, res) => {
    let post_title = req.body.post_title;
    let caption = req.body.caption;

    const query = `INSERT INTO post(\
        post_title, post_text, date, user_id\
    ) VALUES (\
        '${post_title}', '${caption}', '${user_id}'\
    );`
    let connection = mysql.createConnection(DBCONFIG);
    connection.connect(function (err) {
        if (err) throw err;
        else console.log("successful connection")
    });
    connection.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });

    connection.end();
});













module.exports = { router };
