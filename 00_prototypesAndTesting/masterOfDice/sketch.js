let grabbedData = "none"
//playerData in URL will be a stringified JSON
let playerData = {}
let scoreMessage = ""
let scoreMessageTimer = -1;

function setup(){
  icursor = new MobileFriendlyCursor({
    threeFingerConsole: true,
    minAspectRatio: 0.4,
    maxAspectRatio: 0.55
  })
  
  myLoader = new FileLoader({
    dice1: "assets/dice1.png",
    dice2: "assets/dice2.png",
    dice3: "assets/dice3.png",
    dice4: "assets/dice4.png",
    dice5: "assets/dice5.png",
    dice6: "assets/dice6.png",
    diceblank: "assets/diceblank.png",
    alphFont: "assets/alphFont.ttf",
    diceMaster: "assets/diceMasterColor.png",
    diceMasterRedeem: "assets/diceMasterRedeemColor.png"
  })
  
  //Get URL, then everything that comes after the first slash,
  //to get player data
  grabbedData = window.location.href
  let lastSlashIndex = grabbedData.lastIndexOf("/")
  if(lastSlashIndex >= 6 && lastSlashIndex < grabbedData.length - 1)grabbedData = decodeURI(grabbedData.substring(lastSlashIndex + 1))
  else grabbedData = "none"
  console.log(grabbedData)

  if(grabbedData == "none"){
    playerData = {
      hand: [], //Dice in hand,
      score: 0, //total score
      goal: 100, //goal score
      options: [1,2], //Options to choose from
    }
    setURLToPlayerData();
  } else {
    playerData = JSON.parse(grabbedData.substring(2))
  }

}

function setURLToPlayerData(){
  window.history.replaceState({additionalInformation:"Updated URL with JS"}, "", "?=" + JSON.stringify(playerData));
}

function onLoadComplete(){
  textFont(alphFont)
}

function draw(){
  background(255);
  // fill(255); stroke(0); strokeWeight(1);
  // rect(1,1, width-2, height-2)
  icursor.update();
  
  if(!myLoader.complete){
    fill(0); textAlign(CENTER,CENTER); noStroke();
    textSize(width/20)
    text("Loading...", width/2, height/2)
  }
  if(myLoader.complete){
    fill(0); textAlign(CENTER,CENTER); noStroke();
    textSize(width/5)
    text("Master of Dice", width/2, height*1/10)

    //Draw hand
    for(i = 0; i < 5; i ++){
      let r = handGetRect(i)
      if(playerData.hand[i] !== undefined){
        image( window["dice" + playerData.hand[i]], r[0], r[1], r[2], r[3] )
      } else {
        image( diceblank, r[0], r[1], r[2], r[3] )
      }
    }

    //Draw options
    for(i in playerData.options){
      let r = getOptionsRect(i)
      image( window["dice" + playerData.options[i]], r[0], r[1], r[2], r[3] )
    }

    //Draw score
    textSize(width/8); textAlign(LEFT, BOTTOM)
    let r = handGetRect(0)
    text("Score: " + playerData.score + " / " + playerData.goal, r[0], r[1] )

    //Draw score message
    textSize(width/12)
    fill( map(scoreMessageTimer, 60, 0, 0, 255) )
    let r2 = getOptionsRect(0);
    text(scoreMessage, r[0], r2[1])
    if(scoreMessageTimer > -1)scoreMessageTimer --

    //Draw dice master
    let mr = getMasterRect();
    let imageToShow = diceMaster
    if(playerData.score >= playerData.goal)imageToShow = diceMasterRedeem
    image(imageToShow, mr[0], mr[1], mr[2], mr[3])
  }
}

function getMasterRect(){
  let masterw = width*(2/3)
  return [
    (width/2) - (masterw/2),
    height * 0.22,
    masterw,
    masterw
  ]
}

function handGetRect(i){
  let spacing = width/30
  let w = (width - (spacing * 6))/5
  let r = [
    spacing + ((spacing+w)*i),
    height - spacing - (w * 1),
    w,
    w
  ]
  return r
}

function getOptionsRect(i){
  let spacing = width/30
  let optionsCount = playerData.options.length
  //let w = (width - (spacing * (optionsCount+1) ))/optionsCount
  let w = (width - (spacing * 6))/5 * 1.5
  let offset = (width - (spacing+w) * optionsCount)/2
  let r = [
    ((spacing+w)*i) + offset,
    height * (2/3),
    w,
    w
  ]
  return r
}

function removeDuplicatesFromString(st){
  return Array.from(new Set(st.split(''))).join("")
}

function scoreHand(){
  //Upper section: Use the face that scores the player the most points
  upperType = 1
  for(let i in playerData.hand){
    if( handSumOf(playerData.hand[i]) > handSumOf(upperType) )
      upperType = playerData.hand[i]
  }
  upperScore = handSumOf(upperType)
  let upperBonus = upperScore >= 24

  //Lower section: Use the pattern that scores the most points
  const handString = playerData.hand.join("")
  let h = playerData.hand
  let lowerOptions = ["Chance"]
  const inc = (aString) => {return handString.includes(aString)}
  const incNoDup = (aString) => {
    let handStringNoDup = removeDuplicatesFromString(handString)
    return handStringNoDup.includes(aString)
  }
  const count = (aString) => { return (handString.match( new RegExp(aString.toString(), "g") ) || []).length }
  if(inc("111") || inc("222") || inc("333") || inc("444") || inc("555") || inc("666"))lowerOptions.push("Three of a Kind")
  if(inc("1111") || inc("2222") || inc("3333") || inc("4444") || inc("5555") || inc("6666"))lowerOptions.push("Four of a Kind")
  if(inc("11111") || inc("22222") || inc("33333") || inc("44444") || inc("55555") || inc("66666"))lowerOptions.push("Yahtzee")

  if(incNoDup("1234") || incNoDup("2345") || incNoDup("3456"))lowerOptions.push("Small Straight")
  if(incNoDup("12345") || incNoDup("23456"))lowerOptions.push("Large Straight")
  
  for(let i = 1; i <= 6; i ++){
    for(let j = 1; j <= 6; j ++){
      if( count(i) == 2 && count(j) == 3 && !lowerOptions.includes("Full House")){
        lowerOptions.push("Full House")
      }
    }
  }

  let lowerResults = {
    "Chance": h[0] + h[1] + h[2] + h[3] + h[4],
    "Three of a Kind": 30,
    "Four of a Kind": 40,
    "Full House": 35,
    "Small Straight": 30,
    "Large Straight": 40,
    "Yahtzee": 50,
  }

  let bestLowerOption = "Chance"
  let bestLowerOptionScore = lowerResults["Chance"]
  for(let i in lowerOptions){
    if( lowerResults[ lowerOptions[i] ] > bestLowerOptionScore ){
      bestLowerOption = lowerOptions[i]
      bestLowerOptionScore = lowerResults[ lowerOptions[i] ]
    }
  }

  let total = upperScore + (upperBonus * 35) + bestLowerOptionScore
  playerData.score += total

  const upperTypeStrings = {
    1: "Ones",
    2: "Twos",
    3: "Threes",
    4: "Fours",
    5: "Fives",
    6: "Sixes"
  }
  scoreMessage = "+" + total + " = " + bestLowerOption + " (" + bestLowerOptionScore + ") + " + "Sum of " + upperTypeStrings[upperType] + " (" + upperScore + ")"
  if(upperBonus) scoreMessage += " + Bonus (35)"
  scoreMessageTimer = 200;
  
}

function handSumOf(n){
  //Sum only the dice that read n
  let total = 0
  for(let i in playerData.hand){
    if(playerData.hand[i] == n)total += n
  }
  return total;
}

function selectOption(i){
  //Add number to hand
  playerData.hand.push(playerData.options[i])
  playerData.hand.sort()

  //If hand is complete, add to score and then clear the hand
  if(playerData.hand.length == 5){
    scoreHand();
    playerData.hand = []
  }
  

  //Set new options
  for(let i in playerData.options){
    playerData.options[i] = 0
  }
  for(let i in playerData.options){
    let newOption = floor(random(1, 7))
    while(playerData.options.includes(newOption)) newOption = floor(random(1, 7))
    playerData.options[i] = newOption
  }

  setURLToPlayerData();
}

function cursorClick(b){
  if(b == "left"){
    //See if a dice option was tapped
    for(let i in playerData.options){
      let r = getOptionsRect(i)
      if(collidePointRect(icursor.x, icursor.y, r[0], r[1], r[2], r[3])){
        selectOption(i)
      }
    }

    //See if dice master was clicked/tapped
    let mr = getMasterRect();
    if(collidePointRect(icursor.x, icursor.y, mr[0], mr[1], mr[2], mr[3])){
      //Player has tapped on dice master
      if(playerData.score >= playerData.goal){
        let willRedeem = confirm("Redeem " + playerData.goal +" points?")
        if(willRedeem)playerData.score -= 100;
      }
      else {
        if(playerData.score > 0){
          let willReset = confirm("Reset your score to zero?")
          if(willReset)playerData.score = 0;
        }
        
      }
      setURLToPlayerData();
    }

    //See if player is tapping score to change goal
    let belowy = handGetRect(0)
    belowy = belowy[1] - (belowy[3] * 0.7)
    if(icursor.y > belowy){
      let willSetGoal = confirm("Set new point goal?")
      if(willSetGoal){
        playerData.goal = prompt("New point goal:")
        while( !(int(playerData.goal) > 0) ){
          playerData.goal = prompt("Please write a positive whole number. New point goal:")
        }
        playerData.goal = int(playerData.goal)
      }
      setURLToPlayerData();
    }
  }
}