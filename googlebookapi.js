var request = require('request');
var options = {
    url:'https://www.googleapis.com/books/v1/volumes?q=termodinamica&key=AIzaSyCgkSMk35arxIz9xmZ9GPwTAAUxvuVYzzs',
}
function callback(error,response,body){
    if (!error && response.statusCode == 200){
        var info = JSON.parse(body);
        //console.log(info);
        console.log(info.items[0].volumeInfo.authors);
    }
}

request.get(options,callback);