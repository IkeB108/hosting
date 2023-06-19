function dispMenuScreen(){
  image(platformsBG, 0, 0, gWidth, gHeight);
  //background(backgroundColor);
  var textColor = color(255);
  var highlightBoxColor = color(0,100);
  textAlign(CENTER,CENTER); textSize(15);
  //noStroke();fill(textColor);text('BEETLE RACE', gWidth/2,gHeight*(1/8));
  imageMode(CENTER);
  image(beetleRaceTitle, gWidth/2, gHeight*(1/8) + 10)
  imageMode(CORNER);

  startBox = centerRect(gWidth/2, gHeight*(5/8),50,20)
  tutorialBox = centerRect(gWidth/2, gHeight*(6/8),50,20)
  optionsBox = centerRect(gWidth/2, gHeight*(7/8),50,20)

  if(mouseOverBox(startBox)){noStroke();fill(highlightBoxColor);dispBox(startBox)}
  fill(textColor);text('Start', startBox[0]+(startBox[2]/2), startBox[1]+(startBox[3]/2) - 2.5);

  if(mouseOverBox(tutorialBox)){noStroke();fill(highlightBoxColor);dispBox(tutorialBox)}
  fill(textColor);text('Tutorial', tutorialBox[0]+(tutorialBox[2]/2), tutorialBox[1]+(tutorialBox[3]/2) - 2.5);

  if(mouseOverBox(optionsBox)){noStroke();fill(highlightBoxColor);dispBox(optionsBox)}
  fill(textColor);text('Options', optionsBox[0]+(optionsBox[2]/2), optionsBox[1]+(optionsBox[3]/2) - 2.5);

  //establish animation frame for the animation of sprites flashing pink/black
  var animationFrame = ceil((frameCount % 90)/10)
  if(animationFrame == 0)animationFrame = 1;

  tint(0);
  if(animationFrame > 1 && animationFrame < 6)tint(juiceWallColor);
  image(bugType_Skitter_Walk_1,50-7,70,14,14)

  tint(0);
  if(animationFrame > 2 && animationFrame < 7)tint(juiceWallColor);
  image(bugType_Bouncy,83-7,70,14,14)

  tint(0);
  if(animationFrame > 3 && animationFrame < 8)tint(juiceWallColor);
  image(bugType_Hover_1,116-7,70,14,14)

  tint(0);
  if(animationFrame > 4 && animationFrame < 9)tint(juiceWallColor);
  image(bugType_Sticky_Ground,150-7,70,14,14)

  textSize(7)
  fill(textColor);text('Note: This game uses flashing lights. Turn them off in Options.', gWidth/2, gHeight - 6)
}

function mouseOverBox(box){ //returns whether player cursor is hovering over a box
  return collidePointRect(gMouseX(),gMouseY(),box[0],box[1],box[2],box[3]);
}
function dispBox(box){ //displays a box of the form [x,y,w,h]
  rect(box[0],box[1],box[2],box[3])
}
function centerRect(centerX,centerY,w,h){ //returns [x,y,w,h] for a rectangle centered around centerX and centerY
  var newX = centerX - (w/2)
  var newY = centerY - (h/2)
  return [newX,newY,w,h]
}
