// server.js
// where your node app starts

// include modules
const express = require('express');
const request = require('request');
const assets = require('./assets');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const sql = require("sqlite3").verbose();
const FormData = require("form-data");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({storage: storage});


// server.js
// The code that runs on the server.

const lfDB = new sql.Database("lost&Found.db");

let cmd = "SELECT name FROM sqlite_master WHERE type='table' AND name='lostFoundTable' ";
lfDB.get(cmd, function (err, val) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createLostFoundDB();
    } else {
        console.log(val);
        console.log("Database file found");
    }
});


//create the database for the lost and found items
function createLostFoundDB(){
  const cmd = 'CREATE TABLE lostFoundTable ( id TEXT PRIMARY KEY UNIQUE, lostFound TEXT, title TEXT, category TEXT, description TEXT, photoURL TEXT, date DATE, time TIME, location TEXT)';
  lfDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}

const app = express();
// First, make all the files in 'public' available
app.use(express.static("public"));
// The body-parser is used on requests with application/json in header
// parses the JSON in the HTTP request body, and puts the resulting object 
// into request.body
app.use(bodyParser.json()); 

// Now construct the server pipeline
// Special case for request with just the base URL
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/public/index.html");
});

// Also serve static files out of /images
app.use("/images", express.static('images'));

app.post("/updateItem", function(request, response) {
  console.log("Server recieved in update item", request.body);
  
  let foundId = request.body.id;
  let lostFound = request.body.lostFound;
  let title = request.body.title;
  let cat = request.body.category;
  let desc = request.body.description;
  let photoURL = request.body.photoURL;
  let date = request.body.date;
  let time = request.body.time;
  let location = request.body.location;
  let lat = request.body.lat;
  let lng = request.body.lng;
  
  cmd = "INSERT INTO lostFoundTable ( id, lostFound, title, category, description, photoURL, date, time, location) VALUES (?,?,?,?,?,?,?,?,?) ";
  lfDB.run(cmd, foundId, lostFound, title, cat, desc, photoURL, date, time, location, function(err) {
    if (err) {
      console.log("DB insert error",err.message);
      //next();
    } else {
      let newId = this.lastID; // the rowid of last inserted item
      response.send({"lastID": newId});
    }
  }); 
}); // callback, app.post*/


app.post("/searchItem", function(request, response) {
  console.log("Server recieved in search item", request.body);
 
  let lostFound = request.body.lostFound;
  let startDate = request.body.startDate;
  let startTime = request.body.startTime;
  let endDate = request.body.endDate;
  let endTime = request.body.endTime;
  let cat = request.body.category+'%';
  let loc = request.body.location+'%';
  
  if(startDate === '' || endDate === ''){
    cmd = "SELECT * FROM lostFoundTable WHERE lostFound = ? AND category LIKE ? AND location LIKE ?";
    let rows;
    lfDB.all(cmd, lostFound, cat, loc, function(err,rows) {
    if (err) {
      console.log("DB select error",err.message);
      //next();
    } else {
      rows.forEach((row) => {
        console.log(row);
      });
      response.send(rows);
    }
  }); 
  }
  
  else{
    cmd = "SELECT * FROM lostFoundTable WHERE lostFound = ? AND category LIKE ? AND location LIKE ? AND date BETWEEN ? AND ?";
    let rows;
    lfDB.all(cmd, lostFound, cat, loc, startDate, endDate, function(err,rows) {
    if (err) {
      console.log("DB select error",err.message);
      //next();
    } else {
      rows.forEach((row) => {
        console.log(row);
      });
      response.send(rows);
    }
  }); 
        
  }
  

}); //callback, app.post //



// Handle a post request to upload an image. 
app.post('/upload', upload.single('newImage'), function (request, response) {
  console.log("Recieved",request.file.originalname,request.file.size,"bytes")
  if(request.file) {
    //console.log(request.file.originalname);
    sendMediaStore(request.file.originalname, request, response);
    // file is automatically stored in /images, 
    // even though we can't see it. 
    // We set this up when configuring multer
    // response.end("recieved "+request.file.originalname);
  }
  else throw 'error';
});


// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(filename, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + "/images/" + filename));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
          }
        });
      } else { // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      } // else
    });
  }
}


app.post("/getAddress", (req, res) => {
  let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + req.body.lat + ", " + req.body.lng + "&key="
  + process.env.MapAPIKey;
  request(url, { json: true }, (error, response, body) => {
    if (error) { return console.log(error); }
    res.json(body);
  });
})

// custom 404 page (not a very good one...)
// last item in pipeline, sends a response to any request that gets here
// app.all("*", function (request, response) { 
//   response.status(404);  // the code for "not found"
//   response.send("This is not the droid you are looking for"); });


// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});




//********************************code for Google Login begins **************

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

passport.use(new GoogleStrategy(
  {
  clientID: process.env.Google_CLIENT_ID,
  clientSecret: process.env.Google_CLIENT_SECRET,
  callbackURL: 'https://spiral-north-plough.glitch.me/auth/accepted',  
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo', // where to go for info
  scope: ['profile', 'email']  // the information we will ask for from Google
},
  // function to call to once login is accomplished, to get info about user from Google;
  // it is defined down below.
  gotProfile));


// Start setting up the Server pipeline
// const app = express();
console.log("setting up pipeline")

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({extended: true}));

// puts cookies into req.cookies
app.use(cookieParser());
app.use("/", printIncomingRequest);

app.use(expressSession(
  { 
    secret:'bananaBread',  // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  }));

// Initializes request object for further handling by passport
app.use(passport.initialize()); 

app.use(passport.session()); 

app.get('/*',express.static('public'));

// special case for base URL, goes to index.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Glitch assests directory 
app.use("/assets", assets);
app.get('/user/*', requireUser, requireLogin, express.static('.'));


app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/accepted', 
  passport.authenticate('google', 
    { successRedirect: '/setcookie', failureRedirect:  '/?email=notUCD'}
  )
);

app.get('/setcookie', requireUser,
  function(req, res) {
      res.cookie('google-passport-example', new Date());
      res.redirect('/user/screen2.html');
    //} else {
    //   res.redirect('/');
    //}
  }
);

app.get('/user/logoff',
  function(req, res) {
    // clear both the public and the named session cookie
    res.clearCookie('google-passport-example');
    res.clearCookie('ecs162-session-cookie');
    res.redirect('/');
  }
);


function printIncomingRequest (req, res, next) {
    console.log("Serving",req.url);
    if (req.cookies) {
      console.log("cookies",req.cookies)
    }
    next();
}


function gotProfile(accessToken, refreshToken, profile, done) {
    console.log("Google profile",profile);
  let dbRowID = 1;  
  const emailId = profile.emails[0].value;
  console.log("Email id", emailId);
  const splitvar = emailId.split('@')[1];
  if (splitvar !== 'ucdavis.edu')
    {
      dbRowID = -1;
      request.get('https://accounts.google.com/o/oauth2/revoke', {
qs:{token: accessToken }},  function (err, res, body) {
console.log("revoked token");
}) 
    }
  else
    {
      dbRowID = 1;
    }

    done(null, dbRowID); 
}

passport.serializeUser((dbRowID, done) => {
    console.log("SerializeUser. Input is",dbRowID);
    done(null, dbRowID);
});

passport.deserializeUser((dbRowID, done) => {
    console.log("deserializeUser. Input is:", dbRowID);
    let userData = {userData: dbRowID};
    done(null, userData);
});

function requireUser (req, res, next) {
  console.log("require user",req.user);
  console.log('typeof USER: ', typeof req.user.userData);
  const isValidUser = typeof req.user === 'undefined' ? 1: req.user.userData;
  if (isValidUser === -1) {
    console.log("user invalid");
    res.redirect('/?email=notUCD');
  } else {
    console.log("user is",req.user);
    next();
  }
};

function requireLogin (req, res, next) {
  console.log("checking:",req.cookies);
  if (!req.cookies['ecs162-session-cookie']) {
    res.redirect('/');
  } else {
    next();
  }
};

// *********************** code for Google login ends *************************


