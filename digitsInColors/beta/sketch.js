function preload(){
  eye_open = loadImage('eye_open.png')
  eye_closed = loadImage('eye_closed.png')
}

function setup(){
  createCanvas(800,600)
  diagram_canvas = createGraphics(800,800) //the graphics object on which the diagrams will be drawn
  diagram_canvas.colorMode(HSB)
  colorMode(HSB)
  textSize(20)
  textAlign(CENTER,CENTER)
  //HSB max values = 360, 100, and 100

  /*This array stores radius and color preferences for all numbers for which
  preferences have been set.
  */
  shapePreferences = [
    {
      'number':10, //for the number 10...
      'radii':[50,25], //the first shape will have a radius of 50 px. The second will have 25 px
      'colors':[ [50,100,100] , [150,100,100] ], //the first shape will be yellow. The second will be green
      'factorOrder': [ 2, 5 ], //preferred order of the factors (first factor = largest shape)
      'hiddenFactors':[false,false] //true = factor at that index is hidden
    }
  ]

  shapePreferences = []
  dnum = 3; ///display number; the number currently being displayed

  numberInput = createInput(dnum);
  numberInput.size(30)
  numberInput.position(windowWidth/2,windowHeight/2)
  resizeUI();

  shapeCount_threshold = 1000; //how many shapes will we display before switching to iterate_draw mode?
  crossed_threshold = false; //stores whether or not the current number has crossed the above threshold
  iterate_draw = {
    'frame':-1, //stores the frame of animation for iterative drawing. -1 = we are not iterative drawing at all.
    'complete': false, //stores whether or not the diagram is complete
    'pointsToDrawAt': [ {'x':width/2,'y':height/2,'rFactor':0} ], //array contains all the locations the current shape needs to be drawn at
    'nextPointsToDrawAt': [], //array contains all the locations the NEXT shape needs to be drawn at.
    'current_factor': 0, //stores the index of the factor of dnum we are currently drawing shapes for.
    'current_p': 0, //stores the index of the point in 'pointsToDrawAt' we are currently drawing at.
    'primeFactors':null,
    'prefrad':null,
    'prefcol':null
  }
  //stores data for iterated drawing. Draw this way when the current number has crossed the threshold.
  iterate_speed = 40; //how many iterations do we do per frame? (i.e. how many shapes do we draw?)

  diagram_changed = true; //stores whether or not the user changed the diagram settings since the last time we completely drew it

  too_many_sides = false; //set to true when a diagram contains a shape with so many sides that it cannot be drawn.

  ui_px_spacing = 10;
  /*ui_colors = [
    [214,29,63],
    [20,63,75],
    [88,24,91],
    [131,15,75],
    [60,17,35]
  ]*/
  ui_colors = [
    [200,42,75],
    [40,66,100],
    [252,58,48],
    [175,19,94],
    [332,40,100]
  ]

  ui_buttons = {
    'decrease_dnum': {
      'x': (width/2)-16-ui_px_spacing-37,
      'y': height-50,
      'w': 37,
      'h': 22
    },
    'increase_dnum': {
      'x':(width/2)+18+ui_px_spacing,
      'y':height-50,
      'w':37,
      'h':22
    },
    'hide_factor_menu':{
      'x':15,
      'y':5,
      'w':30,
      'h':30
    }
  }

  drag_adjust_initial_y = null; //stores the initial y position when user began dragging to adjust a shape size
  drag_adjust_initial_value = null; //stores the initial value of the shape size in px
  offer_apply = false; //set to true when the program should offer an "apply" button for user's settings
  hide_factor_menu = false;
}

function draw(){


  if(iterate_draw.frame == -1 && !iterate_draw.complete)diagram_canvas.background(0)

  diagram_canvas.stroke(255);
  updateDiagram();
  updateMouseEvents(); //update anything to do with the user's mouse inputs
  if(!too_many_sides){
    if(!crossed_threshold)drawDiagram();
    for(var i = 0; i < iterate_speed; i ++){
      if(iterate_draw.frame > 0 && !iterate_draw.complete)iterate_drawDiagram();
    }
  } else {
    diagram_canvas.fill(preferredColors(dnum)[0])
    diagram_canvas.ellipse(width/2, height/2, preferredRadii(dnum)[0] * 2 )
  }

  image(diagram_canvas,0,0)

  drawUI();
}

function drawShape(vertices){
  /*given an array of vertices of a shape, draw the shape*/
  if(vertices.length == 2)diagram_canvas.stroke(255);
  diagram_canvas.beginShape();
  for(var i = 0; i < vertices.length; i ++){
    diagram_canvas.vertex(vertices[i].x, vertices[i].y)
  }
  diagram_canvas.endShape(CLOSE);
}

function pointsOfShape(vertices, radius, x, y, rOffset){
  /*given the number of points of vertices on the shape
  and the radius of the shape in px, return an array of points of the shape centered at x, y
  rotated by rOffset degrees*/
  var allPoints = []
  var center = createVector(x, y)
  for(var i = 0; i < vertices; i ++){
    var pAbove = createVector(center.x, center.y - radius) //coords of a point directly above the centerpoint
    var rotateBy = (360/vertices) * i + rOffset//how many degrees to rotate pAbove by
    var p = rotatePoint(pAbove, rotateBy, center); //rotate pAbove by that many degrees
    allPoints.push( {'x':p.x, 'y':p.y, 'rFactor':rotateBy} )
  }

  return allPoints;
}

function drawDiagram(){
  /*Draws all of the shapes that complete the diagram
  for the number dnum.
  */

  //create an array of all the factors of dnum
  //with some factors listed more than once
  var primeFactors = preferredFactorOrder(dnum)
  var prefrad = preferredRadii(dnum)
  var prefcol = preferredColors(dnum)

  //this array stores all the places where the next shape should be drawn
  //(the first shape should be drawn only in the center of the screen)
  var pointsToDrawAt = [ {'x':width/2,'y':height/2,'rFactor':0} ]

  for(var f = 0; f < primeFactors.length; f ++){
    //f is the index of the current prime factor
    nextPointsToDrawAt = [] //array for the points of the next shape

    for(var p = 0; p < pointsToDrawAt.length; p ++){
      //for every point we should draw this shape at, draw the shape at it.
      if(primeFactors[f] < 100){
        var rFactor = pointsToDrawAt[p].rFactor;
        if(primeFactors[f] == 2)rFactor += 90; //when the factor is a line, add 90 degrees so it's horizontal (and so that lines don't overlap with their parents)
        var allPoints = pointsOfShape(primeFactors[f], prefrad[f], pointsToDrawAt[p].x, pointsToDrawAt[p].y, rFactor)
        diagram_canvas.fill(prefcol[f])
        //fill(prefcol[f])
        if(!preferredHiddenFactors(dnum)[f]) drawShape(allPoints)
      } else {
        //if this shape has more than 40 sides, it will look like a circle anyway, so just draw a circle to save render time
        diagram_canvas.fill(prefcol[f])
        //fill(0,100,100)
        if(!preferredHiddenFactors(dnum)[f]) diagram_canvas.ellipse(pointsToDrawAt[p].x, pointsToDrawAt[p].y, prefrad[f]*2)
        var rFactor = pointsToDrawAt[p].rFactor;
        if(primeFactors[f] == 2)rFactor += 90; //when the factor is a line, add 90 degrees so it's horizontal (and so that lines don't overlap with their parents)
        var allPoints = pointsOfShape(primeFactors[f], prefrad[f], pointsToDrawAt[p].x, pointsToDrawAt[p].y, rFactor)
      }

      nextPointsToDrawAt = nextPointsToDrawAt.concat(allPoints) //add the points from allPoints to the array of nextPointsToDrawAt
    }

    //for the next factor, we will draw it at all the points (vertices) of this factor
    pointsToDrawAt = copyList(nextPointsToDrawAt)
  }

  if(dnum == 1){
    diagram_canvas.push();
    diagram_canvas.stroke(255);
    diagram_canvas.strokeWeight(5);
    diagram_canvas.point(width/2, height/2)
    diagram_canvas.pop();
  }

  diagram_changed = false;
}

function iterate_drawDiagram(){
  //draw the diagram for this shape iteratively. Same process as drawing all at once,
  //but instead drawing one shape per frame.
  var primeFactors = iterate_draw.primeFactors;
  var prefrad = iterate_draw.prefrad;
  var prefcol = iterate_draw.prefcol;

  var f = iterate_draw.current_factor
  var p = iterate_draw.current_p

  if(primeFactors[f] < 40){
    var rFactor = iterate_draw.pointsToDrawAt[p].rFactor;
    if(primeFactors[f] == 2){rFactor += 90} //when the factor is a line, add 90 degrees so it's horizontal (and so that lines don't overlap with their parents)
    var allPoints = pointsOfShape(primeFactors[f], prefrad[f], iterate_draw.pointsToDrawAt[p].x, iterate_draw.pointsToDrawAt[p].y, rFactor)
    diagram_canvas.fill(prefcol[f])
    if(!preferredHiddenFactors(dnum)[f])drawShape(allPoints)
  } else {
    diagram_canvas.fill(prefcol[f])
    if(!preferredHiddenFactors(dnum)[f])diagram_canvas.ellipse(iterate_draw.pointsToDrawAt[p].x, iterate_draw.pointsToDrawAt[p].y, prefrad[f]*2)
    var rFactor = iterate_draw.pointsToDrawAt[p].rFactor;
    if(primeFactors[f] == 2){rFactor += 90} //when the factor is a line, add 90 degrees so it's horizontal (and so that lines don't overlap with their parents)

    var allPoints = pointsOfShape(primeFactors[f], prefrad[f], iterate_draw.pointsToDrawAt[p].x, iterate_draw.pointsToDrawAt[p].y, rFactor)
  }

  for(var i = 0; i < allPoints.length; i ++){ //I'm trying this as an alternative to array.concat(x) to see if it's faster
    iterate_draw.nextPointsToDrawAt.push(allPoints[i])
  }
  //iterate_draw.nextPointsToDrawAt = iterate_draw.nextPointsToDrawAt.concat(allPoints) //add the points from allPoints to the array of nextPointsToDrawAt

  iterate_draw.current_p ++;
  if(iterate_draw.current_p == iterate_draw.pointsToDrawAt.length){
    //if we have drawn all the shapes for this factor, move to the next factor.
    iterate_draw.current_factor ++;
    iterate_draw.current_p = 0;
    iterate_draw.pointsToDrawAt = copyList(iterate_draw.nextPointsToDrawAt)
    iterate_draw.nextPointsToDrawAt = [];
  }

  iterate_draw.frame ++;
  if(iterate_draw.current_factor >= primeFactors.length){
    //if the diagram is complete...
    iterate_draw.frame = -1;
    iterate_draw.complete = true;
  }

  diagram_changed = false;
}

function shapeCount(n){
  /*Given a number n, return how many shapes it would take to draw its complete diagram.
  */
  primeFactors = preferredFactorOrder(n)
  if(primeFactors.length == 1)return 1;
  var total = 0;
  var shapesThisIteration = 1;
  for(var f = 0; f < primeFactors.length - 1; f++){
    if(f == 0){total += 1}
    shapesThisIteration *= primeFactors[f]
    total += shapesThisIteration
  }
  return total;
}

function preferredRadii(n){
  /*Given a number n, returns the radius preferences for this number
  if there are any listed in shapePreferences. If not, make up some preferences.
  */
  for(var i = 0; i < shapePreferences.length; i ++){
    if(shapePreferences[i].number == n){
      return shapePreferences[i].radii;
    }
  }
  //if there are no preferences, make up some
  var ret = [120] //set the radius of the first shape to this many px
  var primeFactors = primeDecompose(n)
  for(var f = 1; f < primeFactors.length; f ++){
    var points_pShape = pointsOfShape(primeFactors[f-1], ret[f-1], 0, 0, 0)
    var pointDist_previousShape = dist( points_pShape[0].x, points_pShape[0].y, points_pShape[1].x, points_pShape[1].y )
    ret.push(pointDist_previousShape * 0.35)
  }
  return ret;
}
function preferredColors(n){
  /*Given a number n, returns the color preferences for this number
  if there are any listed in shapePreferences. If not, make up some color preferences.
  */
  for(var i = 0; i < shapePreferences.length; i ++){
    if(shapePreferences[i].number == n){
      return shapePreferences[i].colors;
    }
  }

  var ret = []
  var primeFactors = primeDecompose(n)
  for(var f = 0; f < primeFactors.length; f ++){
    var colCount = 5; //how many colors have I defined as a preset?
    if(f%colCount == 0)ret.push( ui_colors[0] )
    if(f%colCount == 1)ret.push( ui_colors[1] )
    if(f%colCount == 2)ret.push( ui_colors[2] )
    if(f%colCount == 3)ret.push( ui_colors[3] )
    if(f%colCount == 4)ret.push( ui_colors[4] )
  }
  return ret
}
function preferredFactorOrder(n){
  /*Given a number n, returns the factor-order preference for this number
  if there is one listed in shapePreferences. If not, order from largest to smallest
  */
  for(var i = 0; i < shapePreferences.length; i ++){
    if(shapePreferences[i].number == n){
      return shapePreferences[i].factorOrder;
    }
  }

  return primeDecompose(n);
}
function preferredHiddenFactors(n){
  for(var i = 0; i < shapePreferences.length; i ++){
    if(shapePreferences[i].number == n){
      return shapePreferences[i].hiddenFactors;
    }
  }
  var hfactorsList = []
  for(var i = 0; i < primeFactors.length; i ++)hfactorsList.push(false);
  return hfactorsList;
}

function setPreferredRadius(n, f, r){
  /*given a number n and factor index f, set a preferred radius r*/
  var hasPreference = false; //set to true if there are already preference settings for n
  for(var i = 0; i < shapePreferences.length; i ++){
    if(shapePreferences[i].number == n){shapePreferences[i].radii[f] = r; hasPreference = true}
  }
  if(!hasPreference){
    var hfactorsList = []
    for(var i = 0; i < primeFactors.length; i ++)hfactorsList.push(false);
    shapePreferences.push({
      'number':n, //for the number 10...
      'radii':preferredRadii(n),
      'colors':preferredColors(n),
      'factorOrder': preferredFactorOrder(n),
      'hiddenFactors': hfactorsList
    })
    shapePreferences[shapePreferences.length-1].radii[f] = r
  }
}
function setPreferredHiddenFactors(n, f){
  /*given number n and factor index f, set 'hidden' to opposite of what it currently is*/
  var hasPreference = false; //set to true if there are already preference settings for n
  for(var i = 0; i < shapePreferences.length; i ++){
    if(shapePreferences[i].number == n){shapePreferences[i].hiddenFactors[f] = !shapePreferences[i].hiddenFactors[f] ; hasPreference = true}
  }
  if(!hasPreference){
    var hfactorsList = []
    for(var i = 0; i < primeFactors.length; i ++)hfactorsList.push(false);
    shapePreferences.push({
      'number':n, //for the number 10...
      'radii':preferredRadii(n),
      'colors':preferredColors(n),
      'factorOrder': preferredFactorOrder(n),
      'hiddenFactors': hfactorsList
    })
    shapePreferences[shapePreferences.length-1].hiddenFactors[f] = true
  }
}

function drawUI(){
  noStroke();
  var pHidden = preferredHiddenFactors(dnum)

  //display the decrease_dnum button
  if(!mouseOver(ui_buttons.decrease_dnum)){
    fill(ui_colors[0])
    rect(ui_buttons.decrease_dnum.x, ui_buttons.decrease_dnum.y, ui_buttons.decrease_dnum.w, ui_buttons.decrease_dnum.h)
    fill(255); text('<', ui_buttons.decrease_dnum.x+18, ui_buttons.decrease_dnum.y + 11)
  } else {
    fill(255)
    rect(ui_buttons.decrease_dnum.x, ui_buttons.decrease_dnum.y, ui_buttons.decrease_dnum.w, ui_buttons.decrease_dnum.h)
    fill(ui_colors[0]); text('<',  ui_buttons.decrease_dnum.x+18, ui_buttons.decrease_dnum.y + 11)
  }
  //display the increase_dnum button
  if(!mouseOver(ui_buttons.increase_dnum)){
    fill(ui_colors[0])
    rect(ui_buttons.increase_dnum.x, ui_buttons.increase_dnum.y, ui_buttons.increase_dnum.w, ui_buttons.increase_dnum.h)
    fill(255); text('>',  ui_buttons.increase_dnum.x+18, ui_buttons.increase_dnum.y + 11)
  } else {
    fill(255)
    rect(ui_buttons.increase_dnum.x, ui_buttons.increase_dnum.y, ui_buttons.increase_dnum.w, ui_buttons.increase_dnum.h)
    fill(ui_colors[0]); text('>',  ui_buttons.increase_dnum.x+18, ui_buttons.increase_dnum.y + 11)
  }

  if(iterate_draw.frame > 0 && !iterate_draw.complete){
    fill(0); stroke(255);
    ellipse(width-30, 30, 35 )
    ellipse(width-30, 30, ( (iterate_draw.frame/40) % 35) )
  }

  if(!hide_factor_menu){
    noStroke();fill(255);
    text('Factors:', 80, 20)
    for(var i = 0; i < primeFactors.length; i ++){
      var y = 55 + (40 * i)
      fill(20,100);
      rect(10,y-15,180,30)
      fill(255);

      textSize(20)
      text(primeFactors[i], 35, y)

      textSize(15)
      text(round(prefrad[i]) + ' px', 90, y)

      stroke(255); strokeWeight(2)
      dottedLine(73,y+8,112,y+8)
      strokeWeight(1)

      noStroke();
      if(!pHidden[i])image(eye_open, 145, y-15, 30, 30)
      if(pHidden[i])image(eye_closed, 145, y-15, 30, 30)
      //dragSymbol(25,y)
    }
  }


  if(!hide_factor_menu)image(eye_open, ui_buttons.hide_factor_menu.x, ui_buttons.hide_factor_menu.y, 30, 30)
  if(hide_factor_menu)image(eye_closed, ui_buttons.hide_factor_menu.x, ui_buttons.hide_factor_menu.y, 30, 30)

  if(offer_apply){
    //display an apply button for the user
    applyRect = {
      'x':10,'y':y+40,'w':180,'h':40
    }
    if(!mouseOver(applyRect)){
      fill(ui_colors[0])
      rect(applyRect.x, applyRect.y, applyRect.w, applyRect.h)
      fill(255)
      text('Apply',applyRect.x + applyRect.w/2, applyRect.y + applyRect.h/2)
    } else {
      fill(255)
      rect(applyRect.x, applyRect.y, applyRect.w, applyRect.h)
      fill(0)
      text('Apply',applyRect.x + applyRect.w/2, applyRect.y + applyRect.h/2)
    }
  }
}
function dragSymbol(x,y){
  stroke(255);
  line(x-5,y-2,x+5,y-2)
  line(x-5,y+2,x+5,y+2)
  line(x,y-8,x-3,y-5)
  line(x,y-8,x+3,y-5)
  line(x,y+8,x-3,y+5)
  line(x,y+8,x+3,y+5)
}
function dottedLine(x1,y1,x2,y2){
  for(var i = 0; i < 8; i ++){
    var x = map(i, 0, 8, x1, x2)
    var y = map(i, 0, 8, y1, y2)
    point(x,y)
  }
}

function updateMouseEvents(){
  cursor('default')
  if(!hide_factor_menu){
    for(var i = 0; i < primeFactors.length; i ++){
      var sizeAdjustBox = { //dimensions of box where user clicks and drags to change this factor's px radius
        'x': 73,
        'y': 55 + (40 * i) - 15,
        'w': 40,
        'h': 30
      }
      if(mouseOver( sizeAdjustBox ) || drag_adjust_initial_y != null){
        cursor('ns-resize')
      }
      var hideBox = {
        'x':145,
        'y': 55 + (40 * i)-15,
        'w': 30,
        'h': 30
      }
      if(mouseOver( hideBox )){
        cursor('pointer')
      }
    }
  }

  if(drag_adjust_initial_y != null){
    var newRad = drag_adjust_initial_value + (mouseY - drag_adjust_initial_y)
    setPreferredRadius(dnum, drag_adjust_index, constrain(newRad, 2, 500) )
    prefrad = preferredRadii(dnum)
  }
  if(mouseOver( ui_buttons.decrease_dnum ) || mouseOver( ui_buttons.increase_dnum ))cursor('pointer')
  var applyRect = {
    'x':10,'y':25 + (40 * primeFactors.length),'w':180,'h':40
  }
  if(offer_apply && mouseOver( applyRect ))cursor('pointer')
  if(mouseOver( ui_buttons.hide_factor_menu ))cursor('pointer')
}
function updateDiagram(){
  var p_dnum = dnum;
  if( int(numberInput.value()) == numberInput.value()  ){
    if( numberInput.value() <= 0 )numberInput.value('1')
    if( numberInput.value() > 100000000)numberInput.value('100000000') //disallow values greater than 100 million
    dnum = int(numberInput.value())
  }

  if(p_dnum != dnum){
    diagram_changed = true;
  }

  if(diagram_changed){
    primeFactors = preferredFactorOrder(dnum);

    prefrad = preferredRadii(dnum)
    prefcol = preferredColors(dnum)
    prefFactorOrder = preferredFactorOrder(dnum)

    crossed_threshold = shapeCount(dnum) >= shapeCount_threshold
    //make sure that if there are multiple factors, that none are above 1000000.
    //this slows down the program because it has to keep an array of 1000000 points (even if we use ellipses for drawing)
    too_many_sides = false;
    if(primeFactors.length > 1){
      for(var i = 0; i < primeFactors.length; i ++){
        if(primeFactors[i] > 1000000){too_many_sides = true}
      }
    }
  }



  if(diagram_changed && crossed_threshold && !too_many_sides){
    //initialize iterative drawing of this diagram
    iterate_draw.frame = 1;
    iterate_draw.complete = false;
    iterate_draw.pointsToDrawAt = [ {'x':width/2,'y':height/2,'rFactor':0} ];
    iterate_draw.nextPointsToDrawAt = [];
    iterate_draw.current_factor = 0;
    iterate_draw.current_p = 0;

    iterate_draw.primeFactors = primeFactors;
    iterate_draw.prefrad = preferredRadii(dnum)
    iterate_draw.prefcol = preferredColors(dnum)

    offer_apply = true;
  }

  if(diagram_changed && !crossed_threshold && !too_many_sides){
    //regular drawing of this diagram
    iterate_draw.frame = -1;
    iterate_draw.complete = false;
    iterate_draw.pointsToDrawAt = [ {'x':width/2,'y':height/2,'rFactor':0} ];
    iterate_draw.nextPointsToDrawAt = [];
    iterate_draw.current_factor = 0;
    iterate_draw.current_p = 0;

    iterate_draw.primeFactors = null;
    iterate_draw.prefrad = null;
    iterate_draw.prefcol = null;

    offer_apply = false;
  }

  if(diagram_changed){
    diagram_canvas.background(0);
  }

}

function mousePressed(){
  if(!hide_factor_menu){
    for(var i = 0; i < primeFactors.length; i ++){
      var sizeAdjustBox = { //dimensions of box where user clicks and drags to change this factor's px radius
        'x': 73,
        'y': 55 + (40 * i) - 15,
        'w': 40,
        'h': 30
      }
      if(mouseOver( sizeAdjustBox )){
        cursor('ns-resize')
        drag_adjust_initial_y = mouseY;
        drag_adjust_initial_value = prefrad[i]
        drag_adjust_index = i;
      }
      var hideBox = {
        'x':145,
        'y': 55 + (40 * i)-15,
        'w': 30,
        'h': 30
      }
      if(mouseOver( hideBox )){
        setPreferredHiddenFactors(dnum, i)
      }
    }
  }

  if(offer_apply && mouseOver( applyRect )){
    diagram_changed = true;
    updateDiagram();
  }
  if(mouseOver(ui_buttons.decrease_dnum)){
    dnum --
    if(dnum <= 0)dnum = 1
    numberInput.value(dnum)
    diagram_changed = true;
  }
  if(mouseOver(ui_buttons.increase_dnum)){
    dnum ++
    numberInput.value(dnum)
    diagram_changed = true;
  }
  if(mouseOver(ui_buttons.hide_factor_menu)){
    hide_factor_menu = !hide_factor_menu;
  }
}
function mouseReleased(){
  drag_adjust_initial_y = null;
}
function mouseOver(rect_obj){
  /*Given an object of the form {'x':~,'y':~,'w':~,'h':~}, returns whether or not
  the mouse is hovering over this rectangle
  */
  return collidePointRect(mouseX, mouseY, rect_obj.x, rect_obj.y, rect_obj.w, rect_obj.h)
}

function isPrime(given){
  //returns whether the given number is prime
  for(var i = 2; i < given; i ++){
    if(given/i == round(given/i)){
      return false;
    }
  }
  if(given > 1){return true}
  else{return false}
}
function factors(given){
  //returns the factors of the given number
  ret = [];
  for(var i = 2; i < given; i ++){
    if(given/i == round(given/i) && given != i){
      ret.push(i)
    }
  }
  return ret;
}
function old_primeDecompose(n){
  /*Given a number n, returns an array of prime factors such that
  all factors multiplied together equals n (prime decomposition).
  Factors used more than once are listed more than once in the array.
  */
  if(n <= 1){
    return n;
  }
  factorsOfGiven = []
  remaining = n;
  while(!isPrime(remaining)){
    remainingFactors = factors(remaining)
    divideBy = remainingFactors[remainingFactors.length - 1]
    while(!isPrime(divideBy)){
      remainingFactors = del(remainingFactors.length - 1, remainingFactors)
      divideBy = remainingFactors[remainingFactors.length - 1]
    }
    factorsOfGiven.push(divideBy);
    remaining /= divideBy
  }
  factorsOfGiven.push(remaining)
  //reverse(factorsOfGiven)
  return factorsOfGiven;
}
function copyList(l){
  /*given a list l, return an identical list l
  */
  var ret = []
  for(var i = 0; i < l.length; i ++){
    ret.push(l[i])
  }
  return ret;
}

function primeDecompose(n) {
  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  reverse(factors)
  return factors;
}

function windowResized(){
  resizeUI();
}
function resizeUI(){
  var cornerX = (windowWidth/2) - (width/2)
  var cornerY = (windowHeight/2) - (height/2)
  numberInput.position( cornerX + (width/2) - 18, cornerY + (height-50) )
}
