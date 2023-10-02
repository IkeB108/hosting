let uniqueIDCounter = 0
// let allListItems = {
//   1693143600000: ["Item 1", "Item 2", "Item 3"],
//   1694144600000: ["Item 1", "Item 2000", "Item 3"],
// }

let allListItems = {
  1693143600000: [
    {"name": "Item 0", "id": "listItem0"},
    {"name": "Item 1", "id": "listItem1"},
    {"name": "Item 2", "id": "listItem2"},
  ]
}

function generateListItems(){
  for(let d in allListItems){
    let dayItems = allListItems[d]
    let dateObj = roundDateToDay( new Date( parseInt(d) ) )
    appendDateHeader( dateObj.toLocaleDateString() )
    for(let i in dayItems){
      let uniqueID = "listItem" + uniqueIDCounter
      uniqueIDCounter ++
      appendListItem(dayItems[i].name, uniqueID, false)
    }
  }
}

function appendDateHeader( dateString ){
  let newDateHeader = $("#template-date-header").clone()
  let time = new Date(dateString)
  time = time.getTime();
  newDateHeader.attr('id', "header" + time )
  newDateHeader.removeAttr("style")
  newDateHeader.text( dateString )
  $("#add-item-input").before(newDateHeader)
}

function onListTitleClick(){
  let newTitle = prompt("Enter a new title:")
  if(newTitle !== '' && newTitle !== null){
    $("#list-title").text(newTitle)
    localStorage.setItem("title", newTitle)
  }
}

function onLoad(){
  //Load allListItems from local storage if available
  let aliFromLocal = localStorage.getItem("allListItems")
  console.log(aliFromLocal)
  if(aliFromLocal !== null){
    allListItems = JSON.parse(aliFromLocal)
  }
  
  let titleFromLocal = localStorage.getItem("title")
  if(titleFromLocal !== null)$("#list-title").text(titleFromLocal);
  
  let addItemInput = $("#add-item-input")
  addItemInput.on("keydown", (e)=>{
    if(e.code == "Enter"){
      let val = addItemInput.val()
      let uniqueID = "listItem" + uniqueIDCounter
      uniqueIDCounter ++;
      appendListItem(val, uniqueID, true);
      window.scrollTo(0, document.body.scrollHeight);
    }
  })
  
  // for(let i = 0; i < 20; i ++){
  //   appendListItem(i)
  // }
  
  generateListItems();
}

function appendListItem(listItemContent, uniqueID, dateIsToday){
  let addItemInput = $("#add-item-input")
  
  let newListItem = $("#template-list-item").clone()
  // newListItem.removeAttr("id")
  newListItem.removeAttr("style")
  newListItem.find("p").text(listItemContent)
  
  if(dateIsToday){
    let today = roundDateToDay( new Date() )
    let dateHeaderExists = allListItems.hasOwnProperty( today.getTime() )
    if(!dateHeaderExists){
      appendDateHeader( today.toLocaleDateString() )
      allListItems[ today.getTime() ] = []
    }
    
    allListItems[today.getTime()].push(
      { "name": listItemContent, "id": uniqueID}
    )
  }
  
  newListItem.attr("id", uniqueID)
  console.log(uniqueID)
  addItemInput.before(newListItem)
  addItemInput.val("")
  
  updateLocalStorage();
  
  if( "eraselocalstorage replacelocalstorage deletelocalstorage".includes(listItemContent.toLowerCase().replaceAll(" ", ""))  ){
    localStorage.removeItem("allListItems")
    localStorage.removeItem("title")
    window.location.reload();
  }
}

function updateLocalStorage(){
  localStorage.setItem("allListItems", JSON.stringify(allListItems)  )
}

function onListItemButtonClick(buttonName, elt){
  let parentDiv = elt.parentElement;
  let textContent = parentDiv.querySelector("p").textContent
  
  if(buttonName == "delete"){
    for(let d in allListItems){
      let newDayItemList = []
      for(let i in allListItems[d]){
        let item = allListItems[d][i]
        if(item.id !== parentDiv.id){
          newDayItemList.push(item)
        }
      }
      allListItems[d] = newDayItemList
      if(newDayItemList.length == 0){
        console.log("#header" + d)
        $("#header" + d).remove();
        
      }
    }
    parentDiv.remove();
    updateLocalStorage();
  }
  
  if(buttonName == "add"){
    let uniqueID = "listItem" + uniqueIDCounter
    uniqueIDCounter ++;
    appendListItem(textContent, uniqueID, true)
  }
}

function roundDateToDay( dateObject ){
  dateObject.setHours(0);
  dateObject.setMinutes(0);
  dateObject.setSeconds(0);
  dateObject.setMilliseconds(0);
  return dateObject;
}