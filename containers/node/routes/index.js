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


/* GET home page. */
router.get('/', function(req, res) {
  console.log(JSON.stringify(req.cookies.accesso));
  res.render('index', { title: 'Express' });
});

router.get('/search', function(req, res) {
  console.log(JSON.stringify(req.cookies.accesso));
  res.render('search', { title: 'Search' });
});

router.get('/mybook', function(req, res) {
    console.log(JSON.stringify(req.cookies.accesso));
    if(JSON.stringify(req.cookies.accesso)== '"true"'){
      console.log('sto cercando di stampare delle cose');
      access_token_cookie = req.cookies.un_biscotto_per_te;
      var options_to_read = {
        url:'https://www.googleapis.com/books/v1/mylibrary/bookshelves/2/volumes?key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs',
        headers:{
          Authorization : "Bearer " + access_token_cookie,
        }
      }
      var options_favorites = {
        url:'https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/volumes?key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs',
        headers:{
          Authorization : "Bearer " + access_token_cookie,
        }
      }
      var options_read = {
        url:'https://www.googleapis.com/books/v1/mylibrary/bookshelves/4/volumes?key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs',
        headers:{
          Authorization : "Bearer " + access_token_cookie,
        }
      }
      function callback(error,response,body){
        if (!error && response.statusCode == 200){
          var info = JSON.parse(body);
          console.log(info);
      }
    }
    request.get(options_to_read,callback);
    request.get(options_favorites,callback);
    request.get(options_read,callback);
    }
    const oauth2Client = new google.auth.OAuth2(
        //client id
        "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
        //client secret
        "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",
        //link to redirect
        "http://localhost:3000/steps"
    )
    const scopes = ["profile","email"];
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
          tile: 'oauth',
          url: url,
          line:JSON.stringify(req.cookies.accesso)
        });
      });
  });

router.get("/steps",async (req,res) =>{
  console.log(JSON.stringify(req.cookies.accesso));
  const queryURL = new urlParse(req.url);
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
  var options = {
    url:"https://www.googleapis.com/oauth2/v1/userinfo?access_token="+access_token
  }
  function callback(error,response,body){
    if (!error && response.statusCode == 200){
      var info = JSON.parse(body);
      console.log(info);
  }
}
res.cookie("un_biscotto_per_te",access_token);
res.cookie("accesso","true");
request.get(options,callback);
  res.render('steps', { 
    title: 'Express',
    line: JSON.stringify(req.cookies.accesso)
    });

});

router.get("/to_read",function(req,res){
  if(req.cookies.un_biscotto_per_te!=undefined){
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
          res.render("mybook", { title: 'mybook', line: JSON.stringify(req.cookies.accesso)});
      });
    }
  }
  else{
    res.render("steps",{ title: 'mybook',line: JSON.stringify(req.cookies.accesso) })
  }
});
router.get("/favorite",function(req,res){
  if(req.cookies.un_biscotto_per_te!=undefined){
    access_token_cookie = JSON.stringify(req.cookies.un_biscotto_per_te);
    access_token_cookie = access_token_cookie.split('"')[2].slice(0,-1);
    const queryURL = new urlParse(req.url);
    const id = queryParse.parse(queryURL.query).id;
    if(access_token_cookie){
      var options = {
        url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/addVolume?volumeId="+id+"&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
        headers:{
            Authorization : "Bearer " + access_token_cookie,
            'content-type':'application/json',
            'Content-length': 'CONTENT-LENGTH'
          }
      };
      
      request.post(options,function(error,response,body){
          console.log(access_token_cookie);
          console.log(body);
          res.render("mybook", { title: 'mybook',line: JSON.stringify(req.cookies.accesso) });
      });
    }
  }
  else{
    res.render("steps",{ title: 'mybook',line: JSON.stringify(req.cookies.accesso) })
  }
});
router.get("/read",function(req,res){
  if(req.cookies.un_biscotto_per_te!=undefined){
    access_token_cookie = JSON.stringify(req.cookies.un_biscotto_per_te);
    access_token_cookie = access_token_cookie.split('"')[2].slice(0,-1);
    const queryURL = new urlParse(req.url);
    const id = queryParse.parse(queryURL.query).id;
    if(access_token_cookie){
      var options = {
        url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/4/addVolume?volumeId="+id+"&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
        headers:{
            Authorization : "Bearer " + access_token_cookie,
            'content-type':'application/json',
            'Content-length': 'CONTENT-LENGTH'
          }
      };
      
      request.post(options,function(error,response,body){
          console.log(access_token_cookie);
          console.log(body);
          res.render("mybook", { title: 'mybook',line: JSON.stringify(req.cookies.accesso) });
      });
    }
}
else{
  res.render("steps",{ title: 'mybook',line: JSON.stringify(req.cookies.accesso) })
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
        var info_links = new Array(info.items.length);
        for(var i = 0;i < info.items.length;i++){
          indici[i] = i;
          libri[i] = info.items[i].volumeInfo.title;
          id_libri[i] = info.items[i].id;
          info_links[i] = info.items[i].volumeInfo.infoLink;
          console.log(info.items[i].volumeInfo.infoLink);
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
          id: id_libri,
          links: info_links
        });
    }
}

request.get(options,callback);
  });
module.exports = router;
