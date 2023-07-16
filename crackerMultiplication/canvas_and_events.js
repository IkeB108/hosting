function onclick(){
  if(shape_mouse_over == "whole cracker"){
    cracker_break_sound.play();
    cracker_broken = true;
  }
  
  var byy  = (width/10)*3.4 + pxSpacing;
  if( dist(mousepos.x, mousepos.y, width * (6/9), byy - ((width/22)/2) ) < (width/22) ){
    window.open("https://ikebot.dev/", "_blank")
  }
}

function clickBegin(){
  drawCracker();
  drawNumbers();
  mouse_over_at_press = shape_mouse_over
  multa_at_press = multa;
  multb_at_press = multb;
  // console.log(mouse_over_at_press)
}
function clickEnd(){
  if( dist(mousepos.x, mousepos.y, mousepos_at_press.x, mousepos_at_press.y) < 20 )onclick();
  if(onMobile && typeof mouse_over_at_press !== 'number' ){
    mousepos.x = 0;
    mousepos.y = 0;
    shape_mouse_over = null;
    mousepos_at_press = {x:null, y:null}
  }
}
function clickMove(){
  if(mouse_over_at_press == "multa"){
    var d = mousepos.y - mousepos_at_press.y
    var new_multa = multa_at_press - round(d/(width/10) )
    setMult(new_multa, multb)
  }
  if(mouse_over_at_press == "multb"){
    var d = mousepos.y - mousepos_at_press.y
    var new_multb = multb_at_press - round(d/(width/10) )
    setMult(multa, new_multb)
  }
}

function mouseWheel(){
  
}

function setupCanvas(){
  let h = null;
  let w = null;
  if(windowWidth/windowHeight >= (1/1.5)){
    h = windowHeight - (pxSpacing * 2);
    w = h * (1/1.5)
    console.log("Constraining height")
  } else {
    w = windowWidth - (pxSpacing * 2)
    h = w * 1.5
    console.log("Constraining width")
  }
  resizeCanvas(w,h)
  //Set canvas attribute style to "touch-action: none"
}

function windowResized(){
  pxSpacing = 30
  setupCanvas();
  textSize(width/10)
  tileZone = {
    x: width*0.3 + (pxSpacing*3),
    y: textSize() * 3.4 + (pxSpacing * 4) ,
    w: width * 0.4,
    h: height - (textSize()*3.4 + pxSpacing * 4) - pxSpacing
  }
}

function createCanvasEventListeners(){
  /*
  The default mouse behaviors from P5JS are not working
  very well on mobile and I need good tap and drag functionality
  so I'm coding it myself
  */
  document.body.addEventListener("mousedown", mouseDown)
  document.body.addEventListener("mousemove", mouseMove)
  document.body.addEventListener("mouseup", mouseUp)
  document.body.addEventListener("touchstart", touchStart)
  document.body.addEventListener("touchmove", touchMove)
  document.body.addEventListener("touchend", touchEnd)
  onMobile = false;
  logMouse = false; //Set to true to log mouse/touch movements and positions
  mousepos = {'x':null, 'y':null, 'pressed':false, 'isclick':false}
  mousepos2 = {'x':null, 'y':null, 'pressed':false} //Second finger if on mobile
  mousepos_at_press = {x:null,y:null}
  presses_count = 0;
}



function mouseDown(e){
  if(!onMobile){
    if(logMouse)console.log("Mouse down x" + round(mousepos.x) + " y" + round(mousepos.y) )
    // console.log(mousepos)
    mousepos.pressed = true;
    mousepos_at_press = {x: mousepos.x, y: mousepos.y}
    clickBegin();
  }
}
function mouseUp(e){
  if(!onMobile){
    if(logMouse)console.log("Mouse up x" + round(mousepos.x) + " y" + round(mousepos.y) )
    // console.log(mousepos)
    mousepos.pressed = false;
    clickEnd();
  }
}
function mouseMove(e){
  if(!onMobile){
    getMousePosFromEvent(e);
    if(mousepos.pressed)clickMove();
  }
}
function touchMove(e){
  getMousePosFromEvent(e);
  clickMove();
}
function touchStart(e){
  onMobile = true;
  if(logMouse)console.log("Touch start x" + round(mousepos.x) + " y" + round(mousepos.y) )
  getMousePosFromEvent(e);
  mousepos.pressed = true;
  mousepos_at_press = {x: mousepos.x, y: mousepos.y}
  clickBegin();
}
function touchEnd(e){
  // console.log(e)
  if(logMouse)console.log("Touch end x" + round(mousepos.x) + " y" + round(mousepos.y) )
  getMousePosFromEvent(e);
  mousepos.pressed = false;
  clickEnd();
}
function getMousePosFromEvent(e){
  var canvasBounding = canvas.getBoundingClientRect();
  mousepos.x = e.clientX - canvasBounding.x;
  mousepos.y = e.clientY - canvasBounding.y;
  if(e.touches){ //This is a touch, not a mouse click
    if(e.touches.length > 0){ //This is a touch start event.
      presses_count = e.touches.length
      mousepos.x = e.touches[0].clientX - canvasBounding.x;
      mousepos.y = e.touches[0].clientY - canvasBounding.y;
      if(e.touches.length > 1){ //There are two fingers on the screen
        mousepos2.x = e.touches[1].clientX - canvasBounding.x;
        mousepos2.y = e.touches[1].clientY - canvasBounding.y;
      }
    } else { //This is a touch end event
      presses_count = e.changedTouches.length
      mousepos.x = e.changedTouches[0].clientX - canvasBounding.x;
      mousepos.y = e.changedTouches[0].clientY - canvasBounding.y;
      if(e.changedTouches.length > 1){ //There are two fingers on the screen
        mousepos2.x = e.changedTouches[1].clientX - canvasBounding.x;
        mousepos2.y = e.changedTouches[1].clientY - canvasBounding.y;
      }
    }
  }
}
