function renderBook(file){
    var numberOfBooks = file.totalItems;
    for(var i=0;i<numberOfBooks;i++){
        document.write(file.item[i].volumeInfo.title);
        document.write(file.item[i].volumeInfo.pageCount);
        document.write(file.item[i].volumeInfo.imageLinks.smallThumbnail);
    }
}