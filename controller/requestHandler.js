var mysql = require("mysql2");
//use the router class in express
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { validationRule } = require("./validationrules");
const { DBCONFIG } = require("../app");



//------------------------------------------------------TO DO: log in --------------------------------------//
router.get("/log_in", (req, res) => {
    return res.render("log_in");
});



//post("/authentic_logIn

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

// //Create sessions
// app.use(session({
//     secret: "session_secret",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }))

//---------------------------------------------------------TO DO start post ----------------------------------------//
router.get("/create_post", (req, res) => {
    return res.render("create_post.ejs");
    // insert into post table; get postID;
    // pass the postID to /upload post method
});

router.post("/upload", urlencodedParser, validationRule, (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    //if there is no error, open query:
    const query = `INSERT INTO user_credential(\
        user_name, user_password, user_email\
    ) VALUES (\
        '${username}', '${password}', '${email}'\
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


//--------------------------------------------------------  TO DO: create post ---------------------------------------//


router.post("/post_complete", urlencodedParser, (req, res) => {
    let post_title = req.body.post_title;
    let caption = req.body.caption;

    const query = `INSERT INTO post(\
        post_title, post_text, date, user_id\
    ) VALUES (\
        '${post_title}', '${post_text}', '${user_id}'\
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
router.get("/", (req, res) => {
    res.render("index.ejs", { messages: { error: null } });
});

const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];

router.post("/upload", async (req, res) => {
    const image = req.files.pic;

    if (acceptedTypes.indexOf(image.mimetype) >= 0) {
        //where is it going to save the file to
        const imageUploaded = __dirname + "/assets/uploads/" + image.name;
        //const localFileData = `{_direname}/assets/uploads/${imageFile.name}`;

        //copy the file and do the editting
        // const resizedImagePath =
        //   __dirname + "/assets/uploads/resized/" + image.name;
        const editedFile = __dirname + "/assets/uploads/resized/" + image.name;
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
            res.render("show_post.ejs", {
                image: "/uploads/resized/" + image.name,
                image_name: image.name,
            });
        });
    } else {
        res.render("index.ejs", {
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
        '${image_name}', '${post_id}'\
    );`
    connection.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
    connection.end();




});

function fileTooBig(req, res, next) {
    res.render("index.ejs", {
        name: "",
        messages: { error: "Filesize too large" },
    });
}











module.exports = { router };
