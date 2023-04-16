var mysql = require("mysql2");
const mysqlPromise = require("mysql2/promise");
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

// the prefix to an image's path (before image name)
const image_directory_str = "uploads/resized/";

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
    // MySQL session store ready for use.
    console.log('MySQLStore ready');
}).catch(error => {
    // Something went wrong.
    console.error(error);
});
// lets router use this for all paths - parse / understand user http requests.
//can remove erlencodedParser from individual paths now
router.use(urlencodedParser);

//-------------------------------------------- homepage --------------------------------------------//

router.get("/", (req, res) => {
    return res.render("index");
})


//------------------------------------------------------ log in --------------------------------------//
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
        let connection = mysql.createConnection(DB_CONFIG);
        connection.connect(function (err) {
            if (err) throw err;
            else console.log("successful connection")
        });
        const targetUserName = req.body.login_username;
        const targetPassword = req.body.password;
        const query = `SELECT user_id, user_name FROM user_credential WHERE
         user_name = ? AND user_password =? ;`;
        connection.query(query, [targetUserName, targetPassword], function (err, result, fields) {
            if (err) throw err;
            if (result.length === 0) { // not logged in
                let wrongInfo = "Incorrect username or password";
                res.render("log_in", {
                    wrongInfo: wrongInfo,
                });
            } else { //logged in
                // unpack sql result and get uder id(primary key), then assign to session.user_id
                // then use that to insnert into post table
                req.session.user_id = result[0].user_id;
                req.session.user_name = result[0].user_name;
                req.session.save(function (err) {
                    if (err) return err;
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

router.post("/addUserCredentials", validationRule, async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    //Error messages
    const errors = validationResult(req);
    //if there is error
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        let currentErrors = [];
        for (let i = 0; i < errorArray.length; i++) {
            const currentError = errorArray[i];
            console.log(currentError);
            //show the error message
            let errorMsg = "invalid " + currentError.param + ":" + currentError.value;
            let errorMsgPsw = "invalid " + currentError.param + ": the password must contains minimum 8 charaters, one lower case, one uppercase, one special character";
            if (currentError.param == "password") {
                currentErrors.push(errorMsgPsw);
            } else {
                currentErrors.push(errorMsg);
            }
            res.render("registration", {
                currentErrors: currentErrors,
            });
        }
    } else {  //if there is no error, check the if the username or(and) email is unique
        let connection = await mysqlPromise.createConnection(DB_CONFIG);
        try {
            await connection.execute("INSERT `user_credential`(\
                `user_name`, `user_password`, `user_email`) VALUES (?,?,?)", [username, password, email]);
        } catch (e) {  //if not, throw error
            console.log(e);
            let duplicateErrors = "Username or email address already exists.";
            res.render("registration", {
                showMsg: duplicateErrors,
            });
        }
        //if there are no errors, 
        finally {
            const findNewUserId = `SELECT user_id, user_name 
            FROM user_credential WHERE
             user_name = "${username}";`
            let [thisUserId, userIdOtherFields] = await connection.execute(findNewUserId);
            req.session.user_id = thisUserId[0].user_id;
            req.session.user_name = username;
            req.session.save(function (err) {
                if (err) return err;
                res.redirect("/user_homepage");

            })
        }
    };
});
  
//--------------------------------------------------------post your work-----------------------------------------//
router.get("/user_homepage", (req, res) => {
    if (userLoggedIn(req) == true) { // code run if user is logged in - session is active
        var user_id = req.session.user_id;
        let connection = mysql.createConnection(DB_CONFIG);
        //get all the user data of this user from db
        const query =
            `SELECT P.*, U.user_name
             FROM post as P, user_credential as U
             WHERE P.user_id = U.user_id
             AND P.user_id =?
             ORDER BY post_date DESC`;
        // const commentsQuery = "SELECT"
        connection.query(query, [user_id], function (err, result, fields) {
            if (err) throw err; //if throw err here the website will stop running
            // result is an array of key-value objects
            // add the image directory prefix to each image name before sendingn to ejs
            for (let i = 0; i < result.length; i++) {
                // imageURL = image_directory_str + result[i].image_name;
                result[i].image_path = image_directory_str + result[i].image_name;
            }
            // console.log(result);
            res.render("show_post", {
                data: {
                    user_name: req.session.user_name,
                    result: result,
                    isUserHomepage: true,
                    isLoggedIn: userLoggedIn(req),
                },
            })
        });
    } else { // if not logged in
        res.render("log_in", { messages: { error: null } });
    }
});

//---------------------log out-------//

router.get('/logOut', function (req, res) {
    req.session.destroy();
    console.log("logged out");
    res.redirect("/");
})

//-----------image upload-----------//

const flash = require("express-flash");
const fileUpload = require("express-fileupload");
//sharp - resizes the images 
const sharp = require("sharp");
// need to npm install almost any require things apart from fs
//fs/promises--> can use await and dont need to use callback by ourselves
const fs = require("fs/promises");
// const { STATUS_CODES } = require("http");

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
            fileSize: 10000000, // Around 10MB
        },
        abortOnLimit: true,
        //   limitHandler: fileTooBig,
    })
);

const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];

router.get("/create_post", (req, res) => {
    return res.render("create_post");
});

router.post("/upload", async (req, res) => {
    if (req.files == null) {
        res.render("create_post", {
            messages: { error: "Please upload an image." },
        });
    }
    const image = req.files.pic;
    const user_id = req.session.user_id;
    if (acceptedTypes.indexOf(image.mimetype) >= 0) {
        //where is it going to save the file to
        // use user ID and post time as image name for unique identifier
        var today = new Date();
        var date = today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();
        // can't use ":" in filenames because it will be converted to "/" whcih will be mistaken for path name
        var time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
        var cur_time = date + "-" + time;
        var imageNewName = user_id + "-" + cur_time + "." + image.name.split(".").pop(); //get the extension after .
        const imageUploaded = __dirname + "/../assets/uploads/" + image.name;
        //const localFileData = `{_direname}/assets/uploads/${imageFile.name}`;
        //copy the file and do the editting
        // const resizedImagePath =
        //   __dirname + "/assets/uploads/resized/" + image.name;
        const editedFile = __dirname + "/../assets/uploads/resized/" + imageNewName;
        //   const editedUrl = _dirname+ "uploads/resized/" + image.name;
        //resize the picture
        await receiveAndResizeImage(image, imageUploaded, editedFile, res, imageNewName);
    } else {
        res.render("create_post", {
            messages: { error: "I don't believe that's an image" },
        });
    }
    //----------------------------------------------connect db for images ----------------------------//
    //build the connection to mysql
    insertImageIntoDatabase(imageNewName, user_id);

    function fileTooBig(req, res, next) {
        res.render("create_post", {
            name: "",
            messages: { error: "Filesize too large" },
        });
    }

});


//--------------------------------------------------------create post ---------------------------------------//

router.post("/post_complete", (req, res) => {
    let connection = mysql.createConnection(DB_CONFIG);
    connection.connect(function (err) {
        if (err) throw err;
        else console.log("successful connection")
    });
    let post_title = req.body.post_title;
    let caption = req.body.caption;
    // get image_name from the hidden element in ejs form.
    let image_name = req.body.image_name;
    // upddate the post_title and post_text column in the database that has the correspondinng imagename in the entry
    const query = `UPDATE post
        SET post_title = ?, post_text =?, post_date = CURDATE()
        WHERE image_name = ?`;
    connection.query(query, [post_title, caption, image_name], function (err, result, fields) {
        if (err) throw err;
        res.redirect("/user_homepage");
    });
});

async function receiveAndResizeImage(image, imageUploaded, editedFile, res, imageNewName) {
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
                        if (err)
                            throw err;
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
            data: {
                image_URL: image_directory_str + imageNewName,
                image_name: imageNewName,
            }
        });
    });
}

function insertImageIntoDatabase(imageNewName, user_id) {
    let connection = mysql.createConnection(DB_CONFIG);
    connection.connect(function (err) {
        if (err)
            throw err;
        else
            console.log("successful connection");
    });
    //if there is no error, open query, insert to table
    const query = `INSERT INTO post (image_name, user_id) VALUES (?,?);`;

    connection.query(query, [imageNewName, user_id], function (err, result, fields) {
        if (err)
            throw err;
    });

}

// --------------------------------------get all the db on browser page----------------//
router.get("/image_showcase", async (req, res) => {
    let connection_promise = await mysqlPromise.createConnection(DB_CONFIG);
    //get all the user data of this user from db
    const allPostsQuery = `SELECT P.*, U.user_name
        FROM post as P, user_credential as U
        WHERE P.user_id = U.user_id
        ORDER BY post_date DESC`;
    // otherfields contains irrelevant info from the query execution.
    let [allPosts, otherFields] = await connection_promise.execute(allPostsQuery);
    for (let thisPost of allPosts) { // for each post
        const commentQuery =
            `SELECT C.*, U.user_name
            FROM user_comment as C, user_credential as U 
            WHERE C.post_id =${thisPost.post_id} AND C.user_id = U.user_id`;
        // get all comments that responsed to this post
        let [thisPostsComments, otherFields] = await connection_promise.execute(commentQuery);

        //show comment likes
        for (let thisComment of thisPostsComments) {
            const likeToCommentsQuery =
                `SELECT COUNT(*) as count
               FROM user_like
               WHERE comment_id = ${thisComment.comment_id};`
            let [thisCommentLikes, commentLikeOtherFields] =
                await connection_promise.execute(likeToCommentsQuery);
            thisComment.allLikes = thisCommentLikes[0].count;
        }

        //append the comments to the result passed on to ejs
        // create a new attribute withinn the allPosts variable
        thisPost.comments = thisPostsComments;

        //show  post likes
        const likeQuery =
            `SELECT L.*, U.user_name
            FROM user_like as L, user_credential as U
            WHERE L.post_id = ${thisPost.post_id} AND L.user_id = U.user_id`;
        let [thisPostsLikes, otherField] = await connection_promise.execute(likeQuery);
        thisPost.likes = thisPostsLikes;
        thisPost.likesNum = thisPost.likes.length;

        //show all images
        thisPost.image_path = image_directory_str + thisPost.image_name;

    }
    res.render("show_post", {
        data: {
            result: allPosts,
            isUserHomepage: false,
            isLoggedIn: userLoggedIn(req),

        }
    });
});

//------------------------comments---------------------------------//
router.post("/addComment", (req, res) => {
    let connection = mysql.createConnection(DB_CONFIG);
    const postId = req.body.postId;
    const commentUser = req.session.user_id;
    const commentText = req.body.commentText;
    const insertCommentQuery = `INSERT INTO user_comment(user_id, comment_text, post_id, comment_date)
        VALUES (?,?,?, CURDATE())`;
    connection.query(insertCommentQuery, [commentUser, commentText, postId], function (err, result, fields) {
        if (err) throw err;
        res.redirect("/image_showcase");
    })

});
//--------------likes-----------//
router.post("/addLike", (req, res) => {
    let connection = mysql.createConnection(DB_CONFIG);
    const likeUser = req.session.user_id;
    const toPost = req.body.postId;
    const toComment = req.body.commentId;
    if (toPost != null) {
        const insertLikeQuery = `INSERT IGNORE INTO user_like(user_id, post_id)
        VALUES (?,?)`;
        connection.query(insertLikeQuery, [likeUser, toPost], (dbErr, dbResult) => {
            console.log(dbErr, dbResult);
            if (dbErr == null) {
                res.redirect("/image_showcase");
            }
        });
    } else if (toComment != null) {
        const insertLiketoCommentQuery = `INSERT IGNORE INTO user_like(user_id, comment_id)
        VALUES(?,?)`;
        connection.query(insertLiketoCommentQuery, [likeUser, toComment], (dbErr, dbResult) => {
            console.log(dbErr, dbResult);
            if (dbErr == null) {
                res.redirect("/image_showcase");
            }
        });
    }

});


module.exports = { router };



