const btn = document.querySelector("button");
const post = document.querySelector(".post");
const widget = document.querySelector(".star-widget");
const editBtn = document.querySelector(".edit");
btn.onclick = ()=>{
  widget.style.display = "none";
  post.style.display = "block";
  editBtn.onclick = ()=>{
    widget.style.display = "block";
    post.style.display = "none";
  }
  return false;
}

function replace_with_valuestar(){
  var radio_1 = document.getElementById("rate-1");
  var radio_2 = document.getElementById("rate-2");
  var radio_3 = document.getElementById("rate-3");
  var radio_4 = document.getElementById("rate-4");
  var radio_5 = document.getElementById("rate-5");
  if(radio_1.checked == true){
    document.getElementById("star").value= radio_1.value;
    alert(document.getElementById("star").value);
  }
  else if(radio_2.checked == true){
    document.getElementById("star").value= radio_2.value;
    alert(document.getElementById("star").value);
  }
  else if(radio_3.checked == true){
    document.getElementById("star").value= radio_3.value;
    alert(document.getElementById("star").value);
  }
  else if(radio_4.checked == true){
    document.getElementById("star").value= radio_4.value;
    alert(document.getElementById("star").value);
  }
  else{
    document.getElementById("star").value= radio_5.value;
    alert(document.getElementById("star").value);
  }
}