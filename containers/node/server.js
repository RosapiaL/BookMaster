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

app.get("/",(req,res) => {
    const oauth2Client = new google.auth.OAuth2(
        //client id
        "251108875342-4v8smdsvvqujm8nte6bb4m8har234rk1.apps.googleusercontent.com",
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

app.get("/steps",(req,res) =>{
    const queryURL = new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;
    console.log(code);
});
app.listen(port,() => console.log('google book listening on port ' + port));