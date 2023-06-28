function onLoad(){
  let h1text = localStorage.getItem("inputVal") || "Hello, world!"
  $("h1").text(h1text)
}

function setLocalStorage(){
  let newVal = $("input").val()
  localStorage.setItem("inputVal", newVal)
  $("h1").text(newVal)
}