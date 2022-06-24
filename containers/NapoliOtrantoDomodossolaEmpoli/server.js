const express = require('express');
var app = express();
const port = 3000;
const {google} = require("googleapis");
var request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios");
const cookieParser = require('cookie-parser');


app.use(cookieParser());
app.use(express.json());
//620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com
//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
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var access_token = null;
const name = process.env.NAME_OF_NODE || "uno";

app.get('/',function(req,res){
    res.send('hello'+ name + '!');
});

app.get("/oauth",(req,res) => {
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
        res.send("<a href= "+url+"> authenticate with google <\a>");
        
    });
});

app.get("/steps",async (req,res) =>{
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
    res.cookie("un_biscotto_per_te",access_token);
    res.send(tokens.tokens.access_token);
    console.log(tokens.tokens.access_token);
});


app.get("/mylibrary",function(req,res){
    
    access_token_cookie = JSON.stringify(req.cookies.un_biscotto_per_te);
    access_token_cookie = access_token_cookie.split('"')[2].slice(0,-1);

    if(access_token_cookie){
      var options = {
        url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves?key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
        headers:{
            Authorization : "Bearer " + access_token_cookie,
            'content-type':'application/json',
          },
      };
      
      request.get(options,function(error,response,body){
          console.log(access_token_cookie);
          console.log(body);
          res.send(body);
      });
    }
});
app.listen(port,() => console.log('google book listening on port ' + port));