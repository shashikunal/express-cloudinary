const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
require("../config/cloudinaryConfig");
const cloudinary = require("../config/cloudinaryConfig");
let { ensureAuthenticated } = require("../helper/auth_helper");

//load Profile Schema
require("../Model/Profile");
const Profile = mongoose.model("profile");
const uploadPhoto = require("../config/multer");

const upload = multer({
  storage: uploadPhoto.storage,
});

router.get("/all-profiles", ensureAuthenticated, (req, res) => {
  Profile.find({})
    .sort({ date: "desc" })
    .lean()
    .then((body) => {
      res.render("./profiles/all-profiles", {
        body: body,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/add-profile", ensureAuthenticated, (req, res) => {
  res.render("./profiles/add-profile");
});

router.get("/profiles", ensureAuthenticated, (req, res) => {
  Profile.find({ user: req.user.id })
    .sort({ date: "desc" })
    .lean()
    .then((body) => {
      res.render("./profiles/profiles", {
        body: body,
      });
    })
    .catch((err) => console.log(err));
});

//edit Profile get route

router.get("/edit-profile/:id", ensureAuthenticated, (req, res) => {
  Profile.findOne({ _id: req.params.id })
    .lean()
    .then((profile) => {
      if (profile.user != req.user.id) {
        req.flash("errors_msg", "Not authrized");
      } else {
        res.render("./profiles/edit-profile", { profile: profile });
      }
    });
});

//----------------------post profile block --------------------------------------------------

//post data
router.post(
  "/add-profile",
  ensureAuthenticated,
  upload.single("photo"),
  async (req, res) => {
    const errors = [];

    if (!req.body.firstname) {
      errors.push({ text: "First name is Required" });
    }
    if (!req.body.lastname) {
      errors.push({ text: "lastname is Required" });
    }
    if (!req.body.email) {
      errors.push({ text: "Email is Required" });
    }

    if (!req.body.phonenumber) {
      errors.push({ text: "Phone number is Required" });
    }

    if (errors.length > 0) {
      res.render("profiles/add-profile", {
        errors: errors,
        photo: req.file,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
      });
    } else {
      var cloudPhoto = await cloudinary.v2.uploader.upload(req.file.path);

      let newProfile = {
        photo: [req.file, cloudPhoto],
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        user: req.user.id,
      };
      new Profile(newProfile)
        .save()
        .then((profile) => {
          req.flash("success_msg", "Successfully profile created!");
          res.redirect("/profile/profiles", 302, {
            profile: profile,
          });
        })
        .catch((err) => console.log(err));
    }
  }
);

//put Post
router.put(
  "/edit-profile/:id",
  ensureAuthenticated,
  upload.single("photo"),
  (req, res) => {
    Profile.findOne({ _id: req.params.id })
      .then((data) => {
        data.photo = req.file;
        data.firstname = req.body.firstname;
        data.lastname = req.body.lastname;
        data.email = req.body.email;
        data.phonenumber = req.body.phonenumber;

        data
          .save()
          .then((profile) => {
            req.flash("success_msg", "Successfully profile updated!");
            res.redirect("/profile/profiles", 302, {
              profile: profile,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
);

router.delete("/delete-profile/:id", ensureAuthenticated, (req, res) => {
  Profile.remove({ _id: req.params.id })
    .then((_) => {
      req.flash("success_msg", "successfully deleted profile");
      res.redirect("/profile/profiles", 302);
    })
    .catch((err) => console.log(err));
});

module.exports = router;
