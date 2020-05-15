module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("errors_msg", "Not Authrized");
    res.redirect("/auth/login", 201, {});
  },
};
