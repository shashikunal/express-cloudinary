const express = require("express");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
var HandlebarsIntl = require("handlebars-intl");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const toastr = require("express-toastr");
const profile = require("./Routes/profile");
HandlebarsIntl.registerWith(Handlebars);
require("dotenv").config();
const app = express();

Handlebars.registerHelper("trimString", function (passedString) {
  var theString = [...passedString].splice(6).join("");
  return new Handlebars.SafeString(theString);
});
// const {
//   allowInsecurePrototypeAccess,
// } = require("@handlebars/allow-prototype-access");
// set engine
app.engine(
  "handlebars",
  exphbs({
    // handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

//connect mongodb

mongoose.connect(
  process.env.MONGODB_URL,
  { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (err) throw err;
    console.log("database connected");
  }
);

//serve static
app.use(express.static(__dirname + "/node_modules"));
app.use(express.static(__dirname + "/public"));

//bodyparser middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

app.use(cookieParser("secret"));
//express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(toastr());

// set global variables
app.use(function (req, res, next) {
  res.locals.toasts = req.toastr.render();
  res.locals.success_msg = req.flash("success_msg");
  res.locals.errors_msg = req.flash("errors_msg");
  res.locals.error = req.flash("error");
  next();
});

//static routes
app.get("/", (req, res) => {
  res.render("./home", { req: req });
  res.send(req.toastr.render());
});
//use routes
app.use("/profile", profile);
const port = process.env.PORT;
app.listen(port, (err) => {
  if (err) throw err;
  console.log("app is running on port number " + port);
});
