const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const fileUpload = require("express-fileupload");
//sharp - resizes the images 
const sharp = require("sharp");
// need to npm install almost any require things apart from fs
//fs/promises--> can use await and dont need to use callback by ourselves
const fs = require("fs/promises");
const PORT= 8080;

app.use(express.static("assets"));
app.set("view-engine", "ejs");
app.use(express.static(path.join(__dirname, "./assets")));

app.use(
    session({
      secret: "session_secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(flash());
  app.use(
    fileUpload({
      limits: {
        fileSize: 2000000, // Around 2MB
      },
      abortOnLimit: true,
      limitHandler: fileTooBig,
    })
  );


  app.get("/", (req, res) => {
    res.render("index.ejs", { messages: { error: null } });
  });
  
  const acceptedTypes = ["image/gif", "image/jpeg", "image/png"];
  
  app.post("/upload", async (req, res) => {
    const image = req.files.pic;

    if (acceptedTypes.indexOf(image.mimetype) >= 0) {
      //where is it going to save the file to
      const imageDestinationPath = __dirname + "/assets/uploads/" + image.name;
      //const localFileData = `{_direname}/assets/uploads/${imageFile.name}`;

      //copy the file and do the editting
      // const resizedImagePath =
      //   __dirname + "/assets/uploads/resized/" + image.name;

      const editedUrl = `uploads/resized/${image.name}`;
      const editedFile=`assets/${editedUrl}`;
  
  
      //resize the picture
      await image.mv(imageDestinationPath).then(async () => {
        try {
          //this process will take a long time, wait for it to finish
          await sharp(imageDestinationPath)
            .resize(750)
            .toFile(editedFile)
            .then(() => {
              //delete the original file
              //or get rid of  and add: await fs.unlink
              fs.unlink(imageDestinationPath, function (err) {
                if (err) throw err;
                console.log(imageDestinationPath + " deleted");

                res.render("upload_image.ejs",{
                  data:{
                    iamgeName: image.name,
                    imageSourceUrl: editedUrl, //have to give it back to the user
                  }
                });
              });
              // with fs/promises: await fs.unlink(imageDestinationPath); it deletes the original file 
              //res.send("done") --> work like console.log but on the page
            });
        } catch (error) {
          console.log(error);
        }
  
        res.render("img.ejs", {
          image: "/uploads/resized/" + image.name,
          image_name: image.name,
        });
      });
    } else {
      res.render("index.ejs", {
        messages: { error: "I don't believe that's an image" },
      });
    }
  });
  
  function fileTooBig(req, res, next) {
    res.render("index.ejs", {
      name: "",
      messages: { error: "Filesize too large" },
    });
  }
  
  app.listen(PORT, () => {
    console.log("App running on http://localhost:" + PORT);
});
  