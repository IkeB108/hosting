function setup(){
  icursor = new ImprovedCursor({
    threeFingerConsole: true,
  })
  
  myLoader = new FileLoader({
    dialogueJSON: "dialogueNoComics.json",
    tileJSON: "tilemap.json",
    personSpriteSheet: "spritesheet.png",
    blankLayer: "blankLayer.json",
    diceSpriteSheet: "diceSpritesheet.png",
    leftArrow1: "leftArrow1.png",
    leftArrow2: "leftArrow2.png",
    soundCollect: "Sounds/collect.mp3",
    soundDice: "Sounds/dice.mp3",
    soundFootstep: "Sounds/footstep.mp3",
    soundVictory: "Sounds/victory.mp3",
    soundSpeech: "Sounds/speech.mp3",
  })
  
  mapBGColor = color("#8bac0f")
  overallBGColor = color("#306230")
  
  playerPos = {x:16, y:93} //in TILES
  mapTileZoom = round( width * 0.06 ) ;
  getMapBox = () => {
    return {
      x: (playerPos.x * mapTileZoom * -1) + (width/2),
      y: (playerPos.y * mapTileZoom * -1) + (height/2),
      w: 55 * mapTileZoom,
      h: 100 * mapTileZoom
    }
  }
  fullMapGraphic = createGraphics(55 * 8, 100 * 8)
  fullMapGraphic.noSmooth();
  spriteGraphic = createGraphics(width, height) //stays smooth
  noSmooth();
  
  playerMovementTimer = -1; //tracks how many frames since last player movement.
  playerMovementFrameSpace = 9; //frames between player movements
  playerTalkAvailable = false;
  personAvailableToTalk = null;
  mouseOverLink = null; //index of the dialogue link the mouse is over
  lastPerson = null; //last person player talked to
  queueDelete = null;
  playerHasHadMathDialogue = false;
  hideSpeaker = false;
  playerMovedLeft = false;
  ikeDialogueComplete = false;
  footstepsTaken = 0;
  promptSoundPlayed = false;
  
  personSpriteLocations = {
    "Ike": {x:10, y:93},
    "Black Hat": {x:27, y:18},
    "Beret Guy": {x:36, y:50},
    "Marie Curie": {x: 4, y:73},
    "Paul Erdos": {x: 12, y:73},
    "Benton Lowey-Ball": {x: 8, y:53},
    "Richard Stallman": {x:14, y:49},
    "Polecat": {x:45, y:38},
    "Little Bobby Tables": {x:38, y:77},
    "Rocks Guy": {x:40, y:72},
    "Henchman 1": {x:21, y:30},
    "Henchman 2": {x:23, y:30},
    "Henchman 3": {x:25, y:30},
    "Henchman 4": {x:27, y:30},
    "Henchman 5": {x:29, y:30},
    "Henchman 6": {x:31, y:30},
    "Henchman 7": {x:33, y:30},
  }
  
  thumbdrivesInPosession = [];
  thumbdrivesDelivered = [];
  eyelashesInPosession = [];
  
  eyelashCount = 0;
  inventoryFlashTimer = -1;
  
  giveThumbdrive = function(personName){
    thumbdrivesInPosession.splice( thumbdrivesInPosession.indexOf(personName) )
    thumbdrivesDelivered.push( personName )
    updateInventory();
  }
  receiveEyelash = function(n){
    eyelashCount += n;
    eyelashesInPosession.push(personAvailableToTalk);
    updateInventory();
    soundCollect.play();
  }
  
  receiveThumbdrive = function(personName){
    thumbdrivesInPosession.push(personName)
    if(personName == "Ike")ikeDialogueComplete = true;
    updateInventory();
    soundCollect.play();
  }
  
  hasThumbdrive = function(personName){
    return thumbdrivesInPosession.includes(personName)
  }
  
  hasEnoughEyelashes = () => {return eyelashCount >= 55}
  
  mathSymbolCount = 0;
  playerDieRoll = null;
  rollDie = function(){
    soundDice.play();
    playerDieRoll = ceil(random(20))
    mathSymbolCount --;
    updateInventory();
  }
  
  allRendersComplete = function(){
    for(let i in tileLayerGraphics){
      if(!tileLayerGraphics[i].renderComplete)return false;
    }
    return true;
  }
  
  redirectToComics = function(){
    window.location = "https://ikeb108.github.io/XKCDAdventure/Comics/comics.html"
  }
}

function onLoadComplete(){
  dialogue = new DialogueTree(dialogueJSON)
  dialogue.activeNode = null;
  tileRenderer = new TileRenderer(tileJSON, 8)
  tileRenderer.alphabet = "Commodore 64"
  tileRenderer.importLayers( blankLayer )
  tileLayerGraphics = [];
  let tileLayerGraphicSettings = {
    tilesPerFrame:40,
  }
  for(let i of tileRenderer.layers){
    if(i.label !== "Blank"){
      let g = tileRenderer.getGraphic(i.label, i, tileLayerGraphicSettings)
      tileLayerGraphics.push( g );
    }
    
  }
  
  talkAvailableGraphic = tileRenderer.getTextGraphic("talk (e)", {textColor: 0})
  inventoryGraphic = tileRenderer.getGraphic("Inventory", tileRenderer.layers[3])
}

function draw(){
  //Remember to use if(myLoader.complete)
  background(overallBGColor);
  
  icursor.update();
  
  if(myLoader.complete){
    updatePlayer();
    
    tileRenderer.setGraphicsToUnused();
    drawTileLayerGraphics();
    
    image(spriteGraphic, 0, 0)
    
    talkAvailableGraphic.update();
    renderDialogue();
    
    if(dialogue.activeNode === null){
      inventoryGraphic.update();
      let w = inventoryGraphic.width * (mapTileZoom/8);
      let h = inventoryGraphic.height * (mapTileZoom/8);
      push();
      tint( tileRenderer.colorPalette[3] )
      if(inventoryFlashTimer > -1){
        inventoryFlashTimer --;
        if( frameCount % 20 < 10)noTint();
      }
      image(inventoryGraphic, 0, 0, w, h)
      
      if(ikeDialogueComplete){
        let t = "eyelashes: " + eyelashCount
        eyelashGraphic = tileRenderer.getTextGraphic(t, {
          textColor: 3
        })
        let w2 = eyelashGraphic.width * (mapTileZoom/8)
        let h2 = eyelashGraphic.height * (mapTileZoom/8)
        eyelashGraphic.update();
        image(eyelashGraphic, 0, mapTileZoom*2, w2, h2)
      }
      pop();
      
      if(!playerMovedLeft && myLoader.complete && allRendersComplete() ){
        push();
        imageMode(CENTER,CENTER)
        let w = width/2;
        let h = leftArrow1.height * (w/leftArrow1.width)
        if(frameCount % 50 < 25)
        image(leftArrow1, width/2, height*(1/4), w, h)
        else
        image(leftArrow2, width/2, height*(1/4), w, h)
        pop();
      }
    }
    tileRenderer.deleteUnusedGraphics();
  }
  if(!myLoader.complete || !allRendersComplete()){
    background(0,220);
    fill(255);
    textFont("Courier"); textAlign(CENTER,CENTER); textSize(width* 0.066);
    text("Loading\nCUEBALL AND THE\nBLACK HAT TYRANT:\nAn xkcd adventure...",width/2,height/2)
  }
  
}

function drawTileLayerGraphics(){
  
  fullMapGraphic.background( mapBGColor )
  for(let i of tileLayerGraphics){
    i.update();
    fullMapGraphic.image(i, 0, 0);
  }  
  let mb = getMapBox();
  //draw a rectangle at mouse position
  // let mx = map(icursor.x, mb.x, mb.x+mb.w, 0, 55 )
  // let my = map(icursor.y, mb.y, mb.y+mb.h, 0, 100 )
  // fullMapGraphic.fill(255, 100); fullMapGraphic.noStroke();
  // fullMapGraphic.rect( (round(mx)) * 8, (round(my)) * 8, 8, 8)
  image(fullMapGraphic, mb.x, mb.y, mb.w, mb.h )
  // 
  // fill(255); noStroke();
  // text(round(mx) + " " + round(my), width/2, height/2)
  
  //Person sprites must be drawn on top of fullMapGraphic (fullMapGraphic is too small)
  spriteGraphic.clear();
  
  //Draw player
  let playerSprite = getPersonSprite("Cueball")
  spriteGraphic.image(
    personSpriteSheet,
    mb.x + (playerPos.x * mapTileZoom),
    mb.y + (playerPos.y * mapTileZoom),
    mapTileZoom,
    mapTileZoom * 3,
    playerSprite.x,
    playerSprite.y,
    playerSprite.w,
    playerSprite.h
  )
  
  //Draw other person sprites
  for(let i in personSpriteLocations){
    let p = personSpriteLocations[i];
    let personSprite = getPersonSprite( i )
    
    spriteGraphic.image(
      personSpriteSheet,
      mb.x + (p.x * mapTileZoom),
      mb.y + (p.y * mapTileZoom),
      mapTileZoom,
      mapTileZoom * 3,
      personSprite.x,
      personSprite.y,
      personSprite.w,
      personSprite.h
    )
    
  }
}

function getPersonSprite( personName ){
  if(personName == "Rocks Guy")return getPersonSprite("Cueball");
  if(personName !== "Henchman" && personName.startsWith("Henchman"))return getPersonSprite("Henchman");
  
  let personNames = [
    "Cueball",
    "Ike",
    "Black Hat",
    "Beret Guy",
    "Marie Curie",
    "Paul Erdos",
    "Benton Lowey-Ball",
    "Richard Stallman",
    "Henchman",
    "Polecat",
    "Little Bobby Tables"
  ]
  
  let i = personNames.indexOf(personName)
  let x_offset = 0;
  let quiverTime = 15;
  if(frameCount % (quiverTime * 2) > quiverTime)x_offset = 50;
  return {
    x: (i * 100) + x_offset,
    y: 0,
    w: 50,
    h: 150
  }
  
}

function isCollisionAt(x, y){
  y += 2; //we want to track the player's "feet"
  
  if(x < 0 || x > 54 || y < 0 || y > 99)return true;
  
  if(tileRenderer.graphics.Collision.getTile(x, y).sheetIndex !== 32)return true;

  for(let i in personSpriteLocations){
    let p = personSpriteLocations[i];
    if(p.x == x && p.y + 2 == y)return true;
  }
  
  return false;
}

function updatePlayer(){
  
  let directions = [];
  if( dialogue.activeNode === null && allRendersComplete() ){
    if( keyIsDown(LEFT_ARROW) || keyIsDown(65) )directions.push("left")
    if( keyIsDown(RIGHT_ARROW)|| keyIsDown(68) )directions.push("right")
    if( keyIsDown(UP_ARROW)   || keyIsDown(87) )directions.push("up")
    if( keyIsDown(DOWN_ARROW) || keyIsDown(83) )directions.push("down")
  }
  
  if(directions.length > 0)playerMovementTimer ++;
  else playerMovementTimer = -1;
  playerMovementTimer = playerMovementTimer % playerMovementFrameSpace
  
  if(playerMovementTimer == 0){
    
    let newHorizontalPos = {x:playerPos.x, y:playerPos.y}
    if(directions.includes("left")){newHorizontalPos.x --;playerMovedLeft = true}
    if(directions.includes("right"))newHorizontalPos.x ++;
    
    if(!isCollisionAt(newHorizontalPos.x, newHorizontalPos.y) ){
      playerPos.x = newHorizontalPos.x;
    }
    
    let newVerticalPos = {x:playerPos.x, y:playerPos.y}
    if(directions.includes("up"))newVerticalPos.y --;
    if(directions.includes("down"))newVerticalPos.y ++;
    
    if(!isCollisionAt(newVerticalPos.x, newVerticalPos.y) ){
      playerPos.y = newVerticalPos.y;
    }
    footstepsTaken ++;
    if(footstepsTaken % 4 == 0)
    soundFootstep.play();
    
  }
  
  playerTalkAvailable = false;
  personAvailableToTalk = null;
  for(let i in personSpriteLocations){
    let p = personSpriteLocations[i];
    if( abs(playerPos.x - p.x) <= 1 && abs(playerPos.y - p.y) <= 1){
      playerTalkAvailable = true;
      personAvailableToTalk = i;
    }
  }
  
  let mathGraphic = tileRenderer.getGraphic("Math Symbols", {})
  
  for(let i = playerPos.y; i < playerPos.y + 3; i ++){
    if(mathGraphic.getTile(playerPos.x, i).sheetIndex == 94 ){
      mathGraphic.setTile(playerPos.x, i, {sheetIndex:32})
      mathSymbolCount ++;
      updateInventory();
      soundCollect.play();
      if(!playerHasHadMathDialogue){
        dialogue.setActiveNode("firstMathPickup")
        hideSpeaker = true;
        playerHasHadMathDialogue = true;
        soundSpeech.play();
      }
    }
  }
  
}

function renderDialogue(){
  mouseOverLink = null;
  if(playerTalkAvailable && dialogue.activeNode === null){
    push();
    imageMode(CENTER,CENTER);
    rectMode(CENTER,CENTER);
    let x = width/2;
    let y = height * (1/3);
    let s = (mapTileZoom/8) * (1 + (sin(frameCount/12)/25) )
    let w = talkAvailableGraphic.width * s
    let h = talkAvailableGraphic.height * s
    let w2 = w + (s*2)
    let h2 = h + (s*2)
    fill(tileRenderer.colorPalette[3]); noStroke();
    rect(x, y, w2, h2)
    image(talkAvailableGraphic, x, y, w, h)
    pop();
  }
  if(dialogue.activeNode !== null){
    //Text should be displayed.
    let m1 = mapTileZoom;
    let w1 = width - (m1 * 2)
    let h1 = height - (m1 * 2)
    let m2 = mapTileZoom * 1.2;
    let w2 = width - (m2 * 2)
    let h2 = height - (m2 * 2)
    let m3 = mapTileZoom * 1.4;
    let w3 = width - (m3 * 2)
    let h3 = height - (m3 * 2);
    
    fill( tileRenderer.colorPalette[3] )
    rect(m1, m1, w1, h1)
    fill( tileRenderer.colorPalette[1] )
    rect(m2, m2, w2, h2)
    fill( tileRenderer.colorPalette[2] )
    rect(m3, m3, w3, h3)
    
    let widthInChars = 20;
    
    let body = '';
    if(hideSpeaker){
      body = dialogue.activeNode.body.toLowerCase();
    } else {
      body = 
      personAvailableToTalk.toLowerCase() + ":\n\n" + 
      dialogue.activeNode.body.toLowerCase();
    }
    
    
    let bodyTextGraphic = tileRenderer.getTextGraphic(body, {
      textColor: 1,
      widthInCharacters: widthInChars
    } )
    bodyTextGraphic.update();
    
    let sizeMultiplier = floor(w3/bodyTextGraphic.width)
    
    let bodyW = bodyTextGraphic.width * sizeMultiplier
    
    let bodyH = bodyTextGraphic.height * sizeMultiplier;

    let bodyX = mapTileZoom * 1.6;
    let bodyY = mapTileZoom * 1.6;
    // fill(0,0,200);
    // rect( bodyX, bodyY, bodyW, bodyH )
    image(bodyTextGraphic, bodyX, bodyY, bodyW, bodyH );
    
    let bottomY = bodyY + bodyH + (mapTileZoom*2);
    let links = dialogue.activeNode.displayLinks;
    for(let i in links){
      let t = links[i].displayText.toLowerCase();
      let linkTextGraphic = tileRenderer.getTextGraphic(t, {
        textColor:3,
        widthInCharacters: widthInChars
      })
      let linkTextGraphicHighlighted = tileRenderer.getTextGraphic(t, {
        textColor:0,
        widthInCharacters: widthInChars
      })
      
      let linkW = linkTextGraphic.width * sizeMultiplier
      let linkH = linkTextGraphic.height * sizeMultiplier
      
      linkTextGraphic.update();
      linkTextGraphicHighlighted.update();
      
      if(collidePointRect(icursor.x, icursor.y, bodyX, bottomY, linkW, linkH)){
        image(linkTextGraphicHighlighted, bodyX, bottomY, linkW, linkH );
        mouseOverLink = i;
      } else {
        image(linkTextGraphic, bodyX, bottomY, linkW, linkH );
      }
      
      
      bottomY += linkH + (mapTileZoom*2);
      
    }
    
    if(dialogue.activeNode.tags.includes("showDie")){
      let dsc = {
        x: 248 * (playerDieRoll-1),
        y: 0,
        w: 248,
        h: 296,
      }
      let w = width/2;
      let h = 296 * (w/248)
      push();
      imageMode(CENTER,CENTER)
      image(diceSpriteSheet, width/2, height * (2/3), w, h, dsc.x, dsc.y, dsc.w, dsc.h)
      pop();
    }
    
  }
}

function cursorClick(){
  if(mouseOverLink !== null){
    if(dialogue.activeNode.displayLinks[mouseOverLink].nodeTitle == "Victory!" )
    soundVictory.play();
    dialogue.followLink( mouseOverLink, true, false)
    if(dialogue.activeNode !== null)
    soundSpeech.play();
  }
  if(dialogue.activeNode === null){
    if(queueDelete !== null){
      delete personSpriteLocations[queueDelete]
      console.log("Deleted " + queueDelete)
      queueDelete = null;
    }
    //Check if user clicked on an inventory item
    for(let i in thumbdrivesInPosession){
      if( collidePointRect(icursor.x, icursor.y, i * mapTileZoom, 0, mapTileZoom, mapTileZoom) ){
        dialogue.setActiveNode( thumbdrivesInPosession[i] + "_Thumbdrive" )
        soundSpeech.play();
        // personAvailableToTalk = thumbdrivesInPosession[i]
        hideSpeaker = true;
      }
    }
  }
}

function keyTyped(){
  
  if(key == 'e' && playerTalkAvailable)initiateDialogue();
  
}

function initiateDialogue(){
  let pa = personAvailableToTalk;
  lastPerson = pa;
  
  if(dialogue.getNode(pa + "_1") ){
    let numberToUse = 1;
    if("Beret Guy Little Bobby Tables Richard Stallman Marie Curie Ike".includes(pa)){
      if(!hasThumbdrive(pa))numberToUse = 1;
      if(hasThumbdrive(pa))numberToUse = 2;
      if(thumbdrivesDelivered.includes(pa))numberToUse = 3;
    }
    if(pa == "Paul Erdos"){
      if(!hasThumbdrive("Ike") && !thumbdrivesDelivered.includes("Ike") ){
        //Player has not talked to Ike yet
        numberToUse = 0;
      }
      if(hasThumbdrive("Ike"))numberToUse = 1;
      if(thumbdrivesDelivered.includes("Ike"))numberToUse = 2;
    }
    if(pa == "Rocks Guy")numberToUse = 1;
    
    dialogue.setActiveNode(pa + "_" + numberToUse)
  }
  
  if(pa.startsWith("Henchman")){
    if(mathSymbolCount > 0){
      dialogue.setActiveNode("Henchman_withWeapon")
    } else {
      dialogue.setActiveNode("Henchman_withoutWeapon")
    }
    
  }
  soundSpeech.play();
  hideSpeaker = false;
}

function deleteLastPerson(){
  queueDelete = lastPerson;
}

function updateInventory(){
  inventoryGraphic.clear();
  for(let i = 0; i < mathSymbolCount; i ++){
    inventoryGraphic.setTile(i, 1, {sheetIndex:94} )
  }
  for(let i in thumbdrivesInPosession){
    inventoryGraphic.setTile(i, 0, {sheetIndex:173})
  }
  inventoryFlashTimer = 60;
}
