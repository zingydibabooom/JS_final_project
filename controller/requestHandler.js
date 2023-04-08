var mysql = require("mysql2");
//use the router class in express
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { validationRule, validationResult } = require("./validationrules");

const dotenv = require("dotenv");
dotenv.config();
const DB_CONFIG = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
};
//Newly added  should i have it in app.js?
let connection = mysql.createConnection(DB_CONFIG);
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore(DB_CONFIG); 


router.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});


//todo-1 lets router use this for all paths - parse / understand user http requests.
//todo: can remove erlencodedParser from individual paths now
router.use(urlencodedParser);


//-------------------------------------------- homepage --------------------------------------------//

router.get("/", (req, res) => {
    return res.render("index");
})


//------------------------------------------------------TO DO: log in --------------------------------------//
router.get("/authentic_logIn", (req, res) => {
    return res.render("log_in");
});

//check if the user's session has expired
function userLoggedIn(req) {// return true when user is logged in; false otherwise
    // if a session was once created but expired: return false
    // req.session.user: assigned in the "/log_in" handler method, when user logs in successfully
    return req.session.user_id != null;
};

router.post("/authentic_logIn", async (req, res) => {
    //regenerate the session
    req.session.regenerate(function (err) {
        if (err) console.log(err);
        //authentication - check user credentials against database
        
        connection.connect(function (err) {
            if (err) throw err;
            else console.log("successful connection")
        });
        const targetUserName = req.body.login_username;
        const targetPassword = req.body.password;
        const query = `SELECT user_id, user_name FROM user_credential WHERE\
         user_name = '${targetUserName}' AND user_password = '${targetPassword}' ;`;
        connection.query(query, function (err, result, fields) {
            if (err) throw err;
            else if (result.length === 0){ // not logged in
               
                //TODO: prompt wrong username or password

            } else{ //logged in
                // unpack sql result and get uder id(primary key), then assign to session.user_id
                // then use that to insnert into post table
                req.session.user_id = result[0].user_id;
                req.session.user_name = result[0].user_name;
                req.session.save(function(err){
                    if(err) return next (err);
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

router.post("/addUserCredentials", validationRule, (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    //if there is no error, open query:
    const query = `INSERT INTO user_credential(\
        user_name, user_password, user_email\
    ) VALUES (\
        '${username}', '${password}', '${email}'\
    );`
    let connection = mysql.createConnection(DB_CONFIG);
    connection.query(query, function (err, result, fields) {
        if (err) throw err; //if throw err here the website will stop running 
        console.log(result);
        connection.end();
    });
// conection.connect((err)=>{
//     console.log ("connected?", err);
// });

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
//     let connection = mysql.createConnection(DB_CONFIG);
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

//--------------------------------------------------------post your work-----------------------------------------//

router.get("/user_homepage", (req, res) => {
    if (userLoggedIn(req) == true) { // code run if user is logged in - session is active
        var user_name = req.session.user_name;
        res.render("user_homepage", {
            data: {
                user_name,
            }
        })
    } else { // if not logged in
        res.render("log_in", { messages: { error: null } });
    }
});

//----image upload---//

const flash = require("express-flash");
const fileUpload = require("express-fileupload");
//sharp - resizes the images 
const sharp = require("sharp");
// need to npm install almost any require things apart from fs
//fs/promises--> can use await and dont need to use callback by ourselves
const fs = require("fs/promises");
const { STATUS_CODES } = require("http");

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
            fileSize: 3000000, // Around 2MB
        },
        abortOnLimit: true,
        //   limitHandler: fileTooBig,
    })
);

// TO DO: change the path to image page
router.get("/user_homepage", (req, res) => {
    res.render("user_homepage", { messages: { error: null } });
});

const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];

router.get("/create_post", (req, res) => {
    return res.render("create_post");
});


router.post("/upload", async (req, res) => {
    const image = req.files.pic;
    const user_id = req.session.user_id;
    if (acceptedTypes.indexOf(image.mimetype) >= 0) {
        //where is it going to save the file to
        // use user ID and post time as image name for unique identifier
        var today = new Date();
        var date = today.getDate()+ "-" +(today.getMonth()+1)+"-" + today.getFullYear();
        var time = today.getHours()+ ":" + today.getMinutes() + ":" + today.getSeconds();
        var cur_time = date +"-" + time;
        var imageNewName = user_id + "-" + cur_time +"."+ image.name.split(".").pop();
        const imageUploaded = __dirname + "/../assets/uploads/" + image.name;
        //const localFileData = `{_direname}/assets/uploads/${imageFile.name}`;
        //copy the file and do the editting
        // const resizedImagePath =
        //   __dirname + "/assets/uploads/resized/" + image.name;
        const editedFile = __dirname + "/../assets/uploads/resized/" + imageNewName;
        //   const editedUrl = _dirname+ "uploads/resized/" + image.name;
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
                           // 
                        });
                    });
                // with fs/promises: await fs.unlink(imageDestinationPath); it deletes the original file 
                //res.send("done") --> work like console.log but on the page
            } catch (error) {
                console.log(error);
            }
            
            res.render("create_post", {
                image_URL: "/uploads/resized/" + imageNewName,
                image_name: imageNewName,
            });
        });
    } else {
        res.render("create_post", {
            messages: { error: "I don't believe that's an image" },
        });
    }
    //----------------------------------------------connect db for images ----------------------------//
    //build the connection to mysql
    connection.connect(function (err) {
        if (err) throw err;
        else console.log("successful connection")
    });
    //if there is no error, open query, insert to table
    const query = `INSERT INTO post (image_name, user_id)\
    VALUES (\
        '${imageNewName}','${user_id}' );`
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


router.post("/post_complete", (req, res) => {
    let post_title = req.body.post_title;
    let caption = req.body.caption;

    const query = `INSERT INTO post(\
        post_title, post_text, date, user_id\
    ) VALUES (\
        '${post_title}', '${caption}', '${user_id}'\
    );`
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
