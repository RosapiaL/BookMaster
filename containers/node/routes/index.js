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
const { OAuth2 } = google.auth;


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
    var test = JSON.stringify(req.cookies.accesso);
    if(test== '"true"'){
      access_token_cookie = req.cookies.un_biscotto_per_te;
      const queryURL = new urlParse(req.url);
      var scaffale = queryParse.parse(queryURL.query).scaffale;
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
          res.render('mybook',{title:"la mia libreria",line: test,file:body});

      }


    }
    scaffale = JSON.stringify(scaffale);

    switch(scaffale){
      case '"da_leggere"':
         request.get(options_to_read,callback);
        break;
      case '"preferiti"':
        request.get(options_favorites,callback);
        break;
      case '"letti"':
        request.get(options_read,callback);
        break;
      default:
        console.log("Richiesta non valida");
        break;
    }

    }
    const oauth2Client = new google.auth.OAuth2(
        //client id
        "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
        //client secret
        "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",
        //link to redirect
        "http://localhost:3000/steps"
    )
    const scopes = ["https://www.googleapis.com/auth/books","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/calendar"];
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
  console.log(tokens);
  access_token = JSON.stringify(tokens.tokens.access_token);
  refresh_token = tokens.tokens.refresh_token;
  console.log(refresh_token);
  var options = {
    url:"https://www.googleapis.com/oauth2/v1/userinfo?access_token="+access_token
  }
  function callback(error,response,body){
    if (!error && response.statusCode == 200){
      var info = JSON.parse(body);
      console.log(info);
      console.log("ho finito la callback");
  }
}
res.cookie("refresh",refresh_token);
console.log("sto settando il cookie biscotto");
res.cookie("un_biscotto_per_te",access_token);
console.log("sto settando il cookie accesso");
res.cookie("accesso","true");
request.get(options,callback);
console.log("Ho fatto la get");
res.render('steps', { 
    title: 'Express',
    line: JSON.stringify(req.cookies.accesso)
    });

});

router.get('/logout',function(req,res){
  if(JSON.stringify(req.cookies.accesso)== '"true"'){
    res.clearCookie("un_biscotto_per_te");
    res.clearCookie("accesso");
    res.clearCookie("refesh_token");
    res.redirect('/mybook');
  }

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
          res.redirect('/mybook');
      });
    }
  }
  else{
    res.redirect('/mybook');
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
          res.redirect('/mybook');
      });
    }
  }
  else{
    res.redirect('/mybook');
  }
});

async function rimozione_asincrona(access_token, id,req,res){

  var options = {
    url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/2/removeVolume?volumeId="+id+"&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
    headers:{
        Authorization : "Bearer " + access_token,
        'content-type':'application/json',
        'Content-length': 'CONTENT-LENGTH'
      }
  };
  request.post(options,function(error,response,body){
    console.log(access_token);
    console.log(body);

  });

}


async function aggiunta_asincrona(access_token, id,req,res){

  var options = {
    url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/4/addVolume?volumeId="+id+"&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs",
    headers:{
        Authorization : "Bearer " + access_token,
        'content-type':'application/json',
        'Content-length': 'CONTENT-LENGTH'
      }
  };
  request.post(options,function(error,response,body){
    console.log(access_token);
    console.log(body);

  });

}


router.get("/letto", function(req,res){
  if(req.cookies.un_biscotto_per_te!=undefined){
    const queryURL = new urlParse(req.url);
    var id = queryParse.parse(queryURL.query).identificativo;
    id= id.slice(0,-1);
    access_token_cookie = JSON.stringify(req.cookies.un_biscotto_per_te);
    access_token_cookie = access_token_cookie.split('"')[2].slice(0,-1);
    if(access_token_cookie){
      rimozione_asincrona(access_token_cookie,id,req,res);
      aggiunta_asincrona(access_token_cookie,id,req,res);
      res.redirect('/mybook');

    }
  else{
    res.redirect('/mybook');
  }
}});



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
      
      request.post(options,function(error,response,body){});
    }

}


else{
  res.redirect('/mybook');
}
});




router.get("/rimuovi",function(req,res){
  if(req.cookies.un_biscotto_per_te!=undefined){
    const queryURL = new urlParse(req.url);
    var id = queryParse.parse(queryURL.query).identificativo;
    id= id.slice(0,-1);
    access_token_cookie = JSON.stringify(req.cookies.un_biscotto_per_te);
    access_token_cookie = access_token_cookie.split('"')[2].slice(0,-1);
    if(access_token_cookie){
      rimozione_asincrona(access_token_cookie,id,req,res);
      res.redirect('/mybook');
    }
  else{
    res.redirect('/mybook');
  }
}});

function richiesta_titolo(access_token, id,req,res){

  var options = {
    url: "https://www.googleapis.com/books/v1/volumes/"+id
  };
  request.get(options,function(error,response,body){
    console.log(access_token);
    console.log(body);

    var titolo =  JSON.parse(body).volumeInfo.title;
    console.log(titolo);
    return titolo;
  });

}


router.get('/inizia_a_leggere', function(req,res){
  const queryURL = new urlParse(req.url);
  var id = queryParse.parse(queryURL.query).identificativo;
  var title = "";
  var num_pagine = "";
  var options = {
    url:"https://www.googleapis.com/books/v1/volumes/"+id,
}
function callback(error,response,body){
    if (!error && response.statusCode == 200){
        var info = JSON.parse(body);
        console.log(info);
        title = info.volumeInfo.title;
        num_pagine = info.volumeInfo.pageCount;
        }
      }
  request.get(options,callback);
  
  const oauth2Client = new OAuth2(
    "620651589897-nj3i7d6lseqnmonr21gkkuvh6ntcbmjc.apps.googleusercontent.com",
        //client secret
    "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"
  );
  refresh_token = req.cookies.refresh;
  oauth2Client.setCredentials({
    refresh_token: refresh_token,
  });
  var giorni = Math.floor(num_pagine/15);//giorni da da_legge
  if(num_pagine%15) giorni ++;
  var pagine_ultimo_giorno = num_pagine%15;

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const eventStartTime = new Date();
  eventStartTime.setDate(eventStartTime.getDay());
  const eventEndTime = new Date();
  eventEndTime.setDate(eventEndTime.getDay()+giorni);
  eventEndTime.setMinutes(eventEndTime.getMinutes() + 30);
  const event = {
    summary: title, 
    description: "Prenditi una piccola pausa e leggi 15 pagine di questo libro",
    colorId: 4,
    start: {
      dateTime: eventStartTime,
      timeZone: 'Europe/Rome',
    },
    end: {
      dateTime: eventEndTime,
      timeZone: 'Europe/Rome',
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT='+giorni,
    ]
  };
  calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: 'Europe/Rome',
        items: [{ id: 'primary' }],
      },
    },
    (err, res) => {
      // Check for errors in our query and log them if they exist.
      if (err) return console.error('Free Busy Query Error: ', err)
      const eventArr = res.data.calendars.primary.busy;

    // Check if event array is empty which means we are not busy
    if (eventArr.length === 0)
      // If we are not busy create a new calendar event.
      return calendar.events.insert(
        { calendarId: 'primary', resource: event },
        err => {
          // Check for errors and log them if they exist.
          if (err) return console.error('Error Creating Calender Event:', err)
          // Else log that the event was created.
          {
            console.log('Calendar event successfully created.')
            res.redirect("/mybook");
          }
        }
      )

    // If event array is not empty log that we are busy.
    return console.log(`Sorry I'm busy...`)
  }
)
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

