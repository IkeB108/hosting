function setup(){
  createCanvas(800,500)
  icursor = new MobileFriendlyCursor({
    threeFingerConsole: true,
    manualSize: true,
  })
  
  sounds = {
    jump: document.getElementById("jump"),
    land: document.getElementById("land"),
    charge: document.getElementById("charge")
  }
  
  let filesToLoad = {
    mapArt: "mapArt.png",
    mapImage: "map.png",
    mapData: "mapData.json",
    barThingsImage: "barThings.png",
    jumpSound: "jump.mp3",
    landSound: "land.mp3",
    chargeSound: "charge.mp3",
    playerChargedJump1: "sprites/player/charged/jump1.png",
    playerChargedJump2: "sprites/player/charged/jump2.png",
    playerChargedRun1: "sprites/player/charged/run1.png",
    playerChargedRun2: "sprites/player/charged/run2.png",
    playerChargedRun3: "sprites/player/charged/run3.png",
    playerChargedStand1: "sprites/player/charged/stand1.png",
    playerChargedStand2: "sprites/player/charged/stand2.png",
    playerNotChargedJump1: "sprites/player/notCharged/jump1.png",
    playerNotChargedJump2: "sprites/player/notCharged/jump2.png",
    playerNotChargedRun1: "sprites/player/notCharged/run1.png",
    playerNotChargedRun2: "sprites/player/notCharged/run2.png",
    playerNotChargedRun3: "sprites/player/notCharged/run3.png",
    playerNotChargedStand1: "sprites/player/notCharged/stand1.png",
    playerNotChargedStand2: "sprites/player/notCharged/stand2.png",
    orbImage: "sprites/orb.png",
    orbSpentImage: "sprites/orbSpent.png"
  }
  
  //Images
  
  
  myLoader = new FileLoader(filesToLoad)
  
  cameraPosition = {x:0, y:0}
  
  player = {
    x: 43, //In map coordinates, not screen coordinates
    y: 120,
    w: 1,
    h: 2,
    xvel: 0,
    yvel: 0,
    maxWalkSpeed: 0.4,
    walkAcc: 0.05, //Add each frame
    walkDec: 0.6, //Multiplier each frame
    airDec: 0.95, //Multiplier each frame
    airAcc: 0.07, //Add each frame
    gravityAcc: 0.05, //Add each frame
    jumpAcc: 1, //Add on one frame
    horizontalBounciness: 0, //Value between 0 and 1 to multiply xvel on bounce
    charges: 0,
    jumpCooldownMax: 5, //Minimum of this many frames between jumps
    jumpCooldownTimer: -1,
    jumpedOnThisKeyPress: false,
    chargesOnTouchdown: 2,
    directionFacing: "right",
    grounded: () => {
      let rectBelow = rectAfterCollisions( player, mapData.rects, 0, 0.01 )
      let rectAbove = rectAfterCollisions( player, mapData.rects, 0, -0.01 )
      return (rectBelow.wasCollision && !rectAbove.wasCollision)
    }
  }
  
  depthColor = color(200, 200, 220)
  depthTint = color( depthColor.levels[0], depthColor.levels[1], depthColor.levels[2], 30 )
}

function createMapFromImage(){
  mapImage.loadPixels();
  mapImageData = boxifyImage(mapImage.pixels, mapImage.width)
  console.log(mapImageData)
  mapData = {
    rects: [],
    recharges: []
  }
  for(let i in mapImageData){
    let col = mapImageData[i].rgb
    col = col.r + "-" + col.g + "-" + col.b
    if(col == "0-0-0"){ //Rectangle
      mapData.rects.push({
        x: mapImageData[i].x,
        y: mapImageData[i].y,
        w: mapImageData[i].w,
        h: mapImageData[i].h,
      })
    }
    if(col == "0-0-255"){ //Recharge
      mapData.recharges.push({
        x: mapImageData[i].x,
        y: mapImageData[i].y,
        w: 1,
        h: 1,
        spent: false
      })
    }
  }
}

function onLoadComplete(){
  createMapFromImage();
}

function draw(){
  background(depthColor)
  icursor.update();
  
  if(myLoader.complete){
    updatePlayer();
    updateCamera();
    
    drawBackground();
    
    push();
    boxSize = getBoxSize()
    translate(width/2, height/2)
    scale(boxSize)
    translate(cameraPosition.x * -1, cameraPosition.y * -1)
    drawOrbs();
    drawPlayer();
    renderMap();
    pop();
    
    drawUI();
    
  }
  if(!myLoader.complete){
    fill(255, ( (cos(frameCount/20) + 1) * 205) + 50);
    textAlign(CENTER,CENTER); textSize(40)
    text("Loading...", width/2, height/2)
  }
  
}

function drawBackground(){
  noStroke(); noSmooth();
  let w = barThingsImage.width
  let depthMultiplier = 1.15
  let slowDown = 0.05
  let bgCamera = {
    x: cameraPosition.x * slowDown + 10,
    y: cameraPosition.y * slowDown + 10
  }
  
  push();
  translate(width/2, height/2)
  scale( (width/w) * 2 )
  for(let z = 0; z < 10; z ++){
    
    for(let x = 0; x < 3; x ++){
      for(let y = 0; y < 3; y ++){
        let mult = Math.pow(depthMultiplier, z)
        push();
        scale(mult)
        translate(bgCamera.x * -8, bgCamera.y * -8)
        image(barThingsImage, x * w, y * w, w, w)
        pop();
      }
    }
    
    fill(depthTint);
    rect(-10 * width, -10 * height, 20 * width, 20 * height)
  }
  pop();
}

function updatePlayer(){
  
  let playerGrounded = player.grounded()
  
  let arrowKeyAcc = player.walkAcc;
  if(!playerGrounded)arrowKeyAcc = player.airAcc;
  
  if(keyIsDown(LEFT_ARROW)){
    if( player.xvel > player.maxWalkSpeed * -1 )player.xvel -= arrowKeyAcc;
    player.directionFacing = "left"
  }
  
  if(keyIsDown(RIGHT_ARROW)){
    if( player.xvel < player.maxWalkSpeed )player.xvel += arrowKeyAcc;
    player.directionFacing = "right"
  }
  
  if(!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)){
    if(playerGrounded)player.xvel *= player.walkDec
    if(!playerGrounded)player.xvel *= player.airDec
  }
  
  if(player.jumpCooldownTimer > -1){
    player.jumpCooldownTimer --
  }
  
  if(keyIsDown(UP_ARROW) && player.charges > 0 && player.jumpCooldownTimer == -1 && player.jumpedOnThisKeyPress == false){
    //The player jumps
    player.yvel = player.jumpAcc * -1
    player.charges --
    player.jumpCooldownTimer = player.jumpCooldownMax
    player.jumpedOnThisKeyPress = true;
    jumpSound.play();
  }
  
  if(!keyIsDown(UP_ARROW)){
    player.jumpedOnThisKeyPress = false;
  }
  
  
  
  if(!playerGrounded)player.yvel += player.gravityAcc;
  
  let newPlayerRect = rectAfterCollisions(player, mapData.rects, player.xvel, player.yvel)
  
  //If player hit a wall to the left or right, kill all horizontal velocity
  if(newPlayerRect.xCollisionDirection !== "none")player.xvel *= -1 * player.horizontalBounciness
  
  //If player hit a wall above or below, kill all vertical velocity
  if(newPlayerRect.yCollisionDirection !== "none")player.yvel = 0
  
  
  
  if(abs(player.xvel) < 0.01)player.xvel = 0
  if(abs(player.yvel) < 0.01)player.yvel = 0
  
  player.x = newPlayerRect.x
  player.y = newPlayerRect.y
  
  
  //If player has just hit the ground, then all rcharges replenish
  if(newPlayerRect.yCollisionDirection == "down"){
    player.charges = player.chargesOnTouchdown;
    for(let i in mapData.recharges)mapData.recharges[i].spent = false;
    landSound.play();
  }
  
  //Check for collisions with any recharges
  for(let i in mapData.recharges){
    let r = mapData.recharges[i]
    if( !r.spent && collideRectRect(player.x, player.y, player.w, player.h, r.x, r.y, r.w, r.h ) ){
      mapData.recharges[i].spent = true
      player.charges ++
      chargeSound.play();
    }
  }
}

function updateCamera(){
  cameraPosition.x = lerp( cameraPosition.x, player.x, 0.5 )
  cameraPosition.y = lerp( cameraPosition.y, player.y, 0.5 )
}

function drawUI(){
  for(let i = 0; i < 5; i ++){
    let x = 20 + (i * 20)
    let y = 20
    fill(0);
    rect(x, y, 22, 50)
    if( i < player.charges)fill(255,255,0)
    else fill(140, 140, 40)
    rect(x + 2, y + 2, 18, 46)
  }
  let x = (20 * 5) + 20
  let y = 20 + (50/2) - (30/2)
  fill(0)
  rect(x, y, 10, 30)
}

function getBoxSize(){
  return 20;
}

function drawPlayer(){
  fill(255,100,100)
  if(player.grounded())fill(255,50,50);
  let standCycleFrame = floor(frameCount / 10)
  let runCycleFrame = floor(frameCount / 5)
  let c = "playerCharged"
  if(player.charges == 0)c = "playerNotCharged"
  let imgToDraw = c + "Stand" + (( standCycleFrame % 2)+1)
  if(player.yvel < 0)imgToDraw = c + "Jump1"
  if(player.yvel > 0)imgToDraw = c + "Jump2"
  if(player.grounded()){
    if(abs(player.xvel) > 0)imgToDraw = c + "Run" + ((runCycleFrame % 3) + 1)
  }
  // rect(player.x, player.y, player.w, player.h)
  if(player.directionFacing == "left"){
    push();
    translate(player.x, player.y)
    scale(-1, 1)
    image(window[imgToDraw], (player.w/2), 0, player.h * -1, player.h)
    pop();
  }
  if(player.directionFacing == "right")
    image(window[imgToDraw], player.x - (player.w/2), player.y, player.h, player.h)
}

function drawOrbs(){
  //Draw recharges
  for(let i in mapData.recharges){
    let r = mapData.recharges[i]
    //fill(255,255,0)
    //rect(r.x, r.y, r.w, r.h)
    let imgToDraw = orbImage
    if(r.spent)imgToDraw = orbSpentImage
    let w = r.w * 2
    image(imgToDraw, r.x - (w/4), r.y - (w/4), w, w)
    
  }
}

function renderMap(){
  
  //Draw rectangles
  fill(0); noStroke();
  for(let i in mapData.rects){
    let r = mapData.rects[i]
    rect(r.x, r.y, r.w, r.h)
  }
  
  //Draw map art
  image(mapArt, 0, 0, mapImage.width, mapImage.height)
  

}


function keyTyped(){
  if(key == "g"){
    let guess = prompt("Guess the code:")
    if(guess.toLowerCase().includes("loop")){
      confirm("Correct. Congratulations! You win.")
    } else {
      confirm("That is not the correct code.")
    }
  }
}