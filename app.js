var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var morgan = require("morgan");
var ApplicationFormModel = require("./models/ApplicationForm");
var User = require("./models/User");

var app = express();

// set our application port
app.set("port", 3000);

// set morgan to log info about our requests for development use.
app.use(morgan("dev"));

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.urlencoded({ extended: true }));

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};

// route for Home-Page
app.get("/", sessionChecker, (req, res) => {
  res.redirect("/login");
});

// route for user signup
app
  .route("/signup")
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + "/public/signup.html");
  })
  .post((req, res) => {
    var user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      status: false,
      yourstatus : "no"
    });
    user.save((err, docs) => {
      if (err) {
        res.redirect("/signup");
      } else {
        console.log(docs);
        req.session.user = docs;
        res.redirect("/dashboard");
      }
    });
  });

// route for verify
app.get("/index", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    if(req.session.user.status){
        // res.write("Form under verification");
        console.log("Form under verification");
        res.sendFile(__dirname + "/public/fomrSubmitSuccessful.html")
    }
    else{
      res.sendFile(__dirname + "/public/index.html");
    }
  } else {
    res.redirect("/login");
  }
});
app.post("/submit", (req, res) => {
  var myData2 = new ApplicationFormModel(req.body);
  // console.log(req);
  // console.log(typeof(myData2));
  console.log(myData2);
  myData2
    .save()
    .then((item) => {
      // res.send("information saved to db");
      console.log("information saved to db");
      const _id = req.session.user._id;
      console.log(_id);
      const updateDocument = async(_id)=>
      {
        try {
          const result = await User.findByIdAndUpdate(
            {_id},
            {$set : {status:true, yourstatus:"one"}},
            { new : true,
              UseFindAndModify : false
            })
          console.log(result);
        }catch (error) {
          console.log(error);
        }
      }
      updateDocument(_id);
      // console.log("Kuch to hua hai");
      res.sendFile(__dirname + "/public/fomrSubmitSuccessful.html")
    })
    .catch((err) => {
      res.status(400).send("Unable to save applicationFrom to database");
    });
});

// route for user Login
app
  .route("/login")
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
  })
  .post(async (req, res) => {
    var username = req.body.username,
      password = req.body.password;

    try {
      var user = await User.findOne({ username: username }).exec();
      if (!user) {
        res.redirect("/login");
      }
      user.comparePassword(password, (error, match) => {
        if (!match) {
          res.redirect("/login");
        }
      });
      req.session.user = user;
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  });

// route for user's dashboard
app.get("/dashboard", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    var data = req.session.user;
    // res.write('<p>email: ' + req.session.user + '</p>')
    // console.log(data.email);
    // res.write('<p>views: ' + JSON.stringify(req.session.user) + '</p>')
    var name = 'hello';
  // res.render(__dirname + "/public/dashboard", {name:name});

    res.sendFile(__dirname + "/public/dashboard.html");
  } else {
    res.redirect("/login");
  }
});

// route for user logout
app.get("/logout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

// start the express server
app.listen(app.get("port"), () =>
  console.log(`App started on port ${app.get("port")}`)
);
