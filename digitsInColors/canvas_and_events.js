function setupCanvas(firstTime){
  var h = windowHeight - pxSpacing * 2;
  var w = windowWidth - pxSpacing * 2;
  if(h/w <= 1.5)w = h / 1.5;
  resizeCanvas(w,h)
  //Set canvas attribute style to "touch-action: none"
  
  shapeGraphic = createGraphics(w, h);
  sg = shapeGraphic;
  shapeWithBackgroundGraphic = createGraphics(w,h);
  swbg = shapeWithBackgroundGraphic;
  swbg.imageMode(CENTER,CENTER)
  if(!firstTime)setRenderMode(renderMode)
  menu_height = height/2;
  textSize(width/30);
  
}

function windowResized(){
  setupCanvas();
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

function clickBegin(){
  // console.log('click begin')
  mousepos_at_press = {
    x: mousepos.x,
    y: mousepos.y
  }
  number_position_at_press = {
    x: number_position.x,
    y: number_position.y
  }
  factor_list_offset_at_press = factor_list_offset
  
  number_selector_at_press = number_to_draw;
  
  
  mouse_over_at_press = getMouseOver();
  
  if(mouse_over_at_press == "menu toggle button"){
    toggleMenu();
  }
  
  
  
  var moatps = mouse_over_at_press.split(" ")
  if(moatps[0] == "grab"){
    factor_grabbed = int(moatps[1])
  }
  if(moatps[0] == "size"){
    factor_resizing = int(moatps[1])
    factor_size_at_press = ntd_radii[ int(moatps[1]) ]
    preferences_radius[number_to_draw] = getPreferredRadii();
  }
  
  mousepos.pressed = true;
  
}

function clickEnd(){
  // console.log('click end')
  
  // if(dist(mousepos_at_press.x, mousepos_at_press.y, mousepos.x, mousepos.y) < 30 ){
  //   number_to_draw ++;
  //   setNumber(number_to_draw)
  // }
  
  if(iterated_drawing_frame !== -2 && mouse_over_at_press == "none")refresh_iterated_drawing();
  
  
  
  if(mousepos.isclick)onclick_ui();
  
  mousepos_at_press = {x:null,y:null}
  mousepos.isclick = true; //assume true until proven otherwise
  mouse_over_at_release = getMouseOver();
  if(factor_drop_position !== null){
    //Make factors swap places
    var value_of_factor_grabbed = ntd_factors[factor_grabbed]
    var value_of_factor_replaced = ntd_factors[factor_drop_position]
    ntd_factors[factor_grabbed] = value_of_factor_replaced;
    ntd_factors[factor_drop_position] = value_of_factor_grabbed;
    ntd_radii = getPreferredRadii();
    setRenderMode(renderMode);
  }
  factor_grabbed = null;
  factor_drop_position = null;
  factor_resizing = null;
  factor_size_at_press = null;
  mousepos.pressed = false;
}

function clickMove(){
  if(mouse_over_at_press == 'none'){
    //Only pan around if the user DIDN'T click/tap any UI elements at mouse press
    number_position.x = number_position_at_press.x + (mousepos.x - mousepos_at_press.x)
    number_position.y = number_position_at_press.y + (mousepos.y - mousepos_at_press.y)
    if(iterated_drawing_frame !== -2)refresh_iterated_drawing();
  }
}

function updateCursor(){
  var mouseOver = getMouseOver();
  var setToDefault = true;
  if(mouseOver == 'none'){
    setCursorStyle("grab")
    setToDefault = false;
  }
  if(mouseOver == "number selector"){
    setCursorStyle('ew-resize')
    setToDefault = false;
  }
  if(mouseOver !== null && mouseOver.startsWith("grab") ){
    setCursorStyle('move')
    setToDefault = false;
  }
  if( mouseOver !== null && !onMobile && (mouseOver.startsWith("eye") ||
      mouseOver == "menu toggle button" || 
      mouseOver == "information") ){
      setCursorStyle('pointer')
      setToDefault = false;
  }
  if( mouseOver !== null && !onMobile && (mouseOver.startsWith('play')) ){
    if(iterated_drawing_frame == -2)
    setCursorStyle('pointer')
    else
    setCursorStyle('not-allowed')
    setToDefault = false;
    
  }
  if( mouseOver.startsWith("size") ){
    setCursorStyle("ns-resize")
    setToDefault = false;
  }
  if(setToDefault)setCursorStyle('default')
}

function setCursorStyle(setting){
  if(canvas.style.cursor !== setting){
    canvas.style.cursor = setting
    // var canvasParent = canvas.parentElement
    // canvasParent.style.hidden = true;
    // canvasParent.style.hidden = false;
    // console.log(canvas.style.cursor)
  }
  
}



// The functions below can pretty much be ignored

function mouseDown(e){
  if(!onMobile){
    if(logMouse)console.log("Mouse down x" + round(mousepos.x) + " y" + round(mousepos.y) )
    // console.log(mousepos)
    mousepos.pressed = true;
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
  clickBegin();
}

function touchEnd(e){
  // console.log(e)
  if(logMouse)console.log("Touch end x" + round(mousepos.x) + " y" + round(mousepos.y) )
  getMousePosFromEvent(e);
  mousepos.pressed = false;
  clickEnd();
}

function mouseWheel(e){
  if(menu_open && mousepos.y > height - menu_height){
    if(e.delta < 0)factor_list_offset --;
    if(e.delta > 0)factor_list_offset ++;
    if(factor_list_offset < 0)factor_list_offset = 0;
    if(factor_list_offset > ntd_factors.length-1)factor_list_offset = ntd_factors.length-1
  } else {
    if(e.delta < 0)zoom_multiplier += 0.1;
    if(e.delta > 0)zoom_multiplier -= 0.1;
    if(zoom_multiplier < 0.1)zoom_multiplier = 0.1;
    if(zoom_multiplier > 5)zoom_multiplier = 5;
    ntd_radii = getPreferredRadii();
    if(iterated_drawing_frame !== -2)refresh_iterated_drawing();
  }
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
