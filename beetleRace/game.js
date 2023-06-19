function dispGameScreen(){ //this function is where everything related to in-game play happens
  noStroke();fill(255);
  background(backgroundColor)
  updateCurrentRoom();

  dispHoles();
  dispWalls();
  dispRoomText();
  dispCandy();
  dispSwitchBugs();
  if(pl.alive){ //only update and display the player when the player is alive
    if(!gamePaused && !gameOver){
      updatePlayer();
      updateParticles();
      if(abs(pl.xVel) > 0 && playerTouchingFloor() && frameCount%5 == 0)particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(-0.3,0.3),'yVel':-0.5,'age':15,'color':setPartColorTo})
      //add 'dirt' particles if player is walking on the floor
    }
    updatePlayerSprite();
    if(lightSensitive)pl.flashingTimer = 0; //if light sensitive mode is on, set flash timer to 0 so that there is no flashing
    dispPlayer();
  }
  dispParticles();

  if(!gameOver){dispUI();dispPauseButton();} //displays player bugType, time on the clock, etc.
  if(gameOver)dispGameOverScreen();

  if(gamePaused)dispPauseScreen();
  if(devMode){ //display stats that will be useful to dev here
    push();
    textSize(10);
    fill(0); noStroke();
    text('Object Place Type: ' + placeTypes[placeTypeIndex], 5,10)
    text('Room Cord:' + pl.roomXCord + ' / ' + pl.roomYCord, 5,20)
    //text('xVel: ' + pl.xVel, 5, 25)
    //text('yVel: ' + pl.yVel, 5, 30)
    //if(frameRate() < 40)text('Frame Rate' + frameRate(),5,35)
    fill(100,0,0,100);rect(respawnPosition.x,respawnPosition.y,10,10) //remind dev that they can't place a block here
    textFont(pixelFont)
    pop();
  }
}
function dispPlayer(){
  noStroke();tint(0);
  if(pl.boost)tint(juiceWallColor);
  /*if(pl.flashingTimer == 0 || frameCount % 6 < 3){
    //rect(pl.x,pl.y,pl.size,pl.size);
    //this is the part where we actually display the player sprite
    if(pl.rotateSprite == 0){
      if(!pl.flipSprite)image(pl.currentSprite, pl.x, pl.y, pl.size, pl.size);
      if(pl.flipSprite){
      push();
      translate(pl.x+pl.size,pl.y)
      scale(-1,1)
      image(pl.currentSprite, 0, 0, pl.size, pl.size);
      pop();
    }
    }
    if(pl.rotateSprite > 0){
      push();
      translate(pl.x + (pl.size/2), pl.y + (pl.size/2))
      rotate(pl.rotateSprite);
      imageMode(CENTER)
      image(pl.currentSprite,0,0,pl.size,pl.size)
      pop();
    }
  }*/

  if(pl.flashingTimer > 0 && frameCount % 6 < 3){tint(255)}
  if(pl.rotateSprite == 0){
    if(!pl.flipSprite)image(pl.currentSprite, pl.x, pl.y, pl.size, pl.size);
    if(pl.flipSprite){
    push();
    translate(pl.x+pl.size,pl.y)
    scale(-1,1)
    image(pl.currentSprite, 0, 0, pl.size, pl.size);
    pop();
  }
  }
  if(pl.rotateSprite > 0){
    push();
    translate(pl.x + (pl.size/2), pl.y + (pl.size/2))
    rotate(pl.rotateSprite);
    imageMode(CENTER)
    image(pl.currentSprite,0,0,pl.size,pl.size)
    pop();
  }
  if(pl.bugType == 'sticky'){ //draw a short line pointing towards player cursor
    var centerPoint = createVector(pl.x+(pl.size/2),pl.y+(pl.size/2))
    var point1 = createVector(pl.x+(pl.size/2),pl.y-5)
    var point2 = createVector(pl.x+(pl.size/2),pl.y-15)
    var angleToCursor = angleOf(centerPoint, createVector(gMouseX(),gMouseY()))
    point1 = rotatePoint(point1, angleToCursor, centerPoint)
    point2 = rotatePoint(point2, angleToCursor, centerPoint)
    noFill();stroke(0);
    pixelLine(point1.x,point1.y,point2.x,point2.y)
  }
}
function updatePlayerSprite(){ //update which player sprite should be displayed right now
  if(pl.bugType == 'skitter'){
    pl.rotateSprite = 0;
    if(!playerTouchingFloor()){
      pl.currentSprite = bugType_Skitter_Air;
    } else {
      pl.currentSprite = bugType_Skitter_Walk_1;
      if(abs(pl.xVel) > 0 && frameCount % 15 < 7)pl.currentSprite = bugType_Skitter_Walk_2;
    }
    if(pl.bigJump)pl.currentSprite = bugType_Skitter_Launch;
    if(pl.xVel < 0)pl.flipSprite = true;
    if(pl.xVel > 0)pl.flipSprite = false;
  }
  if(pl.bugType == 'hover'){
    pl.rotateSprite = 0;
    var animationFrame = ceil((frameCount % 24)/4)
    if(animationFrame == 0)animationFrame = 1;
    if(animationFrame == 1)pl.currentSprite = bugType_Hover_1;
    if(animationFrame == 2 || animationFrame == 6)pl.currentSprite = bugType_Hover_2;
    if(animationFrame == 3 || animationFrame == 5)pl.currentSprite = bugType_Hover_3;
    if(animationFrame == 4)pl.currentSprite = bugType_Hover_4;
  }
  if(pl.bugType == 'bouncy'){
    pl.rotateSprite = 0;
    if(!pl.bigJump)pl.currentSprite = bugType_Bouncy;
    if(pl.bigJump)pl.currentSprite = bugType_Bouncy_Extra;
  }
  if(pl.bugType == 'sticky'){
    var wallsCurrentlyTouching = wallsPlayerIsTouching();
    if(wallsCurrentlyTouching.length > 0){
      pl.currentSprite = bugType_Sticky_Ground;
      if(wallsCurrentlyTouching[0].direction == 'down')pl.rotateSprite = 0;
      if(wallsCurrentlyTouching[0].direction == 'left')pl.rotateSprite = 90;
      if(wallsCurrentlyTouching[0].direction == 'right')pl.rotateSprite = 270;
      if(wallsCurrentlyTouching[0].direction == 'up')pl.rotateSprite = 180;
    }
    else {
      pl.currentSprite = bugType_Sticky_Air;
    }
  }
}
function updatePlayer(){
  if(pl.bugType == 'dev'){ //dev bug just moves freely without acceleration or deceleration
    pl.xVel = 0; pl.yVel = 0;
    if(keyIsDown(keys.left))pl.xVel = -1 * bugTypeData.dev.speed;
    if(keyIsDown(keys.right))pl.xVel = bugTypeData.dev.speed;
    if(keyIsDown(keys.up))pl.yVel = -1 * bugTypeData.dev.speed;
    if(keyIsDown(keys.down))pl.yVel = bugTypeData.dev.speed;

    pl.x += pl.xVel;
    pl.y += pl.yVel;
  }
  var wallsCurrentlyTouching = wallsPlayerIsTouching();

  updateNewParticleColor();

  //STEP ONE: UPDATE PLAYER'S XVEL AND YVEL BASED ON BUG TYPE
  if(pl.bugType == 'hover'){
    //set variables according to whether or not player is in boost mode
    if(pl.boost){
      var currentMaxVel = bugTypeData.hover.boostMaxVel;
      var currentAccBy = bugTypeData.hover.boostAccBy;
      var currentFriction = bugTypeData.hover.boostFriction;
    }
    else {
      var currentMaxVel = bugTypeData.hover.maxVel;
      var currentAccBy = bugTypeData.hover.accBy;
      var currentFriction = bugTypeData.hover.friction;
    }
    if(keyIsDown(keys.left))pl.xVel -= currentAccBy;
    if(keyIsDown(keys.right))pl.xVel += currentAccBy;
    if(keyIsDown(keys.up))pl.yVel -= currentAccBy;
    if(keyIsDown(keys.down))pl.yVel += currentAccBy;

    applyFriction(currentFriction,currentFriction)

    //do not let velocities exceed maxvel
    pl.xVel = constrain(pl.xVel, -1 * currentMaxVel,currentMaxVel)
    pl.yVel = constrain(pl.yVel, -1 * currentMaxVel, currentMaxVel)

  }
  if(pl.bugType == 'skitter'){
    if(pl.boost){
      var currentMaxVel = bugTypeData.skitter.boostMaxVel;
      var currentAccBy = bugTypeData.skitter.boostAccBy;
      var currentFriction = bugTypeData.skitter.boostFriction;
      var currentGravity = bugTypeData.skitter.boostGravity
      var currentJumpForce = bugTypeData.skitter.boostJumpForce
    } else {
      var currentMaxVel = bugTypeData.skitter.maxVel;
      var currentAccBy = bugTypeData.skitter.accBy;
      var currentFriction = bugTypeData.skitter.friction;
      var currentGravity = bugTypeData.skitter.gravity
      var currentJumpForce = bugTypeData.skitter.jumpForce
    }

    if(keyIsDown(keys.left) && !pl.bigJump){pl.xVel -= currentAccBy} //move player left if pressing left
    if(keyIsDown(keys.right) && !pl.bigJump){pl.xVel += currentAccBy}//move player right if pressing right
    if(keyIsDown(keys.up) && playerTouchingFloor()){
      if(!pl.bigJump){pl.yVel = -1 * currentJumpForce; var particleYVel = -1}
      if(pl.bigJump){pl.yVel = -1 * bugTypeData.skitter.bigJumpForce; var particleYVel = -1.4}
      particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(-0.5,0),'yVel':particleYVel,'age':0,'color':setPartColorTo})
      particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(0,0.5),'yVel':particleYVel,'age':0,'color':setPartColorTo})
      particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(-0.5,0.5),'yVel':particleYVel,'age':0,'color':setPartColorTo})
      if(pl.bigJump && soundOn)sound_bigJump.play();
      if(!pl.bigJump && soundOn)sound_Jump.play();
      pl.bigJump = false;
    } //jump when player presses "up" and touching floor
    if(keyIsDown(keys.down) && playerTouchingFloor()){
      if(!pl.bigJump && soundOn)sound_Crouch.play(); //if player hasn't set bigJump to true yet, then play the sound
      pl.bigJump = true
    } //set bigJump to true when player presses "down"
    applyFriction(currentFriction,0)
    applyGravity(currentGravity)

    //do not let velocities exceed maxVel
    pl.xVel = constrain(pl.xVel, -1 * currentMaxVel,currentMaxVel)
  }
  if(pl.bugType == 'bouncy'){
    if(pl.boost){
      var currentMaxVel = bugTypeData.bouncy.boostMaxVel;
      var currentAccBy = bugTypeData.bouncy.boostAccBy;
      var currentFriction = bugTypeData.bouncy.boostFriction;
      var currentGravity = bugTypeData.bouncy.boostGravity
      var currentJumpForce = bugTypeData.bouncy.boostJumpForce
    } else {
      var currentMaxVel = bugTypeData.bouncy.maxVel;
      var currentAccBy = bugTypeData.bouncy.accBy;
      var currentFriction = bugTypeData.bouncy.friction;
      var currentGravity = bugTypeData.bouncy.gravity
      var currentJumpForce = bugTypeData.bouncy.jumpForce
    }

    if(keyIsDown(keys.left)){pl.xVel -= currentAccBy} //move player left if pressing left
    if(keyIsDown(keys.right)){pl.xVel += currentAccBy}//move player right if pressing right

    if(playerTouchingFloor()){
      if(!pl.bigJump){pl.yVel = -1 * currentJumpForce; var particleYVel = -1.5}
      if(pl.bigJump){pl.yVel = -1 * bugTypeData.bouncy.bigJumpForce; var particleYVel = -2.4}

      //add particles when player bounces

      particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(-0.5,0),'yVel':particleYVel,'age':0,'color':setPartColorTo})
      particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(0,0.5),'yVel':particleYVel,'age':0,'color':setPartColorTo})
      particles.push({'x':pl.x,'y':pl.y+pl.size,'xVel':random(-0.5,0.5),'yVel':particleYVel,'age':0,'color':setPartColorTo})
    } //jump when player touching floor

    if(keyIsDown(keys.up)){pl.bigJump = true} //set bigJump to true when player presses "down"
    else {pl.bigJump = false}
    applyFriction(currentFriction,0)
    applyGravity(currentGravity)
    //do not let velocities exceed maxVel
    pl.xVel = constrain(pl.xVel, -1 * currentMaxVel,currentMaxVel)
  }
  if(pl.bugType == 'sticky'){
  }

  //STEP TWO: APPLY PLAYER'S XVEL AND YVEL, without bumping into walls
  //pl.x += pl.xVel; pl.y += pl.yVel; //this will move player x and y without regards to collision
  if(pl.bugType !== 'dev'){
    var candX = pl.x + pl.xVel; //candidate x position is where x would be if we moved player
    var candY = pl.y + pl.yVel; //candidate y position is where y would be if we moved player
    if(!intersectingWall(candX,pl.y)){pl.x = candX} //if changing x to candX doesn't create collision, do it
    else {
      candX = round(pl.x) //set candX to player's CURRENT position, rounded
      pl.x = candX //also set player's current position to that rounded position
      for(var i = 0; i < abs(pl.xVel); i ++){ //for every pixel between here and where player is supposed to go
        candX += Math.sign(pl.xVel) //increase or decrease candX by 1 depending on sign of x velocity
        if(!intersectingWall(candX,pl.y)){pl.x = candX} //if changing x to candX doesn't create collision, do it
      }
      if(pl.bugType == 'sticky'){ //add particles for wall collisions
        if(pl.xVel > 0){ //add particles for collision with wall to the right
          for(var i=0; i < 3; i ++){particles.push({'x':pl.x+pl.size,'y':pl.y+3.5,'xVel':-0.6,'yVel':random(0,-1.5),'age':10,'color':setPartColorTo})}
        }
        if(pl.xVel < 0){ //add particles for collision with wall to the left
          for(var i=0; i < 3; i ++){particles.push({'x':pl.x+pl.size,'y':pl.y+3.5,'xVel':0.6,'yVel':random(0,-1.5),'age':10,'color':setPartColorTo})}
        }
      }
      if(pl.bugType !== 'devBug')pl.xVel = 0; //since player clearly bumped into something, kill momentum
    }
    if(!intersectingWall(pl.x,candY)){pl.y = candY} //if changing y to candY doesn't create collision, do it
    else {
      candY = round(pl.y) //set candY to player's CURRENT position, rounded
      pl.y = candY //also set player's current position to that rounded position
      for(var i = 0; i < abs(pl.yVel); i ++){ //for every pixel between here and where player is supposed to go
        candY += Math.sign(pl.yVel) //increase or decrease candY by 1 depending on sign of y velocity
        if(!intersectingWall(pl.x,candY)){pl.y = candY} //if changing y to candY doesn't create collision, do it
      }
      updateNewParticleColor();
      if(pl.yVel > 0.2 && pl.bugType !== 'bouncy'){ //add particles for collision with ground
        var particleYVel = -0.7
        particles.push({'x':pl.x+3.5,'y':pl.y+pl.size,'xVel':random(-0.5,0),'yVel':particleYVel,'age':10,'color':setPartColorTo});
        particles.push({'x':pl.x+3.5,'y':pl.y+pl.size,'xVel':random(0,0.5),'yVel':particleYVel,'age':10,'color':setPartColorTo});
        if(pl.bugType == 'skitter' && !keyIsDown(keys.up) && soundOn)sound_Land.play();
      }
      if(pl.yVel < 0 && pl.bugType !== 'hover'){ //add particles for collision with wall above
        var particleYVel = -0.7
        particles.push({'x':pl.x+3.5,'y':pl.y,'xVel':random(-0.5,0),'yVel':0,'age':10,'color':setPartColorTo});
        particles.push({'x':pl.x+3.5,'y':pl.y,'xVel':random(0,0.5),'yVel':0,'age':10,'color':setPartColorTo});
      }

      if(pl.bugType == 'bouncy' && pl.yVel > 0.2 && soundOn){
        if(pl.bigJump)sound_bigJump.play();
        if(!pl.bigJump)sound_Jump.play();
      }
      if(pl.bugType !== 'devBug')pl.yVel = 0; //since player clearly bumped into something, kill momentum
    }
  }

  //STEP 2.5: UPDATE PL.ALLOWEDTOLAUNCH IF PLAYER IS STICKY BEETLE
  var previousVelocity = abs(pl.xVel) + abs(pl.yVel)
  wallsCurrentlyTouching = wallsPlayerIsTouching();
  if(wallsCurrentlyTouching.length > 0 && pl.bugType == 'sticky'){pl.allowedToLaunch = true;pl.xVel=0;pl.yVel=0;} //if touching wall *after* moving, then player has not *just* launched
  else pl.allowedToLaunch = false;
  if(previousVelocity > 0 && pl.xVel == 0 && pl.yVel == 0 && soundOn){sound_Land.play()}

  //STEP THREE: CHANGE PLAYER STATUS IF THEY'RE TOUCHING JUICE OR POISON WALLS
  for(var i = 0; i < wallsCurrentlyTouching.length; i ++){
    if(wallsCurrentlyTouching[i].type == 'juice'){
      if(pl.speedyModeTimer == 0 && soundOn){sound_Upgrade.play();pl.flashingTimer = 25} //if not previously speedy, play the sound
      pl.speedyModeTimer = speedyModeDuration
    } //if player is touching a juice block, set their boost value to true
    if(wallsCurrentlyTouching[i].type == 'poison' && pl.bugType !== 'dev'){
      /*pl.alive = false;*/
      for(var i = 0; i < 20; i ++){
        particles.push({'x':pl.x+3.5,'y':pl.y+3.5,
        'xVel':pl.xVel + random(-1,1),
        'yVel':random(-3,-1),
        'age':random(0,10),'color':setPartColorTo});
      }
      pl.x = respawnPosition.x;
      pl.y = respawnPosition.y;
      pl.flashingTimer = teleportTimerDuration;
      pl.justTeleportedTimer = teleportTimerDuration;
      if(soundOn)sound_Death.play();
    } //if player is touching poison, kill them (reset pos to 30, 30 for respawn)
  }
  if(pl.speedyModeTimer > 0)pl.boost = true;
  else pl.boost = false;
  pl.speedyModeTimer --;
  if(pl.speedyModeTimer < 0)pl.speedyModeTimer = 0;

  //STEP 3.5: UPDATE WHETHER PLAYER IS FLASHING
  pl.flashingTimer = constrain(pl.flashingTimer - 1, 0, 100)

  //STEP FOUR: REMOVE COLLECTED CANDIES
  if(candiesCollected >= candyRequirement){
    gameOver = true;
    if(soundOn)sound_GameOver.play();
  }//end game when player has collected 100 candies

  var newCandies = []
  for(var i = 0; i < currentRoom.candy.length; i ++){
    var currentCandy = currentRoom.candy[i] //currentCandy is the piece of candy we're checking right now
    if(!intersectRectRect(pl.x,pl.y,7,7,currentCandy.x,currentCandy.y,7,7) || devMode){ //if player collides with this candy
      newCandies.push({'x':currentCandy.x,'y':currentCandy.y})
    }
    else {
      candiesCollected ++;
      if(candiesCollected < candyRequirement && soundOn){
        sound_CandyCollected.play();
      }
    } //if player collected a candy, add it to the number of collected candies
  }
  currentRoom.candy = newCandies

  //STEP FIVE: TELEPORT PLAYER IF ENTERED A HOLE
  var intersectingHole = false;
  for(var i = 0; i < currentRoom.holes.length; i ++){
    var currentHole = currentRoom.holes[i]
    if(pl.justTeleportedTimer == 0 && pl.bugType !== 'dev' && intersectRectRect(pl.x,pl.y,pl.size,pl.size,currentHole.x,currentHole.y,10,10)){
      if(i == 0)var newPosIndex = 1;
      else var newPosIndex  = 0;
      intersectingHole = true;
      pl.justTeleportedTimer = teleportTimerDuration;
      if(soundOn)sound_Hole.play();
      pl.flashingTimer = teleportTimerDuration;
    }
  }
  if(intersectingHole){pl.x = currentRoom.holes[newPosIndex].x;pl.y = currentRoom.holes[newPosIndex].y;}
  if(pl.justTeleportedTimer > 0)pl.justTeleportedTimer --;

  //STEP SIX: CHANGE PLAYER BUG TYPE IF COLLIDE WITH SWITCHBUG
  for(var i = 0; i < currentRoom.switchBugs.length; i ++){
    var currentSwitchBug = currentRoom.switchBugs[i]
    if(collideRectRect(pl.x,pl.y,pl.size,pl.size,currentSwitchBug.x,currentSwitchBug.y,7,7)){
      if(pl.bugType !== currentSwitchBug.type && soundOn){sound_Upgrade.play();pl.flashingTimer = 25} //if the player JUST switched this frame, then play the sound
      pl.bugType = currentSwitchBug.type;
    }
  }

  //STEP SEVEN: PUSH PLAYER INTO NEW ROOM IF NECESSARY
  var switchedRooms = false;
  if(pl.x > gWidth-pl.size){pl.roomXCord ++; pl.x = 0; switchedRooms = true}
  if(pl.x < 0){pl.roomXCord --; pl.x = gWidth-pl.size; switchedRooms = true}
  if(pl.y > gHeight-pl.size){pl.roomYCord ++; pl.y = 0; switchedRooms = true}
  if(pl.y < 0){pl.roomYCord --; pl.y = gHeight-pl.size; switchedRooms = true}
  if(switchedRooms)noiseSeed(pl.roomXCord + pl.roomYCord)
  //^ If player goes out of bound, change their room coordinates
  updateCurrentRoom();
  if(currentRoom == null){ //if the room the player is in doesn't exist
    rooms.push(
      {
        'xcord':pl.roomXCord,
        'ycord':pl.roomYCord,
        'texts':[],
        'walls':[],
        'candy':[],
        'switchBugs':[],
        'holes':[],
      }
    )
    currentRoom = rooms[rooms.length-1] //current room is now the room we just added (top of stack)

    /*
    //perlin noise room generation for normal walls
    var noiseThreshold = 0.35;
    //if(Math.sign(currentRoom.ycord) == 1)noiseThreshold = noiseThreshold + ((abs(currentRoom.ycord)/4)*0.1)
    if(Math.sign(currentRoom.ycord) == -1)noiseThreshold = noiseThreshold - ((abs(currentRoom.ycord)/4)*0.1)


    //use the noiseSeed to create the noiseSeed
    noiseSeed(3.14159265)
    noiseSeed(noise(currentRoom.xcord*100, currentRoom.ycord*100)*1000)

    if(currentRoom.ycord > -4){
      //add edge walls
      for(var x = 0; x < 20; x ++){
        if(x < 9 || x > 11){
          currentRoom.walls.push({'x':10*x,'y':0,'type':'normal'})
          currentRoom.walls.push({'x':10*x,'y':gHeight-10,'type':'normal'})
        }
      }
      for(var y = 0; y < 20; y ++){
        if(y < 15){
          currentRoom.walls.push({'x':0,'y':y*10,'type':'normal'})
          currentRoom.walls.push({'x':gWidth-10,'y':y*10,'type':'normal'})
        }
      }
      //add noise walls
      for(var x = 1; x < 19; x ++){
        for(var y = 1; y < 19; y ++){
          var noiseVar = noise(x/5,y/5)
          if(noiseVar <= noiseThreshold && currentRoom.walls.length < 150){
            currentRoom.walls.push({'x':10*x,'y':10*y,'type':'normal'})
          }
        }
      }
    }
    if(currentRoom.ycord <= -4){ //generate poison and candy corn for "air" rooms
      for(var y = 19; y > 0; y --){
        for(var x = 1; x < 19; x ++){
          var noiseVar = noise(x,y)
          if(noiseVar <= 0.2 && currentRoom.walls.length < 150){
            currentRoom.walls.push({'x':10*x,'y':10*y,'type':'poison'})
          }
          if(noiseVar >= 0.7 && currentRoom.walls.length < 150){
            currentRoom.candy.push({'x':10*x,'y':10*y})
          }
        }
      }
    }*/
  }

}
function dispParticles(){
  for(var i = 0; i < particles.length; i ++){
    var thisPart = particles[i] //this part is the particle we're currently displaying
    stroke(thisPart.color)
    point(thisPart.x, thisPart.y)
  }
}
function updateParticles(){
  for(var i = 0; i < particles.length; i ++){ //update position and velocity of each particle
    var thisPart = particles[i] //this part is the particle we're currently updating
    thisPart.x += thisPart.xVel;
    thisPart.y += thisPart.yVel;
    thisPart.yVel += 0.1; //gravity
    thisPart.age += 1;
  }
  var newParticleSet = [];
  for(var i = 0; i < particles.length; i ++){ //update position and velocity of each particle
    if(particles[i].age < particleMaxAge)newParticleSet.push(particles[i])
  }
  particles = newParticleSet;
}
function updateNewParticleColor(){
  var wallsCurrentlyTouching = wallsPlayerIsTouching();
  setPartColorTo = normalWallColor;
  for(var i = 0; i < wallsCurrentlyTouching.length; i ++){
    if(wallsCurrentlyTouching[i].type == 'poison')setPartColorTo = poisonWallColor;
    if(wallsCurrentlyTouching[i].type == 'juice')setPartColorTo = juiceWallColor;
  }
  //set what color particles will be when added
}
function playerTouchingFloor(){
  var wallsToCheck = wallsPlayerIsTouching();
  for(var i = 0; i < wallsToCheck.length; i ++){
    if(wallsToCheck[i].direction == 'down')return true;
  }
  return false;
}
function wallsPlayerIsTouching(){ //if player is touching one or more walls, returns a list of all the walls, which direction they're in, and their wall type
  var wallsTouching = []
  for(var i = 0; i < currentRoom.walls.length; i ++){ //run through each wall in the room
    var cWall = currentRoom.walls[i] //cWall is the current wall we're checking
    var wallCollisionDirection = null;
    var tinyVal = 0.001; //number of pixels to move player when checking
    //wallCollisionDirection is the direction in which the current wall is relative to the player. Set to "null" if there is no collision
    if(intersectRectRect(pl.x-tinyVal,pl.y,pl.size,pl.size,cWall.x,cWall.y,10,10)){wallCollisionDirection = 'left'}
    if(intersectRectRect(pl.x+tinyVal,pl.y,pl.size,pl.size,cWall.x,cWall.y,10,10)){wallCollisionDirection = 'right'}
    if(intersectRectRect(pl.x,pl.y-tinyVal,pl.size,pl.size,cWall.x,cWall.y,10,10)){wallCollisionDirection = 'up'}
    if(intersectRectRect(pl.x,pl.y+tinyVal,pl.size,pl.size,cWall.x,cWall.y,10,10)){wallCollisionDirection = 'down'}
    if(wallCollisionDirection){ // if player is colliding with cWall
      wallsTouching.push({
        'direction':wallCollisionDirection,
        'type':cWall.type
      })
    }
  }
  return wallsTouching;
}
function intersectingWall(x,y){ //returns whether player at (x,y) is intersecting a wall
  for(var i = 0; i < currentRoom.walls.length; i ++){ //check each wall in the room one by one
    var cWall = currentRoom.walls[i] //cWall is the current wall we're checking
    if(intersectRectRect(cWall.x,cWall.y,10,10,x,y,pl.size,pl.size))return true; //return true if player at (x, y) is colliding with the wall we're checking
  }
  return false;
}
function intersectRectRect(x,y,w,h,x2,y2,w2,h2){
  //check if any of the corners of rect 1 are inside of rect 2
  if(
    pointInRect(x,y,x2,y2,w2,h2) ||
    pointInRect(x+w,y,x2,y2,w2,h2) ||
    pointInRect(x,y+h,x2,y2,w2,h2) ||
    pointInRect(x+w,y+h,x2,y2,w2,h2)
  )return true;
  //check if any of the corners of rect 2 are inside of rect 1
  if(
    pointInRect(x2,y2,x,y,w,h) ||
    pointInRect(x2+w2,y2,x,y,w,h) ||
    pointInRect(x2,y2+h2,x,y,w,h) ||
    pointInRect(x2+w2,y2+h2,x,y,w,h)
  )return true;
  return false;
}
function pointInRect(x,y,x2,y2,w2,h2){
  return (x > x2
  && x < x2 + w2
  && y > y2 && y < y2+h2)}
function applyFriction(xAmount,yAmount){
  //if x and y are within "amount" of 0, round them down to 0
  if(abs(pl.xVel) < xAmount)pl.xVel = 0;
  if(abs(pl.yVel) < yAmount)pl.yVel = 0;

  //whatever direction x and y vel are heading, counter it by "amount"
  if(pl.xVel < 0)pl.xVel += xAmount;
  if(pl.yVel < 0)pl.yVel += yAmount;
  if(pl.xVel > 0)pl.xVel -= xAmount;
  if(pl.yVel > 0)pl.yVel -= yAmount;
}
function applyGravity(amount){
  pl.yVel += amount;
}
function keyTyped(){
  if(currentScreen == 'game'){
    if(key.toLowerCase() == 'f' && devMode){
      pl.bugTypeIndex = (pl.bugTypeIndex + 1) % bugTypeList.length
      pl.bugType = bugTypeList[pl.bugTypeIndex]
    }
    if(key.toLowerCase() == 'e' && devMode){
      pl.boost = !pl.boost
    }
    if(devMode){
      if(key.toLowerCase() == 'i'){ //add 10 walls to top of screen
        for(var i = 0; i < 20; i ++){currentRoom.walls.push({'x':i*10,'y':0,'type':'normal'})}
      }
      if(key.toLowerCase() == 'k'){ //add 10 walls to bottom of screen
        for(var i = 0; i < 20; i ++){currentRoom.walls.push({'x':i*10,'y':gHeight-10,'type':'normal'})}
      }
      if(key.toLowerCase() == 'j'){ //add 10 walls to left of screen
        for(var i = 0; i < 20; i ++){currentRoom.walls.push({'x':0,'y':i*10,'type':'normal'})}
      }
      if(key.toLowerCase() == 'l'){ //add 10 walls to right of screen
        for(var i = 0; i < 20; i ++){currentRoom.walls.push({'x':gWidth-10,'y':i*10,'type':'normal'})}
      }
      if(key.toLowerCase() == 'o')wipeRoom();
    }
    /*if(pl.bugType == 'skitter' && keyIsDown(keys.up) && playerTouchingFloor()){
      var currentJumpForce = bugTypeData.skitter.jumpForce
      if(!pl.bigJump)pl.yVel = -1 * currentJumpForce;
      if(pl.bigJump)pl.yVel = -1 * bugTypeData.skitter.bigJumpForce;
      pl.bigJump = false;
    }*/ //jump when player presses "up" and touching floor. This function is not in updatePlayer() because it should only be triggered once per button push
  }
  //if(key == ' ')devMode = !devMode;
  if(keyIsDown(LEFT_ARROW)){
    placeTypeIndex = placeTypeIndex - 1;
    if(placeTypeIndex == -1)placeTypeIndex = placeTypes.length-1;
  }
  if(keyIsDown(RIGHT_ARROW)){
    placeTypeIndex = (placeTypeIndex + 1) % placeTypes.length;
    if(placeTypeIndex == -1)placeTypeIndex = placeTypes.length-1;
  }
}
function wipeRoom(){ //delete everything from this room
  var newCurrentRoom = {
    'texts':[],
    'xcord':0, //this is ignored
    'ycord':0, //this too
    'walls':[],
    'candy':[],
    'switchBugs':[],
    'holes':[],
  } //empty room where we will re-insert everything
  currentRoom.walls = newCurrentRoom.walls
  currentRoom.candy = newCurrentRoom.candy
  currentRoom.switchBugs = newCurrentRoom.switchBugs
  currentRoom.holes = newCurrentRoom.holes
}
function updateCurrentRoom(){
  currentRoom = null; //reset current room
  for(var i = 0; i < rooms.length; i ++){
    if(rooms[i].xcord == pl.roomXCord && rooms[i].ycord == pl.roomYCord){
      currentRoom = rooms[i]
    }
  }
}
function dispRoomText(){
  for(var i = 0; i < currentRoom.texts.length; i ++){
    push();
    textSize(10); fill(255); noStroke(); textAlign(CENTER)
    text(currentRoom.texts[i].mesg,currentRoom.texts[i].x,currentRoom.texts[i].y)
    pop();
  }
}
function dispUI(){ //displays player bugType, time on the clock, etc.
  var textColor = color(255,100)
  push();
  noStroke();
  fill(juiceWallColor);
  rect(54,6.5,92*(pl.speedyModeTimer/speedyModeDuration),11)

  fill(textColor);
  textAlign(CENTER,CENTER); textSize(15);
  var bugText = ''; //text displayed depending on the player's bugtype
  if(pl.bugType == 'dev')bugText = 'DEV BEETLE';
  if(pl.bugType == 'skitter')bugText = 'SKITTER BEETLE';
  if(pl.bugType == 'hover')bugText = 'HOVER BEETLE';
  if(pl.bugType == 'bouncy')bugText = 'BOUNCY BEETLE';
  if(pl.bugType == 'sticky')bugText = 'STICKY BEETLE';
  text(bugText, gWidth/2, 10)

  gameTime = round((millis()-timeAtStart)/10)/100;
  textSize(10);textAlign(CENTER,CENTER)
  if(!playingTutorial)text(gameTime.toFixed(2), gWidth/2, 21);

  noTint();
  image(candyCornImg, gWidth/2 + 9, 29, 4, 4)
  textAlign(RIGHT,CENTER)
  text(candiesCollected + '/' + candyRequirement, gWidth/2+7, 30)
  pop();
}
function dispPauseButton(){
  noStroke();
  if(collidePointRect(gMouseX(),gMouseY(),gWidth-16,4,12,12)){
    fill(0,100);
    rect(gWidth-16,4,12,12)
  }
  fill(255,100);
  rect(gWidth - 14, 6, 3,8)
  rect(gWidth - 9, 6, 3,8)
}
function dispHoles(){
  for(var i = 0; i < currentRoom.holes.length; i ++){
    push();
    tint(255,180)
    image(holeImg,currentRoom.holes[i].x,currentRoom.holes[i].y)
    pop();
    //ellipse(currentRoom.holes[i].x+5,currentRoom.holes[i].y+5,5)
  }
}
function dispSwitchBugs(){
  textSize(5)
  for(var i = 0; i < currentRoom.switchBugs.length; i ++){
    var currentSwitchBug = currentRoom.switchBugs[i]
    tint(80,80,255)

    var spriteToDisp = null; // choose which to display
    if(currentSwitchBug.type == 'skitter')spriteToDisp = bugType_Skitter_Walk_1;
    if(currentSwitchBug.type == 'bouncy')spriteToDisp = bugType_Bouncy;
    if(currentSwitchBug.type == 'hover'){
      animationFrame = ceil((frameCount % 24)/4)
      if(animationFrame == 0)animationFrame = 1;
      if(animationFrame == 1)spriteToDisp = bugType_Hover_1;
      if(animationFrame == 2 || animationFrame == 6)spriteToDisp = bugType_Hover_2;
      if(animationFrame == 3 || animationFrame == 5)spriteToDisp = bugType_Hover_3;
      if(animationFrame == 4)spriteToDisp = bugType_Hover_4;
    }
    if(currentSwitchBug.type == 'sticky')spriteToDisp = bugType_Sticky_Ground;
    image(spriteToDisp,currentSwitchBug.x,currentSwitchBug.y,7,7)
    //rect(currentSwitchBug.x,currentSwitchBug.y,7,7)

    /*fill(0); var bugLetter = '';
    if(currentSwitchBug.type == 'skitter')bugLetter = 'K';
    if(currentSwitchBug.type == 'hover')bugLetter = 'H';
    if(currentSwitchBug.type == 'bouncy')bugLetter = 'B';
    if(currentSwitchBug.type == 'sticky')bugLetter = 'S';
    text(bugLetter,currentSwitchBug.x+2,currentSwitchBug.y+5)*/
  }
}
function dispCandy(){
  noStroke(); fill(255,120,0)
  for(var i = 0; i < currentRoom.candy.length; i ++){
    var currentCandy = currentRoom.candy[i]
    image(candyCornImg, currentCandy.x, currentCandy.y, 7, 7)
    //rect(currentCandy.x,currentCandy.y,7,7)
  }
}
function dispWalls(){
  for(var i = 0; i < currentRoom.walls.length; i ++){
    noStroke();
    var cWall = currentRoom.walls[i]; //cWall is the wall we're currently displaying
    //set the color of cWall depending on its type
    if(cWall.type == 'normal')fill(normalWallColor);
    if(cWall.type == 'juice')fill(juiceWallColor);
    if(cWall.type == 'poison')fill(poisonWallColor);
    //set color to red if player is intersecting with wall (this should not happen if the game works correctly)
    if(intersectRectRect(cWall.x,cWall.y,10,10,pl.x,pl.y,pl.size,pl.size))fill(255,0,0);
    rect(currentRoom.walls[i].x,currentRoom.walls[i].y,10,10)

    //add dirt
    if(cWall.type == 'normal')stroke(normalWallColor);
    if(cWall.type == 'juice')stroke(juiceWallColor);
    if(cWall.type == 'poison')stroke(poisonWallColor);
    var noiseThreshold = 0.16;
    //var noiseThreshold = 0.33;
    for(var j = 0; j < 10; j ++){
      if(noise(cWall.x+j,cWall.y-1) < noiseThreshold)point(cWall.x+j,cWall.y-1); //above the wall
      if(noise(cWall.x+j,cWall.y+10) < noiseThreshold)point(cWall.x+j,cWall.y+10); //below the wall
      if(noise(cWall.x+10,cWall.y+j) < noiseThreshold)point(cWall.x+10,cWall.y+j); //wall right edge
      if(noise(cWall.x-1,cWall.y+j) < noiseThreshold)point(cWall.x-1,cWall.y+j); //wall left edge
    }
  }
}
function dispPauseScreen(){
  background(0,200);
  push();
  var textColor = color(255)
  var highlightBoxColor = color(255,150)
  textAlign(CENTER,CENTER); textSize(15)
  noStroke();fill(textColor);text('Pause',gWidth/2,gHeight/8);
  resumeBox = centerRect(gWidth/2,gHeight*(3/6),50,20) //highlight box of button that resumes player's game
  menuBox = centerRect(gWidth/2,gHeight*(4/6),50,20) //highlight box of button that takes player back to main menu

  fill(textColor);text('Resume', resumeBox[0]+(resumeBox[2]/2), resumeBox[1]+(resumeBox[3]/2) - 2.5);
  if(mouseOverBox(resumeBox)){fill(highlightBoxColor);rect(resumeBox[0],resumeBox[1],resumeBox[2],resumeBox[3])}

  fill(textColor);text('Main Menu', menuBox[0]+(menuBox[2]/2), menuBox[1]+(menuBox[3]/2) - 2.5);
  if(mouseOverBox(menuBox)){fill(highlightBoxColor);rect(menuBox[0],menuBox[1],menuBox[2],menuBox[3])}
  pop();
}
function dispGameOverScreen(){
  background(0,200)
  textAlign(CENTER,CENTER); textSize(20);
  var textColor = color(255);
  var highlightBoxColor = color(255,150);
  fill(textColor); noStroke(); textSize(20)
  text('YOU WIN!',gWidth/2, gHeight/4)

  award = 'BRONZE'
  if(gameTime <= silverTime)award = 'SILVER';
  if(gameTime <= goldTime)award = 'GOLD';
  if(gameTime <= platinumTime)award = 'PLATINUM';

  textSize(10)
  text(candyRequirement + '/' + candyRequirement + ' candies collected!',gWidth/2, gHeight/4 + 17)
  text('Time: ' + gameTime + ' s', gWidth/2, gHeight/4 + 34)

  noTint();
  if(award == 'BRONZE'){mesg = 'Complete in ' + silverTime + ' seconds to win silver!'; image(trophyImg_Bronze, gWidth/2-15,95)}
  if(award == 'SILVER'){mesg = 'Complete in ' + goldTime + ' seconds to win gold!'; image(trophyImg_Silver, gWidth/2-15,95)}
  if(award == 'GOLD'){mesg = 'Complete in ' + platinumTime + ' seconds to win platinum!'; image(trophyImg_Gold, gWidth/2-15,95)}
  if(award == 'PLATINUM'){mesg = 'You finished in less than ' + platinumTime + ' seconds! Remarkable!'; image(trophyImg_Platinum, gWidth/2-15,95)}

  fill(textColor);
  textSize(15);
  text(award, gWidth/2, 140)

  textSize(10)
  text(mesg, gWidth/2, 157)

  fill(highlightBoxColor)
  returnToMenuBox = centerRect(gWidth/2,175,50,15)
  if(mouseOverBox(returnToMenuBox))rect(returnToMenuBox[0],returnToMenuBox[1],returnToMenuBox[2],returnToMenuBox[3])
  fill(textColor);text('Main Menu', returnToMenuBox[0]+(returnToMenuBox[2]/2), returnToMenuBox[1]+(returnToMenuBox[3]/2)-2);
}
function resetGame(){ //set variables to what they should be at the start of the game
  timeAtStart = millis(); //player time = current millis() - timeAtStart
  candiesCollected = 0;
  gamePaused = false;
  gameOver = false;
  pl = { //pl = information about player
    'size':7, //width and height of player in pixels
    'roomXCord':0,
    'roomYCord':0, //coordinates of the room player is currently in
    'x':20,
    'y':20, //coordinates of the player inside the room
    'xVel':0,
    'yVel':0,

    'bugType':'skitter', //bug types: dev (move with WASD), skitter, hover, bouncy, sticky
    'bugTypeIndex':1, //index of the player's current bug type in the bugTypeList

    'bigJump':false, //when set to true, player will jump extra high as 'skitter' and 'bouncy' bug types
    'allowedToLaunch':true, //set to true when player launches sticky bug and set back to false when player collides with a wall
    'boost': false, //set to true when player collides with "beetle juice" wall types
    'alive': true, //set to false when player touches a poison block
    'justTeleportedTimer': 0, //set to 30 when player enters a hole. (prevents player from teleporting between holes over and over)
    'speedyModeTimer':0, //player stops being speedy when this reaches 0
    'flashingTimer':0, //player stops flashing when timer reaches 0
    'currentSprite':bugType_Skitter_Walk_1, //image file of the player's sprite currently being displayed
    'flipSprite':false, //set to true when sprite should be flipped horizontally
    'rotateSprite':0, //rotation, in degrees, that sprite should be rotated
  }
}
