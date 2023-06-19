/*
AsciiMason 1.0

FEAST YOUR EYES UPON THE MOST CONFUSING RENDERER THIS WORLD HAS EVER SEEN!

KNOWN ISSUES:
-------------
- when using moveObject(), items in the way of eachother can move akin to sand/gravel in Minecraft instead of all moving at once
- when referring to selfObject in a dialogue tree,
the program sometimes references the wrong object (defaults to object furthest
to the bottom-right of the player). This can be mitigated by spacing apart objects whose codes
reference selfObject.

*/
function preload() {

  gameFile = loadStrings('Woodland Postbird Final.json') //set the game data to defaultGame.hjson by default
  //gameFile = loadStrings('gameFiles/Final-TheHauntedLibrary.json')

  fonts =
  {
    'default':loadFont('PxPlus_IBM_BIOS.ttf'), //this IBM 8px * 8px font ensures that all characters are square
    //https://int10h.org/oldschool-pc-fonts/fontlist/font?ibm_bios#-
    'creatures':loadFont('creatures.ttf') //this 8px font was created by me (Ikebot) specifically for this software.
  }
  soundFiles = [
    "activate",
    "beep",
    "beep2",
    "bwip",
    "collect",
    "collect2",
    "correct",
    "correct2",
    "crush",
    "crush2",
    "crush3",
    "damage",
    "deactivate",
    "deactivate2",
    "deactivate3",
    "jump",
    "jump2",
    "land",
    "land2",
    "levelcomplete",
    "lfo",
    "lfo2",
    "magic",
  ]
  sounds = {}
  for(var i = 0 ; i < soundFiles.length; i ++){
    sounds[soundFiles[i]] = loadSound('sounds/' + soundFiles[i] + '.mp3')
  }

}

function setup() {

  versionNumber = '1.0'; //this is the version number of Adventure Builder
  //LOAD GAME DATA -------------------------------

  //parse the defaultGame hjson file
  gameFile = Hjson.parse(join(gameFile, '\n'))
  /*since json/hjson files need to be an array (but we want the game data to be an object) all the game
  data is contained in the first item of the array*/
  game = gameFile[0]

  //set title of page
  document.title = game.title + ' - AsciiMason ' + versionNumber
  if(game.title == 'Default Game')document.title = 'AsciiMason ' + versionNumber;

  //INITIALIZE GAME DATA -------------------------------

  editMode = true; //tells the program whether the user is editing the game or playing the game

  //this variable stores the coordinates and quadrant of the chunk the player is currently in
  playerChunkCoord = globalToRelative(game.player.x, game.player.y)
  pPlayerPos = createVector(game.player.x, game.player.y)
  //game.world[0].chunks[0][0] = emptyChunk(); //uncomment this line to start a new file
  //game.world[1].chunks[0][0] = emptyChunk(); //uncomment this line to start a new file
  //game.world[2].chunks[0][0] = emptyChunk(); //uncomment this line to start a new file

  //Position of the 'camera', in tiles. This variable only affects the position of the worldCanvas.
  //The camera position lags only slightly behind the player position.
  cameraPosition = createVector(game.player.x, game.player.y)
  cameraMoving = false; //this bool tells us whether the camera is moving (when camera is not moving, display positions are rounded to look neater)
  moveWorldCanvas = true; //this bool is for debugging; set to false to stop worldCanvas from moving.

  framesSinceLastMovement = round(1/game.player.speed); /*when movementType is set to incremental, we need to keep track of how many
  frames it has been since the player's last movement so we don't move the player too quickly.*/
  framesHoldingActionKey = 0; //stores how many frames long the player has held down the action key for (0 when not holding key)
  pMovementKeysDown = movementKeysDown();

  pcursorpos = createVector(0, 0); //this variable for the previous global position of the world cursor just needs to be initialized
  newGameLoaded = true; //set to true on the one frame when a new game file is loaded in.

  //Variables for object painting...
  objectPainting =
  {
    'name': 'wall', //the name of the object template
    'layerName': 'Layer 1', //the name of the layer we're painting into
    'id':0, //the uniqueID of the object we're currently painting (this will automatically increase with each painted object)
  }
  worldCursorUsage = 'paint';
  //tells the program what the user is doing with the world cursor
  //this value can be 'paint', 'erase', 'colorChunk', or 'none'.
  colorChunk = [41, 135, 207, 255] //when worldCursorUsage is set to colorChunk, color the chunk the user is clicking to this color
  newChunkColor = [0,0,0,0] //when new chunks are added to the scene, what will their background color be?

  objectsToMove = [];
  /*this list is added to and emptied once per frame. Keeps track of all the objects
  that need to be moved and where to move them to, so that all objects can be deleted
  at once and then re-added at once.*/

  //a list of all the clickable buttons currently on screen
  uiButtons = []
  //a list of commands to execute, organized by when to execute them\

  objectsAlreadyColliding = [];
  //a list of object ids for objects the player has already collided with
  objectsAlreadyAction = [];
  //a list of object ids for objects the player has already used the action button with

  currentDialogueID = null; //this will be set to the id of whatever dialogue is currently being displayed
  addBranch = true; //in editMode, when this is set to true, clicking on a dialogue option will automatically add a new dialogue branch
  selectingOptionToEdit = false; //in editMode, when set to true, user will edit a dialogue option instead of selecting it.

  commandWindowOpen = false; //bool tells the program whether or not the command window is currently open
  lastCommandWindowText = '\n//write code here or insert code using the buttons below. Press "execute" to watch it happen!\n';

  commandFolders = {
    'root':
    [
      {
        'name':'► Object commands...',
        'command':'commandWindowFolder = commandFolders.objectCommands'
      },
      {
        'name':'► Player commands...',
        'command':'commandWindowFolder = commandFolders.player'
      },
      {
        'name':'► Inventory commands...',
        'command':'commandWindowFolder = commandFolders.inventory'
      },
      {
        'name':'► Dialogue Tree commands...',
        'command':'commandWindowFolder = commandFolders.dialogue'
      },
      {
        'name':'► Layer commands...',
        'command':'commandWindowFolder = commandFolders.layer'
      },
      {
        'name':'► World commands...',
        'command':'commandWindowFolder = commandFolders.world'
      },
      {
        'name':'► Sound/music commands...',
        'command':'commandWindowFolder = commandFolders.sound'
      },
      {
        'name':'► Add global command...',
        'command':'commandWindowFolder = commandFolders.global'
      }


    ],
    'objectCommands':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root'
      },
      {
        'name':'► Object template commands...',
        'command':"commandWindowFolder = commandFolders.objTemplate"
      },
      {
        'name':'► Individual object commands...',
        'command':"commandWindowFolder = commandFolders.individualObject"
      },

    ],
    'objTemplate':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.objectCommands'
      },
      {
        'name':'► Modify object template...',
        'command':'commandWindowFolder = commandFolders.modifyObjTemplate'
      },
      {
        'name':'+ New object template',
        'command':"game.objectTemplates[\'TEMPLATE_NAME\'] = {\n  \"character\":\"CHARACTER\", //the unicode character this object will display as\n  \"font\":\"default\",\n  \"color\":[255, 255, 255, 255], //RGBA values (A = alpha/opacity)\n  \"tags\":[],\n  \"inventorySettings\":\n  {\n    \'appears\':true,\n    \'appearsZero\':false,\n    \'canBeNegative\': false,\n    \"function\": \"\"\n  },\n  \"collisionFunction\": \"\",\n  \"actionButtonFunction\": \"\"\n};"
      },
      {
        'name':'- Delete object template',
        'command':"deleteObjectTemplate('TEMPLATE_NAME');"
      }
    ],
    'modifyObjTemplate':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.objTemplate;'
      },
      {
        'name':'► Change inventory settings...',
        'command':"commandWindowFolder = commandFolders.objTemplateInventory;"
      },
      {
        'name':'+ Collision function',
        'command':"game.objectTemplates['TEMPLATE_NAME'].collisionFunction = prompt('write your collision function in the provided textbox');"
      },
      {
        'name':'+ Action-button function',
        'command':"game.objectTemplates['TEMPLATE_NAME'].actionButtonFunction = prompt('write your action-button function in the provided textbox');"
      },
      {
        'name':'+ Inventory function',
        'command':"game.objectTemplates['TEMPLATE_NAME'].inventorySettings.function = prompt('write your inventory function in the provided textbox');"
      },
      {
        'name':'+ Tag',
        'command':"game.objectTemplates['TEMPLATE_NAME'].tags.push('TAG_HERE');"
      },
      {
        'name':'> Change color',
        'command':"game.objectTemplates['TEMPLATE_NAME'].color = [R, G, B, A]; /*enter RGBA values. A stands for alpha (opacity)*/"
      },
      {
        'name':'> Change font',
        'command':"game.objectTemplates['TEMPLATE_NAME'].font = 'FONT_HERE';"
      },
      {
        'name':'> Change character',
        'command':"game.objectTemplates['TEMPLATE_NAME'].character = 'CHARACTER_HERE';"
      }
    ],
    'objTemplateInventory':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.modifyObjTemplate;'
      },
      {
        'name':'+ Inventory function',
        'command':"game.objectTemplates['TEMPLATE_NAME'].inventorySettings.function = prompt('write your inventory function in the provided textbox');"
      },
      {
        'name':'> Change inventory settings',
        'command':"game.objectTemplates['TEMPLATE_NAME'].inventorySettings = {\n'appears':true,\n'appearsZero':false,\n'canBeNegative':false,\n'function':''\n}"
      }
    ],
    'individualObject':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.objectCommands;'
      },
      {
        'name':'► Reference an object...',
        'command':'commandWindowFolder = commandFolders.refObject;'
      },
      {
        'name':'+ Add object',
        'command':"addObject('TEMPLATE_NAME', 'LAYER_NAME', X_COORDINATE, Y_COORDINATE);"
      },
      {
        'name':'- Delete object',
        'command':"deleteObject(OBJECT_ID_HERE);"
      },
      {
        'name':'> Move object',
        'command':"moveObject(OBJECT_ID_HERE, 'NEW_LAYER_NAME', NEW_X_COORDINATE, NEW_Y_COORDINATE);"
      }
    ],
    'refObject':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.individualObject;'
      },
      {
        'name':'Reference object by ID',
        'command':'myObject = objectWithID(OBJECT_ID_HERE);'
      },
      {
        'name':'Reference object by tag',
        'command':'myObjects = objectsTagged(\'TAG_HERE\');\nfor(var i = 0; i < myObjects.length; i ++){\n\n//CODE_HERE\n\n}'
      },
      {
        'name':'Reference object by location',
        'command':"idAt(X_COORDINATE, Y_COORDINATE);"
      },
      {
        'name':'Reference object\'s self',
        'command': 'objectSelf.id'
      }
    ],
    'inventory':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root'
      },
      {
        'name':'+ Add/subtract from inventory',
        'command':"addToInventory('OBJECT_TEMPLATE_NAME', COUNT_HERE);"
      },
      {
        'name':'> Set object count',
        'command':"setInventoryCount('OBJECT_TEMPLATE_NAME', COUNT_HERE);"
      },
      {
        'name':'> Get object count',
        'command':"inventoryCount('OBJECT_TEMPLATE_NAME')"
      },
      {
        'name':'> Open inventory',
        'command':"openInventory();"
      },
      {
        'name':'> Close inventory',
        'command':"closeInventory();"
      },
      {
        'name':'> Empty out inventory',
        'command':'emptyInventory();'
      },
      {
        'name':'> Enable/disable inventory flashing',
        'command':'game.config.flashInventory = TRUE_OR_FALSE;'
      }
    ],
    'player':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root'
      },
      {
        'name':'> Teleport player',
        'command':'teleportPlayer(NEW_X_COORDINATE, NEW_Y_COORDINATE)'
      },
      {
        'name':'> Change player speed',
        'command':'game.player.speed = NEW_PLAYER_SPEED; /*speed is in tiles per frame*/'
      },
      {
        'name':'> Change player layer',
        'command':"game.player.layerName = 'NEW_LAYER_NAME';"
      },
      {
        'name':'> Change player character',
        'command':"game.player.character = 'NEW_CHARACTER_HERE';"
      },
      {
        'name':'> Change player color',
        'command':"game.player.color = [R, G, B, A]; /*enter RGBA values. A stands for alpha (opacity)*/;"
      },
      {
        'name':'> Change player font',
        'command':"game.player.font = 'NEW_FONT_HERE';"
      },
      {
        'name':'> Switch to continuous motion',
        'command':"game.config.movementType = 'continuous'"
      },
      {
        'name':'> Switch to incremental motion',
        'command':"game.config.movementType = 'incremental';\ngame.player.x = floor(game.player.x);\ngame.player.y = floor(game.player.y);"
      },
      {
        'name':'> Disable player movement',
        'command':"game.player.movementDisabled = true;"
      },
      {
        'name':'> Enable player movement',
        'command':"game.player.movementDisabled = false;"
      }
    ],
    'dialogue':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root;'
      },
      {
        'name':'> Start dialogue line',
        'command':'dialogueLine(DIALOGUE_ID_HERE);'
      },
      {
        'name':'> Exit dialogue',
        'command':'exitDialogue();'
      },
      {
        'name':'- Delete dialogue line',
        'command':'deleteDialogueLine(DIALOGUE_ID_HERE);'
      },
      {
        'name':"► [Log dialogueLines to the web console]",
        'command':"console.log(game.dialogueLines)"
      }
    ],
    'layer':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root;'
      },
      {
        'name':'► Modify layer...',
        'command':'commandWindowFolder = commandFolders.layerModify;'
      },
      {
        'name':'+ Add new layer',
        'command':"addLayer('LAYER_NAME', LAYER_INDEX, VISIBLE_TRUE_FALSE, COLLISION_TRUE_FALSE);"
      },
      {
        'name':'- Delete layer',
        'command':"deleteLayer('LAYER_NAME');"
      }
    ],
    'layerModify':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.layer;'
      },
      {
        'name':'> Change layer visibility',
        'command':"game.world[getLayerIndex('LAYER_NAME')].visible = TRUE_OR_FALSE;"
      },
      {
        'name':'> Change whether layer has collision',
        'command':"game.world[getLayerIndex('LAYER_NAME')].collisionEnabled = TRUE_OR_FALSE;"
      },
      {
        'name':'> Change layer position',
        'command':"changeLayerPosition('LAYER_NAME', NEW_LAYER_INDEX);"
      }
    ],
    'global':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root;'
      },
      {
        'name':'+ Add on-startup command',
        'command':'game.commands.onStartup.push( prompt("Write your startup command in the provided textbox") );'
      },
      {
        'name':'+ Add every-frame command',
        'command':'game.commands.everyFrame.push( prompt("Write your every-frame command in the provided textbox") );'
      },
      {
        'name':'+ Add every-player-movement command',
        'command':'game.commands.everyPlayerMovement.push( prompt("Write your every-player-movement command in the provided textbox") );'
      },
    ],
    'world':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root;'
      },
      {
        'name':'> Edit game title',
        'command':"game.title = 'TITLE_HERE';"
      },
      {
        'name':'> Zoom',
        'command':'zoomWorldView(NEW_TILE_SIZE_IN_PIXELS);'
      },
      {
        'name':'> Set world background color',
        'command':'/*Set RGBA color values (A = alpha/opacity)*/\ngame.config.backgroundColor = [R, G, B, A]; renderNearbyChunks();'
      },
      {
        'name':'> Set color for painting chunk backgrounds',
        'command':'colorChunk = [R, G, B, A]; /*Set RGBA color values (A = alpha/opacity)*/'
      },
      {
        'name':'> Set background color for new chunks',
        'command':"game.config.newChunkColor = [R, G, B, A]; /*Set RGBA color values (A = alpha/opacity) (newly added chunks will be this color)*/"
      }
    ],
    'sound':
    [
      {
        'name':'◄ Back',
        'command':'commandWindowFolder = commandFolders.root;'
      },
      {
        'name':'> Play sound',
        'command':'sounds["SOUND_NAME_HERE"].play();'
      },
      {
        'name':'> Loop sound',
        'command':'sounds["SOUND_NAME_HERE"].loop();'
      },
      {
        'name':'> Stop looping sound',
        'command':'sounds["SOUND_NAME_HERE"].stop();'
      }
    ]

  }

  commandWindowFolder = commandFolders.root; //this variable holds the command 'folder' that the user is currently browsing

  menuWindowOpen = false; //bool tells the program whether or not the menu window (controller button in upper right corner) is currently open

  inventoryObjectsFlashing = //stores data about the inventory item that's currently flashing
  {}
  /*{
    'objectTemplate': '',
    'frameCountdown':0,
  }*/

  //CREATE DISPLAY -------------------------------
  //canvasWidth = game.config.chunkSize * game.config.tileSize * (((game.config.chunkRenderRadius-1) * 2) + 1); //a canvas this size prevents user from seeing un-rendered chunks
  canvasWidth = 5; //this variable doesn't actually matter anymore because it's corrected by resizeCanvasThings();
  //gameCanvas = createCanvas(canvasWidth, canvasWidth)
  gameCanvas = createCanvas(canvasWidth, canvasWidth);

  worldCanvasWidth = game.config.chunkSize * game.config.tileSize * ((game.config.chunkRenderRadius * 2) + 1); //a canvas this size shows un-rendered chunks, but they will be blocked by uiCanvas
  worldCanvas = createGraphics(worldCanvasWidth, worldCanvasWidth)
  worldCanvasLocation = createVector(0,0) //where to display the worldCanvas (in pixels) relative to the gameCanvas

  worldCanvasDisplayObject = createGraphics (canvasWidth, canvasWidth)
  //the worldCanvas will actually be drawn into this object, which will then be drawn onto the main gameCanvas.

  uiCanvas = createGraphics(canvasWidth, canvasWidth)
  uiSpacing = 5; //spacing between ui objects in pixels
  uiBarSize = 150; //size of a ui bar in pixels
  uiTextSize = 16;


  //FILE INPUT -------------------------------
  /*create a button to input a file for the game.
  if no game file is inputted, game will be defaultGame.json by default.*/
  //createLoadFileInput();


  resizeCanvasThings(); //correct the x,y,w,h of all canvases, graphics elements, etc.


  /*
  Ex. when chunk render radius is set to 3:
  .........
  .xxxxxxx.
  .x22222x.
  .x21112x.
  .x21#12x.
  .x21112x.
  .x22222x.
  .xxxxxxx.
  .........
  # = current chunk, the chunk the player is currently in (rendered)
  1 = 1 chunk away from current chunk (rendered)
  2 = 2 chunks away from current chunk (rendered)
  x = 3 chunks away from current chunk (still rendered but not always visible on the canvas)
  . = 4+ chunks away from current chunk (not rendered)
  */

  //CONFIGURE DRAW SETTINGS -------------------------------
  configureDrawSettings();

  gameCanvas.background(0);
  updatePlayer();
  renderNearbyChunks();

  lagCheckBarWidth = 0; //a bar fills up at the bottom of the screen. If the bar lags, then the game is lagging.

}

function createLoadFileInput(){
  /*create a button to input a file for the game.
  if no game file is inputted, game will be defaultGame.json by default.*/
  gameFileInput = createFileInput(handleMyFile)
  positionLoadInputButton();
}

//DRAW FUNCTION --------------------------------------------------------------------------------

function draw() {

  handleNewGameLoad();

  if(editMode)updateObjectPainting();
  if(!editMode)worldCursorUsage = 'none';

  moveAllObjects(); //move all objects that were told to move via commands

  updatePlayer();

  //update the location of the camera (and therefore the location of the worldCanvas)
  //AFTER player updated but BEFORE drawing the worldCanvas
  if(moveWorldCanvas)updateCamera();

  updateUI();

  //draw a black background for the main gameCanvas
  gameCanvas.background(0);

  displayWorldCanvas();

  image(uiCanvas, 0, 0)

  if(!tempDisablePlayer())executeCommands();

  //displayLagBar();

}

function mouseClicked(){
  for(var i = 0; i < uiButtons.length; i ++){ //for every uiButton...
    var myButton = uiButtons[i] //name the button.
    if(collidePointRect(mouseX,mouseY,myButton.x,myButton.y, uiCanvas.textWidth(myButton.dispText) + (uiSpacing * 2), uiTextSize + (uiSpacing * 2) - 1 )){
      //if the user clicked on the button...
      if(typeof myButton.clickFunction == 'string'){ //if the button's clickFunction is a string...
        //var myFunction = new Function(button.clickFunction)
        //myFunction();
        executeCommand(myButton.clickFunction) //execute the command in the string
      } else {
        myButton.clickFunction(); //if the button's clickFunction is an actual function, call the function.
      }
    }
  }
}

function keyPressed(){
  if(keyCode == ESCAPE){
    if(commandWindowOpen)closeCommandWindow();
    if(menuWindowOpen)closeMenuWindow();
    if(editMode)currentDialogueID = null;
  }

}

function keyTyped(){
  if(key == ' ' && editMode)renderNearbyChunks();
  if(key == 'z'){
    var templates = Object.keys(game.objectTemplates)
    var newIndex = (getIndex(objectPainting.name, templates) - 1)
    if(newIndex < 0)newIndex = templates.length - 1;
    objectPainting.name = templates[newIndex]
  }
  if(key == 'x'){
    var templates = Object.keys(game.objectTemplates)
    var newIndex = (getIndex(objectPainting.name, templates) + 1)
    if(newIndex > templates.length -1)newIndex = 0;
    objectPainting.name = templates[newIndex]
  }
}

function displayLagBar(){
  //displaying this bar helps us figure out whether the game is lagging
  fill(255,50); noStroke();
  rect(0,0,lagCheckBarWidth, 30)
  lagCheckBarWidth = (lagCheckBarWidth + 1) % width;
}

//UPDATE WORLD FUNCTIONS --------------------------------------------------------------------------------

function handleNewGameLoad(){
  if(newGameLoaded){
    editMode = false;
    playerChunkCoord = globalToRelative(game.player.x, game.player.y) //recalculate which chunk the player is currently in
    pPlayerPos = createVector(game.player.x, game.player.y)
    cameraPosition = createVector(game.player.x, game.player.y) //reset the camera position

    //set title of page
    document.title = game.title + ' - AsciiMason ' + versionNumber
    if(game.title == 'Default Game')document.title = 'AsciiMason ' + versionNumber;

    //execute all startup commands
    for(var i = 0; i < game.commands.onStartup.length; i ++){
      executeCommand(game.commands.onStartup[i])
    }

    renderNearbyChunks();

    newGameLoaded = false //we're done setting up the game so we don't need to repeat these actions more than once
  }
}

function updatePlayer() {
  //increase the fraemcount since the player's last movement by 1.
  framesSinceLastMovement ++;

  var controls = game.config.playerControls
  var moveBy = game.player.speed;

  //if(keyIsDown(74))console.log(moveBy);
  if(!game.player.movementDisabled && !tempDisablePlayer()){ //only allow the player to move if movement is not disabled AND player is not in dialogue

    if(game.config.movementType == 'incremental'){
      /*when movementType is incremental, player moves by 1 tile
      at a rate of once every (1/game.player.speed) frames*/
      var moveBy = 1;
      var moved = false;
      if(keyIsDown(controls.up) && (!pMovementKeysDown.up || framesSinceLastMovement  >= round(1/game.player.speed)))
        {movePlayerTo(game.player.x, game.player.y - moveBy);moved = true;}
      if(keyIsDown(controls.down) && (!pMovementKeysDown.down || framesSinceLastMovement  >= round(1/game.player.speed)))
        {movePlayerTo(game.player.x, game.player.y + moveBy);moved = true;}
      if(keyIsDown(controls.left) && (!pMovementKeysDown.left || framesSinceLastMovement  >= round(1/game.player.speed)))
        {movePlayerTo(game.player.x - moveBy, game.player.y);moved = true;}
      if(keyIsDown(controls.right) && (!pMovementKeysDown.right || framesSinceLastMovement  >= round(1/game.player.speed)))
        {movePlayerTo(game.player.x + moveBy, game.player.y);moved = true;}

      if(moved)framesSinceLastMovement = 0;
    }
    if(game.config.movementType == 'continuous'){
      /*when movementType is continuous (default), player moves by game.player.speed
      once per frame.
      */
      var moveBy = game.player.speed;
      if(game.config.frameCorrectedSpeed)moveBy = game.player.speed * (60/frameRate());
      if(keyIsDown(controls.up))movePlayerTo(game.player.x, game.player.y - moveBy)
      if(keyIsDown(controls.down))movePlayerTo(game.player.x, game.player.y + moveBy)
      if(keyIsDown(controls.left))movePlayerTo(game.player.x - moveBy, game.player.y)
      if(keyIsDown(controls.right))movePlayerTo(game.player.x + moveBy, game.player.y)
    }
  }

  playerChangedPosition = false;

  //IF THE PLAYER CHANGED POSITION...
  if(game.player.x != pPlayerPos.x || game.player.y != pPlayerPos.y){
    //if the player's position has changed, we need to do a couple of things...
    playerChangedPosition = true;
    playerChunkCoord = globalToRelative(game.player.x, game.player.y) //recalculate which chunk the player is currently in

    //if the chunk the player is in does not exist, add it.
    if(!chunkExists(game.player.layerName, playerChunkCoord.chunkx, playerChunkCoord.chunky, false)
       && playerChunkCoord.chunkx >= 0 && playerChunkCoord.chunky >= 0){
      addChunk(playerChunkCoord.chunkx, playerChunkCoord.chunky)
      renderNearbyChunks();
    }

    //REDRAW TILES surrounding where player used to be -----------------------------------------------------
    refreshTilesSurroundingXY(pPlayerPos.x, pPlayerPos.y)
    //and also where player currently is
    refreshTilesSurroundingXY(game.player.x, game.player.y)

    //if the player has entered a new chunk, redraw the entire world canvas.
    var oldChunkCoord = globalToRelative(pPlayerPos.x, pPlayerPos.y)
    if(oldChunkCoord.chunkx != playerChunkCoord.chunkx || oldChunkCoord.chunky != playerChunkCoord.chunky){
      renderNearbyChunks();
    }
  }

  triggerCollisionFunctions();

  /*in the case of incremental motion, make it so that when player releases all movement keys,
  it enables them to move the player on the next frame. i.e. they can repeatedly tap a movement key
  to move faster than regular speed*/
  if(!movementKeyIsDown())framesSinceLastMovement = round(1/game.player.speed)

  pMovementKeysDown = movementKeysDown();

  if(keyIsDown(controls.action) && !tempDisablePlayer()){
    framesHoldingActionKey ++;
    if(framesHoldingActionKey == 25){
      var invOpen = game.player.inventory.open
      if(!invOpen){openInventory();}
      if(invOpen){closeInventory();}
    }
  } else {
    framesHoldingActionKey = 0;
  }

  pPlayerPos = createVector(game.player.x, game.player.y) //create a variable for the player's position *before* keyboard inputs were checked (it may not change)
}

function triggerCollisionFunctions(){
  //figure out which objects in the world player is colliding with so we can trigger their
  //on-collision functions
  var newObjectsAlreadyColliding = []
  var newObjectsAlreadyAction = [];
  for(var layerIndex = 0; layerIndex < game.world.length; layerIndex ++){
    //produce a list of all objects player is colliding with, including edge-to-edge collisions
    if(game.world[layerIndex].name == game.player.layerName) //if this layer contains player, count edge collisions
      var triggerCollisions = collisionsAt(game.player.x, game.player.y, game.world[layerIndex].name, true);

    else //otherwise, don't count edge collisions
      var triggerCollisions = collisionsAt(game.player.x, game.player.y, game.world[layerIndex].name, false);

    for(var i = 0; i < triggerCollisions.length; i ++){
      var theObj = triggerCollisions[i]
      var theObjTemplate = game.objectTemplates[theObj.name]
      //if this object has a collision function or action button function, set 'objectSelf' to it.
      if(theObjTemplate.collisionFunction != '' || theObjTemplate.actionButtonFunction != '')objectSelf = objectWithID(theObj.id); //USE THIS in executable commands to have an object reference itself

      if(!contains(theObj, objectsAlreadyColliding)){
        executeCommand(theObjTemplate.collisionFunction);
      }

      if(!contains(theObj, objectsAlreadyAction) && keyIsDown(game.config.playerControls.action) && !tempDisablePlayer()){
        executeCommand(theObjTemplate.actionButtonFunction);
      }

      newObjectsAlreadyColliding.push(theObj); //set up objectsAlreadyColliding for the next frame
      if(keyIsDown(game.config.playerControls.action))newObjectsAlreadyAction.push(theObj); //set up objectsAlreadyAction for the next frame

      //console.log(objectsAlreadyAction)

    }
  }
  objectsAlreadyColliding = newObjectsAlreadyColliding.slice(0);
  objectsAlreadyAction = newObjectsAlreadyAction.slice(0);
  //console.log(objectsAlreadyAction)
}

function tempDisablePlayer(){
  //returns whether or not player controls should be temporarily disabled right now based on context
  //(command window, dialogue window, etc.)
  return  (currentDialogueID != null || commandWindowOpen || menuWindowOpen)
}

function updateCamera(){
  /*
  updates the position of the camera (to follow the player) AND updates the display location of the worldCanvas
  */
  /*The LERP function moves the camera 10% closer to the player each frame (or whatever % is specified in game.config).
  It causes the camera to slow down the closer it gets to the player's position.*/
  lerpBy = game.config.cameraFollowSpeed;
  if(game.config.movementType == 'incremental')lerpBy = 1; //with incremental movement, the camera position should always equal the player position
  cameraPosition.x = lerp(cameraPosition.x, game.player.x, lerpBy)
  cameraPosition.y = lerp(cameraPosition.y, game.player.y, lerpBy)
  //if the cameraPosition is REALLY close to the player position, just set it to be the player's position.
  if(dist(cameraPosition.x, cameraPosition.y, game.player.x, game.player.y) < 0.05){
    cameraPosition = createVector(game.player.x, game.player.y);
    cameraMoving = false;
    refreshTilesSurroundingXY(game.player.x, game.player.y); //this helps fix anti aliasing
  } else cameraMoving = true;

  var cameraDispPosition = globalToDisplay(cameraPosition.x, cameraPosition.y)

  if(!cameraMoving)worldCanvasLocation = createVector(round(-cameraDispPosition.x + (gameCanvas.width/2)), round(-cameraDispPosition.y + (gameCanvas.height/2))) //this version rounds the canvas position to fix anti-aliasing
  else worldCanvasLocation = createVector(-cameraDispPosition.x + (gameCanvas.width/2), -cameraDispPosition.y + (gameCanvas.height/2))
}

function movePlayerTo(testx,testy){
  /*given a global x and y position in the world, move the player to that position
  but preventing collision with objects on the same layer as the player*/

  if(collisionsAt(testx, game.player.y, game.player.layerName, false).length == 0)game.player.x = testx; //if changing the x coordinate to the desired locations creates no collisions, then do it
  else game.player.x = round(game.player.x); //if changing the y coordinate does create collisions, rounding the x coordinate actually fixes this
  if(collisionsAt(game.player.x, testy, game.player.layerName, false).length == 0)game.player.y = testy; //if changing the y coordinate to the desired locations creates no collisions, then do it
  else game.player.y = round(game.player.y); //if changing the y coordinate does create collisions, rounding the y coordinate actually fixes this


  //all these lines do is fix floating point inaccuracies...
  game.player.x = round(game.player.x/game.player.speed) * game.player.speed;
  game.player.y = round(game.player.y/game.player.speed) * game.player.speed;

  //game.player.x = x; //these lines will ignore collisions completely
  //game.player.y = y;
}

function collisionsAt(x, y, layerName, countEdges){
  /*returns a list of objects (global coordinates only) the player would collide with if player was at (x, y)
  when countEdges is set to true, edge-to-edge rectangle collisions will be counted.*/

  if(!game.world[getLayerIndex(layerName)].collisionEnabled)return []; //if collision is not enabled in the layer we're checking, don't bother and return an empty list

  var flooredPlayerPos = createVector(floor(x),floor(y))

  /*this is a list of the nine tiles surrounding the player
  xxx
  xox     x = included in the list
  xxx     o = player (also included in the list)
  */
  var xymodifiers = [
    createVector(-1,-1),
    createVector(0,-1),
    createVector(1,-1),
    createVector(-1,0),
    createVector(0,0),
    createVector(1,0),
    createVector(-1,1),
    createVector(0,1),
    createVector(1,1)
  ]
  var collisions = [];
  for(var i =  0; i < xymodifiers.length; i ++){ //for every tile surrounding the player...
    var tilePosition = createVector(flooredPlayerPos.x + xymodifiers[i].x, flooredPlayerPos.y + xymodifiers[i].y) //get the global position of this tile
    var rTilePosition = globalToRelative(tilePosition.x, tilePosition.y) //get the relative position of this tile
    if( objectExists(layerName, rTilePosition.chunkx, rTilePosition.chunky, rTilePosition.objx, rTilePosition.objy, false) ){ //if an object exists at this tile, and not just a placeholder 0...
      if( (!countEdges && collideRectRectNoEdges(tilePosition.x,tilePosition.y, 1, 1, x, y, 1, 1)) ||
      (countEdges && collideRectRect(tilePosition.x,tilePosition.y, 1, 1, x, y, 1, 1) && (abs(tilePosition.x - game.player.x) < 1 || abs(tilePosition.y - game.player.y) < 1) ) ){ //AND the player is colliding with this object...
        var theObj = game.world[getLayerIndex(layerName)].chunks[rTilePosition.chunkx][rTilePosition.chunky].objects[rTilePosition.objx][rTilePosition.objy]
        var objTemplate = game.objectTemplates[theObj.name]
        collisions.push(theObj) //add the global position of this tile to the list of collisions
      }

    }
  }
  return collisions;
}

function movementKeyIsDown(){
  //returns whether or not the user is holding down a movement key
  //controls can be modified in game.config
  var controls = game.config.playerControls
  return keyIsDown(controls.up) || keyIsDown(controls.down) || keyIsDown(controls.left) || keyIsDown(controls.right)
}

function movementKeysDown(){
  /*
  returns an object of which player movement keys are currently down
  */
  var controls = game.config.playerControls

  return {
    'up': keyIsDown(controls.up),
    'down': keyIsDown(controls.down),
    'left': keyIsDown(controls.left),
    'right': keyIsDown(controls.right)
  }
}

function updateObjectPainting() {
  if(mouseIsPressed && !cursorOnUI() && !tempDisablePlayer()){
    var wcursorpos = worldCursorPosition(); //get the position of the world cursor *in the world*
    var relativewcursorpos = globalToRelative(wcursorpos.x, wcursorpos.y) //convert the world cursor position from global to relative to its chunk
    if( tileExists(objectPainting.layerName, relativewcursorpos.chunkx, relativewcursorpos.chunky, relativewcursorpos.objx, relativewcursorpos.objy, false) ){
      var theObj = game.world[getLayerIndex(objectPainting.layerName)].chunks[relativewcursorpos.chunkx][relativewcursorpos.chunky].objects[relativewcursorpos.objx][relativewcursorpos.objy]
      //if there is an object (and NOT a 0 placeholder) at the cursor's location...
      if(worldCursorUsage == 'paint' && (theObj == 0 || theObj.name != objectPainting.name) ){ //if world cursor is being used to paint objects AND the object here is different from the one we're painting
        addObject(objectPainting.name, objectPainting.layerName, wcursorpos.x, wcursorpos.y)
      }
      if(worldCursorUsage == 'erase'){
        deleteObject(theObj.id)
      }
    }
    if(worldCursorUsage == 'colorChunk'){ //if the worldCursorUsage is to paint chunks' background colors...
      if( chunkExists(objectPainting.layerName, relativewcursorpos.chunkx, relativewcursorpos.chunky, true) ){
        for(var i = 0; i < game.world.length; i ++){ //set the background color of this chunk at every layer
          game.world[i].chunks[relativewcursorpos.chunkx][relativewcursorpos.chunky].backgroundColor = colorChunk.slice(0);
        }
        renderNearbyChunks();
      }
    }
  }
}

function cursorOnUI(){
  //returns whether or not the cursor is hovering over a ui element
  //useful to prevent unintentional object painting on the world canvas

  //return true if player is hovering over dialogue box
  var x = uiSpacing
  var y = height -uiBarSize - (uiSpacing)
  var w = width - (uiSpacing * 2)
  var h = uiBarSize
  if(currentDialogueID != null && collidePointRect(mouseX, mouseY, x, y, w, h))return true;

  //return true if player is hovering over a button
  for(var i = 0; i < uiButtons.length; i ++){ //for every uiButton...
    var button = uiButtons[i] //name the button.
    if(collidePointRect(mouseX,mouseY,button.x,button.y, uiCanvas.textWidth(button.dispText) + (uiSpacing * 2), uiTextSize + (uiSpacing * 2) - 1 )){
      return true;
    }
  }
  return false;
}

//DRAW UI FUNCTIONS --------------------------------------------------------------------------------

function updateUI(){
  if(editMode)drawWorldCursor(); //the world cursor is actually drawn to the worldCanvas and not the uiCanvas, but it is included here for being a ui element

  uiCanvas.clear();

  //draw four boxes at the edges of the screen to block view of unrendered chunks
  /*halfChunkSizePx = round((game.config.tileSize * game.config.chunkSize)/2) + game.config.tileSize; //calculate the size of a chunk in pixels on the screen
  uiCanvas.noStroke();
  uiCanvas.fill(0);

  uiCanvas.rect(0,0,halfChunkSizePx,uiCanvas.height)
  uiCanvas.rect(width-halfChunkSizePx,0,halfChunkSizePx,uiCanvas.height)
  uiCanvas.rect(0,0,uiCanvas.width,halfChunkSizePx)
  uiCanvas.rect(0,height-halfChunkSizePx,uiCanvas.width,halfChunkSizePx)*/

  if(game.player.inventory.open)drawInventory(); //we don't need this box; rest of inventory is just buttons
  if(currentDialogueID != null){
    drawDialogueBox();
  }

  if(editMode)drawContextInfo();

  if(commandWindowOpen)drawCommandWindow();

  if(menuWindowOpen)drawMenuWindow();

  updateButtons();
  drawButtons();
}

function drawContextInfo(){
  uiCanvas.push();
  uiCanvas.textAlign(RIGHT,TOP); uiCanvas.fill(255,100); uiCanvas.noStroke();
  var dispText = ''

  //dispText += 'Layer: ' + objectPainting.layerName

  var cursorPos = worldCursorPosition();
  dispText += objectPainting.layerName + ' (' + cursorPos.x + ', ' + cursorPos.y + ')'

  var relCursorPos = globalToRelative(cursorPos.x, cursorPos.y)
  if(objectExists(objectPainting.layerName, relCursorPos.chunkx, relCursorPos.chunky, relCursorPos.objx, relCursorPos.objy, false) ){
    var theObj = game.world[ getLayerIndex(objectPainting.layerName) ].chunks[relCursorPos.chunkx][relCursorPos.chunky].objects[relCursorPos.objx][relCursorPos.objy]
    dispText += '\n' + theObj.name + ' ID ' + theObj.id
  }

  if(worldCursorUsage == 'paint')dispText += '\n Painting: ' + objectPainting.name;

  if(currentDialogueID != null){ //if we are displaying some dialogue, show the id of the dialogueLine
    dispText += '\nDialogue ID ' + currentDialogueID;
  }

  uiCanvas.text(dispText,width-uiSpacing, uiSpacing + (uiTextSize + uiSpacing * 3) * 4)
  uiCanvas.pop();
}

function drawWorldCursor(){

  //refresh the tile where the cursor was *last* frame
  refreshTile('all', pcursorpos.x, pcursorpos.y, false)
  var wcursorpos = worldCursorPosition();
  var dispPos = globalToDisplay(wcursorpos.x, wcursorpos.y)
  //draw the cursor to the world canvas (even though we're considering the cursor a UI element)
  worldCanvas.fill(255, 60)
  worldCanvas.rect(dispPos.x, dispPos.y, game.config.tileSize, game.config.tileSize)

  //the current position of the cursor will be the old position of the cursor next frame
  pcursorpos = createVector(wcursorpos.x, wcursorpos.y)
}

function worldCursorPosition(){
  /*Calculates the global position in the world of an object at the mouse's coordinates*/
  return canvasDisplayToGlobal(mouseX, mouseY)
}

function drawInventory(){
  uiCanvas.fill(0);
  uiCanvas.stroke(255); uiCanvas.strokeWeight(1);
  //dispPos = getDisplayWorldCanvasPosition();
  //uiCanvas.rect(dispPos.dispX, dispPos.dispY, 150, dispPos.dispW)
  //uiCanvas.rect(uiSpacing, uiSpacing, uiBarSize, height-uiBarSize - (uiSpacing*2))
  uiCanvas.line(uiSpacing, uiSpacing, uiSpacing + uiBarSize, uiSpacing)
  uiCanvas.line(uiSpacing, uiSpacing, uiSpacing, height-uiBarSize - (uiSpacing*2) )
  uiCanvas.line(uiSpacing, height-uiBarSize - (uiSpacing*2), uiSpacing + uiBarSize, height-uiBarSize - (uiSpacing*2))
}

function openInventory(){
  game.player.inventory.open = true;

}

function closeInventory(){
  game.player.inventory.open = false;
}

function drawDialogueBox(){
  uiCanvas.fill(0);
  uiCanvas.stroke(255); uiCanvas.strokeWeight(1);
  var x = uiSpacing
  var y = height -uiBarSize - (uiSpacing)
  var w = width - (uiSpacing * 2)
  var h = uiBarSize
  uiCanvas.rect(x, y, w, h)

  var dispText = game.dialogueLines[ getDialogueIndex(currentDialogueID) ].text;
  uiCanvas.fill(255); uiCanvas.noStroke();
  uiCanvas.text(dispText, x + uiSpacing, y + uiSpacing, w - (uiSpacing * 2), h - (uiSpacing * 2))
}

function getDialogueIndex(id){
  /*given the id of a dialogue line, return its index in the list of game.dialogueLines */
  var ret = null;
  for(var i = 0; i < game.dialogueLines.length; i ++){
    if(game.dialogueLines[i].id == id)ret = i;
  }
  return ret;
}

function drawCommandWindow(){
  uiCanvas.background(0,170)
}

function closeCommandWindow(){
  lastCommandWindowText = commandTextArea.value();
  commandTextArea.remove();
  commandWindowOpen = false;
}

function drawMenuWindow(){
  uiCanvas.background(0,170);

  var xFlush = floor(width/50);
  var yFlush = floor(height/4);
  uiCanvas.noStroke();uiCanvas.fill(255);
  uiCanvas.text(game.title + '\nMade with AsciiMason ' + versionNumber, xFlush, yFlush - (uiTextSize + uiSpacing)*3)
  var controls = game.config.playerControls
  var dispText = //"Load controls" text removed for safe version
  '\n\nControls:' +
  '\n   ↑  ' +
  '\n   ' + String.fromCharCode(controls.up)+ '  ' +
  '\n ←' + String.fromCharCode(controls.left)+ ' ' + String.fromCharCode(controls.right)+ '→' +
  '\n   ' + String.fromCharCode(controls.down)+ '  ' +
  '\n   ↓  ' +
  '\n\n' + String.fromCharCode(controls.action)+ ' = action button' +
  '\n    (Hold to open/close\n    inventory)'
  uiCanvas.text(dispText, xFlush + uiSpacing, yFlush + ((uiSpacing * 3) + uiTextSize) * 1)
}

function closeMenuWindow(){
  menuWindowOpen = false;
  gameFileInput.remove();
}

function updateButtons(){
  uiButtons = []

  if(!commandWindowOpen && !menuWindowOpen){

    if(game.player.inventory.open){
      var listNo = 0; //the current object's position in the list of inventory buttons
      var invObjects = game.player.inventory.objects
      for(var i = 0; i < invObjects.length; i ++){
        var obj = invObjects[i]
        if(inventoryObjectsFlashing[obj.name]){
          if(inventoryObjectsFlashing[obj.name] % 20 > 10)flash = true;
          else flash = false;
          inventoryObjectsFlashing[obj.name] --;
          if(inventoryObjectsFlashing[obj.name] == 0)delete inventoryObjectsFlashing[obj.name];
        } else flash = false;
        if(game.objectTemplates[obj.name].inventorySettings.appears){
          uiButtons.push({
            'name': 'inventory-' + obj.name,
            'element': 'inventory', //which ui element does this button belong to?
            'dispText': game.objectTemplates[obj.name].character + ' ' + obj.name + ' (' + obj.count + ')',
            'flash': flash, //inventory-specific value; when set to true, button displays as bright
            'x': uiSpacing * 2,
            'y': uiSpacing * 2 + (listNo * (uiTextSize + (uiSpacing*2)) ),
            'clickFunction': game.objectTemplates[obj.name].inventorySettings.function
          })
          listNo ++;
        }
      }
    }

    if(currentDialogueID != null){ //if a dialogueLine is currently being displayed...
      //display each option for this dialogueLine as a button
      var options = game.dialogueLines[ getDialogueIndex(currentDialogueID) ].options
      var optionsToDisplay = [];

      for(var i = 0; i < options.length; i ++){ //for every dialogue option...
        var requirementMet = function(){return true}; //if the option has no requirement, it gets a free pass.
        if(options[i].requirement != ''){ //if this option has a requirement...
          requirementMet = Function('return ' + options[i].requirement )
        }
        if(requirementMet()){ //if the requirement for this dialogue option was met, add it to the list of buttons to display.
          optionsToDisplay.push({
            'text':options[i].text,
            'function':options[i].function,
            'nextDialogue':options[i].nextDialogue,
            'requirement':options[i].requirement,
            'originalIndex':i
          })
        }
      }

      var lastIndex = optionsToDisplay.length;

      for(var i = 0; i < optionsToDisplay.length; i ++){ //display all options that have met their requirement
        //give this option an easy variable name
        var thisOption = optionsToDisplay[i]
        //var clickFunction is a combination of all the things this button will do (including triggering the option's click function)
        var clickFunction = '';

        //if selecting an option to edit, add the editing of this option to the click function.
        if(editMode && selectingOptionToEdit){
          var thisDIndex = getDialogueIndex(currentDialogueID)
          var thisOIndex = thisOption.originalIndex
          //behold, an unholy abomination
          clickFunction += '\nvar newText = prompt("Edit this option\'s text", "' + escapeString(thisOption.text) + '")'
          clickFunction += "\nif(newText != '' && newText != null)"
          clickFunction += "\n  game.dialogueLines[" + thisDIndex + "].options[" + thisOIndex + "].text = newText;"

          clickFunction += '\nvar newFunction = prompt("Edit this option\'s function", "' + escapeString(thisOption.function) + '")'
          clickFunction += '\nif(newFunction != "" && newFunction != null)'
          clickFunction += "\n  game.dialogueLines[" + thisDIndex + "].options[" + thisOIndex + "].function = newFunction;"

          clickFunction += '\nvar newRequirement = prompt("Edit this option\'s requirement", "' + escapeString(thisOption.requirement)+ '")'
          clickFunction += '\nif(newRequirement != "" && newRequirement != null)'
          clickFunction += "\n  game.dialogueLines[" + thisDIndex + "].options[" + thisOIndex + "].requirement = newRequirement;"

          var idTextToAdd = '';
          if(thisOption.nextDialogue != null)idTextToAdd = thisOption.nextDialogue;
          clickFunction += '\nvar newNextID = prompt("Choose the ID of the dialogueLine that this option leads to", "' + idTextToAdd + '")'
          clickFunction += '\nif(newNextID != "" && newNextID != null)'
          clickFunction += "\n  game.dialogueLines[" + thisDIndex + "].options[" + thisOIndex + "].nextDialogue = newNextID;"

          clickFunction += "\n if(newText == ''){"
          clickFunction += "deleteDialogueOption(" + currentDialogueID + ", " + thisOption.originalIndex + ")"
          clickFunction += "\n }"

          clickFunction += '\nselectingOptionToEdit = false;'
        }

        //if not selecting an option to edit, add the button's actual in-game functions
        if(!selectingOptionToEdit){
          clickFunction += '\n' + thisOption.function; //the function of the option
          if(thisOption.nextDialogue != null && !thisOption.function.includes('exitDialogue()'))
            clickFunction += '\ndialogueLine(' + thisOption.nextDialogue + ');'; //the next line of dialogue

          //also add code for inserting the next dialogue line via auto-add branch
          if(editMode && addBranch && thisOption.nextDialogue == null && !thisOption.function.includes('exitDialogue()') ){
            clickFunction += '\n var newDialogueText = prompt("Write the text of the next dialogue line") '
            clickFunction += "\n if(newDialogueText != '' && newDialogueText != null) {"
            clickFunction += "\n var newID = newDialogueID();"
            clickFunction += "\n addDialogueLine(newID, newDialogueText);"
            clickFunction += "\n game.dialogueLines[" + getDialogueIndex(currentDialogueID) + "].options[" + thisOption.originalIndex + "].nextDialogue = newID;"
            clickFunction += "\n dialogueLine(newID);"
            clickFunction += "\n }"
          }
        }

        //if(keyIsDown(74))console.log(clickFunction);

        //add the actual button for this option
        uiButtons.push({
          'name':'dialogueOption-' + i,
          'element':'dialogueBox',
          'dispText':thisOption.text,
          'x': uiSpacing * 2,
          'y': height - (uiSpacing * 2) - ( (lastIndex - i) * (uiTextSize + (uiSpacing*2) ) ) ,
          'clickFunction': clickFunction
        })
        /*var clickFunction = ''
        if(editMode && addBranch && getDialogueIndex(optionsToDisplay[i].nextDialogue) == null && !optionsToDisplay[i].function.includes('exitDialogue()') ){ //if in editMode, we are supposed to automatically add new branches, add that as a consequence for this buton
          var newID = newDialogueID();
          clickFunction +=
          '\naddDialogueLine('+ newID + ', prompt("Write the text of the next dialogue line")) \ngame.dialogueLines['+getDialogueIndex(currentDialogueID)+'].options[' + optionsToDisplay[i].originalIndex + '].nextDialogue = '+newID+'\ndialogueLine('+newID+')'
          //console.log(clickFunction)
        }

        clickFunction += "\n" + optionsToDisplay[i].function

        uiButtons.push({
          'name': 'dialogueOption-' + i,
          'element': 'dialogueBox',
          'dispText': optionsToDisplay[i].text,
          'x': uiSpacing * 2,
          'y': height - (uiSpacing * 2) - ( (lastIndex - i) * (uiTextSize + (uiSpacing*2) ) ) ,
          'clickFunction': clickFunction + '\ndialogueLine(' + optionsToDisplay[i].nextDialogue + ')'
        })*/
      }

      if(editMode){ //if user is in edit mode...
        //add a button that toggles whether or not new branches are automatically added
        if(addBranch)var dispText = 'Auto-add branch: On';
        else var dispText = 'Auto-add branch: Off';
        uiButtons.push({
          'name':'dialogueEdit-toggleAddNew',
          'element': 'dialogueBox',
          'dispText': dispText,
          'x': uiSpacing,
          'y': height - uiBarSize - (uiSpacing * 4) - (uiTextSize),
          'clickFunction':"addBranch = !addBranch"
        })

        //add a button that adds a new option
        uiButtons.push({
          'name':'dialogueEdit-addOption',
          'element':'dialogueBox',
          'dispText': '+ Add option',
          'x': uiSpacing,
          'y': height - uiBarSize - (uiSpacing * 4) - ((uiTextSize + (uiSpacing) ) * 2),
          'clickFunction': function(){
            var cDialogue = game.dialogueLines[ getDialogueIndex(currentDialogueID) ]
            var text = prompt('Type the text of your new option')
            //var theFunction = prompt('Type the function of this option (leave blank for no function)')
            //var requirement = prompt ('Type the requirement of this option (leave blank for no requirement)')
            if(text == null)text = '';
            //if(theFunction == null)theFunction = '';
            //if(requirement == null)requirement = '';
            if(text != ''){
              cDialogue.options.push(
                {
                  'text': text,
                  'function': '', //theFunction,
                  'requirement': '', //requirement,
                  'nextDialogue': null,
                }
              )
            }
          }
        })

        //add a button that toggles whether the user is editing an option instead of selecting it
        var dispText = 'Edit Option'
        if(selectingOptionToEdit)dispText = 'Select an option...'
        uiButtons.push({
          'name':'dialogueEdit-editOption',
          'element':'dialogueBox',
          'dispText':dispText,
          'x':(uiSpacing*4) + uiCanvas.textWidth('+ Add option'),
          'y': height - uiBarSize - (uiSpacing * 4) - ((uiTextSize + (uiSpacing) ) * 2),
          'clickFunction': function(){
            selectingOptionToEdit = !selectingOptionToEdit;
          }
        })
      }

    }

    if(editMode){
      //add a button for displaying/changing the layer we're painting in
      uiButtons.push({
        'name': 'layerToggler',
        'element': 'world',
        'dispText': objectPainting.layerName,
        'x':width- (uiSpacing*3) - uiCanvas.textWidth(objectPainting.layerName),
        'y':uiSpacing + (uiTextSize + uiSpacing * 3),
        'clickFunction':function(){
          var newIndex = (getLayerIndex(objectPainting.layerName) + 1) % game.world.length;
          objectPainting.layerName = game.world[newIndex].name;
        }
      })


      if(currentDialogueID == null){ //if a dialogue is NOT being displayed...

        //add a button for opening the command window
        //commented out for the non-command (safe) version
        /*uiButtons.push({
          'name':'writeCommand',
          'element':'world',
          'dispText':'>>',
          'x':width- (uiSpacing*3) - uiCanvas.textWidth('>>'),
          'y':height - (uiSpacing*3) - uiTextSize,
          'clickFunction':function(){
            commandTextArea = createElement('textarea', lastCommandWindowText)
            canvasPosition(commandTextArea, gameCanvas, uiSpacing, uiSpacing)
            commandTextArea.size(width - (uiSpacing*3),height/3)
            commandWindowOpen = true;
          }
        })*/

        //add a button for adding new dialogueLines
        //commented out for the non-command (safe) version
        /*uiButtons.push({
          'name':'newDialogue',
          'element':'world',
          'dispText':'+ Dialogue',
          'x':width- (uiSpacing*3) - uiCanvas.textWidth('+ Dialogue'),
          'y':height - (((uiSpacing*3) + uiTextSize) * 2),
          'clickFunction':function(){
            var newID = newDialogueID();
            var newText = prompt("Write the text of the first dialogue line")
            if(newText != null && newText != ''){
              addDialogueLine(newID, newText);
              currentDialogueID = newID;
            }
          }
        })*/
      }


      //add a button for changing worldCursorUsage
      var uses = ['none', 'paint', 'erase', 'colorChunk']
      uiButtons.push({
        'name':'worldCursorUsageToggler',
        'element':'world',
        'dispText': 'cursor: ' + worldCursorUsage,
        'x':width- (uiSpacing*3) - uiCanvas.textWidth('cursor: ' + worldCursorUsage),
        'y':uiSpacing + (uiTextSize + uiSpacing * 3) * 2,
        'clickFunction':function(){
          var newIndex = (getIndex(worldCursorUsage, uses) + 1) % uses.length
          worldCursorUsage = uses[newIndex]
        }
      })

      if(worldCursorUsage == 'paint'){
        //add left/right buttons for browsing which object we're painting
        var templates = Object.keys(game.objectTemplates)
        uiButtons.push({
          'name':'objPainting-Left',
          'element':'world',
          'dispText': '<',
          'x':width- (uiSpacing*3) - uiCanvas.textWidth(worldCursorUsage),
          'y':uiSpacing + (uiTextSize + uiSpacing * 3) * 3,
          'clickFunction':function(){
            var newIndex = (getIndex(objectPainting.name, templates) - 1)
            if(newIndex < 0)newIndex = templates.length - 1;
            objectPainting.name = templates[newIndex]
          }
        })

        uiButtons.push({
          'name':'objPainting-Right',
          'element':'world',
          'dispText': '>',
          'x':width- (uiSpacing*3) - uiCanvas.textWidth('>'),
          'y':uiSpacing + (uiTextSize + uiSpacing * 3) * 3,
          'clickFunction':function(){
            var newIndex = (getIndex(objectPainting.name, templates) + 1)
            if(newIndex > templates.length - 1)newIndex = 0;
            objectPainting.name = templates[newIndex]
          }
        })
      }

    }

    //add a button for accessing the game menu (whether in editMode or not)
    uiButtons.push({
      'name':'menu',
      'element':'world',
      'dispText':'h', //'L' displays a controller when we use the correct font
      'x':width- (uiSpacing*3) - uiCanvas.textWidth('h') - 5,
      'y':uiSpacing,
      'clickFunction':function(){
        menuWindowOpen = true;
        //file input commented out for safe version
        //createLoadFileInput();
      }
    })
  }

  /*if(commandWindowOpen){

    //add a button for closing the command window
    uiButtons.push({
      'name':'closeCommandWindow',
      'element':'commandWindow',
      'dispText':'Back',
      'x':width- (uiSpacing*3) - uiCanvas.textWidth('Back'),
      'y':height - (uiSpacing*3) - uiTextSize,
      'clickFunction':function(){
        closeCommandWindow();
      }
    })

    //add a button for executing the command
    uiButtons.push({
      'name':'executeCommandWindow',
      'element':'commandWindow',
      'dispText':'Execute',
      'x':width- (uiSpacing*3) - uiCanvas.textWidth('Execute'),
      'y':height*(1/3) + (uiSpacing*3),
      'clickFunction':function(){
        executeCommand( commandTextArea.value() )
        closeCommandWindow();
      }
    })

    //add a button for clearing the textArea
    uiButtons.push({
      'name':'clearCommandTextArea',
      'element':'commandWindow',
      'dispText':'Clear',
      'x':width- (uiSpacing*6) - uiCanvas.textWidth('Execute') - uiCanvas.textWidth('Clear'),
      'y':height*(1/3) + (uiSpacing*3),
      'clickFunction':function(){
        commandTextArea.value('')
      }
    })

    var columnMax = floor( (height*(2/3))/( (uiSpacing*3) + uiTextSize ) )
    var columnSpacing = 200; //px

    for(var i = 0; i < commandWindowFolder.length; i ++){

      var clickFunction = ''
      var thisButton = commandWindowFolder[i]
      if(thisButton.name.startsWith('►') || thisButton.name.startsWith('◄'))
        var clickFunction = thisButton.command;
      else var clickFunction = function(){insertAtCursor(commandTextArea.elt, this.commandToInsert)}
      uiButtons.push({
        'name':'commandButton-' + thisButton.name,
        'commandToInsert': '\n' + thisButton.command + '\n', //only buttons of this type have this property
        'element':'commandWindow',
        'dispText':thisButton.name,
        'x': uiSpacing + (200 * floor(i/columnMax)) ,
        'y':((height*(1/3))+(uiSpacing*6)+uiTextSize) + ((uiSpacing*3)+uiTextSize) * (i % columnMax) ,
        'clickFunction':clickFunction
      })
    }

  }*/ //commented out for safe version

  if(menuWindowOpen){
    var xFlush = floor(width/50)
    var yFlush = floor(height/4);
    //add a button for closing the menuWindowScreen
    uiButtons.push({
      'name':'menu-back',
      'element':'menuWindow',
      'dispText':'Back',
      'x': width- (uiSpacing*3) - uiCanvas.textWidth('Back'),
      'y': uiSpacing,
      'clickFunction':function(){
        closeMenuWindow();
      }
    })

    //new game, save game, and help buttons commented out for the safe (non-command) version
    /*
    //add a button for creating a new game
    uiButtons.push({
      'name':'menu-newGame',
      'element':'menuWindow',
      'dispText':'New Game',
      'x':xFlush,
      'y':yFlush,
      'clickFunction':function(){
        loadStrings('defaultGame.hjson', setGameData) //set the game data to defaultGame.hjson by default

      }
    })

    //add a button for saving game progress
    uiButtons.push({
      'name':'menu-saveGame',
      'element':'menuWindow',
      'dispText':'Save Game',
      'x': xFlush,
      'y': yFlush + ((uiSpacing * 3) + uiTextSize),
      'clickFunction':function(){
        var myFileName = prompt('Name your save file', game.title)
        if(myFileName != null)saveJSON([game], myFileName);
      }
    })

    //help button for taking the user to the AsciiMason wiki
    uiButtons.push({
      'name':'menu-Help',
      'element':'menuWindow',
      'dispText':'About/help',
      'x': xFlush,
      'y': yFlush + ((uiSpacing * 3) + uiTextSize) * 12,
      'clickFunction':function(){
        window.open("https://asciimason.fandom.com/wiki/Text_Mason_Wiki", "_blank")
      }
    })
    */
    //add a button for toggling edit mode
    if(editMode)var dispText = 'Switch to Play mode';
    else var dispText = 'Switch to Edit mode';
    uiButtons.push({
      'name':'menu-toggleEdit',
      'element':'menuWindow',
      'dispText':dispText,
      'x': xFlush,
      'y': yFlush + ((uiSpacing * 3) + uiTextSize) * 11,
      'clickFunction':function(){
        editMode = !editMode
        closeMenuWindow();
      }
    })
  }

}

function drawButtons(){
  /*uiButtons = [
    {
      'name': 'jeff',
      'dispText': 'hello',
      'x':0,
      'y':30,
      'clickFunction': function(){console.log('hi')}
    }
  ]*/
  for(var i = 0; i < uiButtons.length; i ++){
    var button = uiButtons[i]
    if(button.name == 'menu'){uiCanvas.push();uiCanvas.textFont(fonts.creatures);uiCanvas.textSize(32)}
    uiCanvas.fill(60);
    if(button.flash)uiCanvas.fill(100);
    if(collidePointRect(mouseX,mouseY,button.x,button.y,uiCanvas.textWidth(button.dispText) + (uiSpacing * 2), uiTextSize + (uiSpacing * 2) - 1 ))uiCanvas.fill(90);
    uiCanvas.noStroke();
    uiCanvas.rect(button.x, button.y, uiCanvas.textWidth(button.dispText) + (uiSpacing * 2), /*uiCanvas.textAscent(button.dispText)*/uiTextSize + (uiSpacing * 2) )
    uiCanvas.fill(255);
    uiCanvas.text(button.dispText, button.x + uiSpacing, button.y + uiSpacing)
    if(button.name == 'menu'){uiCanvas.pop();}
  }
}



//DRAW WORLD FUNCTIONS --------------------------------------------------------------------------------

function renderNearbyChunks(){
  //one function to render all objects in all nearby chunks.
  //this function will also probably handle collision

  //first, clear the worldCanvas
  worldCanvas.background(game.config.backgroundColor);

  //calculate the range of chunks we will be rendering (only chunks within the chunkRenderRadius)
  //prevent the minimums and maximums from going below 0 or going above the list of chunks
  minX = (playerChunkCoord.chunkx) - game.config.chunkRenderRadius;
  if(minX < 0)minX = 0;

  maxX = (playerChunkCoord.chunkx) + game.config.chunkRenderRadius;
  if(maxX > game.world[0].chunks.length - 1)maxX = game.world[0].chunks.length - 1;

  minY = (playerChunkCoord.chunky) - game.config.chunkRenderRadius;
  if(minY < 0)minY = 0;

  maxY = (playerChunkCoord.chunky) + game.config.chunkRenderRadius;
  if(maxY > game.world[0].chunks[0].length - 1)maxY = game.world[0].chunks[0].length - 1;

  //game.world is a list of layers. Run through the list...
  for(var layerIndex = 0; layerIndex < game.world.length; layerIndex ++){ //for every layer...
    //CURRENT LAYER

    var currentLayer = game.world[layerIndex]

    if(currentLayer.visible){ //only draw the layer if the layer's visibility is set to true
      var chunkRenderingCount = 0;
      for(var chunkx = minX; chunkx <= maxX; chunkx ++){ //for every chunkColumn in this layer...
        for(var chunky = minY; chunky <= maxY; chunky ++){ //for every chunk in this chunkColumn...
          //CURRENT CHUNK

          ///draw a box around this chunk ONLY if this is the 0th layer
          if(layerIndex == 0){
            var chunkCorner = chunkUpperRightCorner(chunkx, chunky) //get the global position of the corner of this chunk
            var chunkCornerDispPosition = globalToDisplay(chunkCorner.x, chunkCorner.y) //get the display coordinates of the corner of this chunk
            var w = game.config.chunkSize * game.config.tileSize;
            if(editMode){worldCanvas.stroke(255); worldCanvas.strokeWeight(0.5);} //if in edit mode, draw a white border around the chunk
            if(!editMode){worldCanvas.noStroke();} //if not in edit mode, don't draw a border around the chunk
            worldCanvas.fill(currentLayer.chunks[chunkx][chunky].backgroundColor);
            worldCanvas.rect(chunkCornerDispPosition.x, chunkCornerDispPosition.y, w, w) //draw a rectangle at the display coordinates
          }

          if(currentLayer.chunks[chunkx][chunky].empty == false){ //if this chunk contains *any* objects at all... (we check this using a flag that is modified once an object is added to the chunk)
            worldCanvas.noStroke();
            for(var objx = 0; objx < currentLayer.chunks[chunkx][chunky].objects.length; objx ++){ //for every objectColumn in this chunk...
              for(var objy = 0; objy < currentLayer.chunks[chunkx][chunky].objects[objx].length; objy++){ //for every object in this objectColumn...
                //CURRENT OBJECT
                var cObject = currentLayer.chunks[chunkx][chunky].objects[objx][objy] //give an easy variable name to the object we're currently checking
                if(cObject != 0){ //if the object is an actual object and not a 0 placeholder
                  var cObjectTemplate = game.objectTemplates[cObject.name] //give an easy variable name to the template of this object
                  var objectGlobalPosition = relativeToGlobal(chunkx,chunky,objx,objy); //get the global position of this object rather than the relative position
                  drawObject(cObjectTemplate, objectGlobalPosition.x, objectGlobalPosition.y) //draw the object to the worldCanvas
                }
              }
            }
          }
          chunkRenderingCount ++;
        }
      }
      if(game.player.layerName == currentLayer.name)drawPlayer();
    }
  }
  //console.log(chunkRenderingCount);

  //image(worldCanvas, 0, 0)
}

function refreshTile(layerIndex, globalx, globaly, drawPlayerArg){
  /*given the global x and y coordinates of a tile,
  redraw the tile at the given layer (including redrawing the player if necessary)
  if layerIndex is set to the string 'all', it will refresh for all tiles
  */
  if(layerIndex != 'all' && game.world[layerIndex].visible){
    var tileRelativeLocation = globalToRelative(globalx, globaly) //convert the tile's global location to a relative location so we can check whether it exists

    layerChecking = game.world[layerIndex] //give the layer we're updating an easy variable name
    //if this tile is in a chunk, erase what's in the tile by overwriting it with a rectangle of the chunk's background color
    if( layerIndex == 0 && chunkExists(layerChecking.name, tileRelativeLocation.chunkx, tileRelativeLocation.chunky) ){
      var tileDisplayLocation = globalToDisplay(globalx, globaly)
      var tilesChunk = layerChecking.chunks[tileRelativeLocation.chunkx][tileRelativeLocation.chunky]
      //first draw a rectangle of the game's default background color (in case the chunk's background color is semi-transparent)
      worldCanvas.fill(game.config.backgroundColor)
      worldCanvas.rect(tileDisplayLocation.x, tileDisplayLocation.y, game.config.tileSize, game.config.tileSize)
      //then draw a rectangle of this chunk's specific background color
      worldCanvas.fill(tilesChunk.backgroundColor)
      worldCanvas.rect(tileDisplayLocation.x, tileDisplayLocation.y, game.config.tileSize, game.config.tileSize)
      //bonus rectangle
      //worldCanvas.fill(255,50)
      //worldCanvas.rect(tileDisplayLocation.x, tileDisplayLocation.y, game.config.tileSize, game.config.tileSize)
    }

    if( layerIndex == 0 && !chunkExists(layerChecking.name, tileRelativeLocation.chunkx, tileRelativeLocation.chunky) ){
      var tileDisplayLocation = globalToDisplay(globalx, globaly)
      //first draw a rectangle of the game's default background color (in case the chunk's background color is semi-transparent)
      worldCanvas.fill(game.config.backgroundColor)
      worldCanvas.rect(tileDisplayLocation.x, tileDisplayLocation.y, game.config.tileSize, game.config.tileSize)

    }

    //if an objects exists at the location of this tile, draw it.
    if( objectExists(layerChecking.name, tileRelativeLocation.chunkx, tileRelativeLocation.chunky, tileRelativeLocation.objx, tileRelativeLocation.objy )){
      var theObject = layerChecking.chunks[tileRelativeLocation.chunkx][tileRelativeLocation.chunky].objects[tileRelativeLocation.objx][tileRelativeLocation.objy]
      if(theObject != 0){ //if the object is an actual object and not a 0 placeholder...
        var theObjectTemplate = game.objectTemplates[theObject.name]
        drawObject(theObjectTemplate, globalx, globaly)
      }
    }

    if(drawPlayerArg && game.player.layerName == layerChecking.name){drawPlayer()} //draw the player if the layer we're checking contains the player
  }

  if(layerIndex == 'all'){ //if layerIndex is 'all', call this function again for every layer.
    for(var i = 0; i < game.world.length; i ++)refreshTile(i, globalx, globaly, drawPlayerArg);
  }

}

function refreshTilesSurroundingXY(objx, objy){
  //get the coordinates of where an object would be if it were at the player's old global location
  relativeFloored = globalToRelative(objx,objy)
  relativeFloored.objx = floor(relativeFloored.objx); relativeFloored.objy = floor(relativeFloored.objy);

  var objLocationsToCheck = [
    createVector(0,0),
    createVector(0,1),
    createVector(1,0),
    createVector(1,1)
  ] //these are the four tiles surrounding the player we need to update ( (0,0) = player, (1,1) = diagonal to player )
  worldCanvas.textSize(game.config.tileSize);
  worldCanvas.noStroke();

  for(var layerIndex = 0; layerIndex < game.world.length; layerIndex ++){ //for every layer...
    for(var i = 0; i < objLocationsToCheck.length; i ++){ //for every tile surrounding the player...
      var xymodifiers = objLocationsToCheck[i] //give the xymodifier of this tile an easy variable name.
      var tileGlobalLocation = createVector(floor(objx) + xymodifiers.x, floor(objy) + xymodifiers.y) //apply the modifier to pPlayerPos
      refreshTile(layerIndex, tileGlobalLocation.x, tileGlobalLocation.y, true); //refresh (redraw) the tile, including player
    }
  }
  /*for(var i = 0; i < objLocationsToCheck.length; i ++){ //for every tile surrounding the player...
    var xymodifiers = objLocationsToCheck[i] //give the xymodifier of this tile an easy variable name.
    var tileGlobalLocation = createVector(floor(objx) + xymodifiers.x, floor(objy) + xymodifiers.y) //apply the modifier to pPlayerPos
    refreshTile(myLayerIndex, tileGlobalLocation.x, tileGlobalLocation.y); //refresh (redraw) the tile
  }*/
}

function drawObject(objectTemplate, objx, objy){
  //draws an object of type objectTemplate at the GLOBAL POSITION objx, objy
  //note that 'objx' and 'objy' here refer to the object's global position, not just the position relative to the chunk it's in
  var dispPosition = globalToDisplay(objx, objy)
  worldCanvas.fill(objectTemplate.color)
  worldCanvas.textFont(fonts[objectTemplate.font]);
  worldCanvas.textAlign(LEFT,BOTTOM)
  worldCanvas.textSize(game.config.tileSize)
  if(objectTemplate.font == 'creatures')worldCanvas.textSize(game.config.tileSize * 2);
  worldCanvas.text(objectTemplate.character, dispPosition.x, dispPosition.y + game.config.tileSize)

}

function drawPlayer(){
  //draw the player to the canvas
  worldCanvas.noStroke();
  var dispPosition = globalToDisplay(game.player.x, game.player.y)
  worldCanvas.fill(game.player.color)
  worldCanvas.textFont(fonts[game.player.font])
  worldCanvas.textAlign(LEFT,BOTTOM)
  worldCanvas.textSize(game.config.tileSize)
  if(game.player.font == 'creatures')worldCanvas.textSize(game.config.tileSize * 2);
  worldCanvas.text(game.player.character, dispPosition.x, dispPosition.y + game.config.tileSize)
}

function displayWorldCanvas(){
  //draw the world canvas

  //this is among the ugliest, jankiest code I have ever written. Please turn back now

  worldCanvasDisplayObject.background(0); //clear the graphics object that actually displays the worldCanvas
  worldCanvasDisplayObject.image(worldCanvas, worldCanvasLocation.x, worldCanvasLocation.y) //display the worldCanvas on that object
  var w = worldCanvasDisplayObject.width
  var chunkSizePx = game.config.chunkSize * game.config.tileSize;
  var chunkRadiusPx = game.config.chunkSize * game.config.tileSize * (game.config.chunkRenderRadius) - (game.config.tileSize * 2)

  //image(worldCanvasDisplayObject, w/4, w/4, (w/2), (w/2), (width/2) - (w/4), (height/2) - (w/4), w/2, w/2) //draw that object to the main canvas
  var dispX = round((w/2) - chunkRadiusPx);
  var dispY = round((w/2) - chunkRadiusPx);
  var dispW = round((chunkRadiusPx * 2) + 1)

  if(dispW > width || dispW > height){
    chunkRadiusPx = width/2 - (game.config.tileSize/2);
    var dispX = round((w/2) - chunkRadiusPx);
    var dispY = round((w/2) - chunkRadiusPx);
    var dispW = round((chunkRadiusPx * 2) + 1)
  }

  //image(worldCanvasDisplayObject, dispX, dispY, dispW, dispW, (width/2) - (dispW/2), (height/2) - (dispW/2), dispW, dispW) //draw that object to the main canvas
  image(worldCanvasDisplayObject, dispX, dispY, dispW, dispW, dispX, dispY, dispW, dispW)
  //image(worldCanvasDisplayObject, mouseX, mouseY, (w/2), (w/2), (width/2) - (w/4), (height/2) - (w/4), w/2, w/2) //draw that object to the main canvas
  /*if(dispW > width || dispW > height){
    //image(worldCanvasDisplayObject, dispX, dispY, dispW, dispW, dispX, dispY, dispW, dispW) //draw that object to the main canvas
    image(worldCanvasDisplayObject, w/4, w/4, (w/2), (w/2), (width/2) - (w/4), (height/2) - (w/4), w/2, w/2) //draw that object to the main canvas
  } else {
    image(worldCanvasDisplayObject, dispX, dispY, dispW, dispW, (width/2) - (dispW/2), (height/2) - (dispW/2), dispW, dispW) //draw that object to the main canvas
  }*/

}

function getDisplayWorldCanvasPosition(){
  //more ugly code. Beware the horrors ahead
  var w = worldCanvasDisplayObject.width
  var chunkSizePx = game.config.chunkSize * game.config.tileSize;
  var chunkRadiusPx = game.config.chunkSize * game.config.tileSize * (game.config.chunkRenderRadius) - (game.config.tileSize * 2)

  var dispX = round((w/2) - chunkRadiusPx);
  var dispY = round((w/2) - chunkRadiusPx);
  var dispW = round((chunkRadiusPx * 2) + 1)

  if(dispW > width || dispW > height){
    chunkRadiusPx = width/2 - (game.config.tileSize/2);
    var dispX = round((w/2) - chunkRadiusPx);
    var dispY = round((w/2) - chunkRadiusPx);
    var dispW = round((chunkRadiusPx * 2) + 1)
  }

  return {
    'dispX': dispX,
    'dispY': dispY,
    'dispW': dispW
  }
}

function configureDrawSettings(){
  //sets up things like font size and font type for all graphics elements
  //this is called on setup and windowResize
  worldCanvas.textFont(fonts.default);
  worldCanvas.textAlign(LEFT, TOP);
  worldCanvas.textSize(game.config.tileSize)

  uiCanvas.textFont(fonts.default);
  uiCanvas.textAlign(LEFT, TOP)
  uiCanvas.textSize(uiTextSize);

  //worldCanvas.noSmooth();
  //gameCanvas.noSmooth();
  //uiCanvas.noSmooth();
}

//ADD TO/MODIFY WORLD --------------------------------------------------------------------------------

function addToInventory(objectTemplateName, count){
  //adds the object objectTemplateName to the player's inventory.
  //the amount added is 'count'. To subtract from inventory, make count negative.
  var invObjects = game.player.inventory.objects
  var alreadyInInventory = false;
  for(var i = 0; i < invObjects.length; i ++){ //for every object in the player's inventory...
    if(invObjects[i].name == objectTemplateName){ //if this object is the one we're looking to add...
      invObjects[i].count += count; //add to its count
      alreadyInInventory = true;
      var indexPos = i;
    }
  }
  if(!alreadyInInventory){ //if the object we're adding is not already in the player's inventory...
    game.player.inventory.objects.push( //add it.
      {
        'name': objectTemplateName,
        'count': count
      }
    )
    var indexPos = game.player.inventory.objects.length - 1;
  }

  var thisObj = invObjects[indexPos]
  var thisTemplate = game.objectTemplates[objectTemplateName]
  //objects can be removed from the inventory for having a count of zero or a negative count.
  //if either of those is supposed to happen, do it.
  if( (!thisTemplate.inventorySettings.canBeNegative && thisObj.count < 0) ||
  (!thisTemplate.inventorySettings.appearsZero && thisObj.count == 0)){
    game.player.inventory.objects.splice(indexPos, 1)
  }

  if(count != 0 && game.config.flashInventory){ //if the count of this object was changed AND flash inventory is enabled...
    inventoryObjectsFlashing[objectTemplateName] = 40; //set the frame countdown for this object to 40 frames
  }

}

function setInventoryCount(objectTemplateName, count){
  if(inventoryCount(objectTemplateName) != 0)
    addToInventory(objectTemplateName, -1 * inventoryCount(objectTemplateName)  ); //simply set the count of this object to zero in the inventory.
  addToInventory(objectTemplateName, count); //Then, simply add what we actually want it to be.
}

function emptyInventory(){
  //empties the player's inventory of all objects
  game.player.inventory.objects = [];
}

function addObject(objectTemplateName, layerName, objx, objy, id){
  /*given the global position of an object,
  add the object to the correct chunk*/
  var objR = globalToRelative(objx, objy) //calculate the position of this object relative to whatever chunk it's going in
  if(tileExists(layerName, objR.chunkx, objR.chunky, objR.objx, objR.objy, true) &&
    game.world[getLayerIndex(layerName)].chunks[objR.chunkx][objR.chunky].objects[objR.objx][objR.objy] == 0){ //if there is a placeholder 0 at the spot in the chunk where we're adding this object, then it is safe to add it.
    //add the object (replace the placeholder with the object we want)

    if(id == undefined){var idToAdd = objectPainting.id; objectPainting.id ++} //if no ID is given, use objectPainting.id
    if(id != undefined){var idToAdd = id;} //if an id is given as an argument, use it.

    game.world[getLayerIndex(layerName)].chunks[objR.chunkx][objR.chunky].objects[objR.objx][objR.objy] =
    {
      "name": objectTemplateName,
      "id": idToAdd
    }

    //make sure the 'empty' flag on this chunk is set to 'false' since there is now an object in it
    game.world[getLayerIndex(layerName)].chunks[objR.chunkx][objR.chunky].empty = false;

    //add this object's id to the chunk's ID Reference Table (idRefTable)

    game.world[getLayerIndex(layerName)].chunks[objR.chunkx][objR.chunky].idRefTable.push(
      {
        "id": idToAdd,
        "name": objectTemplateName,
        "chunkx": objR.chunkx,
        "chunky": objR.chunky,
        "relativex": objR.objx,
        "relativey": objR.objy,
        "globalx": objx,
        "globaly": objy
        //"location": {'objx': objR.objx, 'y': objR.objy, 'globalx':objx, 'globaly':objy}
      }
    )
  }
  refreshTile('all', objx, objy, false)
}

function deleteObject(id){
  /*deletes an object with the id 'ID'*/


  //this line allows function to use global position as input (arguments: layerName, objx, objy)
  //var objR = globalToRelative(objx, objy)//calculate the position of this object relative to whatever chunk it's going in

  //this line uses id as input
  var objR = idToRelativePosition(id);

  if(objR != null){
    var layerName = objR.layerName;
    if(objectExists(layerName, objR.chunkx, objR.chunky, objR.objx, objR.objy, true)){ //if there is an object at the inputted location, we can delete it.

      var thisChunk = game.world[getLayerIndex(layerName)].chunks[objR.chunkx][objR.chunky] //give the chunk of this object an easy variable name

      //before deleting the object, remove its id from the chunk's ID Reference Table
      //get the index of this object's id in the chunk's ID Reference Table
      var objIDIndex = 0;
      for(var i = 0; i < thisChunk.idRefTable.length; i ++){
        if(thisChunk.idRefTable[i].id == id)objIDIndex = i;
      }
      //remove the object id from the idRefTable
      thisChunk.idRefTable.splice(objIDIndex, 1)

      //replace the object in the chunk with a placeholder 0
      thisChunk.objects[objR.objx][objR.objy] = 0;
    }

    var objGlobal = relativeToGlobal(objR.chunkx, objR.chunky, objR.objx, objR.objy)
    var objx = objGlobal.x;
    var objy = objGlobal.y;
    refreshTile('all', objx, objy, false)
  }
}

function deleteObjectTemplate(templateName){
  if(game.objectTemplates[templateName] != undefined){
    delete game.objectTemplates[templateName]
    if(objectPainting.name == templateName)objectPainting.name = Object.keys(game.objectTemplates)[0]
    var objToDelete = objectsWithTemplate(templateName)
    for(var i = 0; i < objToDelete.length; i ++){
      deleteObject(objToDelete[i])
    }
  }
}

function moveObject(id, newLayer, newx, newy){
  /*given an object's id and the layer/position the user wants to move it to,
  instead of actually moving the object we actually add the information to 'objectsToMove'
  so it can be handled by a different function (moveAllObjects()) at the beginning of the frame
  */
  var objRelative = idToRelativePosition(id);
  if(objRelative){ //if this object exists
    //get the object's global position
    var objGlobal = relativeToGlobal(objRelative.chunkx, objRelative.chunky, objRelative.objx, objRelative.objy)
    objectsToMove.push(
      {
        'id':id,
        'template': objectWithID(id).template,
        'oldx':objGlobal.x, //we need the old position of the object in case we need to put it back where it was before.
        'oldy':objGlobal.y,
        'oldLayer':objRelative.layerName,
        'newx':newx,
        'newy':newy,
        'newLayer':newLayer,
      }
    )
  }
}

function moveAllObjects(){
  /*handle the moving of all objects that need to be moved this frame.
  Then, reset the 'objectsToMove' array.*/

  //first, check for any objects that will get stuck when we try to move them
  //and remove them from objectsToMove.
  for(var i = 0; i < objectsToMove.length * 2; i ++){

    for(var j = 0; j < objectsToMove.length; j ++){ //for every objectToMove...
      var theObj = objectsToMove[j] //give the object an easy variable name.
      //get the relative position of the new location of htis object
      var newPosRel = globalToRelative(theObj.newx, theObj.newy)

      //if the tile this object should move to does not exist...
      if( !tileExists(theObj.newLayer, newPosRel.chunkx, newPosRel.chunky, newPosRel.objx, newPosRel.objy, false) ){
        objectsToMove.splice(j, 1) //then the object should not be moved, so remove it from objectsToMove.
      }

      //if there is an object (and NOT just a placeholder 0) at the location the object is supposed to be moved to...
      if( objectExists(theObj.newLayer, newPosRel.chunkx, newPosRel.chunky, newPosRel.objx, newPosRel.objy, false) ){
        //get the id of the object that's blocking the way
        var objBlockerID = game.world[getLayerIndex(theObj.newLayer)].chunks[newPosRel.chunkx][newPosRel.chunky].objects[newPosRel.objx][newPosRel.objy].id
        //if the object blocking the way is NOT on the list of objects to move (and therefore is not going to move)...
        if(!contains(objBlockerID, objectsToMove)){
          //...then this object is not going to budge because something is blocking the way, so remove it from objectsToMove.
          objectsToMove.splice(j, 1)
        }
      }
    }

  }



  //first, delete all objects at once.
  for(var i = 0; i < objectsToMove.length; i ++){
    deleteObject(objectsToMove[i].id)
  }

  //second, re-add all objects where they now belong.

  for(var i = 0; i < objectsToMove.length; i ++){
    var theObj = objectsToMove[i];
    //get the relative position of the new location of htis object
    var newPosRel = globalToRelative(theObj.newx, theObj.newy)
    if(tileExists(theObj.newLayer, newPosRel.chunkx, newPosRel.chunky, newPosRel.objx, newPosRel.objy, false)
    && game.world[getLayerIndex(theObj.newLayer)].chunks[newPosRel.chunkx][newPosRel.chunky].objects[newPosRel.objx][newPosRel.objy] == 0){
      //if the tile we're moving this object to exists AND is occupied by a placeholder 0, we're
      //good to continue.
      addObject(theObj.template, theObj.newLayer, theObj.newx, theObj.newy, theObj.id)
      //console.log('I put it where you wanted!')
    } else {
      //if the tile we're moving the object to does NOT exist OR is already occupied by something else,
      //put the object back where it was before.
      addObject(theObj.template, theObj.oldLayer, theObj.oldx, theObj.oldy, theObj.id)
      //console.log("I put it back where I found it!")
    }

  }

  objectsToMove = []; //empty the list of objects to move for the next frame.
}

function idToRelativePosition(id){
  /*given the id of an object, returns its relative position*/
  var ret = null;
  for(var layerIndex = 0; layerIndex < game.world.length; layerIndex ++){ //for every layer...
    for(var chunkx = 0; chunkx < game.world[layerIndex].chunks.length; chunkx ++){ //for every chunkColumn in this layer...
      for(var chunky = 0; chunky < game.world[layerIndex].chunks[chunkx].length; chunky ++){//for every chunk in this chunkColumn...
        var thisChunk = game.world[layerIndex].chunks[chunkx][chunky]
        for(var i = 0; i < thisChunk.idRefTable.length; i ++){
          var thisIdRef = thisChunk.idRefTable[i]
          if(thisIdRef.id == id){
            ret = {'chunkx':chunkx, 'chunky':chunky, 'objx':thisIdRef.relativex, 'objy':thisIdRef.relativey, 'layerName':game.world[layerIndex].name}
          }
        }
      }
    }
  }
  return ret;
}

function addLayer(layerName, layerIndex, visible, collisionEnabled){
  /*
  Given the name of a new layer and where in the layers array (game.world) the layer should be inserted,
  adds the layer to game.world.
  */
  var newLayer =
  {
    "name": layerName,
    "visible": visible,
    "collisionEnabled": collisionEnabled,
    "chunks": []
  }
  for(var i = 0; i < game.world[0].chunks.length; i ++){ //for every chunk column in the first chunk of the first layer...
    newLayer.chunks.push(emptyChunkColumn()) //add an empty chunk column to our new layer.
  }
  //the splice command inserts our object into game.world at any index we want.
  game.world.splice(layerIndex, 0, newLayer)
}

function deleteLayer(layerName){
  var changeObjPainting = false;
  if(objectPainting.layerName == layerName)changeObjPainting = true;
  var changePlayerPos = false;
  if(game.player.layerName == layerName)changePlayerPos = true;
  game.world.splice(getLayerIndex(layerName), 1)
  if(changeObjPainting)objectPainting.layerName = game.world[0].name;
  if(changePlayerPos)game.player.layerName = game.world[0].name;

  renderNearbyChunks();
}

function changeLayerPosition(layerName, newIndex){
  if(newIndex <= game.world.length - 1){ //if this newPosition (new index) exists...
    var layerIndex = getLayerIndex(layerName)
    var layerBeingMoved = game.world[layerIndex];

    //delete this layer
    deleteLayer(layerName);

    //re-add this layer at the desired position
    game.world.splice(newIndex,0,layerBeingMoved)

    renderNearbyChunks();
  }


}

function addChunk(chunkx, chunky){
  /*given the x and y coordinates of the chunk the user would like to add,
  adds all the necessary rows and columns for that chunk to exist.
  /*ex. when requesting addChunk(3,3)
  o~++
  ~~++
  ++++
  +++x
  o = origin chunk (chunk at 0, 0)
  ~ = chunks that already exist
  x = chunk at (3,3) (input)
  */

  //calculate how many chunk rows and columns are missing
  var gameWorldLength = game.world.length;
  var gameWorld0ChunksLength = game.world[0].chunks.length;
  var gameWorld0Chunks0Length = game.world[0].chunks[0].length;
  var missingChunkColumns = (chunkx+1) - gameWorld0ChunksLength;
  var missingChunkRows = (chunky+1) - gameWorld0Chunks0Length;

  //add missing columns first.
  for(var layerIndex = 0; layerIndex < gameWorldLength; layerIndex ++){
    for(var i = 0; i < missingChunkColumns; i ++){
      game.world[layerIndex].chunks.push(emptyChunkColumn())
    }
  }

  //then, add missing chunk rows to each chunkColumn
  for(var layerIndex = 0; layerIndex < gameWorldLength; layerIndex ++){
    for(var columnIndex = 0; columnIndex < game.world[0].chunks.length; columnIndex ++){
      for(var j = 0; j < missingChunkRows; j ++)game.world[layerIndex].chunks[columnIndex].push(emptyChunk())
    }
  }

  renderNearbyChunks();
}

function emptyChunk(){
  var ret =
  {
    "backgroundColor": game.config.newChunkColor.slice(0),
    "empty":true,
    "idRefTable":[], //a reference table of where an object with the id 'id' is located in this chunk.
    "objects": []
  }

  /*var emptyObject =
  {
    'name':'egg',
    'id':3
  }*/
  var emptyObject = 0;

  var emptyObjectColumn = []
  for(var i = 0; i < game.config.chunkSize; i ++)emptyObjectColumn.push(emptyObject);
  for(var i = 0; i < game.config.chunkSize; i ++)ret.objects.push(emptyObjectColumn.slice(0))
  return ret;
}

function emptyChunkColumn(){
  var ret = []
  for(var i = 0; i < game.world[0].chunks[0].length; i ++)ret.push(emptyChunk());
  return ret;
}

function zoomWorldView(newTileSize){
  game.config.tileSize = newTileSize;
  renderNearbyChunks();
}

function teleportPlayer(x,y){
  /*given global coordinates, teleport the player there*/
  game.player.x = x; cameraPosition.x = x;
  game.player.y = y; cameraPosition.y = y;
}

function executeCommands(){

  //first, execute commands that are supposed to run every frame
  for(var i = 0; i < game.commands.everyFrame.length; i ++){
    executeCommand(game.commands.everyFrame[i])
  }

  //then, execute commands that are only executed on frames where the player is moving
  if(playerChangedPosition){
    for(var i = 0; i < game.commands.everyPlayerMovement.length; i ++){
      executeCommand(game.commands.everyPlayerMovement[i])
    }
  }

  if(frameCount == 0){ //if this is the 0th (first) frame of the program, initiate startup commands.
    for(var i = 0; i < game.commands.onStartup.length; i ++){
      executeCommand(game.commands.onStartup[i])
    }
  }
}

function executeCommand(commandString){
  if(commandString != null){
    var myFunction = Function(commandString);
    myFunction();
  }
}

//IDENTIFYING AN OBJECT BY ID OR TAG --------------------------------------------------------------------------------

function idAt(layerName, xposition, yposition){
  /*given a global x, y position, returns the object at that x y position*/
  var objR = globalToRelative(xposition, yposition)
  var ret = null;
  if(objectExists(layerName, objR.chunkx, objR.chunky, objR.objx, objR.objy, false)){
    ret = game.world[getLayerIndex(layerName)].chunks[objR.chunkx][objR.chunky].objects[objR.objx][objR.objy].id;
  }
  return ret;
}

function objectWithID(id){
  /*given the id of an object, return the object's global position, layer, objectTemplate, and ID*/
  var ret = null;
  var objRelative = idToRelativePosition(id); //get the relative position of the object with this id.
  if(objRelative != null){
    var objGlobal = relativeToGlobal(objRelative.chunkx, objRelative.chunky, objRelative.objx, objRelative.objy)
    var objTemplate = game.world[getLayerIndex(objRelative.layerName)].chunks[objRelative.chunkx][objRelative.chunky].objects[objRelative.objx][objRelative.objy].name
    ret = {'x':objGlobal.x, 'y':objGlobal.y, 'layerName': objRelative.layerName, 'template':objTemplate, 'id':id}
  }
  return ret;
}

function objectsTagged(tag){
  /*returns a list of object ids (not objects or objectTemplates) tagged with 'tag'*/
  var ret = []
  for(var layerIndex = 0; layerIndex < game.world.length; layerIndex ++){ //for every layer...
    for(var chunkx = 0; chunkx < game.world[layerIndex].chunks.length; chunkx ++){ //for every chunkColumn in this layer...
      for(var chunky = 0; chunky < game.world[layerIndex].chunks[chunkx].length; chunky ++){//for every chunk in this chunkColumn...
        var thisChunk = game.world[layerIndex].chunks[chunkx][chunky]
        for(var i = 0; i < thisChunk.idRefTable.length; i ++){ //for every object in this chunk's id reference table...
          var thisIdRef = thisChunk.idRefTable[i] //if this id
          if(contains(tag, game.objectTemplates[thisIdRef.name].tags)){
            ret.push(thisIdRef.id)
          }
        }
      }
    }
  }
  return ret;
}

function objectsWithTemplate(templateName){
  var ret = []
  for(var layerIndex = 0; layerIndex < game.world.length; layerIndex ++){ //for every layer...
    for(var chunkx = 0; chunkx < game.world[layerIndex].chunks.length; chunkx ++){ //for every chunkColumn in this layer...
      for(var chunky = 0; chunky < game.world[layerIndex].chunks[chunkx].length; chunky ++){//for every chunk in this chunkColumn...
        var thisChunk = game.world[layerIndex].chunks[chunkx][chunky]
        for(var i = 0; i < thisChunk.idRefTable.length; i ++){ //for every object in this chunk's id reference table...
          var thisIdRef = thisChunk.idRefTable[i] //if this id
          if(thisIdRef.name == templateName)ret.push(thisIdRef.id)
        }
      }
    }
  }
  return ret;
}

function template(objTemplateName){
  //given the name of an object template, return the actual object template itself
  return game.objectTemplates[objTemplateName]
}

function inventoryCount(templateName){
  /*given an object template name, returns how much of that object is in the player's inventory*/
  for(var i = 0; i < game.player.inventory.objects.length; i ++){
    if(game.player.inventory.objects[i].name == templateName)return game.player.inventory.objects[i].count;
  }
  return 0;
}

// DIALOGUE --------------------------------------------------------------------------------

function dialogueLine(id){
  //display the dialogueLine with the id 'id'
  if(getDialogueIndex(id) != null)currentDialogueID = id;
}

function exitDialogue(){
  currentDialogueID = null;
}

function newDialogueID(){
  var id = 0;
  var dialogueIds = [];
  for(var i = 0; i < game.dialogueLines.length; i ++){dialogueIds.push(game.dialogueLines[i].id)}
  while (contains(id, dialogueIds)) {
    id ++;
  }
  return id;
}

function addDialogueLine(id, text){
  //adds a new dialogue line with id 'id' and text 'text'
  if(text != null){
    game.dialogueLines.push(
      {
        'id': id,
        'text': text,
        'options': []
      }
    )
  }

}

function deleteDialogueLine(id){
  var index = getDialogueIndex(id)
  if( index != null ){
    game.dialogueLines.splice(index, 1)
  }
}

function deleteDialogueOption(dialogueID, optionIndex){
  game.dialogueLines[getDialogueIndex(dialogueID)].options.splice(optionIndex, 1)
}

//POSITION CONVERSIONS --------------------------------------------------------------------------------

function relativeToGlobal(chunkx, chunky, objx, objy){
  //when given an object's x y position relative to the chunk it's in, returns a global position, relative to the origin point of the world at (0, 0)
  return createVector((game.config.chunkSize * chunkx + objx), (game.config.chunkSize * chunky + objy))
}

function globalToRelative(objx, objy){
  //when given an object's global x y position, returns the chunk it's in and its position within that chunk
  var chunkx = floor(objx/game.config.chunkSize)
  var chunky = floor(objy/game.config.chunkSize)
  var relativeObjX = objx % game.config.chunkSize;
  var relativeObjY = objy % game.config.chunkSize;
  return {'chunkx':chunkx, 'chunky':chunky, 'objx':relativeObjX, 'objy':relativeObjY}
}

function globalToDisplay(objx, objy){
  /*when given global x y position (in tiles) of an object, returns the coordinates (in pixels)
  of where to display that object on the worldCanvas*/

  /*
  get the coordinates of the chunk up and to the left of the current player's chunk
  the chunk that is least
  Ex. when chunk render radius is set to 3:
  .........
  .xxxxxxx.
  .x*2222x.
  .x21112x.
  .x21#12x.
  .x21112x.
  .x22222x.
  .xxxxxxx.
  .........
  * = target
  */
  var chunkR = game.config.chunkRenderRadius
  var worldCanvasCornerChunk = createVector(playerChunkCoord.chunkx - chunkR, playerChunkCoord.chunky - chunkR);
  worldCanvasCornerChunk.x = constrain(worldCanvasCornerChunk.x, 0, worldCanvasCornerChunk.x); //stop these from being negative
  worldCanvasCornerChunk.y = constrain(worldCanvasCornerChunk.y, 0, worldCanvasCornerChunk.y)
  var worldCanvasCornerCorner = chunkUpperRightCorner(worldCanvasCornerChunk.x, worldCanvasCornerChunk.y);

  var adjustedObjX = objx - worldCanvasCornerCorner.x;
  var adjustedObjY = objy - worldCanvasCornerCorner.y;

  if(!cameraMoving)return createVector(round(adjustedObjX * game.config.tileSize), round(adjustedObjY * game.config.tileSize)) //this version fixes anti-aliasing but creates jittery motion...
  return createVector(adjustedObjX * game.config.tileSize, adjustedObjY * game.config.tileSize)
}

function canvasDisplayToGlobal(x, y){
  /*
  given the x, y coordinates (in pixels) of something on the gameCanvas (NOT the worldCanvas),
  returns the global position of that something in the world (in tiles)
  This will probably only used for mouse inputs
  */
  /*var w = worldCanvasDisplayObject.width
  var newx = x - ((width/2) - (w/4))
  var newy = y - ((height/2) - (w/4))*/
  var newx = x; var newy = y;
  newx -= worldCanvasLocation.x
  newy -= worldCanvasLocation.y

  newx = floor(newx/game.config.tileSize);
  newy = floor(newy/game.config.tileSize);

  var chunkR = game.config.chunkRenderRadius
  var worldCanvasCornerChunk = createVector(playerChunkCoord.chunkx - chunkR, playerChunkCoord.chunky - chunkR);
  worldCanvasCornerChunk.x = constrain(worldCanvasCornerChunk.x, 0, worldCanvasCornerChunk.x); //stop these from being negative
  worldCanvasCornerChunk.y = constrain(worldCanvasCornerChunk.y, 0, worldCanvasCornerChunk.y)
  var worldCanvasCornerCorner = chunkUpperRightCorner(worldCanvasCornerChunk.x, worldCanvasCornerChunk.y);

  newx += worldCanvasCornerCorner.x;
  newy += worldCanvasCornerCorner.y;
  return createVector(newx, newy)

}

function chunkUpperRightCorner(chunkx, chunky){
  /*
  given the x, y coordinates of a chunk,
  return the global coordinates of the upper right corner of that chunk
  */
  var chunkSize = game.config.chunkSize;
  return createVector(chunkx * chunkSize, chunky * chunkSize);
}

function getLayerIndex(layerName){
  //when given the name of a layer, returns the index of that layer in the "game.world" array
  for(var i = 0; i < game.world.length; i ++){
    if(layerName == game.world[i].name)return i;
  }
  return null;
}

//CHECK WHETHER SOMETHING EXISTS --------------------------------------------------------------------------------

function chunkExists(layerName, chunkx, chunky, logResult){
  //returns whether a chunk at (chunkx, chunky) in layer layerName has been created
  var layerChecking = game.world[getLayerIndex(layerName)]
  var chunkExists = false;
  try {
    var testVariable = layerChecking.chunks[chunkx][chunky]
    if(testVariable !== undefined)chunkExists = true;
  } catch {
    chunkExists = false;
    if(logResult)console.log('chunk does not exist');
  }
  return chunkExists;
}

function tileExists(layerName, chunkx, chunky, objx, objy, logResult){
  //returns whether an object in the specified chunk has been created
  var layerChecking = game.world[getLayerIndex(layerName)]
  var tileExists = false;
  try {
    var testVariable = layerChecking.chunks[chunkx][chunky].objects[objx][objy]
    if(testVariable !== undefined)tileExists = true;
  } catch {
    tileExists = false;
    if(logResult)console.log('tile does not exist');
  }
  return tileExists;
}

function objectExists(layerName, chunkx, chunky, objx, objy, logResult){
  return (tileExists(layerName, chunkx, chunky, objx, objy, logResult) &&
  game.world[getLayerIndex(layerName)].chunks[chunkx][chunky].objects[objx][objy] != 0)
}

//MORE DISPLAY FUNCTIONS --------------------------------------------------------------------------------

function windowResized(){
  resizeCanvasThings();
}

function resizeCanvasThings(){
  /*corrects the x,y,w,h of canvases, graphics elements, etc based on window width and height.
  execute this function on windowResized() and startup*/

  if(windowHeight > windowWidth){resizeCanvas(windowWidth, windowWidth);}
  if(windowWidth > windowHeight){resizeCanvas(windowHeight, windowHeight);}
  //worldCanvasDisplayObject.size(gameCanvas.width, gameCanvas.height)
  //uiCanvas.size(gameCanvas.width, gameCanvas.height)
  //worldCanvasDisplayObject.resizeCanvas(gameCanvas.width, gameCanvas.height)
  //uiCanvas.resizeCanvas(gameCanvas.width, gameCanvas.height)
  worldCanvasDisplayObject = createGraphics(gameCanvas.width, gameCanvas.height)
  uiCanvas = createGraphics(gameCanvas.width, gameCanvas.height)
  uiCanvas.textFont(fonts.default);uiCanvas.textSize(uiTextSize);

  if(menuWindowOpen){
    //commented out for safe version
    //positionLoadInputButton();
  }

  if(commandWindowOpen){
    canvasPosition(commandTextArea, gameCanvas, uiSpacing, uiSpacing)
    commandTextArea.size(width - (uiSpacing*3),height/3)
  }

  configureDrawSettings();
}

function positionLoadInputButton(){
  gameFileInputPos = createVector(0,0)
  var xPos = floor(width/50) + uiCanvas.textWidth('Load game: ') + (uiSpacing*3)
  var yPos = floor(height/4) + ((uiSpacing * 3) + uiTextSize) * 2 - 5
  gameFileInputPos = createVector(xPos, yPos) //position (relative to the canvas) where the input button will be placed
  canvasPosition(gameFileInput, gameCanvas, gameFileInputPos.x, gameFileInputPos.y) //reposition the input button
}

function setGameData(result){
  parseThis = join(result, '\n')
  gameFile = Hjson.parse(parseThis);
  game = gameFile[0]
  newGameLoaded = true;
  menuWindowOpen = false;
  gameFileInput.remove();
}
