const   express = require("express"),
        path = require('path'), //The path module provides utilities for working with file and directory paths
        fs = require("fs"), //deals with async and sync i/o
        mongodb = require('mongodb'), //no need of model as using gridFS
        multer = require('multer'), //used for file storage
        methodOverride = require("method-override"), //http override
        bodyParser = require("body-parser"),
        app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine",'ejs');

//connect to db
var mongo_need_obj = {
  useNewUrlParser: true,
  useUnifiedTopology:true,
};

//make storage engine for multer
var store  = multer.diskStorage({
  //destination: where the files to be stored in disk
  //file: file itself    cb: call back func
  destination: function(req, file, cb){
    cb(null, 'uploads'); //uploads here is the directory
  },
  filename: function(req,file,cb){
    //fieldname: 'name' attribute associated with the upload type from 'form tag'
    //path: allows to extract extension of file
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

      //initialize a variable with our sorage engine
var upload = multer({
  storage: store,
});

const MongoClient = mongodb.MongoClient;
const url = 'mongodb://127.0.0.1:27017';

MongoClient.connect(url,mongo_need_obj,(err,db_res)=>{
  if(err)
    console.log("error connecting to db: " + err);
  else{
    console.log("connected to db");
    db = db_res.db('Images'); //'db' is now the database
  }

});
//R O U T E S

      //root
app.get("/", (req,res) => { 
  res.render("index");
});

      //single file

      //If the current middleware function does not end the request-response 
      //cycle, it must call next() to pass control to the next  
      //middleware function. Otherwise, the request will be left hanging.
app.post("/uploadSingle", upload.single('Sfile'), (req,res,next) => {
    const file = req.file; //set the file to a variable

    if(!file){ //file doesn't uploaded or connection lost
      var error = new Error('Please upload the file');
      //request to load a web page,
      //was somehow incorrect or corrupted and the server couldn't understand it
      error.httpStatusCode = 400; 
      return next(error);
    }

    res.send(file);

});


      // multi file 
      // 8: limit
app.post("/uploadMulti", upload.array('Mfile',8), (req,res,next) => {
    const files = req.files;

    if(!files){ //file doesn't uploaded or connection lost
    var error = new Error('Please upload the file');
    //request to load a web page,
    //was somehow incorrect or corrupted and the server couldn't understand it
    error.httpStatusCode = 400; 
    return next(error);
  }
  res.send(files);
})

      // image file 
app.post("/uploadImg", upload.single('Ifile'), (req,res)=>{
  var img = fs.readFileSync(req.file.path);
  var encode_img = img.toString('base64');

  //defining JSON structure for img
  var finalImg = {
    contentType: req.file.mimetype,
    path: req.file.path,
    image: new Buffer(encode_img, 'base64')
  };

  //insert img to db
  db.collection('img').insertOne(finalImg, (err,db_res)=>{
    if(err)
      return console.log('Problem inserting img: ' + err);
    else{
      //console.log('saved to DB: ' + db_res);
      res.contentType(finalImg.contentType);
      res.send(finalImg.image);
    }
  })
});

/* P O R T */
const port=3000;
app.listen(port,()=>console.log(`server started @ ${port}`));