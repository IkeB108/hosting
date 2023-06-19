function renderShapeGraphic(){
  swbg.clear();
  if( [].includes(renderMode) ){
    swbg.background(0);
  } else {
    if(renderMode == 'multiply')
    swbg.image(spray_paint_image_bright, width/2,height/2, (height/spray_paint_image.height)*spray_paint_image.width , height)
    else
    swbg.image(spray_paint_image, width/2,height/2, (height/spray_paint_image.height)*spray_paint_image.width, height)
    
  }
  if(iterated_drawing_frame == -2){
    sg.clear();
    if(renderMode != 'multiply')sg.background(0)
  }
  
  
  //myTriangle = shapeVertexArray(8, 30, frameCount, width/2, height/2)
  //drawVertexArray(myTriangle)
  sg.stroke(255); sg.noFill();
  if(iterated_drawing_frame == -2)draw_number();
  else {
    for(var i = 0; i < 100; i ++){
      iterated_drawing();
    }
  }
  
  swbg.image(sg,width/2,height/2)
  image(swbg,width/2,height/2)
}

function draw_number(){
  if(renderMode == 'overlap'){
    sg.fill(0,0,0);
    sg.stroke(255);
  }
  if(renderMode == 'outline'){
    sg.noFill();
    sg.stroke(255);
  }
  if( ['add','multiply', 'difference'].includes(renderMode) ){
    // sg.stroke(255);
    var fillColors = getPreferredColors();
  }
  
  var preferredHidden = getPreferredHidden();
  
  var points_to_draw_at = [ {x:number_position.x,y:number_position.y,rotation:0} ]
  var next_points_to_draw_at = [];
  for(var i = 0; i < ntd_factors.length; i ++){
    // this_shape = shapeVertexArray(ntd_factors[i], 30, 0, 100*(i+1), height/2)
    // drawVertexArray(this_shape);
    
    if(cycling_layers.includes(i) ){
      //Change this layer (factor)'s size
      //This doesn't have to be in draw_number() but it might as well be
      
      //If this number doesn't yet have a radius preference, create one.
      if(preferences_radius[number_to_draw] === undefined)preferences_radius[number_to_draw] = getPreferredRadii();
      preferences_radius[number_to_draw][i] += sin(frameCount * noise(i*100) * 2 );
      if(preferences_radius[number_to_draw][i]<5)preferences_radius[number_to_draw][i] =5
      ntd_radii = getPreferredRadii();
      
    }
    
    //Draw this layer...
    for(var p = 0; p < points_to_draw_at.length; p ++){
      var thisPoint = points_to_draw_at[p]
      var thisRadius = ntd_radii[i] * zoom_multiplier;
      
      var next_layer_is_2 = (ntd_factors[i+1] !== undefined && ntd_factors[i+1] == 2)
      var shapeVertexArray = getShapeVertexArray(ntd_factors[i], thisRadius, thisPoint.rotation, thisPoint.x, thisPoint.y, next_layer_is_2)
      
      if( ['add','multiply','difference'].includes(renderMode) ){
        sg.fill(fillColors[i % fillColors.length ]);
        if(ntd_factors[i] == 2){
          if(renderMode=="multiply")sg.stroke(0);
          else sg.stroke(255);
        }
        else sg.noStroke();
      }
      // if(renderMode == "add")sg.fill(255,0,0);
      if(!preferredHidden[i])
      drawVertexArray(shapeVertexArray, (i == ntd_factors.length-1) )
      
      next_points_to_draw_at = next_points_to_draw_at.concat(shapeVertexArray);
    }
    
    //Now get the set of points to draw the next layer's shapes at...
    points_to_draw_at = next_points_to_draw_at;
    next_points_to_draw_at = [];
    
  }
}

function getPreferredRadii(){
  /*Given number_to_draw,
  return the default radii of the shapes in each layer,
  unless the user has set a preference*/
  var ret = [120];
  if(preferences_radius[number_to_draw] !== undefined ){
    //If user has defined radius preferences for this number, just use that,
    //And fill in the rest with defaults.
    usp = preferences_radius[number_to_draw]
    for(var i = 0; i < usp.length; i ++){
      ret[i] = usp[i]
    }
  }
  
  for(var i = 1; i < ntd_factors.length; i ++){
    var previous_shape_vertices = getShapeVertexArray(ntd_factors[i-1], ret[i-1], 0, 0, 0 )
    var psv = previous_shape_vertices
    if(i > ret.length-1){
      var distance_of_vertices = dist(psv[0].x, psv[0].y, psv[1].x, psv[1].y)
      ret.push(distance_of_vertices * 0.35)
    }
  }
  
  
  return ret;
}

function getPreferredColors(){
  var x = 255;
  var y = 0;
  var defaultLoop = [
    color(x,y,y),
    color(y,x,y),
    color(y,y,x)
  ]
  var ret = []
  for(var i = 0; i < ntd_factors.length; i ++){
    var collist = preferences_color[number_to_draw]
    if(collist !== undefined &&
       i < collist.length){
       ret.push(collist[i])
    } else {
      ret.push(defaultLoop[i%3])
      // ret.push( random_pastels[ (number_to_draw+i) %100] )
    }
  }
  return ret;
}

function getPreferredHidden(){
  var ret = []
  for(var i = 0; i < ntd_factors.length; i ++){
    var hidden_list = preferences_hidden[number_to_draw]
    if(hidden_list !== undefined && i < hidden_list.length)ret.push(hidden_list[i])
    else ret.push(false)
  }
  return ret;
}

function getShapeVertexArray(vertexCount, radius, rotation, x, y, next_layer_is_2){
  //Returns an array of vertices for a shape centered at x, y
  //Just add the desired x and y values to move it around
  var ret = [];
  var cursor = {'x':0, 'y':-1 * radius}
  cursor = rotatePoint(cursor, rotation, {x:0,y:0})
  for(var i = 0; i < vertexCount; i ++){
    var thisVertexRotation = rotation +( (360/vertexCount)*i )
    if(vertexCount == 2 && next_layer_is_2)thisVertexRotation += 90;
    ret.push({'x':cursor.x, 'y':cursor.y, 'rotation': thisVertexRotation })
    cursor = rotatePoint(cursor, 360/vertexCount, {x:0,y:0})
  }
  for(var i = 0; i < ret.length; i ++){
    ret[i].x += x;
    ret[i].y += y;
  }
  return ret;
}

function drawVertexArray(vertexArray, final_layer = false){
  sg.beginShape();
  for(var i = 0; i < vertexArray.length; i ++){
    sg.vertex(vertexArray[i].x,vertexArray[i].y)
    if(vertexArray.length==2 && final_layer){
      sg.strokeWeight(8);
      if(zoom_multiplier < 1)sg.strokeWeight(8*zoom_multiplier)
      sg.point(vertexArray[i].x, vertexArray[i].y)
    }
  }
  sg.strokeWeight(1);
  if(renderMode == "difference")sg.strokeWeight(3);
  sg.endShape(CLOSE);
}

function setRenderMode(new_mode){
  //new_mode options: filled, outlined, overlap, add, multiply, difference
  renderMode = new_mode;
  if(renderMode == "add"){
    sg.blendMode(ADD);
    swbg.blendMode(ADD);
  }
  if(renderMode == "multiply"){
    swbg.blendMode(MULTIPLY)
    sg.blendMode(MULTIPLY);
  }
  if(renderMode == "difference"){
    swbg.blendMode(DIFFERENCE)
    sg.blendMode(BLEND);
  }
  if(!(['add','multiply','difference'].includes(renderMode))){
    sg.blendMode(BLEND)
    swbg.blendMode(ADD)
  }
  if(iterated_drawing_frame !== -2)refresh_iterated_drawing();
}
