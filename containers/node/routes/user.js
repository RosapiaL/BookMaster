var express = require('express');
var router = express.Router();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/auth",
passport.authenticate("google", { scope: ["profile"] })
);

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


  passport.use(new GoogleStrategy({
      clientID: "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/user/info",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
      }
  ));
  
  router.get("/info",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to success.
    res.redirect("/success");
  });
module.exports = router;
