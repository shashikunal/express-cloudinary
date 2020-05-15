const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../Model/Auth");

/*-------------------------all users Login get routes starts here-------------------------------------*/
router.get("/login", (req, res) => {
  res.render("./auth/login");
});
/*-------------------------all users Login get routes starts here-------------------------------------*/

/*-------------------------all users Login Post routes starts here-------------------------------------*/
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/profile/profiles",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
});

/*-------------------------all users Login Post ends starts here-------------------------------------*/

/*-------------------------all users register get routes starts here-------------------------------------*/
router.get("/register", (req, res) => {
  res.render("./auth/register");
});
/*-------------------------all users get ends ends here-------------------------------------*/

/*-------------------------all users register posts routes starts here-------------------------------------*/
router.post("/register", (req, res) => {
  let errors = [];
  let { username, email, password, password2 } = req.body;
  if (password != password2) {
    errors.push({ text: "Password should match" });
  }
  if (password.length < 6) {
    errors.push({ text: "Password should minimum 6 characters" });
  }
  if (errors.length > 0) {
    res.render("./auth/register", {
      errors: errors,
      username,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          req.flash("errors_msg", "Email is already registered");
          res.redirect("/auth/register", 401, {});
        } else {
          //create new users
          let newUser = new User({
            username,
            email,
            password,
          });
          bcrypt.genSalt(12, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then((user) => {
                  req.flash(
                    "success_msg",
                    "Successfully registered Please login ..."
                  );
                  res.redirect("/auth/login", 201, { user });
                })
                .catch((err) => console.log(err));
            });
          });
        }
      })
      .catch((err) => console.log(err));
  }
});

/*-------------------------all users register post ends starts here-------------------------------------*/

/*-----------------------logout route -------------------------------*/

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Successfully logout");
  res.redirect("/auth/login", 201, {});
});

module.exports = router;
