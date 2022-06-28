var express = require('express');
var router = express.Router();
const {google} = require("googleapis");
var request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios");
const cookieParser = require('cookie-parser');
const ejs = require("ejs");
const session = require('express-session');
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function getValoreAccesso(req){
  access_token = JSON.stringify(req.cookies.accesso);
  if(access_token == "true") return "true";
  else return "false";
}

/* GET home page. */
router.get('/', function(req, res) {
  res.cookie("accesso","false");
  res.render('index', { title: 'Express' });
});

router.get('/search', function(req, res) {
  res.render('search', { title: 'Search' });
});

router.get('/mybook', function(req, res) {
  if(getValoreAccesso(req)){
    res.render('mybook',{
      title: "my book",
      line: getValoreAccesso(req)
    });

  }
  else{
    const oauth2Client = new google.auth.OAuth2(
        //client id
        "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
        //client secret
        "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",
        //link to redirect
        "http://localhost:3000/steps"
    )
    const scopes = ["https://www.googleapis.com/auth/books"];
    const url = oauth2Client.generateAuthUrl({
        access_type:"offline",
        scope: scopes,
        state:JSON.stringify({
            callbackUrl: req.body.callbackUrl,
            userID: req.body.userid
        })
    });
    request(url,(err,response,body) => {
        console.log("error: ",err);
        console.log("statusCode: ", response && response.statusCode);
        res.render('mybook',{
          line: getValoreAccesso(req),
          tile: 'oauth',
          url: url
        });
      });
    }
  });

router.get("/steps",async (req,res) =>{
  const queryURL = new urlParse(req.url);
  console.log(queryURL);
  console.log(queryURL.query);
  if(queryURL.query==""){
    res.render("steps",{
      tile: 'mybook'
    });
  }
  else{
  const code = queryParse.parse(queryURL.query).code;
  const oauth2Client = new google.auth.OAuth2(
      //client id
      "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
      //client secret
      "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",
      //link to redirect
      "http://localhost:3000/steps"
  );
  const tokens = await oauth2Client.getToken(code);
  access_token = JSON.stringify(tokens.tokens.access_token);
  res.cookie("un_biscotto_per_te",access_token);
  res.cookie("accesso","true");
  res.render('steps', { title: 'Express',
                        login: getValoreAccesso(req) });
                      }
});

router.get("/to_read",function(req,res){
  access_token_cookie = JSON.stringify(req.cookies.un_biscotto_per_te);
  access_token_cookie = access_token_cookie.split('"')[2].slice(0,-1);
  const queryURL = new urlParse(req.url);
  const id = queryParse.parse(queryURL.query).id;
  if(access_token_cookie){
    var options = {
      url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/2/addVolume?volumeId="+id+"&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
      headers:{
          Authorization : "Bearer " + access_token_cookie,
          'content-type':'application/json',
          'Content-length': 'CONTENT-LENGTH'
        }
    };
    
    request.post(options,function(error,response,body){
        console.log(access_token_cookie);
        console.log(body);
        res.render("steps", { title: 'mybook' });
    });
  }
});
router.get('/book', function(req, res) {
  const queryURL = new urlParse(req.url);
  const search = queryParse.parse(queryURL.query).search;
  var options = {
    url:'https://www.googleapis.com/books/v1/volumes?q='+search+'&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs',
}
function callback(error,response,body){
    if (!error && response.statusCode == 200){
        var info = JSON.parse(body);
        console.log(info);
        var libri = new Array(info.items.length);
        var src_images = new Array(info.items.length);
        var indici = new Array(info.items.length);
        var id_libri = new Array(info.items.length);
        for(var i = 0;i < info.items.length;i++){
          indici[i] = i;
          libri[i] = info.items[i].volumeInfo.title;
          id_libri[i] = info.items[i].id;
          if(info.items[i].volumeInfo.imageLinks!= undefined)
                src_images[i] = (info.items[i].volumeInfo.imageLinks.smallThumbnail);
                else
                src_images[i] = ("./images/logo_libro.png");
      }
        res.render('book', { 
          title: 'book',
          libri:libri,
          sorgenti: src_images,
          indici: indici,
          id: id_libri  
        });
    }
}

request.get(options,callback);
  });

 
module.exports = router;
