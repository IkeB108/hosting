/*Naming Conventions:
disp = display
pl = player

*/
function preload(){
  //load player sprites
  bugType_Bouncy = loadImage('sprites/player/Bouncy.png')
  bugType_Bouncy_Extra = loadImage('sprites/player/Bouncy-Extra.png')

  bugType_Hover_1 = loadImage('sprites/player/Hover-1.png')
  bugType_Hover_2 = loadImage('sprites/player/Hover-2.png')
  bugType_Hover_3 = loadImage('sprites/player/Hover-3.png')
  bugType_Hover_4 = loadImage('sprites/player/Hover-4.png')

  bugType_Skitter_Walk_1 = loadImage('sprites/player/Skitter-Walk.png')
  bugType_Skitter_Walk_2 = loadImage('sprites/player/Skitter-Walk2.png')
  bugType_Skitter_Air = loadImage('sprites/player/Skitter-Air.png')
  bugType_Skitter_Launch = loadImage('sprites/player/Skitter-Launch.png')

  bugType_Sticky_Air = loadImage('sprites/player/Sticky-Air.png')
  bugType_Sticky_Ground = loadImage('sprites/player/Sticky-Ground.png')

  //trophies
  trophyImg_Bronze = loadImage('sprites/trophies/bronze.png')
  trophyImg_Silver = loadImage('sprites/trophies/silver.png')
  trophyImg_Gold = loadImage('sprites/trophies/gold.png')
  trophyImg_Platinum = loadImage('sprites/trophies/platinum.png')

  //miscellaneous sprites
  candyCornImg = loadImage('sprites/candyCorn.png')
  holeImg = loadImage('sprites/Hole.png')

  //backgrounds
  emptyBG = loadImage('backgrounds/empty.png')
  platformsBG = loadImage('backgrounds/somePlatforms.png')
  beetleRaceTitle = loadImage('backgrounds/BeetleRaceTitle.png')

  //sounds
  sound_Jump = loadSound('sounds/Jump.mp3')
  sound_Land = loadSound('sounds/Land.mp3')
  sound_bigJump = loadSound('sounds/Big Jump.mp3')
  sound_Crouch = loadSound('sounds/Skitter Crouch.mp3')
  sound_CandyCollected = loadSound('sounds/Candy.mp3')
  sound_Death = loadSound('sounds/Death.mp3')
  sound_Hole = loadSound('sounds/Hole.mp3')
  sound_Upgrade = loadSound('sounds/Upgrade.mp3')
  sound_GameOver = loadSound('sounds/Game Over.mp3')
  sound_Click = loadSound('sounds/SelectItem.mp3')

  //music
  song1 = loadSound('sounds/music/song1.mp3')
  song2 = loadSound('sounds/music/Song2.mp3')
  song3 = loadSound('sounds/music/Song3.mp3')

  //json files
  tutorialRooms = loadJSON('jsons/tutorialRooms.json')
  gameRooms = loadJSON('jsons/gameRooms.json')

  pixelFont = loadFont('pixelFont.ttf')
}
function setup() {
  createCanvas(600,600)
  gWidth = 200; gHeight = 200;
  scaleFactor = width/gWidth;
  noSmooth(); noCursor();
  angleMode(DEGREES)
  textFont(pixelFont)

  pl = { //pl = information about player
    'size':7, //width and height of player in pixels
    'roomXCord':0,
    'roomYCord':0, //coordinates of the room player is currently in
    'x':20,
    'y':20, //coordinates of the player inside the room
    'xVel':0,
    'yVel':0,

    'bugType':'dev', //bug types: dev (move with WASD), skitter, hover, bouncy, sticky
    'bugTypeIndex':0, //index of the player's current bug type in the bugTypeList

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
  keys = {
    'left':65,
    'right':68,
    'up':87,
    'down':83
  }

  var temporaryVar = JSON.parse(JSON.stringify(gameRooms))
  rooms = []
  for(var i = 0; i < 100; i ++){
    if(temporaryVar[i])rooms.push(temporaryVar[i]);
  }

  /*rooms = [{
    'texts':[],
    'xcord':0,
    'ycord':0,
    'walls':[],
    'candy':[],
    'switchBugs':[],
    'holes':[],
  }]*/


  //OPTIONS: Settings that can be changed in the options menu
  soundOn = true;
  musicOn = true;
  lightSensitive = false;


  //Unchanging values: Values that only the developer can change manually
  devMode = false; //if true, clicking will place walls in-game, in addition to other minor changes like pressing "F" to change bug types
  wallTypes = ['normal','juice','poison']
  backgroundColor = color(61, 43, 26);
  normalWallColor = color(122, 88, 55);
  juiceWallColor = color(179, 62, 105);
  poisonWallColor = color(98, 117, 49);

  speedyModeDuration = 400; //time, in frames, player has to be speedy
  teleportTimerDuration = 60; //time, in frames, player cannot teleport for once teleported
  //all wall types collide with player. Juice (beetle juice) makes player faster. Poison walls kill player instantly
  placeTypes = ['wall','wall-juice','wall-poison','candy','switchBug-skitter','switchBug-hover','switchBug-bouncy','switchBug-sticky','hole','delete']
  //list of types of things that can be placed into the level.
  //'delete' type just means when dev clicks on something it is deleted
  bugTypeData = { //values relating to how each bug type moves
    'dev':{ //data for dev bug type
      'speed':5,
    },
    'skitter':{
      'maxVel':1.7,
      'accBy':0.3,
      'jumpForce':3.5,
      'bigJumpForce':4.5,
      'friction':0.15,
      'gravity':0.2,
      //same variables in boost mode:
      'boostMaxVel':2.5,
      'boostAccBy':0.6,
      'boostJumpForce':3.5,
      'boostFriction':0.3,
      'boostGravity':0.2,
    },
    'hover':{ //data for hover bug type
      'maxVel':1.5, //maximum velocity allowed
      'accBy':0.1, //acceleration in pixels per second per second
      'friction':0.04, //deceleration by friction in pixels per second per second
      //same variables but in boost mode:
      'boostMaxVel':2,
      'boostAccBy':0.6,
      'boostFriction':0.1,
    },
    'bouncy':{
      'maxVel':1.7,
      'accBy':0.3,
      'jumpForce':4.5, //will jump player 4 walls high
      'bigJumpForce':6, //will jump player 8 walls high
      'friction':0.15,
      'gravity':0.2,
      //same variables in boost mode:
      'boostMaxVel':2.5,
      'boostAccBy':0.6,
      'boostJumpForce':4.5,
      'boostFriction':0.3,
      'boostGravity':0.2,
    },
    'sticky':{
      'speed':4,
      'boostSpeed':7,
    }
  }
  bugTypeList = ['dev','skitter','bouncy','hover','sticky'] //list of all the bug types
  candyRequirement = 300; //how many candies player needs to collect to beat the game
  //player wins a bronze award by default for beating the game
  silverTime = 300; //maximum time in seconds required to win a silver award
  goldTime = 150;
  platinumTime = 115;
  respawnPosition = createVector(100,20); //coordinates of location where player respawns when they die
  particleMaxAge = 30; //how old a particle is allowed to get (in frames) before it's deleted

  //Changing Values: Miscellaneous values that change as the game goes
  currentRoom = rooms[0]
  currentScreen = 'menu'; //which screen is the player currently viewing?
  playingTutorial = true; //set to true if player is playing the tutorial
  prevScreen = currentScreen; //screen that came before the one currently viewing
  gamePaused = false; //set to true when player presses the pause button in-game
  gameOver = false;
  timeAtStart = null; //millis() at the exact start of the game. Used to set in-game timer
  candiesCollected = 0;
  currentSongIndex = 0; //index in the list of songs of the song that is currently playing
  song1.setVolume(0.1);song2.setVolume(0.1);song3.setVolume(0.1);
  songs = [song1, song2, song3]
  //screens: lightWarning, menu, game, tutorial, options
  placeTypeIndex = 0; //index in the 'placeTypes' list of the object type that dev is placing
  particles = []; //list of all the particles being displayed
}

function draw() {
  push();
  scale(scaleFactor);
  background(0);
  if(currentScreen == 'menu')dispMenuScreen();
  if(currentScreen == 'game')dispGameScreen();
  if(currentScreen == 'options')dispOptionsScreen();

  updateMusic();

  dispCursor(); //cursor goes above all else on the screen
  pop();
}
/*function mouseWheel(event){
  placeTypeIndex = (placeTypeIndex + (event.delta/-53)) % placeTypes.length;
  if(placeTypeIndex == -1)placeTypeIndex = placeTypes.length-1;
}*/
function saveRooms(){
  saveJSON(rooms,'gameRooms.json')
}
function updateMusic(){
  if(musicOn && songs[0].isLoaded() && songs[1].isLoaded() && songs[2].isLoaded()){
    if(!songs[currentSongIndex].isPlaying()){ //if current song has stopped playing
      currentSongIndex = (currentSongIndex + 1) % songs.length //increase current song index by one
      songs[currentSongIndex].play(); //play the song that is now the current song
    }
  }
}
function mouseClicked(){
  changedScreensThisClick = false;
  if(currentScreen == 'options'){
    if(mouseOverBox(soundToggleBox)){
      soundOn = !soundOn;
      if(soundOn)sound_Click.play();
    }
    if(mouseOverBox(musicToggleBox)){musicOn = !musicOn;if(soundOn)sound_Click.play();}
    if(mouseOverBox(lightSensitiveToggleBox)){lightSensitive = !lightSensitive;if(soundOn)sound_Click.play();}
    if(mouseOverBox(backBox)){currentScreen = 'menu';changedScreensThisClick = true;if(soundOn)sound_Click.play();}
    if(mouseOverBox(musicByBox))window.open("https://freemusicarchive.org/music/sawsquarenoise/Towel_Defence_OST", "_blank");
    if(!musicOn)songs[currentSongIndex].stop();
  }
  if(currentScreen == 'menu' && !changedScreensThisClick){
    if(mouseOverBox(startBox)){
      currentScreen = 'game';
      changedScreensThisClick = true;
      if(soundOn)sound_Click.play();
      playingTutorial = false;

      var temporaryVar = JSON.parse(JSON.stringify(gameRooms))
      rooms = []
      for(var i = 0; i < 100; i ++){
        if(temporaryVar[i])rooms.push(temporaryVar[i]);
      }

      resetGame();
    }
    if(mouseOverBox(tutorialBox)){
      currentScreen = 'game';
      changedScreensThisClick = true;
      resetGame();
      if(soundOn)sound_Click.play();
      playingTutorial = true;

      var temporaryVar = JSON.parse(JSON.stringify(tutorialRooms))
      rooms = []
      for(var i = 0; i < 100; i ++){
        if(temporaryVar[i])rooms.push(temporaryVar[i]);
      }

    }
    if(mouseOverBox(optionsBox)){currentScreen = 'options'; changedScreensThisClick = true;if(soundOn)sound_Click.play();}
  }
  if(currentScreen == 'game' && !changedScreensThisClick){
    if(devMode && cursorOnCanvas() && pl.bugType !== 'sticky' && !collidePointRect(gMouseX(),gMouseY(),gWidth-16,4,12,12)){
      var placeType = placeTypes[placeTypeIndex]
      if(placeType == 'wall')currentRoom.walls.push({'x':floor(gMouseX()/10)*10,'y':floor(gMouseY()/10)*10,'type':'normal'})
      if(placeType == 'wall-juice')currentRoom.walls.push({'x':floor(gMouseX()/10)*10,'y':floor(gMouseY()/10)*10,'type':'juice'})
      if(placeType == 'wall-poison')currentRoom.walls.push({'x':floor(gMouseX()/10)*10,'y':floor(gMouseY()/10)*10,'type':'poison'})
      if(placeType == 'delete'){
        //method: create the room all over again but without the deleted item
        newCurrentRoom = {
          'xcord':0,
          'ycord':0,
          'walls':[],
          'candy':[],
          'switchBugs':[],
          'holes':[],
          'texts':[]
        } //empty room where we will re-insert everything
        for(var i = 0; i < currentRoom.walls.length; i ++){ //re-insert walls that were not clicked on
          if(!collidePointRect(gMouseX(),gMouseY(),currentRoom.walls[i].x,currentRoom.walls[i].y,10,10)){
            newCurrentRoom.walls.push(currentRoom.walls[i])
          }
        }
        currentRoom.walls = newCurrentRoom.walls //put those walls into the actual room

        //delete candy
        for(var i = 0; i < currentRoom.candy.length; i ++){
          if(!collidePointRect(gMouseX(),gMouseY(),currentRoom.candy[i].x,currentRoom.candy[i].y,7,7)){
            newCurrentRoom.candy.push(currentRoom.candy[i])
          }
        }
        currentRoom.candy = newCurrentRoom.candy

        //delete holes
        for(var i = 0; i < currentRoom.holes.length; i ++){
          if(!collidePointRect(gMouseX(),gMouseY(),currentRoom.holes[i].x,currentRoom.holes[i].y,10,10)){
            newCurrentRoom.holes.push(currentRoom.holes[i])
          }
        }
        currentRoom.holes = newCurrentRoom.holes

        for(var i = 0; i < currentRoom.switchBugs.length; i ++){
          if(!collidePointRect(gMouseX(),gMouseY(),currentRoom.switchBugs[i].x,currentRoom.switchBugs[i].y,7,7)){
            newCurrentRoom.switchBugs.push(currentRoom.switchBugs[i])
          }
        }
        currentRoom.switchBugs = newCurrentRoom.switchBugs
      }
      if(placeType == 'candy'){
        currentRoom.candy.push({
          'x': floor(gMouseX()/10)*10 + 2,
          'y': floor(gMouseY()/10)*10 + 2
        })
      }
      if(placeType == 'hole'){
        currentRoom.holes.push({
          'x': floor(gMouseX()/10)*10,
          'y': floor(gMouseY()/10)*10
        })
      }
      if(placeType.startsWith('switchBug')){
        if(placeType.endsWith('-skitter'))currentRoom.switchBugs.push({'type':'skitter','x': floor(gMouseX()/10)*10,'y': floor(gMouseY()/10)*10+3})
        if(placeType.endsWith('-hover'))currentRoom.switchBugs.push({'type':'hover','x': floor(gMouseX()/10)*10,'y': floor(gMouseY()/10)*10+3})
        if(placeType.endsWith('-bouncy'))currentRoom.switchBugs.push({'type':'bouncy','x': floor(gMouseX()/10)*10,'y': floor(gMouseY()/10)*10+3})
        if(placeType.endsWith('-sticky'))currentRoom.switchBugs.push({'type':'sticky','x': floor(gMouseX()/10)*10,'y': floor(gMouseY()/10)*10+3})
      }
      console.log('walls: ' + currentRoom.walls.length)
    }
    if(gamePaused){ //if player is viewing the pause menu
      if(mouseOverBox(resumeBox)){gamePaused = false; changedScreensThisClick = true;if(soundOn)sound_Click.play();}
      if(mouseOverBox(menuBox)){currentScreen = 'menu';changedScreensThisClick = true;gamePaused = false;if(soundOn)sound_Click.play();}
    }
    pl.allowedToLaunch = (pl.xVel == 0 && pl.yVel == 0)
    if(pl.bugType == 'sticky' && !gamePaused && !gameOver && pl.allowedToLaunch && !changedScreensThisClick && !collidePointRect(gMouseX(),gMouseY(),gWidth-16,4,12,12)){
      var centerPoint = createVector(pl.x+(pl.size/2),pl.y+(pl.size/2)) //center point of the player
      var angleToCursor = angleOf(centerPoint, createVector(round(gMouseX()),round(gMouseY()))) //angle in degrees between player and cursor
      pl.rotateSprite = angleToCursor; //angle at which we should rotate the sprite is the same angle as the direction we're travelling in
      if(pl.boost)var currentSpeed = bugTypeData.sticky.boostSpeed;
      else var currentSpeed = bugTypeData.sticky.speed;
      var newCenterPoint =  createVector(pl.x+(pl.size/2),pl.y+(pl.size/2)-currentSpeed); //where the center point of the player will be when they move
      newCenterPoint = rotatePoint(newCenterPoint, angleToCursor, centerPoint)
      pl.xVel = (newCenterPoint.x-centerPoint.x)
      pl.yVel = (newCenterPoint.y-centerPoint.y)
      if(soundOn)sound_bigJump.play();
    }
    if(!gameOver && collidePointRect(gMouseX(),gMouseY(),gWidth-16,4,12,12)){gamePaused = !gamePaused;if(soundOn)sound_Click.play();}
    if(gameOver && mouseOverBox(returnToMenuBox)){currentScreen = 'menu'; changedScreensThisClick = true;if(soundOn)sound_Click.play();}
  }
  changedScreensThisClick = false;
}

function dispCursor(){
  stroke(255);noFill();point(gMouseX(),gMouseY());
  if(devMode){noStroke();fill(255,100);rect(floor(gMouseX()/10)*10,floor(gMouseY()/10)*10,10,10)}
}
function cursorOnCanvas(){
  return gMouseX() > 0 && gMouseY() > 0 && gMouseX() < gWidth && gMouseY() < gHeight
}
function pixelLine(x1,y1,x2,y2){
  var dst = ceil(dist(x1,y1,x2,y2))
  //var dst = 5;
  var xdif = x2 - x1
  var ydif = y2 - y1
  for(var i = 0; i < dst; i ++){
    stroke(0);
    point(x1 + ( i * (xdif/dst) ), y1 + ( i * (ydif/dst) ))
  }
}
function gMouseX(){return mouseX/scaleFactor}
function gMouseY(){return mouseY/scaleFactor}
