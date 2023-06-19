function iterated_drawing(){
  if(iterated_drawing_frame == 0)initialize_iterated_drawing();
  if(iterated_drawing_frame > -1){
    //The drawing is not complete yet
    var thisPoint = id.points_to_draw_at[id.currentShape]
    var thisRadius = ntd_radii[id.currentFactor] * zoom_multiplier;
    
    var next_layer_is_2 = (ntd_factors[id.currentFactor+1] !== undefined && ntd_factors[id.currentFactor+1] == 2)
    var shapeVertexArray = getShapeVertexArray(ntd_factors[id.currentFactor], thisRadius, thisPoint.rotation, thisPoint.x, thisPoint.y, next_layer_is_2)
    
    if( ['add','multiply','difference'].includes(renderMode) ){
      sg.fill(id.fillColors[id.currentFactor % id.fillColors.length ]);
      if(ntd_factors[id.currentFactor] == 2){
        if(renderMode=="multiply")sg.stroke(0);
        else sg.stroke(255);
      }
      else sg.noStroke();
    }
    if(renderMode == "overlap")sg.fill(0);
    
    if(!id.preferredHidden[id.currentFactor])
    drawVertexArray(shapeVertexArray, (id.currentFactor == ntd_factors.length-1) )
    
    id.next_points_to_draw_at = id.next_points_to_draw_at.concat(shapeVertexArray)
    
    id.currentShape ++;
    if(id.currentShape > id.points_to_draw_at.length-1 ){
      id.currentShape = 0;
      id.currentFactor ++;
      if(id.currentFactor > ntd_factors.length-1){
        iterated_drawing_frame = -1;
        //console.log("Drawing complete")
        id.drawingComplete = true;
      }
      id.points_to_draw_at = id.next_points_to_draw_at;
      id.next_points_to_draw_at = [];
    }
    if(!id.drawingComplete)iterated_drawing_frame ++;
  }
}

function initialize_iterated_drawing(){
  id = {} //Object to store general information about iterative drawing
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
    id.fillColors = getPreferredColors();
  }
  
  id.preferredHidden = getPreferredHidden();
  
  
  id.points_to_draw_at = [ {x:number_position.x,y:number_position.y,rotation:0} ]
  id.next_points_to_draw_at = [];
  id.currentFactor = 0; //INDEX of the factor (layer) we're currently drawing
  id.currentShape = 0; //INDEX of the shape we're drawing within that layer
  id.drawingComplete = false;
}

function refresh_iterated_drawing(){
  iterated_drawing_frame = 0;
  sg.clear();
}
