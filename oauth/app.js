const express = require('express');
const app = express();
const port = 3000;
const {google} = require("googleapis");
const request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios");
//620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com
//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
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var access_token = null;

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
    access_token = tokens.tokens.access_token;
    res.send(tokens.tokens.access_token);
    console.log(tokens.tokens.access_token);
});
app.get("/mylibrary",function(req,res){
    request({
        url:"https://www.googleapis.com/books/v1/mylibrary/bookshelves?key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
        method: 'GET',
        headers:{
            Authorization : access_token
        } 
    },function(error, response, body){
        if(error) {
            console.log(error);
        } else {
            res.send(response.statusCode+" "+body)
            console.log(response.statusCode, body);
        }
    });
});
app.listen(port,() => console.log('google book listening on port ' + port));