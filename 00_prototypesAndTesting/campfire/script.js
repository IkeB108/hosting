let templateUserTasks = [
  {
    "title": "DEMO 3 laps of jogging",
    "description": "Burns 400 calories each. Jogging helps maintain my hearth health and stay fit.",
    "streakSize": 6,
    "cumulativeUnit": "cals burned",
    "cumulativeMultiplier": 400,
    "cumulativeProgress": 0,
    "cumulativeUpdateText": "+ 400 cals",
    "streakProgress": "",
    "timeOfLastUpdate": 1688355319612,
    "rewardSize": 10,
    "rewardProgress": 0,
    "rewardMessage": "A reward can now be redeemed"
  },
  {
    "title": "DEMO 30 mins guitar practice",
    "description": "Practicing guitar will enable me to play my favorite songs.",
    "streakSize": 4,
    "cumulativeUnit": "hours practice",
    "cumulativeMultiplier": 0.5,
    "cumulativeProgress": 0,
    "cumulativeUpdateText": "+ half hour practice",
    "streakProgress": "",
    "timeOfLastUpdate": "none"
  }
]

userTasks = [...templateUserTasks];

rewardSize = 8 //By default
rewardProgress = 0 //By default
rewardMessage = "A reward can be redeemed"

function updateLocalStorage(){
  localStorage.setItem("userTasks", JSON.stringify(userTasks))
  console.log("Updated Local Storage")
}

function textboxButtonClick(){
  $("#newSettingsTextbox").toggle()
  if( $("#newSettingsTextbox").css("display") == "none" ){
    //If textbox has just been closed, update userSettings to match
    //User needs to refresh the page for settings to take effect
    try { userTasks = JSON.parse( $("#newSettingsTextbox").val() ) } catch { alert("Your text was not formatted correctly.") }
    updateLocalStorage();
  }
}

function undoButtonClick(){
  let confirmation = confirm("Revert your settings and all progress? You will need to refresh the page to see changes.")
  if(confirmation){
    userTasks = [...templateUserTasks]
    updateLocalStorage();
  }
}

function onLoad(){
  let localStorageUserTasks = localStorage.getItem("userTasks")
  if(localStorageUserTasks){
    userTasks = JSON.parse(localStorageUserTasks)
    console.log("Found data in local storage")
  }
  
  //Put settings in the settings text area
  $("#newSettingsTextbox").val( JSON.stringify(userTasks, null, 2) )
  
  //Create task cards
  for(let i in userTasks){
    let task = userTasks[i]
    let newCard = $("#taskCardTemplate").clone()
    
    let cardID = "taskCard_" + encodeURI(task.title).replaceAll("%", "_")
    
    newCard.attr("id", cardID )
    
    newCard.find(".taskH2").text(task.title) //Set title
    newCard.find(".taskDescription").text(task.description) //Set description
    
    newCard.find(".progressTextSubtitle").text(task.cumulativeUpdateText)
    newCard.find(".progressTextSubtitle").removeClass("visible")
    newCard.find(".progressTextSubtitle").addClass("invisible")
    newCard.find(".streakBarSubtitle").removeClass("visible")
    newCard.find(".streakBarSubtitle").addClass("invisible")
    
    
    
    let progressText = task.cumulativeProgress + " " + task.cumulativeUnit
    newCard.find(".progressText").text(progressText)
    
    //Set last updated text
    if(Number.isInteger(task.timeOfLastUpdate)){
      //timeOfLastUpdate should be an integer gotten with Date.time()
      newCard.find(".lastUpdatedText").text( getLastUpdatedText(task.timeOfLastUpdate) )
    }
    
    //Set button functions
    let plusButton = newCard.find(".taskPlusButton")
    plusButton.attr("onclick", `updateTask('${cardID}', '${ task.title }', 'plus')` )
    
    let minusButton = newCard.find(".taskMinusButton")
    minusButton.attr("onclick", `updateTask('${cardID}', '${ task.title }', 'minus')`)
    
    //Set streak bar
    setStreakBar(newCard, task.title);
    
    //Set reward text if this task has a reward size
    if(task.hasOwnProperty("rewardSize")){
      rewardSize = task.rewardSize
    }
    if(task.hasOwnProperty("rewardProgress")){
      rewardProgress = task.rewardProgress
    }
    if(task.hasOwnProperty("rewardMessage")){
      rewardMessage = task.rewardMessage
    }
    
    $("body").append(newCard);
  }
  
  updateRewardText()
}

function updateRewardText(){
  let rewardText = ""
  if(rewardSize > 10){
    rewardText = "Reward " + rewardProgress + " / " + rewardSize
  } else {
    for(let i = 0; i < rewardProgress; i ++){
      rewardText += "●"
    }
    rewardText =  "Reward " + rewardText.padEnd(rewardSize, "○") 
  }
  $(".rewardText").text(rewardText)
}

function updateTask(taskCardID, taskTitle, plusOrMinus){
  let taskCard = $("#" + taskCardID)
  let task = getTask(taskTitle);
  let completionsBeforeUpdate = (task.streakProgress.padStart(task.streakSize, "0").slice(-1 * task.streakSize).match(/1/g) || []).length
  
  if(plusOrMinus == "plus"){
    task.streakProgress += "1"
    task.cumulativeProgress += task.cumulativeMultiplier
    //Round to two decimal places
    task.cumulativeProgress = Math.round( task.cumulativeProgress * 100 ) / 100
  }
    
  else
    task.streakProgress += "0"
  setStreakBar(taskCard, taskTitle);
  
  let date = new Date()
  time = date.getTime();
  task.timeOfLastUpdate = time;
  taskCard.find(".lastUpdatedText").text( getLastUpdatedText(time) )
  
  taskCard.find(".progressText").text( task.cumulativeProgress + " " + task.cumulativeUnit )
  
  if(plusOrMinus == "plus"){
    //Update the subtitle text and make it visible
    let completionsAfterUpdate = (task.streakProgress.padStart(task.streakSize, "0").slice(-1 * task.streakSize).match(/1/g) || []).length
    let percentage = Math.round( (completionsAfterUpdate / task.streakSize) * 100) + "%"
    let fireAnalogy = ""
    if(completionsAfterUpdate > completionsBeforeUpdate)fireAnalogy = "🌡️ Growing"
    if(completionsAfterUpdate == completionsBeforeUpdate)fireAnalogy = "🔥 Maintaining"
    if(completionsBeforeUpdate == 0)fireAnalogy = "💥 Ignited"
    if(percentage == "100%")fireAnalogy = "☄️ Blazing"
    taskCard.find(".streakBarSubtitle").text(percentage + " " + fireAnalogy)
    
    
    taskCard.find(".progressTextSubtitle").removeClass("invisible")
    taskCard.find(".progressTextSubtitle").addClass("visible")
    taskCard.find(".streakBarSubtitle").removeClass("invisible")
    taskCard.find(".streakBarSubtitle").addClass("visible")
    setTimeout( () => { //Make subtitle text invisible again after a short duration
      taskCard.find(".progressTextSubtitle").removeClass("visible")
      taskCard.find(".progressTextSubtitle").addClass("invisible")
      taskCard.find(".streakBarSubtitle").removeClass("visible")
      taskCard.find(".streakBarSubtitle").addClass("invisible")
    }, 2000)
    
    //Increment reward
    rewardProgress = (rewardProgress+1) % rewardSize
    updateRewardText();
    if(rewardProgress == 0){
      //User has filled the reward
      let notif = newNotification("Redeem Reward", rewardMessage);
    }
  }
  
  $("#newSettingsTextbox").val( JSON.stringify(userTasks, null, 2) )
  updateLocalStorage();
}

function newNotification(header, body){
  let notif = $("#notificationCardTemplate").clone()
  let time = new Date()
  time = time.getTime()
  notif.attr("id", time )
  notif.find("h2").text(header)
  notif.find("p").text( body )
  notif.find("button").attr("onclick", `$("#${time}").remove()`)
  $("h1").after(notif)
  return notif;
}

function getLastUpdatedText(time){
  let date = new Date(time)
  let months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")
  let ampm = "am"
  if(date.getHours() >= 12 )ampm = "pm"
  return "Last Updated " + months[date.getMonth() - 1] + " " + date.getDate() + ", " + date.getFullYear() + " " + (date.getHours() % 12) + ":" + date.getMinutes() + " " + ampm
}

function getTask(taskTitle){
  return userTasks.filter( task => { return task.title == taskTitle } )[0]
}

function getTaskCard(taskTitle){
  return $("#taskCard_" + encodeURI(taskTitle).replaceAll('%', '_'))
}

function setStreakBar(taskCard, taskTitle){
  let task = getTask(taskTitle);
  
  let streakProgress = task.streakProgress.padStart(task.streakSize, "0").slice(-1 * task.streakSize);
  taskCard.find(".streakBar").empty()
    
  for(let j in streakProgress){
    let activity = "inactive"
    if(streakProgress[j] == "1"){
      activity = "active"
    }
    let newDiv = $(`<div class="streakBarCounter ${activity}"></div>`)
    taskCard.find(".streakBar").append(newDiv)
  }
}