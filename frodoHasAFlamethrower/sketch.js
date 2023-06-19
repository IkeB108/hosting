//6
function setup(){
  icursor = new MobileFriendlyCursor({
    minAspectRatio: 3/2,
    maxAspectRatio: 3/2,
  })
  
  myLoader = new FileLoader({
    dialogue: "LOTRDialogue.json",
    mapImage_mobile: "LOTRMap_mobile.png",
    mapImage_PC: "LOTRMap_PC.png",
    mapJSON: "LOTRMapJSON.json",
    spritesheetImage: "spritesheet.png",
    spritesheetJSON: "spritesheet.json"
  })
  
  soundFlameStart = document.getElementById("flameStart")
  soundCollect = document.getElementById("collect")
  soundCollect.volume = 0.4;
  soundFootstep = document.getElementById("footstep")
  soundSpeech = document.getElementById("speech")
  soundVictory = document.getElementById("victory")
  soundVictory.volume = 0.4;
  soundAsh = document.getElementById("ash")
  soundMusic = document.getElementById("music")
  
  currentScreen = "start"
  windowResized("isManual");
  
  noSmooth()
  
  player = {
    x: width * (0.2), //position in pixels in map image (after map image is scaled),
    y: (height/2),
    speed: () => { return (width * 0.005) * (70/frameRate()) },
    moving: false,
    movingTimer: 0,
    hasFlamethrower: false,
    flaming: false,
    canSwipeToMove: false,
  }
  
  pressedKeys = {};
  window.onkeyup = function(e) { pressedKeys[e.key] = (e.type == "keydown");  }
  window.onkeydown = function(e) { pressedKeys[e.key] = (e.type == "keydown"); }
  
  orcs = [
    {
      x: mapImageW * (872/1955),
      y: mapImageH * (203/345),
      dead: false,
      deadTimer: 0,
      bufferDeath: false,
    },
    {
      x: mapImageW * (874/2210),
      y: mapImageH * (142/390),
      dead: false,
      deadTimer: 0,
      bufferDeath: false,
    }
  ];
  
  nazgul = [
    {
      x: mapImageW * (1102/2045),
      y: mapImageH * (194/361),
      dead: false,
      deadTimer: 0,
      bufferDeath: false,
    },
    {
      x: mapImageW * (1146/2045),
      y: mapImageH * (275/361),
      dead: false,
      deadTimer: 0,
      bufferDeath: false,
    },
    {
      x: mapImageW * (1205/2045),
      y: mapImageH * (126/361),
      dead: false,
      deadTimer: 0,
      bufferDeath: false,
    }
  ]
  
  sauronBufferDeath = false
  sauronDead = false
  sauronDeadTimer = 0;
  
  gandalfBurned = false
  samBurned = false
  
  spokeToGandalf = false
  spokeToSam = false
  
  nearNPC = "none";
  linkHovering = "none";
  personTalking = "none";
  
  musicStartedOnce = false;
}

function onLoadComplete(){
  myTileRenderer = new TileRenderer( mapJSON );
  myTileRenderer.alphabet = "Commodore 64"
  collisionTiles = [];
  let tilesToCheck = myTileRenderer.layers[0].data.tiles
  let collisionGraphic = myTileRenderer.getGraphic( "collisionGraphic", myTileRenderer.layers[0] )
  for(let i in tilesToCheck){
    if(tilesToCheck[i] == 86){
      let coords = collisionGraphic.indexToCoordinates(i)
      collisionTiles.push( {
        x: coords.x,
        y: coords.y
      } )
      
    }
  }
  
  myDialogue = new DialogueTree(dialogue)
  myDialogue.activeNode = "none"
}

function draw(){
  background(0);
  
  if(!myLoader.complete){
    fill("white");
    textAlign(CENTER,CENTER); textSize(width * 0.05)
    text("Loading Frodo Has a Flamethrower...", width/2, height/2)
  }
  if(myLoader.complete){
    myTileRenderer.setGraphicsToUnused();
    if(currentScreen == "start")drawStartScreen();
    else player.canSwipeToMove = false;
    if(currentScreen == "play")drawPlayScreen();
    myTileRenderer.deleteUnusedGraphics();
    
    if(frameCount % 30 == 0 && soundMusic.paused && (!myDialogue.activeNode.title == "win" || myDialogue.activeNode == "none") ){
      soundMusic.play();
    }
    
  }
}

let musicInterval = setInterval( ()=> {
  if(document.hidden && !soundMusic.paused){
    soundMusic.pause()
    soundMusic.currentTime = 0;
  }
}, 500)

function cursorClick(){
  for(let i in buttons){
    let b = buttons[i];
    if( collidePointRect(icursor.x, icursor.y, b.x, b.y, b.w, b.h) && currentScreen == b.screen){
      b.onclick();
    }
  }
  if(myDialogue.activeNode !== "none" && linkHovering !== "none"){
    let nodeTitle = myDialogue.activeNode.displayLinks[linkHovering].nodeTitle
    if(myDialogue.getNode(nodeTitle) == null){
      myDialogue.activeNode = "none"
    } else {
      myDialogue.followLink(linkHovering);
      soundSpeech.currentTime = 0;
      soundSpeech.play();
    }
  }
}

function windowResized( isManual ){
  let codeToRun = (isManual) => {
    if(isManual !== "isManual"){
      player.x = mapImageW * (110/2190)
      player.y = mapImageH * (196/386)
    }
    graphicMultiplier = round((width * 0.03)/8)
    
    playerHeight = height * (1/5)
    playerWidth = playerHeight * (24/40)
    
    mapImageH = height;
    mapImageW = mapImage_PC.width * (mapImageH/mapImage_PC.height)
    
    let buttonw = width/4;
    let buttonh = buttonw * (1/2)
    buttons = {
      "start": {
        screen: "start",
        text: "start",
        x: width/2 - ((8 * graphicMultiplier * 2 * "start".length)/2)*(5/3),
        y: height - (8 * graphicMultiplier * 2 * "start".length)/2,
        w: 8 * graphicMultiplier * 2 * "start".length * (5/3),
        h: (8 * graphicMultiplier * 2 * "start".length) * (1/2),
        color: color(78, 94, 17),
        onclick: () => {
          currentScreen = "play";
          soundCollect.play();
          player.x = mapImageW * (110/2190)
          player.y = mapImageH * (196/386)
        }
      },
      "talk": {
        screen: "play",
        text: "talk",
        x: width/2 - ((8 * graphicMultiplier * 2 * "talk".length)/2)*(5/3),
        y: 0,
        w: 8 * graphicMultiplier * 2 * "talk".length * (5/3),
        h: (8 * graphicMultiplier * 2 * "talk".length) * (1/2),
        color: color(78, 94, 17),
        onclick: () => {
          if(myDialogue.activeNode == "none"){
            
            newNode = "none"
            if(nearNPC == "gandalf"){
              if(!gandalfBurned && spokeToGandalf)newNode = "Gandalf After"
              if(!gandalfBurned && !spokeToGandalf){newNode = "Gandalf Begin"; spokeToGandalf = true}
              if(gandalfBurned)newNode = "Gandalf Burned"
            }
            if(nearNPC == "sam"){
              if(!spokeToGandalf && spokeToSam)newNode = "Sam beforeGandalf2"
              if(!spokeToGandalf && !spokeToSam){newNode = "Sam beforeGandalf"; spokeToSam = true}
              if(spokeToGandalf)newNode = "Sam afterGandalf"
              if(samBurned)newNode = "Sam Burned"
            }
            if(nearNPC == "sauron"){
              newNode = "Sauron"
            }
            if(newNode !== "none"){
              myDialogue.setActiveNode(newNode)
              soundSpeech.currentTime = 0;
              soundSpeech.play();
            }
            
          }
        }
      },
    }
  }
  if(isManual == "isManual")codeToRun("isManual");
  else setTimeout(codeToRun, 200)
}

function drawPlayScreen(){
  linkHovering = "none";
  player.canSwipeToMove = true;
  if(player.x < mapImageW/2)background( myTileRenderer.colorPalette[7] );
  else background( myTileRenderer.colorPalette[3] )
  let playerXOffset = width * (1/3)
  mapImageH = height;
  mapImageW = mapImage_PC.width * (mapImageH/mapImage_PC.height)
  let mi = mapImage_PC
  if(icursor.onMobile)mi = mapImage_mobile
  image(mi, (-1 * player.x) + playerXOffset, 0, mapImageW, mapImageH)
  
  
  if(myDialogue.activeNode == "none")updatePlayer();
  //FOLD> Display enemies
  orcs = [
    {
      x: mapImageW * (872/1955),
      y: mapImageH * (203/345),
      dead: orcs[0].dead,
      deadTimer: orcs[0].deadTimer,
      bufferDeath: orcs[0].bufferDeath,
    },
    {
      x: mapImageW * (874/2210),
      y: mapImageH * (142/390),
      dead: orcs[1].dead,
      deadTimer: orcs[1].deadTimer,
      bufferDeath: orcs[1].bufferDeath,
    }
  ];
  
  for(let i in orcs){
    let o = orcs[i]
    if(playerBurningAt(o.x, o.y)){
      o.bufferDeath = true;
    } else {
      if(o.bufferDeath && !o.dead){
        o.dead = true;
        o.bufferDeath = false;
        soundAsh.play();
      }
    }
    
    let screenOffset = player.x - (width/3)
    
    let spriteToDisplay = 8;
    if(!o.dead){
      if(frameCount % 50 < 25)spriteToDisplay = 9;
    }
    if(o.dead){
      spriteToDisplay = 11 + o.deadTimer
      if(frameCount % 5 == 0)o.deadTimer ++
      if(spriteToDisplay == 16)spriteToDisplay = 17;
      if(spriteToDisplay > 21)spriteToDisplay = 21;
    }
    
    displaySprite(spriteToDisplay, o.x - screenOffset, o.y, playerWidth, playerHeight, false)
  }
  
  nazgul = [
    {
      x: mapImageW * (1102/2045),
      y: mapImageH * (194/361),
      dead: nazgul[0].dead,
      deadTimer: nazgul[0].deadTimer,
      bufferDeath: nazgul[0].bufferDeath,
    },
    {
      x: mapImageW * (1146/2045),
      y: mapImageH * (275/361),
      dead: nazgul[1].dead,
      deadTimer: nazgul[1].deadTimer,
      bufferDeath: nazgul[1].bufferDeath,
    },
    {
      x: mapImageW * (1205/2045),
      y: mapImageH * (126/361),
      dead: nazgul[2].dead,
      deadTimer: nazgul[2].deadTimer,
      bufferDeath: nazgul[2].bufferDeath,
    }
  ]
  
  for(let i in nazgul){
    let n = nazgul[i]
    if((playerBurningAt(n.x, n.y))){
      n.bufferDeath = true;
    } else {
      if(n.bufferDeath && !n.dead){
        n.dead = true;
        n.bufferDeath = false;
        soundAsh.play();
      }
    }
    
    let screenOffset = player.x - (width/3)
    
    let spriteToDisplay = 6;
    if(!n.dead){
      if(frameCount % 50 < 25)spriteToDisplay = 7;
    }
    if(n.dead){
      spriteToDisplay = 11 + n.deadTimer
      if(frameCount % 5 == 0)n.deadTimer ++
      if(spriteToDisplay == 16)spriteToDisplay = 17;
      if(spriteToDisplay > 21)spriteToDisplay = 21;
    }
    
    displaySprite(spriteToDisplay, n.x - screenOffset, n.y, playerWidth, playerHeight, false)
  }
  //<FOLD
  
  //FOLD> Display Sauron
  let sauronx = mapImageW * (1747/2045)
  let saurony = mapImageH * (191/361)
  if(playerBurningAt(sauronx, saurony)){
    sauronBufferDeath = true;
  } else {
    if(sauronBufferDeath && !sauronDead){
      sauronDead = true;
      sauronBufferDeath = false;
      soundAsh.play();
      setTimeout( ()=> {
        myDialogue.setActiveNode("win")
      }, 1000)
    }
  }
  let screenOffset = player.x - (width/3)
  let spriteToDisplay = 10;
  if(sauronDead){
    spriteToDisplay = 11 + sauronDeadTimer
    if(spriteToDisplay == 16)spriteToDisplay = 17;
    if(spriteToDisplay > 21)spriteToDisplay = 21;
    if(frameCount%5 == 0)
    sauronDeadTimer ++
  }
  displaySprite(spriteToDisplay, sauronx - screenOffset, saurony, playerWidth, playerHeight, false)
  //<FOLD
  
  //FOLD> Display NPCS
  let gandalfx = mapImageW * (382/2045)
  let gandalfy = mapImageH * (275/361)
  if(playerBurningAt(gandalfx, gandalfy))gandalfBurned = true
  if(gandalfBurned)spriteToDisplay = 3;
  else spriteToDisplay = 2;
  displaySprite(spriteToDisplay, gandalfx - screenOffset, gandalfy, playerWidth, playerHeight, false)
  
  let samx = mapImageW * (205/2045)
  let samy = mapImageH * (142/361)
  if(playerBurningAt(samx, samy))samBurned = true
  if(samBurned)spriteToDisplay = 5;
  else spriteToDisplay = 4;
  displaySprite(spriteToDisplay, samx - screenOffset, samy, playerWidth, playerHeight, false)
  
  //<FOLD
  
  //FOLD> Display player
  let dw = playerWidth
  if(!player.hasFlamethrower){
    if(!player.moving)spriteToDisplay = 0;
    if(player.moving){
      if(player.movingTimer%20 < 10)spriteToDisplay = 1;
      if(player.movingTimer%20 >= 10)spriteToDisplay = 0;
      if(player.movingTimer % 20 == 1)soundFootstep.play();
    }
  }
  if(player.hasFlamethrower){
    dw = playerHeight * (80/40)
    if(!player.flaming){
      if(!player.moving)spriteToDisplay = 22;
      if(player.moving){
        if(player.movingTimer%20 < 10)spriteToDisplay = 23;
        if(player.movingTimer%20 >= 10)spriteToDisplay = 22;
        if(player.movingTimer % 20 == 1)soundFootstep.play();
      }
    }
    if(player.flaming){
      let flamingModifier = 0;
      if(frameCount%20 < 10)flamingModifier = 1;
      if(!player.moving){
        spriteToDisplay = 24 + flamingModifier;
      }
      if(player.moving){
        if(player.movingTimer%20 < 10)spriteToDisplay = 26 + flamingModifier;
        if(player.movingTimer%20 >= 10)spriteToDisplay = 24 + flamingModifier;
      }
    }
  }
  
  displaySprite(spriteToDisplay, playerXOffset, player.y, dw, playerHeight, false);
  //<FOLD
  
  if(nearNPC !== "none" && myDialogue.activeNode == "none")
  displayButton("talk")
  
  player.canSwipeToMove = (myDialogue.activeNode == "none")
  
  //Draw arrow if on mobile 
  if(icursor.onMobile && icursor.leftPressed && player.canSwipeToMove && !(icursor.atFirstPress.y == icursor.y && icursor.atFirstPress.x == icursor.x) ){
    stroke(255); strokeWeight( width * 0.007 );
    let x2 = lerp(icursor.atFirstPress.x, icursor.x, 0.5)
    let y2 = lerp(icursor.atFirstPress.y, icursor.y, 0.5)
    drawArrow(icursor.atFirstPress.x, icursor.atFirstPress.y, x2, y2, width * 0.05 )
    
  }
  
  if(myDialogue.activeNode !== "none"){
    displayDialogue();
  }
  
}

function displayDialogue(){
  noSmooth();
  fill(78, 94, 17)
  let sp = width / 30
  rect( sp, sp, width - (sp * 2), height - (sp * 2) )
  let b = myDialogue.activeNode.body.toLowerCase()
  let nodeTitleOne = myDialogue.activeNode.title.split(" ")[0].toLowerCase()
  if(["gandalf", "sam", "sauron", "win"].includes(nodeTitleOne) ){
    personTalking = nodeTitleOne;
  }
  b = personTalking + ":\n\n" + b
  let wic = (width - (sp*4)) / (8 * graphicMultiplier)
  wic = floor(wic)
  let tSettings = {
    textColor: 0,
    widthInCharacters: wic,
    tilePerFrame: 1,
  }
  let t = myTileRenderer.getTextGraphic(b, tSettings)
  t.update()
  
  image(t, sp*2, sp*2, t.width * graphicMultiplier, t.height * graphicMultiplier )
  
  
  let links = myDialogue.activeNode.displayLinks
  let linkSettings = {
    textColor: 6,
    widthInCharacters: wic,
    tilePerFrame: 1
  }
  let linkSpacing = 8 * graphicMultiplier * 4
  linkHovering = "none";
  for(let i = links.length-1; i >= 0; i -- ){
    let link = links[i]
    let linkBody = links[i].displayText.toLowerCase()
    let linkY = height - (linkSpacing * (links.length-i) )
    if(abs(icursor.y - linkY) < (linkSpacing/2) ){
      linkSettings.textColor = 0;
      linkHovering = i;
    } else linkSettings.textColor = 6;
    let linkGraphic = myTileRenderer.getTextGraphic(linkBody, linkSettings)
    linkGraphic.update()
    image(linkGraphic, sp*2, linkY, linkGraphic.width * graphicMultiplier, linkGraphic.height * graphicMultiplier)
  }
}

function playerBurningAt(x, y){
  return (player.flaming && x - player.x > 0 &&
 collideRectRectNoEdges(
   player.x, player.y, playerHeight * (80/40), playerHeight,
   x, y, playerWidth, playerHeight)
 )
}

function drawArrow(x1, y1, x2, y2, headSize){
  line(x1, y1, x2, y2);
  let a = angleOf( {x:x1, y:y1}, {x:x2, y:y2} )
  let endPoint1 = rotatePoint( {x:x2, y:y2-headSize}, a+140, {x:x2, y:y2} )
  let endPoint2 = rotatePoint( {x:x2, y:y2-headSize}, a-140, {x:x2, y:y2} )
  line(x2, y2, endPoint1.x, endPoint1.y)
  line(x2, y2, endPoint2.x, endPoint2.y)
}

function keyPressed(){
  if(key == ' ' && player.hasFlamethrower){
    soundFlameStart.play()
  }
}

function keyReleased(){
  if(key == ' ' && player.hasFlamethrower){
    soundFlameStart.pause()
    soundFlameStart.currentTime = 0;
  }
}

function updatePlayer(){
  let newx = player.x
  let newy = player.y
  player.moving = false;
  let oldx = player.x
  let oldy = player.y
  if(pressedKeys["ArrowLeft"] || pressedKeys["a"]){
    newx -= player.speed();
  }
  if(pressedKeys["ArrowRight"] || pressedKeys["d"]){
    newx += player.speed();
  }
  if(pressedKeys["ArrowUp"] || pressedKeys["w"]){
    newy -= player.speed();
  }
  if(pressedKeys["ArrowDown"] || pressedKeys["s"]){
    newy += player.speed();
  }
  
  if(icursor.leftPressed && icursor.onMobile){
    let deltax = icursor.x - icursor.atFirstPress.x;
    if(abs(deltax) < width/12) deltax = 0;
    let deltay = icursor.y - icursor.atFirstPress.y;
    if(abs(deltay) < width/12) deltay = 0;
    
    if(deltax < 0)newx -= player.speed();
    if(deltax > 0)newx += player.speed();
    
    if(deltay < 0)newy -= player.speed();
    if(deltay > 0)newy += player.speed();
  }
  player.flaming = false;
  if(pressedKeys["f"] || pressedKeys[" "] || icursor.allCursors.length > 1){
    if(player.hasFlamethrower){
      player.flaming = true;
    }
  }
  
  let xcollision = false;
  if( newx < 0 || newx + playerWidth > mapImageW )xcollision = true;
  for(let i in collisionTiles){
    let box = {
      x: collisionTiles[i].x * (mapImageW/170),
      y: collisionTiles[i].y * (mapImageH/30),
      w: 8 * graphicMultiplier,
      h: 8 * graphicMultiplier,
    }
    if(collideRectRectNoEdges(newx, player.y, playerWidth, playerHeight, box.x, box.y, box.w, box.h) ) xcollision = true;
  }
  
  let ycollision = false;
  if( newy < 0 || newy + playerHeight > mapImageH )ycollision = true;
  for(let i in collisionTiles){
    let box = {
      x: collisionTiles[i].x * (mapImageW/170),
      y: collisionTiles[i].y * (mapImageH/30),
      w: 8 * graphicMultiplier,
      h: 8 * graphicMultiplier,
    }
    if(collideRectRectNoEdges(player.x, newy, playerWidth, playerHeight, box.x, box.y, box.w, box.h) ) ycollision = true;
  }
  
  if(newx !== oldx || newy !== oldy)player.moving = true;
  if(!xcollision){player.x = newx}
  if(!ycollision){player.y = newy}
  
  if(!spokeToGandalf && player.x > mapImageW * (390/2210) )
  player.x = mapImageW * (390/2210)
  
  let gandalfx = mapImageW * (382/2045)
  let gandalfy = mapImageH * (275/361)
  let samx = mapImageW * (205/2045)
  let samy = mapImageH * (142/361)
  let sauronx = mapImageW * (1747/2045)
  let saurony = mapImageH * (191/361)
  
  nearNPC = "none"
  
  if(dist(player.x, player.y, gandalfx, gandalfy) <= playerWidth * 2 ){
    nearNPC = "gandalf"
  }
  if(dist(player.x, player.y, samx, samy) <= playerWidth * 2 ){
    nearNPC = "sam"
  }
  if(dist(player.x, player.y, sauronx, saurony) <= playerWidth * 2 && !sauronDead && !sauronBufferDeath ){
    nearNPC = "sauron"
  }
  
  if(player.moving) player.movingTimer ++;
  else player.movingTimer = 0;
}

function cursorPressStart(){
  if(icursor.allCursors.length == 1){
    icursor.atFirstPress = {x: icursor.x, y: icursor.y}
  }
  if(icursor.allCursors.length > 1){
    if(player.hasFlamethrower){
      try { soundFlameStart.play(); } catch {}
    }
  }
  icursor.x = icursor.allCursors[0].x;
  icursor.y = icursor.allCursors[0].y;
  
}

function cursorPressEnd(){
  soundFlameStart.pause();
  soundFlameStart.currentTime = 0;
}

function drawStartScreen(){
  background(141, 144, 46);
  //Display title text
  let titleGraphic = myGetTextGraphic("FRODO HAS A FLAMETHROWER", 0)
  centerImage(titleGraphic, width/2, height/4, titleGraphic.width * graphicMultiplier )
  
  //Draw Frodo with Flamethrower
  let dw = playerHeight * (80/40)
  if(frameCount % 40 < 20)displaySprite(24, width/2, height/2, dw, playerHeight, true)
  if(frameCount % 40 >= 20)displaySprite(27, width/2, height/2, dw, playerHeight, true)
  
  displayButton("start")
}

function displaySprite(spriteNumber, x, y, dw, dh, isCentered){
  let s = spriteCoords(spriteNumber)
  // let dw = s.w * graphicMultiplier;
  // let dh = s.h * graphicMultiplier;
  if(isCentered)
  image( spritesheetImage, x-(dw/2), y-(dh/2), dw, dh, s.x, s.y, s.w, s.h )
  else
  image( spritesheetImage, x, y, dw, dh, s.x, s.y, s.w, s.h )
  
}

function spriteCoords(spriteNumber){
  spriteNumber = spriteNumber.toString().padStart(4,'0');
  return spritesheetJSON.frames["lotr_" + spriteNumber + ".png"].frame
}

function myGetTextGraphic(myString, colorIndex, widthInCharacters) {
  let mySettings = {
    textColor: colorIndex,
    tilesPerFrame: 1,
  }
  if(widthInCharacters)mySettings.widthInCharacters = widthInCharacters;
  let titleGraphic = myTileRenderer.getTextGraphic(myString.toLowerCase(), mySettings )
  titleGraphic.update();
  return titleGraphic;
}

function displayButton(buttonName){
  let b = buttons[buttonName]
  fill(b.color); noStroke();
  if( (!icursor.onMobile || icursor.leftPressed) && collidePointRect(icursor.x, icursor.y, b.x, b.y, b.w, b.h) ){
    let new_r = red(b.color) + 30
    let new_g = green(b.color) + 30
    let new_b = blue(b.color) + 30
    fill(new_r, new_g, new_b)
  }
  rect(b.x, b.y, b.w, b.h)
  let buttonTextGraphic = myGetTextGraphic(b.text, 0)
  let w = buttonTextGraphic.width * graphicMultiplier * 2
  let h = buttonTextGraphic.height * graphicMultiplier * 2
  image(buttonTextGraphic, b.x + (b.w/2) - (w/2), b.y + (b.h/2) - (h/2), w, h)
}

function centerImage(myImage, x, y, w, h) {
  if(typeof w == "undefined")w = myImage.width;
  if(typeof h == "undefined")h = myImage.height * ( w/myImage.width )
  image( myImage, x-(w/2), y-(h/2), w, h )
}
