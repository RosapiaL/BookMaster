
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
  