//12
function setup(){
  icursor = new MobileFriendlyCursor({
    minAspectRatio: 2,
    maxAspectRatio: 3
  })
  
  myLoader = new FileLoader({
    dialogue: "dialogue.json",
    mapImage: "mapImage.png",
    mapJSON: "mapJSON.json",
    collisionRects: "rects.json",
    spritesheetImage: "spritesheet.png",
    spritesheetJSON: "spritesheet.json",
    
    soundCollect: "Sounds/collect.mp3",
    soundFootstep: "Sounds/footstep.mp3",
    soundMusic: "Sounds/music.mp3",
    soundSpeech: "Sounds/speech.mp3",
    soundVictory: "Sounds/victory.mp3"
  })
  
  angleMode(DEGREES)
  scalePixelGraphicsBy = 5;
  
  scalePixelsBy = () => {return width * 0.0025}
  
  player = {
    x: 496,
    y: 230,
    w: 24,
    h: 40,
    displaySize: function(){ 
     let w = 24 * scalePixelsBy()
     let h = 40 * scalePixelsBy()
     return {w, h}
   },
   moving: false,
   speed: () => { return 2 * 70/frameRate()} ,
   feetRect: function(frx, fry) {
     if(typeof frx == "undefined")frx = this.x
     if(typeof fry == "undefined")fry = this.y
     let y = fry + this.h - 8
     let frw = this.w
     let frh = 8
     frx += frw * (2/7)
     frw *= 3/7
     return {x:frx, y, w:frw, h:frh}
   },
   animationInterval: 40,
   arrowButtonsPressed: [],
   hasPassword: false,
   keyCount: 0,
  }
  
  fDoorUnlocked = false;
  deanDoorUnlocked = false;
  safeUnlocked = false;
  key1collected = false
  key2collected = false
  displayArrowMessage = false;
  
  timeOfSoundMusic = 0;
  
  hoveringTalkButton = () => { 
    return (
      abs(icursor.x - (width/2)) <= width * 0.2 &&
      abs(icursor.y - (height * 3/4)) <= height * 0.1 &&
      newNode !== null &&
      !player.moving
    )
  }
  speakerName = "none"
  
  logpos = () => { return { x:player.x, y:player.y } }
  
  map = {
    x: ()=> {return ((-1 * player.x) * scalePixelsBy()) + (width/2) - (player.displaySize().w/2) }, 
    y: ()=> {return ((-1 * player.y) * scalePixelsBy()) + (height/2) - (player.displaySize().h/2) },
    w: ()=> {return mapImage.width * scalePixelsBy()},
    h: ()=> {return mapImage.height * scalePixelsBy()}
  }
  

  
  getArrowButtons = function(){
    let buttonW = width/6
    let buttonH = height/2 //Small arrows are half this size
    let ret = {
      upLeft: {
        x: 0,
        y: 0,
        w: buttonW,
        h: buttonH/2,
      },
      left: {
        x: 0,
        y: buttonH/2,
        w: buttonW,
        h: buttonH
      },
      downLeft: {
        x: 0,
        y: height * (3/4),
        w: buttonW,
        h: buttonH/2,
      },
      upRight: {
        x: width-buttonW,
        y: 0,
        w: buttonW,
        h: buttonH/2,
      },
      right: {
        x: width-buttonW,
        y: buttonH/2,
        w: buttonW,
        h: buttonH
      },
      downRight: {
        x: width-buttonW,
        y: height * (3/4),
        w: buttonW,
        h: buttonH/2,
      },
    }
    return ret;
  }
  
  currentScreen = "play";
  
  textAlign(CENTER, CENTER);
  
  windowIsVertical = () => {
    return (innerWidth/innerHeight < 2/3 && icursor.onMobile )
  }
  
  framesSinceEvent = 0;
  touchesCount = 0
  allCursorsCount = 0;
  linkHovering = "none";
}

muteInterval = setInterval( ()=> {
  if(myLoader.complete && soundMusic.isPlaying() && document.hidden ){
    soundMusic.stop();
    timeOfSoundMusic = soundMusic.currentTime();
  }
}, 200)

function onLoadComplete(){
  myDialogue = new DialogueTree(dialogue)
  myDialogue.activeNode = null;
  historyIncludes = function(nodeTitle) {
    for(let i in myDialogue.nodeHistory){
      if( myDialogue.getNode(myDialogue.nodeHistory[i]).title == nodeTitle )
      return true;
    }
    return false;
  }
  
  
  myTileRenderer = new TileRenderer(mapJSON)
  myTileRenderer.alphabet = "Commodore 64"
  player.spritesheet1 = spritesheetJSON.frames["player1.png"].frame
  player.spritesheet2 = spritesheetJSON.frames["player2.png"].frame
  
  spritesheetGraphic = createGraphics(spritesheetImage.width * scalePixelGraphicsBy, spritesheetImage.height * scalePixelGraphicsBy)
  spritesheetGraphic.noSmooth();
  spritesheetGraphic.image(spritesheetImage, 0, 0, spritesheetGraphic.width, spritesheetGraphic.height)
  
  mapGraphic = createGraphics(mapImage.width * scalePixelGraphicsBy, mapImage.height * scalePixelGraphicsBy)
  mapGraphic.noSmooth();
  mapGraphic.image(mapImage, 0, 0, mapGraphic.width, mapGraphic.height)
  
  characters = {
    "Professor Underhill": {
      x: 440,
      y: 231,
      spritesheet: spritesheetJSON.frames["male.png"].frame,
      color: color(170,255,170)
    },
    "Carolyn": {
      x: 413,
      y: 315,
      spritesheet: spritesheetJSON.frames["femaleBackpack.png"].frame,
      color: color(255,255,170)
    },
    "Noah": {
      x: 260,
      y: 317,
      spritesheet: spritesheetJSON.frames["maleBackpack.png"].frame,
      color: color(170,170,255)
    },
    "Alex": {
      x: 543,
      y: 327,
      spritesheet: spritesheetJSON.frames["maleBackpack.png"].frame,
      color: color(255,170,170)
    },
    "Emily": {
      x: 54,
      y: 310,
      spritesheet: spritesheetJSON.frames["female.png"].frame,
      color: color(170,170,255)
    },
    "Harry": {
      x: 580,
      y: 46,
      spritesheet: spritesheetJSON.frames["male.png"].frame,
      color: color(230, 100, 230)
    },
    "Kathleen": {
      x: 51,
      y: 84,
      spritesheet: spritesheetJSON.frames["female.png"].frame,
      color: color(120, 230, 230)
    },
    "Mike": {
      x: 740,
      y: 236,
      spritesheet: spritesheetJSON.frames["male.png"].frame,
      color: color(120, 230, 230)
    },
    "Key1": {
      x: 260,
      y: 78,
      spritesheet: spritesheetJSON.frames["key.png"].frame,
      color: color(255),
    },
    "Key2": {
      x: 441,
      y: 56,
      spritesheet: spritesheetJSON.frames["key.png"].frame,
      color: color(255),
    }
  }
  
  soundSpeech.setVolume(1.5);
}

function draw(){
  background(0,82,40);
  icursor.update();
  linkHovering = "none"
  newNode = null;
  
  if(!myLoader.complete){
    textSize(width * 0.06); fill(255); noStroke();
    text("Loading...", width/2, height/2)
  }
  
  if(myLoader.complete && !windowIsVertical()){
    myTileRenderer.setGraphicsToUnused();
    if(currentScreen == "play"){
      drawPlayScreen();
    }
    myTileRenderer.deleteUnusedGraphics();
  }
  
  if(windowIsVertical()){
    background(0); fill(255); noStroke();
    textSize(width * 0.06)
    text("Please rotate your device\nto be horizontal.", width/2, height/2)
  }
}

function drawPlayScreen(){
  if(myDialogue.activeNode === null)updatePlayer();
  image(mapGraphic, map.x(), map.y(), map.w(), map.h())
  
  let pds = player.displaySize()
  let ssn = player.spritesheet1
  let interval = player.animationInterval;
  if(player.moving && frameCount % interval < floor(interval/2) ){
    ssn = player.spritesheet2
  }
  if(player.moving && frameCount % floor(interval/2) == 0 ){
    soundFootstep.play();
  }
  
  //Draw NPCs
  for(let i in characters){
    
    let drawCharacter = true;
    if( i == "Key1" && key1collected )drawCharacter = false;
    if( i == "Key2" && key2collected )drawCharacter = false;
    if(drawCharacter){
      let c = characters[i];
      let ss = c.spritesheet
      let dx = map.x() + (c.x * scalePixelsBy())
      let dy = map.y() + (c.y * scalePixelsBy())
      let minx = -1 * pds.w
      let maxx = width
      let miny = -1 * pds.h
      let maxy = height
      if(dx.isBetween(minx, maxx) && dy.isBetween(miny,maxy) ){
        //If this character is onscreen...
        image(spritesheetGraphic,
          dx,
          dy,
          pds.w,
          pds.h,
          ss.x * scalePixelGraphicsBy,
          ss.y * scalePixelGraphicsBy,
          ss.w * scalePixelGraphicsBy,
          ss.h * scalePixelGraphicsBy,
        )
      }
    }
  }
  //Draw player
  image(spritesheetGraphic,
    width/2 - (pds.w/2),
    height/2 - (pds.h/2),
    pds.w,
    pds.h,
    ssn.x * scalePixelGraphicsBy,
    ssn.y * scalePixelGraphicsBy,
    ssn.w * scalePixelGraphicsBy,
    ssn.h * scalePixelGraphicsBy,
  )
  // let fr = player.feetRect()
  // fill(255, 0, 0, 100); noStroke();
  // rect( 
  //   map.x() + (fr.x * scalePixelsBy()) , 
  //   map.y() + (fr.y * scalePixelsBy()), 
  //   fr.w * scalePixelsBy(),
  //   fr.h * scalePixelsBy()
  // )
  
  if(myDialogue.activeNode === null){
    if(newNode !== null){
      let talkSettings = {
        tileSize: 8 * 5
      }
      
      let talkGraphic = myTileRenderer.getTextGraphic("interact", talkSettings)
      talkGraphic.update();
      let m = (width * 0.0013)
      
      let w = talkGraphic.width * m
      let h = talkGraphic.height * m
      let sp = 8 * scalePixelsBy()
      fill( myTileRenderer.colorPalette[3] );
      stroke( myTileRenderer.colorPalette[11] ); strokeWeight(width * 0.005)
      if(hoveringTalkButton()){
        fill( myTileRenderer.colorPalette[11] );
        stroke( myTileRenderer.colorPalette[3] );
      }
      push();
      translate(width/2, height * (3/4))
      rectMode(CENTER); imageMode(CENTER)
      scale( 1 + sin(frameCount*3) * 0.06 )
      rect( 0, 0, w + (sp * 2), h + (sp * 2) )
      image(talkGraphic, 0, 0, w, h)
      
      pop();
    }
  
  
  } else {
    displayDialogue();
  }
  
  if(displayArrowMessage){
    let arrowMessageSettings = {
      tileSize: 8 * 5
    }
    let arrowMessageGraphic = myTileRenderer.getTextGraphic("arrow keys", arrowMessageSettings)
    arrowMessageGraphic.update();
    let m = (width * 0.0013)
    
    let w = arrowMessageSettings.width * m
    let h = arrowMessageSettings.height * m
    let sp = 8 * scalePixelsBy()
    push();
    fill( myTileRenderer.colorPalette[3] );
    stroke( myTileRenderer.colorPalette[11] ); strokeWeight(width * 0.005)
    translate(width/2, height * (3/4))
    rectMode(CENTER); imageMode(CENTER)
    scale( 1 + sin(frameCount*3) * 0.06 )
    rect( 0, 0, w + (sp * 2), h + (sp * 2) )
    image(arrowMessageGraphic, 0, 0, w, h)
    
    pop();
  }
  
  // fill(255,255,0, 100); stroke(255,255,0)
  // for(let i in collisionRects){
  //   let r = collisionRects[i];
  //   if(r.name.startsWith("t")){
  // 
  //     let dr = {
  //       x: map.x() + (r.x * scalePixelsBy()),
  //       y: map.y() + (r.y * scalePixelsBy()),
  //       w: r.w * scalePixelsBy(),
  //       h: r.h * scalePixelsBy()
  //     }
  //     rect(dr.x, dr.y, dr.w, dr.h)
  //     // if(collidePointRect(icursor.x, icursor.y, dr.x, dr.y, dr.w, dr.h)){
  //     //   console.log(r.name)
  //     // }
  // 
  //   }
  // }
  if(icursor.onMobile && myDialogue.activeNode == null)drawArrowButtons();
}

function displayDialogue(){
  
  let sp = 8 * scalePixelsBy()
  stroke( myTileRenderer.colorPalette[11] );
  strokeWeight(width * 0.005);
  fill( myTileRenderer.colorPalette[3] )
  rect( sp, sp, width - (sp * 2), height - (sp * 2) )
  line(width/2, sp, width/2, height - sp)
  
  let tgsettings = {
    tileSize: 8 * 5,
    widthInCharacters: 19,
    tilesPerFrame: 5,
  }
  
  //Display body
  let b = speakerName + ":\n\n" + myDialogue.activeNode.body
  b = b.toLowerCase();
  // b = 'a a a a a a a a a a a a a a a a a a a a a a a a a a a'
  bodyTextGraphic = myTileRenderer.getTextGraphic(b, tgsettings )
  bodyTextGraphic.update();
  let m = width * 0.0006
  image(bodyTextGraphic, sp * 2, sp * 2, (bodyTextGraphic.width) * m, (bodyTextGraphic.height) * m)
  
  //Display links
  let dl = myDialogue.activeNode.displayLinks
  let y = sp * 2;
  for(let i in dl){
    let link = dl[i]
    let linkText = link.displayText.toLowerCase()
    let linkGraphic = myTileRenderer.getTextGraphic(linkText, tgsettings)
    linkGraphic.update();
    if(icursor.x.isBetween(width/2, width) && icursor.y.isBetween(y, y + (linkGraphic.height * m) + (sp * 3) ) && ( icursor.leftPressed || !icursor.onMobile ) ){
      tint( myTileRenderer.colorPalette[9] );
      linkHovering = i;
    } else {
      tint( myTileRenderer.colorPalette[10] )
    }
    image(linkGraphic, (width/2) + sp, y, linkGraphic.width * m, linkGraphic.height * m )
    y += (linkGraphic.height * m) + (sp * 3)
  }
  
  noTint();
}

function cursorClick(){
  if(linkHovering !== "none"){
    if(myDialogue.activeNode.title == "Safe Closed" && linkHovering == "0" ){
      let guess = prompt("Enter the 4-Digit Combination:")
      if (guess !== null && guess.includes("1886")){
        myDialogue.setActiveNode("Safe Open")
        soundVictory.play();
        timeOfSoundMusic = soundMusic.currentTime();
        soundMusic.stop();
        player.hasPassword = true;
        delete collisionRects["t.safe"]
      } else {
        myDialogue.setActiveNode("Wrong Combination")
      }
    } else {
      myDialogue.followLink(linkHovering, true);
      if(myDialogue.activeNode !== null){
        if(myDialogue.activeNode.title.includes("Pickup"))
        soundCollect.play();
        else
        soundSpeech.play();
      }
    }
    
  }
  if( hoveringTalkButton() ){
    myDialogue.setActiveNode( newNode )
    
    if(myDialogue.activeNode.title.includes("Pickup"))
    soundCollect.play();
    else
    soundSpeech.play();
  }
}

function cursorPressStart(){
  if(!icursor.onMobile && typeof dontRepeatArrowMessage == "undefined"){
    displayArrowMessage = true;
    dontRepeatArrowMessage = true;
  }
  if(myLoader.complete && !soundMusic.isPlaying()){
    
    if(getAudioContext().state == "suspended")
    getAudioContext().resume()
    
    soundMusic.loop();
    soundMusic.jump( timeOfSoundMusic )
    soundMusic.setVolume(0.4);
  }
}

function updatePlayer(){
  player.moving = false;
  
  let newx = player.x
  let newy = player.y
  let speed = player.speed();
  let pad = player.arrowButtonsPressed;
  if(keyIsDown(LEFT_ARROW) || keyIsDown(65) || pad.includes("left") ){
    newx -= speed
  }
  if(keyIsDown(RIGHT_ARROW) || keyIsDown(68) || pad.includes("right") ){
    newx += speed
  }
  if(keyIsDown(UP_ARROW) || keyIsDown(87) || pad.includes("upLeft") || pad.includes("upRight") ){
    newy -= speed
  }
  if(keyIsDown(DOWN_ARROW) || keyIsDown(83) || pad.includes("downLeft") || pad.includes("downRight") ){
    newy += speed
  }
  
  if(newx !== player.x || newy !== player.y){
    player.moving = true;
    displayArrowMessage = false;
  }
  
  //Check if new position collides with any walls
  //Check x first
  let isCollision = false;
  for(let i in collisionRects){
    let r = collisionRects[i]
    let fr = player.feetRect(newx, player.y)
    if(collideRectRectNoEdges(
      fr.x, fr.y, fr.w, fr.h,
      r.x, r.y, r.w, r.h
    )) {
      
      if(r.name.startsWith("w")){
        isCollision = true
      }
      if(r.name.startsWith('t')){
        triggerZone(r.name.split(".")[1])
      }
    
    }
  }
  if( !newx.isBetween(0, mapImage.width-player.h) )isCollision = true;
  if(isCollision){
    // if(newx < player.x)newx = floor(player.x/8) * 8;
    // else newx = ceil(player.x/8) * 8;
    newx = player.x
  }
  player.x = newx;
  
  //Check y second
  isCollision = false;
  for(let i in collisionRects){
    let r = collisionRects[i]
    if(r.name.startsWith("w")){
      let fr = player.feetRect(player.x, newy)
      if(collideRectRectNoEdges(
        fr.x, fr.y, fr.w, fr.h,
        r.x, r.y, r.w, r.h
      )) {
        isCollision = true
      }
      
    }
  }
  if( !newy.isBetween(0, mapImage.height-player.h) )isCollision = true;
  if(isCollision){
    if(newy < player.y)newy = floor(player.y/8) * 8;
    else newy = ceil(player.y/8) * 8;
  }
  player.y = newy
  
  if(!player.moving) player.animationInterval = round(40 * (frameRate()/70)  )
  
}

function triggerZone(zoneName){
  if(zoneName == "Underhill"){
    speakerName = "Professor Underhill"
    
    if(player.hasPassword)
    newNode = "Professor Underhill End"
    else if(!historyIncludes("Professor Underhill Start"))
    newNode = "Professor Underhill Start"
    else
    newNode = "Professor Underhill Mid"
    
  }
  if(zoneName == "Carolyn")newNode = "Carolyn"
  if(zoneName == "Noah"){
    speakerName = "Noah"
    if(!historyIncludes("Noah"))newNode = "Noah"
    else newNode = "Noah 2"
  }
  if(zoneName == "Alex")newNode = "Alex"
  if(zoneName == "B12")newNode = "Room B12"
  if(zoneName == "Mike")newNode = "Mike"
  if(zoneName == "Harry")newNode = "Harry"
  if(zoneName == "Emily")newNode = "Emily"
  if(zoneName == "Kathleen"){
    speakerName = "Kathleen"
    if(historyIncludes("Harry") && historyIncludes("Kathleen")) newNode = "Kathleen 2"
    else newNode = "Kathleen"
  }
  if(zoneName == "book")newNode = "Book"
  if(zoneName == "libraryNote"){
    speakerName = "Note"
    newNode = "Note in Library"
  }
  if(zoneName == "FDoor"){
    speakerName = "Door"
    if(player.keyCount > 0 || fDoorUnlocked){
      newNode = "F Building Open"
    } else {
      newNode = "F Building Locked"
    }
  }
  if(zoneName == "DeanDoor"){
    speakerName = "Door"
    if(player.keyCount > 0 || deanDoorUnlocked){
      newNode = "Dean Door Open"
    } else {
      newNode = "Dean's Office Locked"
    }
  }
  if(zoneName == "safe"){
    speakerName = "Safe"
    newNode = "Safe Closed"
  }
  if(zoneName == "f"){
    newNode = "F's"
  }
  if(zoneName == "key1" && !key1collected){
    newNode = "Key 1 Pickup"
    speakerName = "Key"
  }
  if(zoneName == "key2" && !key2collected){
    newNode = "Key 2 Pickup"
    speakerName = "Key"
  }
  
  if("F's Carolyn Noah Alex Room B12 Mike Harry Emily Book".includes(newNode) )
  speakerName = newNode;
}

function drawArrowButtons(){
  let ab = getArrowButtons();
  
  player.arrowButtonsPressed = []
  
  push();
  strokeWeight(width * 0.004);
  for(let i in ab){
    stroke(0);
    let b = ab[i];
    
    let bisPressed = false;
    
    touchesCount = touches.length
    allCursorsCount = icursor.allCursors.length
    
    for(let i in touches){
      let c = touches[i]
      if( collidePointRect(c.x, c.y, b.x, b.y, b.w, b.h) ){
        bisPressed = true
      }
    }
    
    // if(collidePointRect(icursor.x, icursor.y, b.x, b.y, b.w, b.h) && icursor.leftPressed){
    //   bisPressed = true
    // }
    
    if(bisPressed){
      fill(150);
      player.arrowButtonsPressed.push(i)
    } else fill(100);
    rect(b.x, b.y, b.w, b.h)
    let center = {x: b.x+(b.w/2), y: b.y+(b.h/2) }
    let d = 0;
    if(i == "left")d = -90;
    if(i == "right")d = 90;
    if(i == "downLeft")d = 180;
    if(i == "downRight")d = 180;
    stroke(255); 
    drawArrow(center.x, center.y, d)
  }
  pop();
}

function drawArrow(x, y, degrees){
  let size = width * 0.015;
  push();
  translate(x, y);
  rotate(degrees);
  line(0, size*-1, size, size)
  line(0, size*-1, size*-1, size)
  pop();
}
