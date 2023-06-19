function draw_ui(){
  //Check if a tap is still a click
  if(mousepos.pressed &&
    dist(mousepos_at_press.x, mousepos_at_press.y, mousepos.x, mousepos.y) > maxClickDistance){
    mousepos.isclick = false;
    // console.log("set to false")
  }
  if(mousepos.x < 0 || mousepos.x > width || mousepos.y < 0 || mousepos.y > height){
    // mousepos.isclick = false;
    // console.log("set to false")
  }
  //Zoom slider
  
  var zoom_max = 5;
  var zoom_min = 0.1;
  strokeWeight(8);
  stroke(255,160)
  var slider = getZoomSlider();
  line(slider.x, slider.y1, slider.x, slider.y2)
  var slider_pointy = map(zoom_multiplier, zoom_min, zoom_max, slider.y2, slider.y1 )
  noStroke(); fill(255);
  ellipse(slider.x, slider_pointy, 30)
  
  //Update zoom multiplier if user is zooming
  //This doesn't need to be done in draw_ui but it 
  //does need to be done every frame so I might as well put it here
  if(mouse_over_at_press == "slider" && mousepos.pressed){
    zoom_multiplier = map(mousepos.y, slider.y2, slider.y1, zoom_min, zoom_max)
    if(zoom_multiplier > zoom_max)zoom_multiplier = zoom_max;
    if(zoom_multiplier < zoom_min)zoom_multiplier = zoom_min;
    if(zoom_multiplier !== p_zoom_multiplier){
      ntd_radii = getPreferredRadii();
      if(iterated_drawing_frame !== -2)refresh_iterated_drawing();
    }
  }
  p_zoom_multiplier = zoom_multiplier;
  
  //Number selector
  if(true){
    push();
    textAlign(CENTER,BASELINE)
    fill(255); noStroke();
    var maxTextSize = width * (1/9)
    var textSpacing = maxTextSize * 1.6;
    var ty = getNumberSelectorY();
    
    var tx = (width/2) - (textSpacing*1.6);
    textSize(maxTextSize/3)
    text(number_to_draw-2,tx,ty)  
    
    tx = (width/2)-(textSpacing)
    textSize(maxTextSize/2)
    text(number_to_draw-1,tx,ty)
    
    tx = (width/2)
    textSize(maxTextSize)
    text(number_to_draw,tx,ty)
    
    tx = (width/2) + textSpacing
    textSize(maxTextSize/2)
    text(number_to_draw+1,tx,ty)
    
    tx = (width/2) + (textSpacing*1.6);
    textSize(maxTextSize/3)
    text(number_to_draw+2,tx,ty)
    
    pop();
  }
  stroke(255); strokeWeight(2);
  var arrow_size = width/50
  line(width*(1/4), ty+30, width*(3/4), ty+30 )
  
  line(width*(1/4), ty+30, width*(1/4)+arrow_size, ty+30-arrow_size )
  line(width*(1/4), ty+30, width*(1/4)+arrow_size, ty+30+arrow_size )
  
  line(width*(3/4), ty+30, width*(3/4)-arrow_size, ty+30-arrow_size )
  line(width*(3/4), ty+30, width*(3/4)-arrow_size, ty+30+arrow_size )
  
  if(mouse_over_at_press == "number selector" && mousepos.pressed){
    //Update the number selector if user is dragging it
    var mouse_dif = mousepos.x - mousepos_at_press.x
    mouse_dif = round(mouse_dif/ (width/10) )
    number_to_draw = number_selector_at_press - mouse_dif;
    if(number_to_draw < 1)number_to_draw = 1;
    if(number_to_draw !== p_number_to_draw)setNumber(number_to_draw);
  }
  p_number_to_draw = number_to_draw
  
  fill(255); noStroke();
  mtb = getMenuToggle(); //Menu toggle button x,y,h,w
  if(!menu_open){
    text("By Alex \"Ike\"\nBischof", pxSpacing, height - pxSpacing - (textSize()*1.5) )
  }
  if(menu_open){
    text("By Alex \"Ike\"\nBischof", pxSpacing, height - pxSpacing - (textSize()*1.5) - menu_height )
  }
  
  
  //Menu (the one on the bottom)
  fill(60);
  strokeWeight(1); stroke(255); 
  
  if(menu_open){
    draw_menu();
  }
  
  image(icons.information, width - pxSpacing - (icon_size/2), height - pxSpacing - (icon_size/2), icon_size, icon_size)
  
  //Draw the button that opens or closes the menu
  
  stroke(255);
  rect(mtb.x,mtb.y,mtb.w,mtb.h)
  
  noStroke();
  rect(mtb.x+1,mtb.y+5,mtb.w-2,mtb.h)
  
  if(!menu_open)
  image( icons.chevron_up, width/2, mtb.y + (mtb.h/2), mtb.h, mtb.h )
  if(menu_open)
  image( icons.chevron_down, width/2, mtb.y + (mtb.h/2), mtb.h, mtb.h )
  
  //If a factor is grabbed, draw a box by the player's cursor that resembles it
  if(factor_grabbed !== null){
    fill(60);
    stroke(255);
    var w = width/4
    var h = w/5
    rect(mousepos.x + 30, mousepos.y + 30, w, h )
    line(mousepos.x + 30 + (w/6), mousepos.y + 30 + (h/2), mousepos.x + 30 + (w*(3/4)), mousepos.y + 30 + (h/2) )
  }
  
}

function draw_menu(){
  rect(-5,height-menu_height, width+10, menu_height+5)
  var lineY = height-menu_height + (mtb.h/2)
  line(pxSpacing, lineY, width - pxSpacing, lineY )
  // line(mtb.x + pxSpacing, height-menu_height, mtb.x+mtb.w-(pxSpacing*2), height-menu_height )
  x_separator = width * (2/3)
  line(x_separator, lineY, x_separator, height)
  
  noStroke(); fill(255);
  text("FACTORS:", pxSpacing, lineY + pxSpacing + textSize())
  text("COLOR MODE:", x_separator + pxSpacing, lineY + pxSpacing + textSize())
  
  
  //Color mode drop down menu
  var cmddm = getColorModeDropdown();
  
  //Allowed composites checkboxes
  fill(255);
  text("ALLOW...", x_separator + pxSpacing, cmddm.y + cmddm.h + (pxSpacing*2) + textSize())
  
  if(true){
    var possible_composites = ["SQUARES", "HEXAGONS", "OCTAGONS"]
    var checkbox_x = x_separator + pxSpacing + (mtb.h/2)
    var checkbox_y = cmddm.y + cmddm.h + (pxSpacing*3) + textSize() + (mtb.h/2)
    
    if(allowed_composites.includes(4))image(icons.checkbox_check, checkbox_x, checkbox_y, mtb.h, mtb.h)
    else image(icons.checkbox_empty, checkbox_x, checkbox_y, mtb.h, mtb.h)
    text("SQUARES", checkbox_x + (mtb.h), checkbox_y + (mtb.h/2) - (textSize()/2) )
    
    checkbox_y += mtb.h * 2
    
    if(allowed_composites.includes(6))image(icons.checkbox_check, checkbox_x, checkbox_y, mtb.h, mtb.h)
    else image(icons.checkbox_empty, checkbox_x, checkbox_y, mtb.h, mtb.h)
    text("HEXAGONS", checkbox_x + (mtb.h), checkbox_y + (mtb.h/2) - (textSize()/2) )
    
    checkbox_y += mtb.h * 2
    
    if(allowed_composites.includes(8))image(icons.checkbox_check, checkbox_x, checkbox_y, mtb.h, mtb.h)
    else image(icons.checkbox_empty, checkbox_x, checkbox_y, mtb.h, mtb.h)
    text("OCTAGONS", checkbox_x + (mtb.h), checkbox_y + (mtb.h/2) - (textSize()/2) )
  }
  
  var mouseOver = getMouseOver();
  // console.log(mouseOver)
  
  //Color mode drop down menu
  fill(35);
  if(color_dropdown_open == false){
    rect(cmddm.x,cmddm.y,cmddm.w,cmddm.h)
    fill(255);
    text(renderMode.toUpperCase(), cmddm.x + 30 + pxSpacing, cmddm.y + (cmddm.h/2) + (textSize()*(4/10)) )
    image(icons.chevron_down, cmddm.x + (pxSpacing*2), cmddm.y + (cmddm.h/2), mtb.h, mtb.h )
  }
  if(color_dropdown_open == true){
    var rms = renderModes;
    var mouseOver = getMouseOver();
    rect(cmddm.x,cmddm.y,cmddm.w,cmddm.h * rms.length)
    for(var i = 0; i < rms.length; i ++){
      var y = cmddm.y + (cmddm.h * i)
      if(mouseOver == "color_dropdown_" + rms[i]){
        fill(90)
        rect(cmddm.x, cmddm.y + (i * cmddm.h), cmddm.w, cmddm.h)
      }
      fill(255);
      text(rms[i].toUpperCase(), cmddm.x + pxSpacing, y + (cmddm.h/2) + (textSize()*(4/10)) )
    }
    
    // image(icons.chevron_down, cmddm.x + (pxSpacing*2), cmddm.y + (cmddm.h/2), mtb.h, mtb.h )
  }
  
  
  drawFactors();
  
  //Draw the play all button
  var playAll_x = x_separator * (2/3) + pxSpacing + icon_size * (1/2)
  var playAll_bottom = getFactorBoxes()[0].y
  var playAll_y = (lineY + playAll_bottom) / 2
  if(iterated_drawing_frame == -2){
    if(cycling_layers.length == ntd_factors.length )
    image(icons.playing, playAll_x, playAll_y, icon_size, icon_size)
    else
    image(icons.play, playAll_x, playAll_y, icon_size, icon_size)
    fill(255)
  } else {
    image(icons.cannot_play, playAll_x, playAll_y, icon_size, icon_size)
    fill(20)
  }
  
  text("Play all", playAll_x + (icon_size/4) + pxSpacing, playAll_bottom - pxSpacing)
  
  fill(60);
}

function drawFactors(){
  push();
  
  var factorBoxes = getFactorBoxes();
  var factorColors = getPreferredColors();
  var factorHidden = getPreferredHidden();
  var factorRadii = getPreferredRadii();
  icon_size = factorBoxes[0].h * (2/4)
  
  stroke(100);
  line( 0, factorBoxes[0].y, x_separator-2, factorBoxes[0].y)
  line( x_separator/3, factorBoxes[0].y, x_separator/3, height )
  line( x_separator*(2/3), factorBoxes[0].y, x_separator*(2/3), height )
  
  
  for(var i = 0; i < ntd_factors.length - factor_list_offset; i ++){
    var b = factorBoxes[i]
    var factor_index = i + factor_list_offset
    // fill( (i+factor_list_offset) *30)
    // rect(b.x, b.y, b.w, b.h)
    
    var fillCol = factorColors[factor_index]
    var newVal = 130;
    if(red(fillCol) == 255 && green(fillCol) == 0 && blue(fillCol) == 0)fillCol = color(255,newVal,newVal)
    if(red(fillCol) == 0 && green(fillCol) == 255 && blue(fillCol) == 0)fillCol = color(newVal,255,newVal)
    if(red(fillCol) == 0 && green(fillCol) == 0 && blue(fillCol) == 255)fillCol = color(newVal,newVal,255)
    
    fill(fillCol)
    if(ntd_factors[factor_index] == 2)fill(0);
    rect( (x_separator/3), b.y, (x_separator/3), b.h )
    
    stroke(100);
    // line(b.x+pxSpacing, b.y+b.h, x_separator - pxSpacing, b.y+b.h)
    line(b.x, b.y+b.h, x_separator-2, b.y+b.h)
    
    if(factor_grabbed === factor_index){
      stroke(255); strokeWeight(3); noFill();
      rect(b.x,b.y,b.w,b.h)
      strokeWeight(1);
    }
    else if(factor_drop_position === factor_index){
      stroke(255,255,0); strokeWeight(3); noFill();
      rect(b.x,b.y,b.w,b.h)
      strokeWeight(1);
    }
    
    fill( getTextColorWithBackground(fillCol) ); noStroke();
    if(ntd_factors[factor_index] == 2)fill(255);
    textSize(width/20);
    text(ntd_factors[factor_index], (x_separator/3) + pxSpacing, b.y + (b.h/2) + (textSize()/2)-5 )
    
    image(icons.drag_reorder, pxSpacing + (icon_size/2), b.y + (b.h/2), icon_size, icon_size )
    if(factorHidden[factor_index])
    image(icons.eye_closed, pxSpacing + icon_size * (3/2) + pxSpacing, b.y + (b.h/2), icon_size, icon_size )
    else
    image(icons.eye, pxSpacing + icon_size * (3/2) + pxSpacing, b.y + (b.h/2), icon_size, icon_size )
    
    if(iterated_drawing_frame == -2){
      if(cycling_layers.includes(factor_index) )
      image(icons.playing, x_separator * (2/3) + pxSpacing + icon_size * (1/2), b.y + (b.h/2), icon_size, icon_size )
      else
      image(icons.play, x_separator * (2/3) + pxSpacing + icon_size * (1/2), b.y + (b.h/2), icon_size, icon_size )
    } else {
      image(icons.cannot_play, x_separator * (2/3) + pxSpacing + icon_size * (1/2), b.y + (b.h/2), icon_size, icon_size )
    }
    
    textSize(width/30);
    var tx = x_separator * (2/3) + pxSpacing + icon_size * (2/2) + pxSpacing
    var ty = b.y + (b.h/2)+(textSize()/2)
    var r_val = round(factorRadii[factor_index])
    fill(255);
    text(r_val, tx, ty)
    stroke(255);
    ty += textSize()/2
    var start_tx = tx;
    tx += 5
    while(tx < start_tx + textWidth(r_val) ){
      point(tx,ty); tx += 5;
    }
    
    
  }
  pop();
  
  //Handle user dragging to BROWSE factors
  if(mouse_over_at_press == "a factor box" && mousepos.pressed){
    factor_list_offset =  factor_list_offset_at_press  - round((mousepos.y - mousepos_at_press.y)/ factorBoxes[0].h )
    if(factor_list_offset < 0)factor_list_offset = 0;
    if(factor_list_offset > ntd_factors.length-1)factor_list_offset = ntd_factors.length-1;
  }
  
  //Handle user dragging to MOVE factors around with the grab tool
  if(mouse_over_at_press !== null && mouse_over_at_press.startsWith("grab") && mousepos.pressed){
    factor_drop_position = getFactorDropPosition();
  }
  if(mouse_over_at_press !== null && mouse_over_at_press.startsWith("size") && mousepos.pressed){
    var new_size = (factor_size_at_press) - (mousepos.y - mousepos_at_press.y)
    if(new_size < 1)new_size = 1;
    preferences_radius[number_to_draw][ factor_resizing ] = new_size;
    ntd_radii = getPreferredRadii();
    setRenderMode(renderMode);
  }
}

function onclick_ui(){
  if(mouse_over_at_press == "number selector"){
    var newNumber = int(prompt("Type in a number:"))
    if(Number.isInteger(newNumber))number_to_draw = newNumber;
    if(number_to_draw < 1)number_to_draw = 1;
    setNumber(number_to_draw)
  }
  if(mouse_over_at_press == "color mode dropdown"){
    color_dropdown_open = true;
    //console.log("Toggled")
  } else {
    color_dropdown_open = false;
  }
  for(var i = 0; i < renderModes.length; i ++){
    if(mouse_over_at_press == "color_dropdown_" + renderModes[i]){
      setRenderMode(renderModes[i])
      color_dropdown_open = false;
    }
  }
  
  if(mouse_over_at_press == "allow squares"){
    if(allowed_composites.includes(4)){
      allowed_composites.splice(allowed_composites.indexOf(4), 1)
    } else {
      allowed_composites.push(4)
    }
    setNumber(number_to_draw)
  }
  if(mouse_over_at_press == "allow hexagons"){
    if(allowed_composites.includes(6)){
      allowed_composites.splice(allowed_composites.indexOf(6), 1)
    } else {
      allowed_composites.push(6)
    }
    setNumber(number_to_draw)
  }
  if(mouse_over_at_press == "allow octagons"){
    if(allowed_composites.includes(8)){
      allowed_composites.splice(allowed_composites.indexOf(8), 1)
    } else {
      allowed_composites.push(8)
    }
    setNumber(number_to_draw)
  }
  
  if(mouse_over_at_press == "playall"){
    if(cycling_layers.length == ntd_factors.length){
      cycling_layers = []
    } else {
      cycling_layers = []
      for(var i = 0; i < ntd_factors.length; i ++){
        cycling_layers.push(i)
      }
    }
  }
  
  if(mouse_over_at_press == "information"){
    window.open("https://www.youtube.com/watch?v=XH9-f3pKiBE", "_blank")
  }
  //Check for button clicks on factors...
  var moatps = mouse_over_at_press.split(' ')
  if(moatps[0] == "eye"){
    if(preferences_hidden[number_to_draw] == undefined){
      preferences_hidden[number_to_draw] = getPreferredHidden();
    }
    preferences_hidden[number_to_draw][moatps[1]] = !preferences_hidden[number_to_draw][moatps[1]]
    if(iterated_drawing_frame !== -2)setRenderMode(renderMode)
  }
  if(moatps[0] == "play"){
    if( cycling_layers.includes( int(moatps[1]) ) ){
      cycling_layers.splice( cycling_layers.indexOf( int(moatps[1]) ) , 1)
    } else {
      cycling_layers.push( int(moatps[1]) )
    }
  }
  // console.log("click")
  
}

function getFactorDropPosition(){
  var factorBoxes = getFactorBoxes();
  for(var i = 0; i < ntd_factors.length - factor_list_offset; i ++){
    var b = factorBoxes[i]
    var factor_index = i + factor_list_offset
    if( collidePointRect(mousepos.x, mousepos.y, b.x, b.y, b.w, b.h) )return factor_index;
  }
  return null;
}

function getFactorBoxes(){
  //Returns an array of box coordinates for factors in the menu 
  var lineY = height-menu_height + (mtb.h/2)
  var x_separator = width * (2/3)
  var ret = []
  for(var i = factor_list_offset; i < ntd_factors.length; i ++){
    ret.push({
      x: 0,
      y: lineY + (pxSpacing*2) + textSize() + (height/15 * (i-factor_list_offset) ),
      // y: lineY + (pxSpacing*2) + textSize() + (height/15 * (i) ),
      w: x_separator,
      h: height/15
    })
  }
  return ret;
}

function getMouseOver(){
  var slider = getZoomSlider();
  
  if( abs(mousepos.x - slider.x) < 50 &&
      mousepos.y > slider.y1 - 50 &&
      mousepos.y < slider.y2 + 50){
      return 'slider';
  }
  
  if( mousepos.y < getNumberSelectorY()+30)return "number selector";
  
  var mtb = getMenuToggle();
  if(collidePointRect(mousepos.x, mousepos.y, mtb.x, mtb.y, mtb.w, mtb.h))return "menu toggle button"
  
  var info_x = width - pxSpacing - (icon_size/2)
  var info_y = height - pxSpacing - (icon_size/2)
  if(dist(mousepos.x, mousepos.y, info_x, info_y) < icon_size * 0.6){
    return "information"
  }
  
  if(menu_open){
    var cmddm = getColorModeDropdown();
    if(color_dropdown_open){
      var rms = renderModes;
      for(var i = 0; i < rms.length; i ++){
        if(collidePointRect(mousepos.x, mousepos.y, cmddm.x, cmddm.y + (i * cmddm.h), cmddm.w, cmddm.h )){
          return "color_dropdown_" + rms[i]
        }
      }
    }
    if(collidePointRect(mousepos.x, mousepos.y, cmddm.x,cmddm.y,cmddm.w,cmddm.h))return "color mode dropdown"
    
    //Checkboxes
    if(true){
      var x_separator = width * (2/3)
      var checkbox_x = x_separator + pxSpacing + (mtb.h/2) - (mtb.h/2)
      var checkbox_y = cmddm.y + cmddm.h + (pxSpacing*3) + textSize() + (mtb.h/2) - (mtb.h/2)
      
      if(collidePointRect(mousepos.x, mousepos.y, checkbox_x, checkbox_y, mtb.h, mtb.h))
      return "allow squares"
      
      checkbox_y += mtb.h * 2
      
      if(collidePointRect(mousepos.x, mousepos.y, checkbox_x, checkbox_y, mtb.h, mtb.h))
      return "allow hexagons"
      
      checkbox_y += mtb.h * 2
      
      if(collidePointRect(mousepos.x, mousepos.y, checkbox_x, checkbox_y, mtb.h, mtb.h))
      return "allow octagons"
      
    }
    
    var factorBoxes = getFactorBoxes();
    for(var i = 0; i < ntd_factors.length - factor_list_offset; i ++){
      var b = factorBoxes[i]
      var factor_index = i + factor_list_offset
      var eye_location = {
        x: pxSpacing + icon_size * (3/2) + pxSpacing,
        y: b.y + (b.h/2)
      }
      var play_location = {
        x: x_separator * (2/3) + pxSpacing + icon_size * (1/2),
        y: eye_location.y
      }
      var grab_location = {
        x: pxSpacing + (icon_size/2), 
        y: b.y + (b.h/2)
      }
      var size_adjust_location = {
        x: x_separator * (2/3) + pxSpacing + icon_size * (3/2) + pxSpacing,
        y: ty = b.y + (b.h/2)
      }
      if(dist(mousepos.x,mousepos.y,eye_location.x,eye_location.y) < icon_size*0.6 ){
        return "eye " + factor_index
      }
      if(dist(mousepos.x,mousepos.y,play_location.x,play_location.y) < icon_size*0.6 ){
        return "play " + factor_index
      }
      if(dist(mousepos.x,mousepos.y,grab_location.x,grab_location.y) < icon_size*0.6 ){
        return "grab " + factor_index
      }
      if(collidePointRect(mousepos.x, mousepos.y, b.x + (b.w*(2/3)), b.y, b.w/3, b.h ) ){
        return "size " + factor_index
      }
      // if(dist(mousepos.x,mousepos.y,size_adjust_location.x,size_adjust_location.y) < icon_size*0.6 ){
      // }
      
    }
    
    var lineY = height-menu_height + (mtb.h/2)
    var playAll_x = x_separator * (2/3) + pxSpacing + icon_size * (1/2)
    var playAll_bottom = factorBoxes[0].y
    var playAll_y = (lineY + playAll_bottom) / 2
    if(dist(mousepos.x,mousepos.y, playAll_x, playAll_y) < icon_size * 0.6 ){
      return "playall"
    }
    
    for(var i = 0; i < ntd_factors.length - factor_list_offset; i ++){
      var b = factorBoxes[i]
      if(collidePointRect(mousepos.x, mousepos.y, b.x, b.y, b.w, b.h))return "a factor box"
    }
    
    //Make sure this is last
    if(mousepos.y > height - menu_height){
      return "menu";
    }
  
  }
  
  return 'none';
}

function getMenuToggle(){
  var w = width * ( 4/9 )
  var h = w * (2/16)
  if(!menu_open){
    return {
      x: (width/2) - (w/2),
      y: height - h,
      w,
      h
    }
  }
  if(menu_open){
    return {
      x: (width/2) - (w/2),
      y: (height-menu_height) - h,
      w,
      h
    }
  }
}

function getZoomSlider(){
  var zoomSliderSize = height * (2/4)
  var ret = {}
  ret.x = width - 50
  if(!menu_open){
    ret.y1 = (height/2)-(zoomSliderSize/2)
    ret.y2 = (height/2)+(zoomSliderSize/2)
  } else {
    ret.y1 = 50,
    ret.y2 = height - menu_height - 50;
  }
  return ret;
}

function getNumberSelectorY(){
  return height / 12
}

function getColorModeDropdown(){
  var x_separator = width * (2/3)
  var lineY = height-menu_height + (mtb.h/2)
  var w = (width - x_separator) - (pxSpacing * 2)
  return {
    x: pxSpacing + x_separator,
    y: lineY + (pxSpacing*2) + textSize(),
    w: w,
    h: w * (1/4)
  }
}

function toggleMenu(){
  menu_open = !menu_open
  if(menu_open){
    number_position.y -= (height-menu_height)/2
  }
  if(!menu_open){
    number_position.y += (height-menu_height)/2
  }
}

function getTextColorWithBackground(r,g,b){
  // Given r g b color values of a background, return whether or not
  // text against this background should be black or white to have good
  // contrast
  // If given only one argument, assume it's a p5 color
  if(g === undefined && b === undefined){
    var colorArg = r;
    r = red(colorArg);
    g = green(colorArg);
    b = blue(colorArg)
  }
  if(r * 0.299 + g * 0.900 + b * 0.114 > 186){
    return 'black';
  } else {
    return 'white';
  }
  
}

function averageColors(col1, col2){
  var r = (red(col1) + red(col2))/2
  var g = (green(col1) + green(col2))/2
  var b = (blue(col1) + blue(col2))/2
  return color(r,g,b)
}
