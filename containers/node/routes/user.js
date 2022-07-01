var express = require('express');
var router = express.Router();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

router.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());
/* GET users listing. */
router.get('/', isLoggedIn, (req, res) => {
  console.log(req.user);
  res.send("ciao");
  res.cookie("username",req.user.displayName);
});
router.get("/auth",
passport.authenticate("google", { scope: ["profile"] })
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


  passport.use(new GoogleStrategy({
      clientID: "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/user/info",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
      }
  ));
  
  router.get("/info",
  passport.authenticate('google', { 
    successRedirect: "/user",
    failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to success.
    res.redirect("/success");
  });
  function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }
module.exports = router;
