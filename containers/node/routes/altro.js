// FUNZIONI CHE HO SPOSTATO DA DATABASE.JS PER COMODITA'

async function create_database(nome_database){
  console.log("Sto creando il database " + nome_database);
  var options ={
      url:'http://'+username+":"+password+"@127.0.0.1:5984/"+nome_database,
  }

  request.put(options, function callback(error,response,body){
      console.log("creato");
  });

}

async function aggiungi_recensione(id_libro, utente, rating, testo){

  var options = {
      url:'http://'+username+":"+password+"@127.0.0.1:5984/"+id_libro,

      body: {
          "utente": utente,
          "rating": rating,
          "testo": testo
      }
  }
  request.put(options,function callback(){console.log("elemento aggiunto!")})


  
}
