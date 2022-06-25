var request = require('request');
var options = {
    url:'https://www.googleapis.com/books/v1/volumes?q=termodinamica&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs',
}
function callback(error,response,body){
    if (!error && response.statusCode == 200){
        var info = JSON.parse(body);
        for(var i = 0;i < info.items.length;i++){

            console.log(info.items[i].volumeInfo.title);
        }
        
    }
}

request.get(options,callback);