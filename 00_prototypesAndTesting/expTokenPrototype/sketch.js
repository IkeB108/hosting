function getURLData(){
  return window.location.href.split("/?")[1]
}

function setURLData(newDataString){
  window.history.replaceState({additionalInformation:"Updated URL with JS"}, "", "?" + newDataString);
}

function setup(){

  icursor = new MobileFriendlyCursor({
    threeFingerConsole: true,
  })
  
  myLoader = new FileLoader({
    tokenImage: "xpToken.png",
    smallTokenImage: "xpTokenSmall.png",
    plusIcon: "plus.png",
    minusIcon: "minus.png"
  })
  
  flashObjectiveIndex = 0;
  flashObjectiveTimer = -1;

  initializePlayerData = () => {

    playerData = {
      configuration: {
        requiredTokenSegments: 8,
        objectives: [
          {
            name: "Jogging",
            unit: "cals burned",
            unitMax: "none",
            multiplier: 400,
          },
          {
            name: "Biking",
            unit: "cals burned",
            unitMax: "none",
            multiplier: 300,
          },
          {
            name: "Meditation",
            unit: "mastery",
            unitMax: 10,
            multiplier: "none"
          },
          {
            name: "Piano practice",
            unit: "experience",
            unitMax: 5,
            multiplier: "none"
          }
        ]
      }
    }

  }
  playerData = getURLData();
  
  try {
    if(playerData.length > 0){
      playerData = JSON.parse( decodeURI(playerData) )
    } else {
      intializePlayerData();
    }
  } catch {
    //Set player data for the first time,
    //including configuration and progress
    initializePlayerData();
  }

  if(typeof playerData.progress == "undefined"){
    playerData.progress = {
      tokens: 0,
      tokenSegments: 0,
      objectives: {}
    }
    for(let i in playerData.configuration.objectives){
      let o = playerData.configuration.objectives[i]
      if(o.unitMax == "none")playerData.progress.objectives[o.name] = 0
      if(typeof o.unitMax == "number"){
        let newArray = []
        for(let j = 0; j < o.unitMax; j ++){
          newArray.push(false)
        }
        playerData.progress.objectives[o.name] = newArray
      }
    }

  }

  setURLData(JSON.stringify(playerData))

}

function onLoadComplete(){
  
}

function draw(){
  //Remember to use if(myLoader.complete)
  background(255)
  if(!myLoader.complete){
    fill(0);
    textAlign(CENTER, CENTER); textSize(width/30)
    text("Loading...", width/2, height/2)
  }
  if(myLoader.complete){
    //Display the big token
    const tb = getTokenBox();
    image(tokenImage, tb.x, tb.y, tb.w, tb.h)    
    if(playerData.progress.tokenSegments < playerData.configuration.requiredTokenSegments){
      //Display wedge of circle over the token
      const x = tb.x + (tb.w/2)
      const y = tb.y + (tb.h/2)
      const c = tb.w
      noStroke(); fill(0, 150);
      const arcStart = (PI * -0.5) + ( (playerData.progress.tokenSegments/playerData.configuration.requiredTokenSegments) * PI * 2 )
      arc(x, y, c, c, arcStart, PI * -0.5)
      if(playerData.progress.tokenSegments == 0){
        ellipse(x, y, c, c)
      }
    }

    //Display previously collected tokens
    const smallTokenW = height * 0.07
    textAlign(LEFT, CENTER); textSize(width * 0.06)
    image(smallTokenImage, 10, height - smallTokenW - 10, smallTokenW, smallTokenW)
    fill(0);
    text(playerData.progress.tokens, smallTokenW * 1.4, height - 6 - (smallTokenW/2) )
    
    textSize(width * 0.04)

    //Display each objective
    
    for(let o in playerData.configuration.objectives){
      const objective = playerData.configuration.objectives[o]

      //Check and cross / plus and minus buttons
      const bbCheck = getButtonBox("check", o)
      const bbCross = getButtonBox("cross", o)
      const bbCenter = bbCross.y + (bbCross.h/2)
      
      noStroke();
      image(plusIcon, bbCheck.x,bbCheck.y,bbCheck.w,bbCheck.h)
      if(playerData.configuration.objectives[o].unitMax !== "none")
        image(minusIcon, bbCross.x,bbCross.y,bbCross.w,bbCross.h)
      
      //Progress bar
      barFillColor = color(76, 156, 91)
      const pbox = getProgressBox(o)
      if(playerData.configuration.objectives[o].unitMax == "none")fill(barFillColor);
      else fill(60);
      strokeWeight(5);
      rect(pbox.x, pbox.y, pbox.w, pbox.h, )
      noStroke();
      if(objective.unitMax == "none"){
        fill(255);
        const progressAmount = round( playerData.progress.objectives[objective.name] * 1000) / 1000
        const progressText = progressAmount + " " + objective.unit
        text(progressText, pbox.x + 10, bbCenter)
      } else {
        const req = objective.unitMax
        fill(barFillColor); stroke(60); strokeWeight(2)
        let arr = playerData.progress.objectives[objective.name]
        for(let i = 0; i < req; i ++){
          if(arr[i] == true)rect(pbox.x + (i * (pbox.w/req)), pbox.y, (pbox.w/req), pbox.h )
        }
        fill(255); noStroke();
        //Calculate percentage of successes
        let successes = 0
        
        for(let i in arr){
          if(arr[i] == true)successes ++
        }
        const progressPercentage = round((successes / req) * 100)
        const progressText = progressPercentage + "% " + objective.unit
        text(progressText, pbox.x + 10, bbCenter)
      }

      if(o == flashObjectiveIndex && flashObjectiveTimer > 0){
        fill(255, (100 * (flashObjectiveTimer/30)) )
        rect(pbox.x, pbox.y, pbox.w, pbox.h)
        flashObjectiveTimer --
      }

      stroke(190); strokeWeight(5); noFill();
      rect(pbox.x, pbox.y, pbox.w, pbox.h)

      //Objective name
      fill(0); noStroke();
      text(objective.name, bbCross.x + (bbCross.w * 1.5), bbCenter)
    }
  }

}

function getButtonBox(checkOrCross, index){
  let buttonBox = {}
  buttonBox.x = width * 0.05
  
  buttonBox.w = height * 0.05
  buttonBox.h = buttonBox.w
  buttonBox.y = (width * 0.1) + (index * (buttonBox.h * 1.4))
  if(checkOrCross == "cross")buttonBox.x += buttonBox.w * 1.4
  return buttonBox
}

function getProgressBox(index){
  let progressBox = {}
  progressBox.w = width * 0.35
  progressBox.x = width - (width * 0.05) - progressBox.w
  progressBox.h = height * 0.05
  progressBox.y = (width * 0.1) + (index * (progressBox.h * 1.4))
  return progressBox
}

function getTokenBox(){
  let tokenBox = {}
  tokenBox.w = width * 0.6
  tokenBox.x = (width - tokenBox.w)/2
  
  tokenBox.h = tokenBox.w
  tokenBox.y = (height - tokenBox.h) * 0.9
  return tokenBox
}

function increaseTokenSegments(){
  playerData.progress.tokenSegments ++
  if(tokenIsFull())
  playerData.progress.tokenSegments = playerData.configuration.requiredTokenSegments
}

function cursorInBox(boxObj){
  return collidePointRect(icursor.x, icursor.y, boxObj.x,boxObj.y,boxObj.w,boxObj.h )
}

function tokenIsFull(){
  return  (playerData.progress.tokenSegments >= playerData.configuration.requiredTokenSegments)
}
function cursorClick(){
  let playerDataChanged = false;

  //Check if user clicked on the big token
  let tokenFull = tokenIsFull();
  const tb = getTokenBox();
  if(cursorInBox(tb)){
    if(tokenFull){
      playerData.progress.tokens ++
      playerData.progress.tokenSegments = 0;
      playerDataChanged = true;
    }
  }

  //Check if user clicked on a button in an objective
  //But only if the user doesn't have a full token yet
  if(!tokenFull){
    let objs = playerData.configuration.objectives 
    for(let o in objs){
      let objType = "withMax"
      if(objs[o].unitMax == "none")objType = "noMax"
      
      const bbCheck = getButtonBox("check", o)
      if(cursorInBox(bbCheck)){
        if(objType == "noMax"){
          playerData.progress.objectives[objs[o].name] += objs[o].multiplier
          increaseTokenSegments();
        }
        if(objType == "withMax"){
          playerData.progress.objectives[objs[o].name].shift();
          playerData.progress.objectives[objs[o].name].push(true)
          increaseTokenSegments();
        }
        flashObjectiveIndex = o
        flashObjectiveTimer = 30
        playerDataChanged = true;
      }
      if(objType == "withMax"){
        const bbCross = getButtonBox("cross", o)
        if(cursorInBox(bbCross)){
          playerData.progress.objectives[objs[o].name].shift();
          playerData.progress.objectives[objs[o].name].push(false)
          flashObjectiveIndex = o
          flashObjectiveTimer = 30
          playerDataChanged = true;
        }
      }
    }
  }
    
  if(playerDataChanged){
    setURLData(JSON.stringify(playerData))
  }
}
