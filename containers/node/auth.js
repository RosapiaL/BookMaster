const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


const GOOGLE_CLIENT_ID = '251108875342-4v8smdsvvqujm8nte6bb4m8har234rk1.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';


passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback",
    passReqToCallback : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));


passport.serializeUser(function(user,done){
    done(null, user);
});

passport.deserializeUser(function(user,done){
    done(null, user);
});