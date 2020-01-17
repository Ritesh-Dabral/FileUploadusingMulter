const   express = require("express"),
        path = require('path'), //The path module provides utilities for working with file and directory paths
        crypto = require("crypto"), //deals with an algorithm that performs data encryption and decryption
        mongoose = require('mongoose'), //no need of model as using gridFS
        multer = require('multer'), //used for file storage
        methodOverride = require("method-override"), //http override
        bodyParser = require("body-parser"),
        app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine",'ejs');

//R O U T E S
app.get("/", (req,res) => {
  res.render("index");
});


/* P O R T */
const port=3000;
app.listen(port,()=>console.log(`server started @ ${port}`));