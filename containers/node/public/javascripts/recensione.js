
  function replace_with_valuestar(){
  var radio_1 = document.getElementById("rate-1");
  var radio_2 = document.getElementById("rate-2");
  var radio_3 = document.getElementById("rate-3");
  var radio_4 = document.getElementById("rate-4");
  var radio_5 = document.getElementById("rate-5");
  if(radio_1.checked == true){
  document.getElementById("star").value= radio_1.value;
  }
  else if(radio_2.checked == true){
  document.getElementById("star").value= radio_2.value;
  }
  else if(radio_3.checked == true){
  document.getElementById("star").value= radio_3.value;
  }
  else if(radio_4.checked == true){
  document.getElementById("star").value= radio_4.value;
  }
  else{
  document.getElementById("star").value= radio_5.value;
  }
  }
