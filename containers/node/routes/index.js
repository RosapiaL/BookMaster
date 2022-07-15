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
const db = require('./database');
const altro = require('./altro');
const sendmail = require('./rabbit');


const userdb =process.env.DBUSER;
const passdb =process.env.DBPASS;
const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const api_key = process.env.API_KEY;

router.get("/lista_recensioni",function(req, res){
  const queryURL = new urlParse(req.url);
  var id = queryParse.parse(queryURL.query).identificativo;
  var star = req.body.star;
  var review = req.body.review;
  var identificativo = req.body.id;


  console.log(id);
  var id_normale = id;
  id = altro.toHex(id);
  console.log(id);
  id = id +'20';
  var options = {
    url : 'https://www.googleapis.com/books/v1/volumes/'+id_normale
  }
  request.get(options,function callback(error,response,body){
    var info = JSON.parse(body);
    console.log(info.volumeInfo.title);
    var titolo_libro = info.volumeInfo.title;

    var options = {
      url : 'http://'+userdb+':'+passdb+'@couch:5984/'+id+'/_design/all/_view/all'
    }
    request.get(options,function callback(error,response,body){
      var info = JSON.parse(body);
      if(info.error == 'not_found'){
        console.log("Non ci sono recensioni per il libro selezionato");
        res.render('lista_recensioni',{file:undefined,titolo: titolo_libro});
      }
      else{
        console.log(info);
        console.log(titolo_libro);
        res.render('lista_recensioni',{file:body,titolo: titolo_libro,pieno: true});
      }
    }
  )})

});
/* GET home page. */
router.get('/', function(req, res) {
  console.log(JSON.stringify(req.cookies.accesso));
  res.render('index', { title: 'Express' });
});

router.post('/recensione', function(req, res) {
  console.log("######################################################################");
  console.log(req.body);
  var star = req.body.star;
  var review = req.body.review;
  var identificativo = req.body.id;
  console.log(typeof identificativo);
  identificativo = altro.toHex(identificativo);
  console.log(typeof identificativo);

  access_token_cookie = req.cookies.un_biscotto_per_te;
  console.log(access_token_cookie);
  var options = {
    url : 'https://www.googleapis.com/oauth2/v2/userinfo',
    headers:{
      Authorization : "Bearer " + access_token_cookie,
    }
  }
  request.get(options,function callback(error,response,body){
    var email = JSON.parse(body).email;
    db.add_review(identificativo,review,star,email);
  })
  res.redirect('/mybook');
});





router.get('/recensione', function(req, res) {
  console.log(JSON.stringify(req.cookies.accesso));
  const queryURL = new urlParse(req.url);
  var id = queryParse.parse(queryURL.query).identificativo;
  console.log(id);
  console.log(JSON.stringify(id));
  res.render('recensione', { 
    title: 'recensione',
    identificativo:id});
});

router.get('/search', function(req, res) {
  console.log(JSON.stringify(req.cookies.accesso));
  res.render('search', { title: 'Search' });
});

router.get('/mybook', function(req, res) {
    console.log(req.cookies.id_db);
    console.log(JSON.stringify(req.cookies.accesso));
    var test = JSON.stringify(req.cookies.accesso);
    if(test== '"true"'){
      access_token_cookie = req.cookies.un_biscotto_per_te;
      const queryURL = new urlParse(req.url);
      var scaffale = queryParse.parse(queryURL.query).scaffale;
      var options_to_read = {
        url:'https://www.googleapis.com/books/v1/mylibrary/bookshelves/2/volumes?key='+api_key,
        headers:{
          Authorization : "Bearer " + access_token_cookie,
        }
      }
      var options_favorites = {
        url:'https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/volumes?key='+api_key,
        headers:{
          Authorization : "Bearer " + access_token_cookie,
        }
      }
      var options_read = {
        url:'https://www.googleapis.com/books/v1/mylibrary/bookshelves/4/volumes?key='+api_key,
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
        clientID,
        //client secret
        clientSecret,
        //link to redirect
        "https://localhost:443/steps"
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
      clientID,
      //client secret
      clientSecret,
      //link to redirect
      "https://localhost:443/steps"
  );
  const tokens = await oauth2Client.getToken(code);
  console.log(tokens);
  access_token = JSON.stringify(tokens.tokens.access_token);
  refresh_token = tokens.tokens.refresh_token;
  console.log(refresh_token);




  res.cookie("refresh",refresh_token);
  console.log("sto settando il cookie biscotto");
  res.cookie("un_biscotto_per_te",access_token);
  console.log("sto settando il cookie accesso");
  res.cookie("accesso","true");
  sendmail.inviaBenvenuto(access_token);


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
        url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/2/addVolume?volumeId="+id+"&key="+api_key,
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
        url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/addVolume?volumeId="+id+"&key="+api_key,
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
    url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/2/removeVolume?volumeId="+id+"&key="+api_key,
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
    url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/4/addVolume?volumeId="+id+"&key="+api_key,
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
        url: "https://www.googleapis.com/books/v1/mylibrary/bookshelves/4/addVolume?volumeId="+id+"&key="+api_key,
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

async function richiesta_titolo(access_token, id,req,res){

  var options = {
    url: "https://www.googleapis.com/books/v1/volumes/"+id
  };
  request.get(options, function(error,response,body){
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
        const oauth2Client = new OAuth2(
          clientID,
              //client secret
          clientSecret
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
        const eventEndTime = new Date();
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
      
            console.log(eventArr);
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
                }
              }
              )
              
          // If event array is not empty log that we are busy.
          return console.log(`Sorry I'm busy...`);
        }
      )
      res.redirect("/mybook");
        }
      }
  request.get(options,callback);
  
  
});



//API RICERCA LIBRI
router.get('/book', function(req, res) {
  const queryURL = new urlParse(req.url);
  const search = queryParse.parse(queryURL.query).search;
  var options = {
    url:'https://www.googleapis.com/books/v1/volumes?q='+search+'&key='+api_key,
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


router.get('/status',(req,res)=>{
  file = {
    'status':'online'
  }
  res.send(file);
})

router.get('/api/getreview/byid', (req,res) =>{
  res.send({'error':"attribute id not declared"});
    return
});

router.get('/api/getreview/bytitle', (req,res) =>{
  res.send({'error':"attribute title not declared"});
    return
});


router.get('/api/getreview/byid/:id',(req,res) =>{
  var id = req.params.id;
  var options = {
    url: 'https://www.googleapis.com/books/v1/volumes/'+id
  }
  
  request.get(options,function callback(error,response,body){
    body = JSON.parse(body);
    if(response.statusCode == 503){
      var id_not_found = {
        'error': 'No book for this id in google books'
      }
      res.send(id_not_found);
      return;
    }
    var titolo_trovato = body.volumeInfo.title;
    var url_immagine = body.volumeInfo.imageLinks.smallThumbnail;
    id_primo = body.id;
    esadecimale = altro.toHex(id_primo);
    esadecimale = esadecimale +'20';

    var ricerca ={
      url: 'http://'+userdb+':'+passdb+'@couch:5984/'+esadecimale+'/_design/all/_view/all'
    }
    request.get(ricerca,function callback(error,response,body){
      if(body == undefined){
        var db_offline = {
          title :  titolo_trovato,
          picture : url_immagine,
          esadecimal : esadecimale,
          number_of_reviews: 0,
          reason : "db_offline"
        }
        res.send(db_offline);
        return;
      }
      var info = JSON.parse(body);
      if(info.error=="not_found"){
        var errore={
          title :  titolo_trovato,
          picture : url_immagine,
          esadecimal : esadecimale,
          error : "no_reviews_for_this_book"
        }
        res.send(errore);
      }
      else{
        var ok = {
          title :  titolo_trovato,
          picture : url_immagine,
          esadecimal : esadecimale,
          number_of_reviews: info.total_rows,
          reviews: info.rows,
        }
        res.send(ok);
      }
    })
  });

});

router.get('/api/getreview/bytitle/:title',(req,res) =>{
  var titolo = req.params.title;
  var options = {
    url: 'https://www.googleapis.com/books/v1/volumes?q='+titolo
  }
  request.get(options,function callback(error,response,body){
    body = JSON.parse(body);
    if(body.totalItems ==0){
      var nessun_libro = {
        'error' : 'No books with this title'
      }
      res.send(nessun_libro);
      return;
    }
    var titolo_trovato = body.items[0].volumeInfo.title;
    var url_immagine = body.items[0].volumeInfo.imageLinks.smallThumbnail;
    id_primo = body.items[0].id;
    esadecimale = altro.toHex(id_primo);
    esadecimale = esadecimale +'20';


    var ricerca ={
      url: 'http://'+userdb+':'+passdb+'@couch:5984/'+esadecimale+'/_design/all/_view/all'
    }
    request.get(ricerca,function callback(error,response,body){
      if(body == undefined){
        var db_offline = {
          title :  titolo_trovato,
          picture : url_immagine,
          esadecimal : esadecimale,
          number_of_reviews: 0,
          reason : "db_offline"
        }
        res.send(db_offline);
        return;
      }
      var info = JSON.parse(body);
      if(info.error=="not_found"){
        var errore={
          title :  titolo_trovato,
          picture : url_immagine,
          esadecimal : esadecimale,
          number_of_reviews: 0,
          reason : "no_reviews_for_this_book"
        }
        res.send(errore);
      }
      else{
        var ok = {
          title :  titolo_trovato,
          picture : url_immagine,
          esadecimal : esadecimale,
          number_of_reviews: info.total_rows,
          reviews: info.rows,
        }
        res.status(200).send(ok);
      }
    })
  });
});
