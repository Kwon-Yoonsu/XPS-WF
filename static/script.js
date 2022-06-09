const DEFAULT_URL = "http://10.138.126.209:5000";
const submitForm = document.querySelector("#submit-form");
const submitInput = document.querySelector("#submit-input");

function handleSubmit(event) {
  event.preventDefault();
  console.log("submitted!!")  
  
  let xhr = new XMLHttpRequest();
  xhr.open("POST", `${DEFAULT_URL}/submit`);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");

  SN_Select = submitInput.value
  
  let data = JSON.stringify({      
    "SN":SN_Select
  });
  
  xhr.send(data);
  
  xhr.onload = function () {          
    response = JSON.parse(xhr.response)
    df = response[SN_Select]
    console.log(df)
    var keys = Object.keys(df)
    keys.forEach(function(element){
      console.log(df[element]["Count"])
    })
  };
}


submitForm.addEventListener("submit", handleSubmit);
//submitInput.addEventListener("click", handleClick);
