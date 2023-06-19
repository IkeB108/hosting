/*
Steps for making a new puppet:

*/
function preload(){
  /*masterPuppets = {
    //'tieGuy': loadJSON('puppetJSONS/tieGuy.json'),
    'unicorn': loadJSON('puppetJSONS/unicorn.json'),
    'sillyman_orange': loadJSON('puppetJSONS/sillyman_orange.json'),
    'sillyman_yellow': loadJSON('puppetJSONS/sillyman_yellow.json'),
    'sillyman_purple': loadJSON('puppetJSONS/sillyman_purple.json'),
    'chicken': loadJSON('puppetJSONS/chicken.json'),
    'hedgehog': loadJSON('puppetJSONS/hedgehog.json'),
    'sun_tzu': loadJSON('puppetJSONS/sun_tzu.json'),

  }*/

  masterPuppets = {
    'chicken': loadJSON('puppetJSONS/puppet_chicken.json'),
    'unicorn': loadJSON('puppetJSONS/puppet_unicorn.json'),
    'hedgehog': loadJSON('puppetJSONS/puppet_hedgehog.json'),
    'pig': loadJSON('puppetJSONS/puppet_pig.json')
  }

  logo = loadImage('logo.png')

  //masterPuppets = {}

  buttonImages = {}
  buttonImages.openEye = loadImage('buttonImages/openEye.png')
  buttonImages.closedEye = loadImage('buttonImages/closedEye.png')

  buttonImages.arrowOne = loadImage('buttonImages/arrow1.png')
  buttonImages.arrowTwo = loadImage('buttonImages/arrow2.png')
  buttonImages.arrowThree = loadImage('buttonImages/arrow3.png')
  buttonImages.arrowHover = loadImage('buttonImages/arrowHover.png')

  buttonImages.puppeteerOne = loadImage('buttonImages/puppeteer1.png')
  buttonImages.puppeteerTwo = loadImage('buttonImages/puppeteer2.png')
  buttonImages.puppeteerThree = loadImage('buttonImages/puppeteer3.png')

  buttonImages.controls = loadImage('buttonImages/controls.png')
  buttonImages.controller = loadImage('buttonImages/controller.png')

  buttonImages.cursor = loadImage('buttonImages/cursor.png')
  buttonImages.cursorPointing = loadImage('buttonImages/cursorPointing.png')

  buttonImages.trashClosed = loadImage('buttonImages/eraser.png')
  buttonImages.trashOpen = loadImage('buttonImages/bigcursor.png')

  buttonImages.help = loadImage('buttonImages/help.png')
  buttonImages.cycleAdd = loadImage('buttonImages/cycleAdd.png')
  buttonImages.shopLink = loadImage('buttonImages/shopLink.png')
  buttonImages.reset = loadImage('buttonImages/reset.png')

  buttonImages.orthoMove = loadImage('buttonImages/orthoMove.png')
  buttonImages.rotate = loadImage('buttonImages/rotate.png')
  buttonImages.scale = loadImage('buttonImages/scale.png')

  mouseImages = {
    'baseMouse': loadImage('mouseImages/baseMouse.png'),
    'leftClick': loadImage('mouseImages/leftClick.png'),
    'leftClickDown': loadImage('mouseImages/leftClickDown.png'),
    'rightClick': loadImage('mouseImages/rightClick.png'),
    'rightClickDown': loadImage('mouseImages/rightClickDown.png'),
    'scroll': loadImage('mouseImages/scroll.png'),
    'scrollDown': loadImage('mouseImages/scrollDown.png'),
  }

  sounds = {}
  sounds['wahwah.mp3'] = {
    'sound':loadSound('wahwah.mp3'),
    'key': 'Y'
  }

}

function setup() {
  setupFrames = 30; //how many frames the pc needs to set things up
  //this line disables the web browser's right-click context menu (needs to be tested in Chrome)
  document.addEventListener('contextmenu', event => event.preventDefault());

  edgeRoom = 300;
  var cw = constrain(1500, 0, windowWidth - edgeRoom )
  var ch = constrain(750, 0, windowHeight - edgeRoom )
  myCanvas = createCanvas(cw, ch)
  angleMode(DEGREES);
  imageMode(CENTER);
  noCursor();
  noSmooth();

  //convert all masterPuppet json objects to usable puppets with p5 images
  var mpkeys = Object.keys(masterPuppets)
  for(var i = 0; i < mpkeys.length; i ++){
    masterPuppets[mpkeys[i]] = jsonFileToPuppet(masterPuppets[mpkeys[i]]);
  }

  /*scene = [
    {
      'name': 'sun_tzu',
      'puppeteer': null, //describes which "puppeteer" is controlling this puppet (1,2,3, or null). This tells us which controls the puppet uses
      'x': 250, //x coordinate in pixels of this puppet
      'y': 300,  //y coordinate in pixels of this puppet
      'zrotation': 0, //value between 0 and 360 describing the z-axis rotation of this puppet (the 'cartwheel' rotation)

      'pose': 0, //the index of the pose this puppet is currently performing
      'speaking': false, //boolean describing whether or not this puppet is speaking
      'yrotation': 0, //value between 0 and 7 describing the y-axis rotation of this puppet (which direction it's facing)
      'scale': 1

    },
    {
      'name': 'chicken',
      'puppeteer': null, //describes which "puppeteer" is controlling this puppet (1,2,3, or null). This tells us which controls the puppet uses
      'x': 500, //x coordinate in pixels of this puppet
      'y': 300,  //y coordinate in pixels of this puppet
      'zrotation': 0, //value between 0 and 360 describing the z-axis rotation of this puppet (the 'cartwheel' rotation)

      'pose': 0, //the index of the pose this puppet is currently performing
      'speaking': false, //boolean describing whether or not this puppet is speaking
      'yrotation': 0, //value between 0 and 7 describing the y-axis rotation of this puppet (which direction it's facing)
      'scale': 1

    },
    {
      'name': 'hedgehog',
      'puppeteer': null, //describes which "puppeteer" is controlling this puppet (1,2,3, or null). This tells us which controls the puppet uses
      'x': 700, //x coordinate in pixels of this puppet
      'y': 300,  //y coordinate in pixels of this puppet
      'zrotation': 0, //value between 0 and 360 describing the z-axis rotation of this puppet (the 'cartwheel' rotation)

      'pose': 0, //the index of the pose this puppet is currently performing
      'speaking': false, //boolean describing whether or not this puppet is speaking
      'yrotation': 0, //value between 0 and 7 describing the y-axis rotation of this puppet (which direction it's facing)
      'scale': 1
    }

  ]*/

  scene = [
  {
    "name": "chicken",
    "puppeteer": null,
    "x": 100,
    "y": 316,
    "zrotation": 0,
    "pose": 0,
    "speaking": false,
    "yrotation": 0,
    "scale": 1
  },
  {
    "name": "unicorn",
    "puppeteer": null,
    "x": 268.66666666666663,
    "y": 316,
    "zrotation": 0,
    "pose": 0,
    "speaking": false,
    "yrotation": 0,
    "scale": 1
  },
  {
    "name": "hedgehog",
    "puppeteer": null,
    "x": 437.3333333333333,
    "y": 316,
    "zrotation": 0,
    "pose": 0,
    "speaking": false,
    "yrotation": 0,
    "scale": 1
  },
  {
    "name": "pig",
    "puppeteer": null,
    "x": 606,
    "y": 316,
    "zrotation": 0,
    "pose": 0,
    "speaking": false,
    "yrotation": 0,
    "scale": 1
  }
]
  //array containing all puppets in this scene (not master puppets)


  puppetSpeed = 4; //speed of puppets controlled by directional keys, in pixels per frame
  minScale = 0.2; //minimum scale multiplier for the puppets

  puppeteerOnePuppet = null; //index of the puppet controlled by puppeteer one. Set to null if no puppet
  puppeteerTwoPuppet = null;
  puppeteerThreePuppet = null;

  puppetOneOffset = createVector(0,0);
  //when puppeteerOne is using a puppet, this variable describes the coordinate offest
  //between the cursor position and the coordinates of the puppet.

  puppetTwoYRotationFrames = 0;
  puppetThreeYRotationFrames = 0;

  /*puppetOneTimeoutFrames = 0;
  puppetTwoTimeoutFrames = 0;
  puppetThreeTimeoutFrames = 0;

  puppetOnePoseKeyStrokes = 0;
  puppetTwoPoseKeyStrokes = 0;
  puppetThreePoseKeyStrokes = 0;*/

  puppetOneCancelPoseChange = false;
  /*puppetTwoCancelPoseChange = false;
  puppetThreeCancelPoseChange = false;*/

  puppetTwoRotScaleModify = false; //set to true when puppeteer two holds down the S key
  puppetTwoUpDownModify = false; //set to true when puppeteer two holds down the left Shift key

  puppetThreeRotScaleModify = false; //set to true when puppeteer three holds down the K key
  puppetThreeUpDownModify = false; //set to true when puppeteer three holds down the right Shift key

  puppeteerTwoKeys = {
    'moveLeft':'A',
    'moveRight':'D',
    'rotateLeft':'Q',
    'rotateRight':'E',
    'speak':'W',

    'pose1':'Z',
    'pose2':'X',
    'pose3':'C',
    'pose4':'V',

    'rotScaleModify': 'S', //holding down this key modifies the function of the left/right keys and rotation keys
    'upDownModify': 'ShiftLeft'
  }
  puppeteerThreeKeys = {
    'moveLeft':'J',
    'moveRight':'L',
    'rotateLeft':'U',
    'rotateRight':'O',
    'speak':'I',

    'pose1':'N',
    'pose2':'M',
    'pose3':',',
    'pose4':'.',

    'rotScaleModify': 'K',
    'upDownModify': 'Space'
  }

  performanceMode = false; //describes whether or not we are curently in 'performance mode' (hides icons)
  puppetFileInput = createFileInput(handlePuppetInput)
  canvasPosition(puppetFileInput, myCanvas, 20, height+10)

  addPuppetBuffer = -1; //frame countdown for adding puppets to the scene which have just been loaded in
  addPuppetQueue = []; //list of puppet names which need to be added once the buffer countdown hits 0

  canvasResizeBuffer = -1; //frame countdown for when to resize the canvas to fit the current background image

  addSoundQueue = []; //list of sound names which need to be added

  currentBackground = null; //set to a p5 image if a background is selected

  deletingPuppet = false; //set to true when user clicks on trash bin

  showControls = false; //when set to true, controls are displayed on the screen

  puppetAssigning = null;
  //index of the puppet the user is currently assigning a puppeteer to.
  //if user is not doing so, this variable is set to null.

  tookFirstPuppet = false;
  //set to true when user takes their first puppet.

  helpText = "Click on a puppet's belly to use it."

  cyclePuppetAdd = 0; //index of the puppet that will next be added with the cycleAdd button

  newPuppetBuffer = 10; //frame buffer for new puppets to load

  updateButtonLocations();

  rightClickDown = false; //set to true when user is holding down right click
  leftClickDown = false; //set to true when user is holding down left click

  puppetOneShowModifierImageBuffer = -1; //frame countdown for displaying the rotate/scale image above puppetOne when they're holding down up or down arrowkeys

  puppetDragging = null; //index of the puppet the user is currently dragging with the mouse (set to null when user is not dragging a puppet)
  mousePosAtPress = createVector(0,0); //coordinates of where the mouse was at time of mouse press (to compare for mouse release)
  mouseOffset = createVector(0,0); //conveys how far off mouse is from puppet

  releaseCountdown = -1; //frame countdown for releasing a puppet (user must right click twice)
}

function updateButtonLocations(){
  buttons = {
    'performanceMode': {
      'w': buttonImages.openEye.width,
      'h': buttonImages.openEye.height,
      'x': 20,
      'y': height-27
    },
    'trash': {
      'x': 70,
      'y': height-27,
      'w': buttonImages.trashClosed.width,
      'h': buttonImages.trashClosed.height
    },
    'controller': {
      'x': 120,
      'y': height-27,
      'w': buttonImages.controller.width,
      'h': buttonImages.controller.height
    },
    'help': {
      'x': width-40,
      'y': height-27,
      'w': buttonImages.help.width,
      'h': buttonImages.help.height
    },
    'cycleAdd': {
      'x': 170,
      'y': height-27,
      'w': buttonImages.cycleAdd.width,
      'h': buttonImages.cycleAdd.height,
    },
    'shopLink': {
      'x': 270,
      'y': height-27,
      'w': buttonImages.shopLink.width,
      'h': buttonImages.shopLink.height
    },
    'reset': {
      'x':220,
      'y': height-27,
      'w': buttonImages.reset.width,
      'h': buttonImages.reset.height
    }
  }
}

function draw() {
  background(0);
  /*if(puppetTwoUpDownModify)background(0,255,0,100);
  if(puppetThreeUpDownModify)background(255,0,0,100);
  if(leftClickDown){
    background(0,255,0,100)
  }
  if(rightClickDown){
    background(255,0,0,100)
  }*/

  if(currentBackground){
    push();
    imageMode(CORNER)
    image(currentBackground, 0, 0, width, currentBackground.height * (width/currentBackground.width) )
    pop();
  }

  if(frameCount == setupFrames){
    //set up some things on frame 10

    //fix widths and heights of puppets
    var mpkeys = Object.keys(masterPuppets)
    for(var i = 0; i < mpkeys.length; i ++){
      masterPuppets[mpkeys[i]].width = masterPuppets[mpkeys[i]].poses[0][0].nospeak.width;
      masterPuppets[mpkeys[i]].height = masterPuppets[mpkeys[i]].poses[0][0].nospeak.height;
    }
  }


  if(frameCount > setupFrames){

    handleCanvasResize();

    if(showControls)displayControls();

    updatePuppets();
    renderPuppets();
    puppetHovering();
    renderUI();

    handlePuppetQueue();
    handleSoundQueue();
  }

  renderLogo();
  renderCursor();

  noFill(); stroke(255);
  rect(1,1,width-2,height-37)
}

function mousePressed(){
  phovering = puppetHovering();

  if(mouseButton == RIGHT)rightClickDown = true;
  if(mouseButton == LEFT){
    leftClickDown = true;
    if(phovering != null && puppeteerOnePuppet == null && !deletingPuppet){
      //user is dragging a puppet
      puppetDragging = phovering;
      mouseOffset = createVector(scene[puppetDragging].x - mouseX, scene[puppetDragging].y - mouseY )
    }
  }

  if(event.button == 0){
    releaseCountdown = -1; //if user left-clicked, they probably are not planning on releasing a puppet
  }
  if(event.button == 2 && !deletingPuppet && puppetAssigning == null){

    //if mouse was hovering over a puppet operated by puppeteers two or three, release it
    if(phovering != null){
      if(phovering == puppeteerTwoPuppet)puppeteerTwoPuppet = null;
      if(phovering == puppeteerThreePuppet)puppeteerThreePuppet = null;
    }

    //if puppeteerOne is using a puppet, release it
    if(puppeteerOnePuppet != null){
      if(releaseCountdown > 0){
        puppeteerOnePuppet = null;
      }
      if(releaseCountdown < 0){
        releaseCountdown = 30;
      }

    }
  }

  mousePosAtPress = createVector(mouseX, mouseY)
}

function mouseReleased(){
  if(event.button == 0){ //left click released
    leftClickDown = false;
  }
  if(event.button == 2){ //right click released
    rightClickDown = false;
  }
  puppetDragging = null;
  /*if(puppeteerOnePuppet != null && mouseButton == LEFT && rightClickDown && rightClickDownAtTimeOfLeftClick){
    //user is trying to change puppet one's pose here
    console.log('changing pose')
    puppetOnePoseKeyStrokes ++;
    puppetOneTimeoutFrames = 0;
  }
  if(event.button == 2 && puppetOnePoseKeyStrokes > 0){
    //if user has released right click and they were just assigning a pose
    //to puppet one, then assign that pose now
    scene[puppeteerOnePuppet].pose = constrain(puppetOnePoseKeyStrokes - 1, 0, masterPuppets[scene[puppeteerOnePuppet].name].poses.length - 1 )
    puppetOnePoseKeyStrokes = 0;
  }*/
}

function mouseWheel(){
  if(puppeteerOnePuppet != null){
    //if puppeteerOne is using a puppet, change something
    puppetOneCancelPoseChange = true;
    onePuppet = scene[puppeteerOnePuppet]

    if(keyIsDown(UP_ARROW)){
      //if user is holding down the up arrowkey, change z rotation instead of y rotation
      if(event.delta > 0)onePuppet.zrotation -= 15;
      if(event.delta < 0)onePuppet.zrotation += 15;
      onePuppet.zrotation = onePuppet.zrotation % 360;
    }

    if(keyIsDown(DOWN_ARROW)){
      //if user is holding down the down arrowkey, change scale instead of rotation
      if(event.delta > 0)onePuppet.scale -= 0.1;
      if(event.delta < 0)onePuppet.scale += 0.1;

      if(onePuppet.scale < minScale)onePuppet.scale = minScale;
    }

    if(!keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)){
      //if user is not holding down the up or down arrowkey, change y rotation
      if(event.delta > 0)onePuppet.yrotation --;
      if(event.delta < 0)onePuppet.yrotation ++;
    }

    if(onePuppet.yrotation > 7)onePuppet.yrotation = 0;
    if(onePuppet.yrotation < 0)onePuppet.yrotation = 7;
  }
}

function mouseClicked(){
  var phovering = puppetHovering();

  if(puppeteerOnePuppet == null){

    var assignedPuppetThisClick = false;

    //if puppeteerOne is not operating a puppet and they clicked on a puppet,
    //set that puppet to be the puppet they're assigning
    //var userWasDragging = (mouseX != mousePosAtPress.x && mouseY != mousePosAtPress.y)
    var userWasDragging = dist(mouseX, mouseY, mousePosAtPress.x, mousePosAtPress.y) > 5
    if(!userWasDragging && puppetAssigning == null && phovering != null && mouseY < height-40){
      if(puppetAssigning == phovering)puppetAssigning = null;
      else {puppetAssigning = phovering; assignedPuppetThisClick = true}
    }

    if(!assignedPuppetThisClick)puppetAssigning = null;



    /*if(puppetAssigning != null){
      //see if user is clicking on an assignment button (1, 2, or 3)
      var pscale = scene[puppetAssigning].scale
      var pw = masterPuppets[scene[puppetAssigning].name].width * pscale
      var ph = masterPuppets[scene[puppetAssigning].name].height * pscale
      var x = scene[puppetAssigning].x - (50  * pscale)
      var y = scene[puppetAssigning].y - (ph * 0.5) - (15 * pscale)
      var assigned = null; //this variable represents which puppeteer this puppet was assigned to
      if(dist( mouseX, mouseY, x, y ) <= 20 * pscale)assigned = 1;
      x += 50 * pscale;
      if(dist( mouseX, mouseY, x, y ) <= 20 * pscale)assigned = 2;
      x += 50 * pscale;
      if(dist( mouseX, mouseY, x, y ) <= 20 * pscale)assigned = 3;

      if(assigned == 1){
        puppeteerOnePuppet = puppetAssigning;
        if(puppeteerTwoPuppet == puppetAssigning)puppeteerTwoPuppet = null;
        if(puppeteerThreePuppet == puppetAssigning)puppeteerThreePuppet = null;
        puppetOneOffset = createVector( scene[puppetAssigning].x - mouseX, scene[puppetAssigning].y - mouseY )
      }

      if(assigned == 2){
        puppeteerTwoPuppet = puppetAssigning;
        if(puppeteerThreePuppet == puppetAssigning)puppeteerThreePuppet = null;
      }

      if(assigned == 3){
        puppeteerThreePuppet = puppetAssigning;
        if(puppeteerTwoPuppet == puppetAssigning)puppeteerTwoPuppet = null;
      }
      if(assigned != null){
        puppetAssigning = null;
        if(!tookFirstPuppet){
          tookFirstPuppet = true;
          showControls = true;
          performanceMode = false;
        }
      }
      if(assigned == null){
        //if this puppet was assigned to a puppeteer, but the user didn't reassign it,
        //the user probably meant to remove the puppeteer
        if(puppeteerOnePuppet == puppetAssigning)puppeteerOnePuppet = null;
        if(puppeteerTwoPuppet == puppetAssigning)puppeteerTwoPuppet = null;
        if(puppeteerThreePuppet == puppetAssigning)puppeteerThreePuppet = null;
      }
    }*/

    //if user clicked on a puppet and we are deleting a puppet, delete the puppet.
    if(deletingPuppet && phovering != null && mouseY < height-40){
      scene = del(phovering, scene);
      puppetAssigning = null;
      puppeteerOnePuppet = null;
      puppeteerTwoPuppet = null;
      puppeteerThreePuppet = null;
      //deletingPuppet = false;
    }


    //check if user clicked on a button

    var buttonClicked = buttonHovering();

    //performance mode button
    if(buttonClicked == 'performanceMode' && !deletingPuppet){
      performanceMode = !performanceMode;
      puppetAssigning = null;
      if(!performanceMode){
        //if performance mode was just turned off, create the file input button
        puppetFileInput = createFileInput(handlePuppetInput)
        canvasPosition(puppetFileInput, myCanvas, 20, height+10)
      }
      if(performanceMode){
        //if performance mode was just turned on, delete the file input button
        puppetFileInput.remove();
      }
    }

    if(!performanceMode){
      //the remaining buttons require performance mode to be off

      //trash button
      if(buttonClicked == 'trash'){
        deletingPuppet = !deletingPuppet;
      }

      if(!deletingPuppet){
        //the following buttons require for the user to not be deleting a puppet

        //controller button
        if(buttonClicked == 'controller'){
          showControls = !showControls;
        }

        //help button
        if(buttonClicked == 'help'){
          window.open("https://www.youtube.com/watch?v=uouXYSwUP8E", "_blank")
        }

        if(buttonClicked == 'shopLink'){
          window.open("https://gumroad.com/ikebot")
        }

        //cycleAdd button
        if(buttonClicked == 'cycleAdd'){
          var name = Object.keys(masterPuppets)[cyclePuppetAdd]
          addPuppetToScene(name)
          cyclePuppetAdd = (cyclePuppetAdd + 1) % Object.keys(masterPuppets).length ;
        }

        if(buttonClicked == 'reset'){
          resetPuppetPositions();
        }
      }
    }
  }
}

function keyTyped(){
  phovering = puppetHovering();

  /*if(contains(key, '12345789'.split('') )){
    //if user typed a number key, change puppet one to that pose
    if(puppeteerOnePuppet != null){
      var intKey = int(key)
      scene[puppeteerOnePuppet].pose = constrain(intKey - 1, 0, masterPuppets[scene[puppeteerOnePuppet].name].poses.length - 1 )
    }
  }*/
  //if user tapped 1,2, or 3 while assigning a puppet, assign that puppet to its puppeteer
  if(puppetAssigning != null && contains(key, '123'.split(''))){
    var assigned = int(key)
    if(assigned == 1){
      puppeteerOnePuppet = puppetAssigning;
      if(puppeteerTwoPuppet == puppetAssigning)puppeteerTwoPuppet = null;
      if(puppeteerThreePuppet == puppetAssigning)puppeteerThreePuppet = null;
      puppetOneOffset = createVector( scene[puppetAssigning].x - mouseX, scene[puppetAssigning].y - mouseY )
    }

    if(assigned == 2){
      puppeteerTwoPuppet = puppetAssigning;
      if(puppeteerThreePuppet == puppetAssigning)puppeteerThreePuppet = null;
    }

    if(assigned == 3){
      puppeteerThreePuppet = puppetAssigning;
      if(puppeteerTwoPuppet == puppetAssigning)puppeteerTwoPuppet = null;
    }
    if(assigned != null){
      puppetAssigning = null;
      if(!tookFirstPuppet){
        tookFirstPuppet = true;
        showControls = true;
        performanceMode = false;
      }
    }
    if(assigned == null){
      //if this puppet was assigned to a puppeteer, but the user didn't reassign it,
      //the user probably meant to remove the puppeteer
      if(puppeteerOnePuppet == puppetAssigning)puppeteerOnePuppet = null;
      if(puppeteerTwoPuppet == puppetAssigning)puppeteerTwoPuppet = null;
      if(puppeteerThreePuppet == puppetAssigning)puppeteerThreePuppet = null;
    }
  }

  /*if(performanceMode && phovering != null && contains(key.toUpperCase(), Object.values(puppeteerTwoKeys) )){
    //if user has typed a key associated with puppeteerTwo
    //assign puppeteer two to the puppet that the mouse is hovering over (if any)
    if(puppeteerOnePuppet == null){
      puppeteerTwoPuppet = phovering;
      if(puppeteerThreePuppet == phovering)puppeteerThreePuppet = null;
    }
  }

  if(performanceMode && phovering != null && contains(key.toUpperCase(), Object.values(puppeteerThreeKeys) )){
    //if user has typed a key associated with puppeteerTwo
    //assign puppeteer two to the puppet that the mouse is hovering over (if any)
    if(puppeteerOnePuppet == null){
      puppeteerThreePuppet = phovering;
      if(puppeteerTwoPuppet == phovering)puppeteerTwoPuppet = null;
    }
  }*/

  //if user pressed a key which triggers a sound, play the sound
  for(var i = 0; i < Object.keys(sounds).length; i ++){
    if(key.toUpperCase() == sounds[Object.keys(sounds)[i]].key){
      sounds[Object.keys(sounds)[i]].sound.play();
    }
  }

  //if user has been prompted to assign a trigger key to a sound, then assign the key that was pressed
  if(addSoundQueue.length > 0){
    var unacceptableSoundKeys = [' ', 'SHIFT', "0", "1", "2", "3", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", ",", "."]
    if(!contains(key.toUpperCase(), Object.values(puppeteerTwoKeys)) &&
       !contains(key.toUpperCase(), Object.values(puppeteerThreeKeys)) &&
       !contains(key.toUpperCase(), unacceptableSoundKeys )){
      sounds[addSoundQueue[0]].key = key.toUpperCase()
      addSoundQueue = del(addSoundQueue, 0)

    }
  }


}

function keyPressed(){
  if(puppeteerTwoPuppet != null && event.code == 'ShiftLeft')puppetTwoUpDownModify = true;
  if(puppeteerThreePuppet != null && event.code == 'Space')puppetThreeUpDownModify = true;
  puppetOneCancelPoseChange = false;

  //start the frame countdown for triggering the image to appear above puppet one's head
  if(puppeteerOnePuppet != null && (keyCode == UP_ARROW || keyCode == DOWN_ARROW) ){
    if(puppetOneShowModifierImageBuffer < 0)puppetOneShowModifierImageBuffer = 12;
  }
}

function keyReleased(){

  if(event.code == 'ShiftLeft')puppetTwoUpDownModify = false;
  if(event.code == 'Space')puppetThreeUpDownModify = false;

  //if user tapped an arrow key while controlling a puppet
  //then change puppet one's pose
  var arrowKeys = [LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW]
  if(puppeteerOnePuppet != null && contains(keyCode, arrowKeys)){
    var onePuppet = scene[puppeteerOnePuppet]

    if(!puppetOneCancelPoseChange){
      //these keys are forbidden to change the pose if user used them to scale or change to z rotation
      if(keyCode == UP_ARROW)onePuppet.pose = 0;
      if(keyCode == DOWN_ARROW)onePuppet.pose = 2;
    }

    if(keyCode == UP_ARROW || keyCode == DOWN_ARROW)puppetOneShowModifierImageBuffer = -1;


    if(keyCode == LEFT_ARROW)onePuppet.pose = 1;
    if(keyCode == RIGHT_ARROW)onePuppet.pose = 3;
    if(onePuppet.pose > masterPuppets[onePuppet.name].poses.length - 1)onePuppet.pose = masterPuppets[onePuppet.name].poses.length - 1

  }

  puppetOneCancelPoseChange = false;

}

function renderPuppets(){
  phovering = puppetHovering();
  for(var i = 0; i < scene.length; i ++){
    push();
    imageMode(CENTER); noSmooth();
    var mpuppet = masterPuppets[ scene[i].name ]
    translate(scene[i].x, scene[i].y)
    scale(scene[i].scale)
    //draw the assignment buttons before rotating
    /*if(puppetAssigning == i && !performanceMode){
      image(buttonImages.puppeteerOne, -50, (mpuppet.height * -0.5) - 15 )
      image(buttonImages.puppeteerTwo, 0, (mpuppet.height * -0.5) - 15 )
      image(buttonImages.puppeteerThree, 50, (mpuppet.height * -0.5) - 15 )
    }*/

    //draw the puppet
    rotate(scene[i].zrotation)
    if(scene[i].speaking) image(mpuppet.poses[scene[i].pose][scene[i].yrotation].speak, 0, 0)
    else image(mpuppet.poses[scene[i].pose][scene[i].yrotation].nospeak, 0, 0)

    //draw the arrow above the puppet's head (if any)
    if(!performanceMode ){
      if(  i != puppetAssigning ){
        if(i == puppeteerOnePuppet){
          image(buttonImages.arrowOne, 0, (mpuppet.height * -0.5) - 15 )
          if(keyIsDown(UP_ARROW) && puppetOneShowModifierImageBuffer < 0)image(buttonImages.rotate, 0, (mpuppet.height * -0.5) - 45 )
          if(keyIsDown(DOWN_ARROW) && puppetOneShowModifierImageBuffer < 0 && !keyIsDown(UP_ARROW))image(buttonImages.scale, 0, (mpuppet.height * -0.5) - 45 )
        }
        if(i == puppeteerTwoPuppet){
          image(buttonImages.arrowTwo, 0, (mpuppet.height * -0.5) - 15 )
          if(!puppetTwoUpDownModify && keyIsDown(convertToKeyCode(puppeteerTwoKeys.rotScaleModify) )){
            image(buttonImages.rotate, -15, (mpuppet.height * -0.5) - 45 )
            image(buttonImages.scale, 15, (mpuppet.height * -0.5) - 45 )
          }
          if(puppetTwoUpDownModify)image(buttonImages.orthoMove, 0, (mpuppet.height * -0.5) - 45 )
        }
        if(i == puppeteerThreePuppet){
          image(buttonImages.arrowThree, 0, (mpuppet.height * -0.5) - 15 )
          if(!puppetThreeUpDownModify && keyIsDown(convertToKeyCode(puppeteerThreeKeys.rotScaleModify) )){
            image(buttonImages.rotate, -15, (mpuppet.height * -0.5) - 45 )
            image(buttonImages.scale, 15, (mpuppet.height * -0.5) - 45 )
          }
          if(puppetThreeUpDownModify)image(buttonImages.orthoMove, 0, (mpuppet.height * -0.5) - 45 )
        }
      }

      //draw the empty arrow hovering over the puppet
      if( (phovering == i && puppeteerOnePuppet == null && puppetAssigning == null) || i == puppetAssigning){
        image(buttonImages.arrowHover, 0, (mpuppet.height * -0.5) - 15 )
      }



    }


    pop();
  }
}

function updatePuppets(){
  //update the puppet we're dragging (if any)
  if(puppetDragging != null){
    scene[puppetDragging].x = mouseX + mouseOffset.x;
    scene[puppetDragging].y = mouseY + mouseOffset.y;
  }
  //update puppet one
  if(puppeteerOnePuppet != null){
    //if puppeteerOne is operating a puppet...
    scene[puppeteerOnePuppet].x = mouseX + puppetOneOffset.x
    scene[puppeteerOnePuppet].y = mouseY + puppetOneOffset.y

    scene[puppeteerOnePuppet].speaking = (mouseIsPressed && leftClickDown && !rightClickDown);

    puppetOneShowModifierImageBuffer --;
  }

  //update puppet two
  if(puppeteerTwoPuppet != null){
    var twoPuppet = scene[puppeteerTwoPuppet]
    var rotScaleModify = (keyIsDown( convertToKeyCode(puppeteerTwoKeys.rotScaleModify) ) && !puppetTwoUpDownModify)
    var puppetScaling = false;

    if(!rotScaleModify){
      //update left-right movement
      if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.moveRight) )) twoPuppet.x += puppetSpeed * scene[puppeteerTwoPuppet].scale
      if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.moveLeft) )) twoPuppet.x -= puppetSpeed * scene[puppeteerTwoPuppet].scale
    }

    //update puppet scaling
    if(rotScaleModify){
      if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.moveLeft) )){
        if(puppetTwoYRotationFrames % 10 == 0)twoPuppet.scale -= 0.1;
        puppetScaling = true
      }
      if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.moveRight) )){
        if(puppetTwoYRotationFrames % 10 == 0)twoPuppet.scale += 0.1;
        puppetScaling = true
      }
      if(twoPuppet.scale < minScale)twoPuppet.scale = minScale;
    }

    //update up-down movement
    if(puppetTwoUpDownModify && keyIsDown( convertToKeyCode(puppeteerTwoKeys.speak) )) twoPuppet.y -= puppetSpeed * twoPuppet.scale
    if(puppetTwoUpDownModify && keyIsDown( convertToKeyCode(puppeteerTwoKeys.rotScaleModify) )) twoPuppet.y += puppetSpeed * twoPuppet.scale

    //update speaking
    scene[puppeteerTwoPuppet].speaking = keyIsDown(convertToKeyCode(puppeteerTwoKeys.speak)) && !puppetTwoUpDownModify

    //update y rotation
    var rotLeft = keyIsDown( convertToKeyCode(puppeteerTwoKeys.rotateLeft) )
    var rotRight = keyIsDown( convertToKeyCode(puppeteerTwoKeys.rotateRight) )

    if(rotLeft || rotRight){

      if(!rotScaleModify){
        //rotate on the y axis
        if(rotLeft && puppetTwoYRotationFrames % 10  == 0) twoPuppet.yrotation ++;
        if(rotRight && puppetTwoYRotationFrames % 10  == 0) twoPuppet.yrotation --;
      }

      if(rotScaleModify){
        if(rotLeft && puppetTwoYRotationFrames % 10  == 0) twoPuppet.zrotation -= 15;
        if(rotRight && puppetTwoYRotationFrames % 10  == 0) twoPuppet.zrotation += 15;
      }

      //cycle rotation
      if(scene[puppeteerTwoPuppet].yrotation > 7)twoPuppet.yrotation = 0;
      if(scene[puppeteerTwoPuppet].yrotation < 0)twoPuppet.yrotation = 7;
    }

    if(rotLeft || rotRight || puppetScaling ){
      puppetTwoYRotationFrames ++;
    } else {
      puppetTwoYRotationFrames = 0;
    }

    //update pose
    if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.pose1) ))twoPuppet.pose = 0;
    if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.pose2) ))twoPuppet.pose = 1;
    if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.pose3) ))twoPuppet.pose = 2;
    if(keyIsDown( convertToKeyCode(puppeteerTwoKeys.pose4) ))twoPuppet.pose = 3;
    if(twoPuppet.pose > masterPuppets[twoPuppet.name].poses.length - 1 )twoPuppet.pose = masterPuppets[twoPuppet.name].poses.length - 1

  }

  //update puppet three
  if(puppeteerThreePuppet != null){
    var threePuppet = scene[puppeteerThreePuppet]
    var rotScaleModify = (keyIsDown( convertToKeyCode(puppeteerThreeKeys.rotScaleModify) ) && !puppetThreeUpDownModify)
    var puppetScaling = false;

    if(!rotScaleModify){
      //update left-right movement
      if(keyIsDown( convertToKeyCode(puppeteerThreeKeys.moveRight) )) threePuppet.x += puppetSpeed * scene[puppeteerThreePuppet].scale
      if(keyIsDown( convertToKeyCode(puppeteerThreeKeys.moveLeft) )) threePuppet.x -= puppetSpeed * scene[puppeteerThreePuppet].scale
    }

    //update puppet scaling
    if(rotScaleModify){
      if(keyIsDown( convertToKeyCode(puppeteerThreeKeys.moveLeft) )){
        if(puppetThreeYRotationFrames % 10 == 0)threePuppet.scale -= 0.1;
        puppetScaling = true
      }
      if(keyIsDown( convertToKeyCode(puppeteerThreeKeys.moveRight) )){
        if(puppetThreeYRotationFrames % 10 == 0)threePuppet.scale += 0.1;
        puppetScaling = true
      }
      if(threePuppet.scale < minScale)threePuppet.scale = minScale;
    }

    //update up-down movement
    if(puppetThreeUpDownModify && keyIsDown( convertToKeyCode(puppeteerThreeKeys.speak) )) threePuppet.y -= puppetSpeed * threePuppet.scale
    if(puppetThreeUpDownModify && keyIsDown( convertToKeyCode(puppeteerThreeKeys.rotScaleModify) )) threePuppet.y += puppetSpeed * threePuppet.scale

    //update speaking
    scene[puppeteerThreePuppet].speaking = keyIsDown(convertToKeyCode(puppeteerThreeKeys.speak)) && !puppetThreeUpDownModify

    //update y rotation
    var rotLeft = keyIsDown( convertToKeyCode(puppeteerThreeKeys.rotateLeft) )
    var rotRight = keyIsDown( convertToKeyCode(puppeteerThreeKeys.rotateRight) )

    if(rotLeft || rotRight){

      if(!rotScaleModify){
        //rotate on the y axis
        if(rotLeft && puppetThreeYRotationFrames % 10  == 0) threePuppet.yrotation ++;
        if(rotRight && puppetThreeYRotationFrames % 10  == 0) threePuppet.yrotation --;
      }

      if(rotScaleModify){
        if(rotLeft && puppetThreeYRotationFrames % 10  == 0) threePuppet.zrotation -= 15;
        if(rotRight && puppetThreeYRotationFrames % 10  == 0) threePuppet.zrotation += 15;
      }

      //cycle rotation
      if(scene[puppeteerThreePuppet].yrotation > 7)threePuppet.yrotation = 0;
      if(scene[puppeteerThreePuppet].yrotation < 0)threePuppet.yrotation = 7;
    }

    if(rotLeft || rotRight || puppetScaling ){
      puppetThreeYRotationFrames ++;
    } else {
      puppetThreeYRotationFrames = 0;
    }

    //update pose
    if(keyIsDown( convertToKeyCode(puppeteerThreeKeys.pose1) ))threePuppet.pose = 0;
    if(keyIsDown( convertToKeyCode(puppeteerThreeKeys.pose2) ))threePuppet.pose = 1;
    if(keyIsDown( 188 ))threePuppet.pose = 2; //comma (had to be hard coded)
    if(keyIsDown( 190 ))threePuppet.pose = 3; //period (had to be hard coded)
    if(threePuppet.pose > masterPuppets[threePuppet.name].poses.length - 1 )threePuppet.pose = masterPuppets[threePuppet.name].poses.length - 1

  }

  releaseCountdown --;

}

function renderCursor(){
  if(puppeteerOnePuppet == null){
    if(!performanceMode){
      push();
      imageMode(CORNER)

      if(!deletingPuppet){
        //check whether or not the user is hovering over a puppet or button
        if(puppetHovering() != null && puppetAssigning == null)image(buttonImages.cursorPointing, mouseX, mouseY, buttonImages.cursorPointing.width * 2, buttonImages.cursorPointing.height * 2);
        else image(buttonImages.cursor, mouseX, mouseY);
      }

      pop();
    }
    if(deletingPuppet){
      image(buttonImages.trashClosed, mouseX, mouseY, buttonImages.trashClosed.width * 2, buttonImages.trashClosed.height * 2)
    }

    if(performanceMode && puppetAssigning == null){
      fill(255,150); noStroke();
      ellipse(mouseX, mouseY, 5)
    }

  }
}

function renderUI(){
  push();

  imageMode(CORNER)
  rectMode(CORNER)
  //draw a black bar at the bottom of the screen
  noStroke(); fill(0);
  rect(0, height-35, width, 40)


  if(!performanceMode){
    //these buttons require performance mode to be off

    //render controls (old)
    //if(showControls)image(buttonImages.controls, 30, 30)

    noStroke(); fill(0);
    rect(0, height-35, width, 40)

    //render performance mode button
    image(buttonImages.openEye, buttons.performanceMode.x, buttons.performanceMode.y )

    //render trash button
    if(deletingPuppet)image(buttonImages.trashOpen, buttons.trash.x, buttons.trash.y);
    else image(buttonImages.trashClosed, buttons.trash.x, buttons.trash.y);

    //render controller button (shows controls)
    image(buttonImages.controller, buttons.controller.x, buttons.controller.y)

    //render cycle add button
    image(buttonImages.cycleAdd, buttons.cycleAdd.x, buttons.cycleAdd.y)

    //render shopLink button
    image(buttonImages.shopLink, buttons.shopLink.x, buttons.shopLink.y)

    //render reset button
    image(buttonImages.reset, buttons.reset.x, buttons.reset.y)

    //render help text
    helpText = ''
    if(puppeteerOnePuppet == null && mouseY < height-40)helpText = "Click on a puppet's belly to use it."
    if(puppeteerOnePuppet == null && tookFirstPuppet)helpText = 'Click the "plus" to try out more puppets.'
    if(showControls)helpText = 'Select the controller to hide the controls.'
    if(puppeteerOnePuppet != null)helpText = 'Right click twice to release this puppet.'

    if(puppetAssigning != null)helpText = 'Type the 1, 2, or 3 key'
    if(scene.length == 0)helpText = 'Select "Choose File" or "Browse" to add a puppet via a json file.'

    var bhov = buttonHovering();
    if(bhov == 'performanceMode')helpText = 'Click to toggle performance mode'
    if(bhov == 'trash')helpText = 'Click to use eraser'
    if(bhov == 'controller')helpText = 'Click to show/hide controls'
    if(bhov == 'cycleAdd')helpText = 'Click to add a random puppet'
    if(bhov == 'help')helpText = 'Click to open a tutorial video in a new tab'
    if(bhov == 'shopLink')helpText = 'Click to get more puppets, sounds, and backgrounds'
    if(bhov == 'reset')helpText = "Click to reset all puppets' positions"
    if(mouseY > height)helpText = "With 'Choose File', select an image file, sound file, or puppet file (.json)"

    if(deletingPuppet)helpText = 'Click on a puppet to erase it. Select the cursor to stop erasing.'
    if(addSoundQueue.length > 0)helpText = 'Press a key to bind to this sound: ' + addSoundQueue[0]
    fill(255); noStroke(); textAlign(LEFT)
    text(helpText, 320, height - 12)

    //render help button
    image(buttonImages.help, buttons.help.x, buttons.help.y)
    fill(255,255,0);
    text('Video Tutorial', width - 130, height - 12)

    if(puppetAssigning != null){
      push();
      textAlign(CENTER);
      background(0,220)
      fill(255);
      text('Type the 1, 2, or 3 key\nto assign this puppet to a control scheme\n\nClick to cancel', width/2, height/2)
      pop();
    }

  }

  //render performance mode button
  if(performanceMode)image(buttonImages.closedEye,  buttons.performanceMode.x, buttons.performanceMode.y )




  pop();
}

function displayControls(){

  //display red controls
  var bufferOver = (puppetOneShowModifierImageBuffer < 0 && puppeteerOnePuppet != null)

  noStroke();
  image(mouseImages.baseMouse, 95, 73)
  if(!leftClickDown){image(mouseImages.leftClick, 95, 73);fill(255,150)}
  if(leftClickDown){image(mouseImages.leftClickDown, 95, 73);fill(0)}

  if(puppeteerOnePuppet != null)text('Speak', 40, 45)
  else text('Puppet', 40, 45)
  if(!rightClickDown){image(mouseImages.rightClick, 95, 73);fill(255,150)}
  if(rightClickDown){image(mouseImages.rightClickDown, 95, 73);fill(0)}
  text('Release', 108, 45)

  fill(255,150);
  textAlign(CENTER)
  if( !(keyIsDown(UP_ARROW) && bufferOver) && !(keyIsDown(DOWN_ARROW) && bufferOver) )text('Pivot',95,85)
  if(keyIsDown(UP_ARROW) && bufferOver)text('Rotate',95,85)
  if(keyIsDown(DOWN_ARROW) && bufferOver)text('Scale',95,85)

  image(mouseImages.scroll, 95, 73)




  //var redColor = color(204,71,68)
  var redColor = color(108,42,42)
  if(keyIsDown(UP_ARROW)){
    if(!bufferOver)drawKey('↑', 'Pose 1', 'highlight', 1, 2.5)
    if(bufferOver)drawKey('↑', 'Rotate', 'highlight', 1, 2.5)
  }
  else drawKey('↑', 'Pose 1', redColor, 1, 2.5);

  if(keyIsDown(DOWN_ARROW)){
    if(!bufferOver)drawKey('↓', 'Pose 3', 'highlight', 1, 3.5)
    if(bufferOver)drawKey('↓', 'Scale', 'highlight', 1, 3.5)
  }
  else drawKey('↓', 'Pose 3', redColor, 1, 3.5);

  if(keyIsDown(LEFT_ARROW))drawKey('←', 'Pose 2', 'highlight', 0, 3.5)
  else drawKey('←', 'Pose 2', redColor, 0, 3.5);
  if(keyIsDown(RIGHT_ARROW))drawKey('→', 'Pose 4', 'highlight', 2, 3.5)
  else drawKey('→', 'Pose 4', redColor, 2, 3.5);

  //display green controls
  //var greenColor = color(83,159,107)
  var greenColor = color(32, 88, 36)
  var twoHoldingAdjust = keyIsDown(convertToKeyCode('S'))
  var twoHoldingUpDownModify = puppetTwoUpDownModify
  if(!twoHoldingAdjust && !twoHoldingUpDownModify){
    drawKey('Q', 'Pivot', greenColor, 5, 0)
    drawKey('W', 'Speak', greenColor, 6, 0)
    drawKey('E', 'Pivot', greenColor, 7, 0)
    drawKey('A', '←', greenColor, 5, 1)
    drawKey('S', 'Adjust', greenColor, 6, 1)
    drawKey('D', '→', greenColor, 7, 1)
  }
  if(twoHoldingAdjust && !twoHoldingUpDownModify){
    drawKey('Q', 'Rotate', greenColor, 5, 0, 1, true)
    drawKey('W', 'Speak', greenColor, 6, 0)
    drawKey('E', 'Rotate', greenColor, 7, 0, 1, true)
    drawKey('A', 'Shrink', greenColor, 5, 1, 1, true)
    drawKey('S', 'Adjust', greenColor, 6, 1)
    drawKey('D', 'Grow', greenColor, 7, 1, 1, true)
  }
  if(twoHoldingUpDownModify){
    drawKey('Q', 'Pivot', greenColor, 5, 0, 1)
    drawKey('W', '↑', greenColor, 6, 0, 1, true)
    drawKey('E', 'Pivot', greenColor, 7, 0)
    drawKey('A', '←', greenColor, 5, 1)
    drawKey('S', '↓', greenColor, 6, 1, 1, true)
    drawKey('D', '→', greenColor, 7, 1)
  }

  drawKey('Z', 'Pose 1', greenColor, 5, 2.25)
  drawKey('X', 'Pose 2', greenColor, 6, 2.25)
  drawKey('C', 'Pose 3', greenColor, 7, 2.25)
  drawKey('V', 'Pose 4', greenColor, 8, 2.25)

  if(twoHoldingUpDownModify)drawKey('Shift', 'Free Move', 'highlight', 5, 3.5, 3);
  else drawKey('Shift', 'Free Move', greenColor, 5, 3.5, 3);



  //display blue controls
  //var blueColor = color(83,99,159)
  var blueColor = color(41,49,91)
  var threeHoldingAdjust = keyIsDown(convertToKeyCode('K'))
  var threeHoldingUpDownModify = keyIsDown(32)
  if(!threeHoldingAdjust && !threeHoldingUpDownModify){
    drawKey('U', 'Pivot', blueColor, 10, 0)
    drawKey('I', 'Speak', blueColor, 11, 0)
    drawKey('O', 'Pivot', blueColor, 12, 0)
    drawKey('J', '←', blueColor, 10, 1)
    drawKey('K', 'Adjust', blueColor, 11, 1)
    drawKey('L', '→', blueColor, 12, 1)
  }
  if(threeHoldingAdjust && !threeHoldingUpDownModify){
    drawKey('U', 'Rotate', blueColor, 10, 0, 1, true)
    drawKey('I', 'Speak', blueColor, 11, 0)
    drawKey('O', 'Rotate', blueColor, 12, 0, 1, true)
    drawKey('J', 'Shrink', blueColor, 10, 1, 1, true)
    drawKey('K', 'Adjust', blueColor, 11, 1)
    drawKey('L', 'Grow', blueColor, 12, 1, 1, true)
  }
  if(threeHoldingUpDownModify){
    drawKey('U', 'Pivot', blueColor, 10, 0, 1)
    drawKey('I', '↑', blueColor, 11, 0, 1, true)
    drawKey('O', 'Pivot', blueColor, 12, 0)
    drawKey('J', '←', blueColor, 10, 1)
    drawKey('K', '↓', blueColor, 11, 1, 1, true)
    drawKey('L', '→', blueColor, 12, 1)
  }

  drawKey('N', 'Pose 1', blueColor, 10, 2.25)
  drawKey('M', 'Pose 2', blueColor, 11, 2.25)
  if(keyIsDown(188) )drawKey(',', 'Pose 3', 'highlight', 12, 2.25);
  else drawKey(',', 'Pose 3', blueColor, 12, 2.25);
  if(keyIsDown(190) )drawKey('.', 'Pose 4', 'highlight', 13, 2.25)
  else drawKey('.', 'Pose 4', blueColor, 13, 2.25);

  if(threeHoldingUpDownModify)drawKey('Space', 'Free Move', 'highlight', 10, 3.5, 4);
  else drawKey('Space', 'Free Move', blueColor, 10, 3.5, 4);

}

function drawKey(theKey, keyText, theColor, x, y, w, special){
  var finalColor = theColor
  if(theKey.length < 2 && keyIsDown(convertToKeyCode(theKey)))finalColor = 'highlight'

  if(finalColor == 'highlight')fill(255);
  else fill(finalColor);


  noStroke();
  if(!w)rect( (x*50) + 25 , (y*50) + 25 ,44,44)
  if(w)rect( (x*50) + 25 , (y*50) + 25 ,44 * w,44)

  if(!special)fill(255,150);
  if(special == true)fill(255,200,64);
  if(finalColor == 'highlight')fill(0);


  if(w == undefined || w == 1){
    textAlign(CENTER,CENTER);
    textSize(25);
    text(theKey, (x*50) + 25 +22, (y*50) + 25 +17);
    textSize(13);
    text(keyText, (x*50) + 25 +22, (y*50) + 25 +37)
  }
  if(w > 1){
    textAlign(LEFT);
    textSize(25);
    text(theKey, (x*50) + 25 + 10, (y*50) + 25 + 17);
    textSize(13);
    text(keyText, (x*50) + 25 + 10, (y*50) + 25 +37)
  }
}

function renderLogo(){
  if(frameCount < 80){
    background(0);
    image(logo, width/2, height/2 - 20)
  }
  if(frameCount >= 80 && frameCount < 140){
    push();
    transparency = 255 - (255 * ((frameCount - 80)/60))
    background(0, transparency)
    tint(255, transparency)
    image(logo, width/2, height/2 - 20)
    pop();
  }
}

function buttonHovering(){
  var ret = null;
  var buttonKeys = Object.keys(buttons)
  for(var i = 0; i < buttonKeys.length; i ++){
    var thisButton = buttons[buttonKeys[i]]
    var hoveringHere = collidePointRect(mouseX, mouseY, thisButton.x, thisButton.y, thisButton.w, thisButton.h)
    if(hoveringHere)ret = buttonKeys[i]
  }
  return ret;
}

function currentPoseHitbox(i){
  //given the index of a puppet in the scene, returns the x,y,w,h of the hitbox of the pose it's currently doing
  var cpose = scene[i].pose
  var cangle = scene[i].yrotation
  if(scene[i].speaking)var chit = masterPuppets[scene[i].name].poses[cpose][cangle].speakhit
  if(!scene[i].speaking)var chit = masterPuppets[scene[i].name].poses[cpose][cangle].nospeakhit
  return chit
}

function puppetHovering(){
  //returns which puppet the user is currently hovering over
  //if user is hovering over multiple, this function favors
  //the puppet closest to the end of the scene array

  ret = null; //index of the puppet we are hovering over with the mouse
  for(var i = 0; i < scene.length; i ++){
    var hitbox = currentPoseHitbox(i);

    var w = masterPuppets[scene[i].name].width * scene[i].scale
    var h = masterPuppets[scene[i].name].height * scene[i].scale
    var hitw = hitbox.w * scene[i].scale
    var hith = hitbox.h * scene[i].scale

    var centerPoint = createVector( scene[i].x, scene[i].y )

    var hitx = (scene[i].x - (w/2)) + (hitbox.x * scene[i].scale)
    var hity = (scene[i].y - (h/2)) + (hitbox.y * scene[i].scale)

    var hitx2 = hitx + hitw
    var hity2 = hity + hith

    var hit1 = createVector(hitx, hity)
    var hit2 = createVector(hitx, hity2)
    var hit3 = createVector(hitx2, hity2)
    var hit4 = createVector(hitx2, hity)

    hit1 = rotatePoint(hit1, scene[i].zrotation, centerPoint)
    hit2 = rotatePoint(hit2, scene[i].zrotation, centerPoint)
    hit3 = rotatePoint(hit3, scene[i].zrotation, centerPoint)
    hit4 = rotatePoint(hit4, scene[i].zrotation, centerPoint)
    //var hoveringHere = collidePointRect( mouseX, mouseY, hitx, hity, hitw, hith)
    var hoveringHere = collidePointPoly( mouseX, mouseY,  [hit1, hit2, hit3, hit4])
    fill(255,0,0,60); noStroke();

    //render the hitbox (for debugging purposes)
    /*beginShape();
    vertex(hit1.x, hit1.y)
    vertex(hit2.x, hit2.y)
    vertex(hit3.x, hit3.y)
    vertex(hit4.x, hit4.y)
    endShape();*/

    if(hoveringHere)ret = i;
  }

  return ret;
}

function createPuppetFromFiles(puppetName, numberOfPoses){
  /*
  Call in preload()
  Given a string of the name of the puppet, and the number of poses created for that puppet,
  creates a json object of the puppet.

  For this function to work, puppet images need to be named according to this scheme:

  puppetName_poseNumber_angleNumber_speakOrNoSpeak.png
  ex. tieGuy_0_0_nospeak.png

  (pose number and angle number are 0-based)
  The angle number is a number from 0-7 which represents which direction the puppet is facing
  (0 = forward, 2 = left, 4 = backward, 6 = right)

  The puppets must also be placed in a folder with their name on it!

  HOW DO I RENAME PUPPET IMAGES QUICKLY?
  Use the Mirage image viewer.
  1. Right click on an image and select "Open With -> Mirage"
  2. Press F2 to rename the image quickly
  3. Press the down arrow to move to the next image

  */
  var ret = {}
  ret.name = puppetName
  ret.dataType = 'puppet'
  ret.poses = []

  imagesLoaded = 0;

  for(var i = 0; i < numberOfPoses; i ++){
    //for each pose of this puppet...
    ret.poses.push([])
    for(var j = 0; j < 8; j ++){
      //for each angle of this pose...

      //load in the speak and nospeak images
      ret.poses[i].push(
        {
          'speak': loadImage( puppetName + '/' + puppetName + '_' + i + '_' + j + '_' + 'speak.png', imageLoadCallback() ),
          'nospeak': loadImage( puppetName + '/' + puppetName + '_' + i + '_' + j + '_' + 'nospeak.png', imageLoadCallback() ),
        }
      )

    }
  }
  if(imagesLoaded == 16 * numberOfPoses){
    ret.width = ret.poses[0][0].nospeak.width;
    ret.height = ret.poses[0][0].nospeak.height;
    return ret;
  }
}

function puppetToJsonFile(puppet){
  /*
  given a puppet json object created with createPuppetFromFiles(),
  returns a json object where all image data has been converted to base64 encoded strings.
  This allows the json object to be saved as a json file.
  In other words, the entire puppet (and data of all the images that come with it) can be saved to a single json file.

  A regular puppet json object created with createPuppetFromFiles()
  cannot be saved as a json file (it throws an error)
  */
  var ret = {}
  ret.name = puppet.name
  ret.dataType = 'puppet'
  ret.width = puppet.poses[0][0].nospeak.width;
  ret.height = puppet.poses[0][0].nospeak.height;
  ret.poses = []
  for(var i = 0; i < puppet.poses.length; i ++){
    //for each pose of this puppet...
    ret.poses.push([])
    for(var j = 0; j < 8; j ++){
      //for each angle of this pose...

      //create speak and nospeak strings of the images
      ret.poses[i].push(
        {
          'speak': ImageToString(puppet.poses[i][j].speak),
          'nospeak': ImageToString(puppet.poses[i][j].nospeak)
        }
      )
    }
  }
  return ret;
}

function jsonFileToPuppet(jsonObject){
  /*given a json object created with puppetToJsonFile(),
  returns a json object of a puppet where all image data has been converted back into p5 image objects.
  This allows the program to render the puppets on screen.
  */

  /*note to self: use loadImage()'s success callback to count how many images have been loaded,
  so that we can tell at what point the puppet finishes loading.
  */
  var ret = {}
  ret.name = jsonObject.name
  ret.dataType = 'puppet' //as opposed to scene or puppet pack
  ret.poses = []

  /*ret.hitx = jsonObject.hitx
  ret.hity = jsonObject.hity
  ret.hitw = jsonObject.hitw
  ret.hith = jsonObject.hith*/

  var totalImgCount = puppetImageCount(jsonObject)
  imagesLoaded = 0;

  for(var i = 0; i < jsonObject.poses.length; i ++){
    //for each pose of this puppet...
    ret.poses.push([])
    for(var j = 0; j < 8; j ++){
      //for each angle of this pose...

      //create speak and nospeak strings of the images
      ret.poses[i].push(
        {
          'speak': loadImage(jsonObject.poses[i][j].speak, imageLoadCallback()),
          'nospeak': loadImage(jsonObject.poses[i][j].nospeak, imageLoadCallback()),
          'speakhit': jsonObject.poses[i][j].speakhit, //hit box of the image's "speak" pose
          'nospeakhit': jsonObject.poses[i][j].nospeakhit //hit box of the image's "nospeak" pose
        }
      )
    }
  }
  ret.width = ret.poses[0][0].nospeak.width;
  ret.height = ret.poses[0][0].nospeak.height;
  if(imagesLoaded == totalImgCount){
    imagesLoaded = 0; //reset imagesLoaded for another use
    return ret;
  }
}

function imageLoadCallback(){
  /*
  This function is for counting the total number of images loaded.
  The count is stored in the global variable imagesLoaded
  */
  imagesLoaded ++;
}

function handlePuppetInput(file){

  if(file.name.endsWith('.json')){ //if the file is either a .json file
    x = file.data;

    if(x.dataType == 'puppet'){ //if this file is definitely a puppet
      x = jsonFileToPuppet(x);
      if(!contains(x.name, masterPuppets )){
        //only add this puppet to masterPuppets if we haven't done so already
        masterPuppets[x.name] = x;
      }

      //next, add this puppet to the scene

      if(addPuppetBuffer <= 0)addPuppetBuffer = newPuppetBuffer;
      else addPuppetBuffer += newPuppetBuffer;
      addPuppetQueue.push(x.name)

    }

  }

  if(file.type == 'audio'){
    sounds[file.name] = {
      'sound':createAudio(file.data),
      'key': null //key still needs to be set
    }
    addSoundQueue.push(file.name)
  }

  if(file.type == 'image'){
    currentBackground = createImg(file.data, '')
    currentBackground.hide();

    canvasResizeBuffer = 10;
    //fitCanvasToBackground();
  }

  //deleting and recreating the file input should allow us to select the same file twice
  puppetFileInput.remove();

  puppetFileInput = createFileInput(handlePuppetInput)
  canvasPosition(puppetFileInput, myCanvas, 20, height+10)

}

function fitCanvasToBackground(){
  var maxWidth = constrain(windowWidth - edgeRoom, 500, 3000)
  //var neww = constrain(currentBackground.width, 500, maxWidth)
  var neww = constrain(windowWidth - edgeRoom, 500, windowWidth - edgeRoom);
  var newh = currentBackground.height * (neww/currentBackground.width)

  if(newh > windowHeight - edgeRoom ){
    console.log('too tall')
    newh = windowHeight - edgeRoom;
    neww = currentBackground.width * (newh/currentBackground.height)
  }

  resizeCanvas( neww, newh )

  if(!performanceMode){
    canvasPosition(puppetFileInput, myCanvas, 20, height+10)
  }

  updateButtonLocations();
}

function handlePuppetQueue(){
  /*
  For puppets that were just added to the scene, handle adding them in
  */
  if(addPuppetBuffer == 0){
    /*if the addPuppetBuffer frame counter reaches 0 and only 0,
    then take all the puppets in the queue and add them to the scene.*/
    for(var i = 0; i < addPuppetQueue.length; i ++){
      //correct the width and height variables of these puppets
      masterPuppets[addPuppetQueue[i]].width = masterPuppets[addPuppetQueue[i]].poses[0][0].nospeak.width;
      masterPuppets[addPuppetQueue[i]].height = masterPuppets[addPuppetQueue[i]].poses[0][0].nospeak.height;

      //add a copy of the puppet to the scene
      addPuppetToScene(x.name)
    }
    addPuppetQueue = [];
    //empty out the list since we added all the puppets in the queue
    addPuppetBuffer = -1;
  }

  addPuppetBuffer --;
}

function resetPuppetPositions(){
  var spacing = (width - 200)/(scene.length-1)
  if( spacing < 0 || spacing == Infinity )spacing = 0;
  for(var i = 0; i < scene.length; i ++){
    scene[i].scale = 1;
    //scene[i].yrotation = 0;
    scene[i].zrotation = 0;
    scene[i].x = (i * spacing) + 100
    scene[i].y = height/2
    //scene[i].pose = 0;
  }
}

function addPuppetToScene(puppetName){
  scene.push(
    {
      'name': puppetName,
      'puppeteer': null,
      'x': width/2,
      'y': height/2,
      'zrotation': 0,

      'pose': 0,
      'speaking': false,
      'yrotation': 0,
      'scale': 1, //scale multiplier
    }
  )
  resetPuppetPositions();
}

function handleSoundQueue(){
  if(addSoundQueue.length > 0){
    background(0, 200);
    fill(255); noStroke();
    text('Press a key to bind to this sound: ' + addSoundQueue[0], 30, 30)
  }
}

function puppetImageCount(puppet){
  /*
  Given a puppet json object, returns how many images the puppet contains.

  We multiply by 16 because every pose contains 8 rotations,
  and each rotation contains a speak and nospeak variation.
  */
  return puppet.poses.length * 16
}

function convertToKeyCode(uppercaseString) {
  //only guaranteed to work or characters a-z, A-Z, and 0-9
  return uppercaseString.charCodeAt()
}

function windowResized(){

  resizeCanvas( constrain(1500, 0, windowWidth - edgeRoom ), constrain(750, 0, windowHeight - edgeRoom ) )

  if(!performanceMode){
    canvasPosition(puppetFileInput, myCanvas, 20, height+10)
  }

  if(currentBackground)canvasResizeBuffer = 0;

  updateButtonLocations();
}

function handleCanvasResize(){

  if(canvasResizeBuffer == 0){
    fitCanvasToBackground();
  }
  canvasResizeBuffer --;
}
