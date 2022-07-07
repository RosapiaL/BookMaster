var request = require("request");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const { options } = require(".");
const { testing } = require("googleapis/build/src/apis/testing");
const { response } = require("express");



const username = "admin";
const password = "admin";

//id libro sarà il nome del nostro libro
//testo, sarà il testo della nostra recensione 
//stars saranno il numero di stelle 
//user sarà l'email dell utente che ha scritto il messaggio

async function creaDB(id_libro,testo,stars,utente){
    var options ={
        url:'http://'+username+":"+password+"@127.0.0.1:5984/"+id_libro,
    }
    request.put(options, function callback(error,response,body){
        console.log("creando il db...");
        controllaDB(id_libro,testo,stars,utente);

    })

}

async function controllaDB(id_libro,testo,stars,utente){
    var options ={
        url:'http://'+username+":"+password+"@127.0.0.1:5984/"+id_libro,
    }
    request.get(options, async function callback(error,response,body){
        var info = JSON.parse(body);
        if(info.error =="not_found" && info.reason=="Database does not exist."){
            console.log("il db non esiste");
        }
        else{
            console.log("il db esiste");
            console.log(info.doc_count);
            aggiungi_recensione(id_libro,testo,stars,utente,info.doc_count);

        }
    });
}

function aggiungi_recensione(id_libro,testo,stars,utente,numero_rec){
    console.log("Sono dentro la funzione che aggiunge il commento");
    numero_rec++;
    console.log("il commento è il numero: " +numero_rec);

    var options ={
        url:'http://'+username+":"+password+"@127.0.0.1:5984/"+id_libro+"/"+numero_rec,
        json: true,
        body:{
            "nome":utente,
            "stelle": stars,
            "testo": testo
        }
        }
        request.put(options,function callback(error,response,body){
            console.log("sto inserendo la recensione nel db");
            console.log(body);
        })
    }


function add_review(id_libro,testo,stars,utente){
    var options ={
        url:'http://'+username+":"+password+"@127.0.0.1:5984/"+id_libro,
    }
    //controllo se il db esiste e se non esiste lo creo
    let a;
    request.get(options,a = async function callback(error,response,body){
        var info = JSON.parse(body);
        if(info.error =="not_found" && info.reason=="Database does not exist."){
            console.log("il db non esiste");
            creaDB(id_libro,testo,stars,utente);    
            return 1;
        }
        else{
            console.log("il db esiste");
            aggiungi_recensione(id_libro,testo,stars,utente,info.doc_count);
            return 0;

        }
    });

}


function getReviews(id_libro){
    console.log("ottengo le recensioni del libro"+id_libro);
    var options = {
        url:'http://'+username+":"+password+"@127.0.0.1:5984/"+id_libro,
    }    
    request.get(options,function callback(error,response,body){
        var info = JSON.parse(body);
        if(info.error =="not_found" && info.reason=="Database does not exist."){
            console.log("il db non esiste");
            creaDB(id_libro,testo,stars,utente);

        }
        else{
            console.log("ci sono " + info.doc_count+" recensioni");

        }
    })
}


add_review("aa","ciao",5,"mario");
