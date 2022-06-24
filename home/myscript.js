$(document).ready(function(){

    $("#myform").submit(function(){
        var search = $('#books').val();

        if(search =='')
        {
            alert("Inserire nome o categoria di un libro");
        }
        else{
            var url='';
            var img='';
            var title='';
            var author='';

            $.get('https://www.googleapis.com/books/v1/volumes?q='+ search, function(response){
   
            for(i=0 ; i<response.items.length; i++)
            {
                //get the info of the book
                title=$('<h1 class="center-align white-text">'+ response.items[i].volumeInfo.title + '</h1>');
                author=$('<h1 class="center-align white-text">'+ response.items[i].volumeInfo.authors + '</h1>');
                img= $('<img class="aligning card z-depth-5" id="dynamic"><br><a href='+response.items.volumeInfo.infoLink + '><button id="imagebutton" class="btn btn-warning"> Read More </button></a>');
                url= response.items[i].volumeInfo.imageLinks.thumbnail;
                img.attr('src', url);
                
                title.appendTo("#result");
                author.appendTo("#result");
                img.appendTo("#result");
            }
            });
        }
    });

    return false;
});