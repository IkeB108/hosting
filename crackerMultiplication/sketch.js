function preload(){
  cracker_tile_image = loadImage("cracker_tile.png")
  cracker_large_image = loadImage("cracker_large.png")
  link_icon = loadImage("link.png")
  cracker_break_sound = loadSound("cracker_break.mp3")
  myFont = loadFont("MostlyMono.ttf")
}
function setup() {
  pixelDensity(1);
  pxSpacing = windowWidth/30;
  createCanvas(1,1)
  setupCanvas();
  createCanvasEventListeners();
  logMouse = false;
  fill(255); noStroke();
  tilew = 30;
  textFont(myFont);
  textAlign(CENTER,CENTER);
  textSize(width/10)
  multa = 12;
  multb = 15;
  mult_smaller = 12
  mult_bigger = 15
  numbersToSum = getNumbersToSum();
  tileZone = {
    x: width*0.3 + (pxSpacing*3),
    y: textSize() * 3.4 + (pxSpacing * 4) ,
    w: width - (width*0.3 + pxSpacing*3) - pxSpacing,
    h: height - (textSize()*3.4 + (pxSpacing * 4) ) - pxSpacing
  }
  cracker_broken = false;
  shape_mouse_over = null;
}

function draw() {
  shape_mouse_over = null;
  background(255);
  textAlign(CENTER,CENTER)
  textSize(width / 10);
  fill(0); noStroke();
  
  text("CRACKER\nMULTIPLICATION", width/2, textSize()*2)
  var byy  = textSize()*3.4 + pxSpacing;
  textSize(width/22)
  text("BY IKE BISCHOF", width/2, byy)
  
  tint(0);
  image(link_icon, width * (6/9), byy - (textSize()/2) , textSize(), textSize())
  noTint();
  // text(String(shape_mouse_over), width/2, byy + 20)
  
  
  // stroke(0); noFill();
  // rect(tileZone.x, tileZone.y, tileZone.w, tileZone.h)
  
  
  drawCracker();
  drawNumbers();
  // drawArrow(width/2, height/2, mousepos.x, mousepos.y)
  
}

function drawNumbers(){
  textAlign(RIGHT,BOTTOM)
  textSize(width/10)
  var tx = width * (0.3)
  var ty = height * (2/5)
  
  if( dist(mousepos_at_press.x, mousepos_at_press.y, tx - textWidth('55')/2, ty - textSize()/2 ) < textSize()/2 ){
    fill(100,100,255)
    shape_mouse_over = "multa";
  } else fill(0);
  text(multa, tx, ty )
  
  if( dist(mousepos_at_press.x, mousepos_at_press.y, tx - textWidth('55')/2, ty + textSize()/2 ) < textSize()/2 ){
    fill(100,100,255)
    shape_mouse_over = "multb"
  } else fill(0);
  text(multb, tx, ty + textSize())
  
  
  stroke(0);
  var multx = tx - (textWidth('5555'))
  var multy = ty + (textSize() * 0.76)
  var r = width/50;
  line(multx - r, multy - 2 * r, multx + r, multy)
  line(multx + r, multy - 2 * r, multx - r, multy)
  line( tx, ty + textSize(), tx - textWidth('5555') , ty + textSize() )
  
  var bottomy = ty + textSize() + (textSize() * 1.3 * numbersToSum.length)
  line( tx, bottomy , tx - textWidth('5555') , bottomy )
  
  
  noStroke();
  textAlign(RIGHT, TOP)
  for(var i = 0; i < numbersToSum.length; i ++){
    if(shape_mouse_over === numbersToSum.length-i-1 )fill(100,100,255)
    else fill(0);
    text(numbersToSum[i], tx, ty + textSize()*1.2 + (i*textSize()*1.3) )
  }
  fill(0);
  text(multa * multb, tx, ty + textSize()*1.2 + (i * textSize()*1.3) )
}

function drawTiles(xarg,yarg,w,h){
  //w and h are width and height in tiles, not px
  var sep = width/80
  var arrow1 = {
    x1: xarg,
    y1: yarg - (sep/2),
    x2: xarg+(w*tilew),
    y2: yarg - (sep/2)
  }
  var arrow2 = {
    x1: xarg - (sep/2),
    y1: yarg,
    x2: xarg - (sep/2),
    y2: yarg + (h*tilew)
  }
  
  // stroke(0); strokeWeight(10);
  // drawArrow(arrow1.x1, arrow1.y1, arrow1.x2, arrow1.y2, width/80)
  // drawArrow(arrow2.x1, arrow2.y1, arrow2.x2, arrow2.y2, width/80)
  stroke(0); strokeWeight(1);
  drawArrow(arrow1.x1, arrow1.y1, arrow1.x2, arrow1.y2, width/80)
  drawArrow(arrow2.x1, arrow2.y1, arrow2.x2, arrow2.y2, width/80)
  
  textSize(width/20)
  textAlign(CENTER, CENTER)
  var x1 = xarg + ( (w*tilew) /2)
  var y1 = yarg - (sep*3)
  var x2 = xarg - (sep*3) - (width/100)
  var y2 = yarg + ((h*tilew)/2)
  // fill(0); noStroke();
  // ellipse(x1, y1, textSize())
  // ellipse(x2, y2, textSize())
  
  fill(0); noStroke();
  text(w, x1, y1 )
  text(h, x2 , y2 )
  if(w < 30 && h < 30){
    for(var x = 0; x < w; x ++){
      for(var y = 0; y < h; y ++){
        image(cracker_tile_image, xarg + (x*tilew), yarg + (y*tilew), tilew, tilew)
      }
    }
  } else {
    image(cracker_large_image, xarg, yarg, w * tilew, h * tilew)
  }
}

function drawArrow(x1,y1,x2,y2, r, logBool = false){
  line(x1,y1,x2,y2)
  var ah1a = rotatePoint({x:x1,y:y1-r}, angleOf({x:x1,y:y1}, {x:x2,y:y2})+45 , {x:x1,y:y1} )
  var ah1b = rotatePoint({x:x1,y:y1-r}, angleOf({x:x1,y:y1}, {x:x2,y:y2})-45, {x:x1,y:y1} )
  line(x1,y1,ah1a.x, ah1a.y)
  line(x1,y1,ah1b.x, ah1b.y)
  var ah2a = rotatePoint({x:x2,y:y2-r}, angleOf({x:x2,y:y2}, {x:x1,y:y1})+45 , {x:x2,y:y2} )
  var ah2b = rotatePoint({x:x2,y:y2-r}, angleOf({x:x2,y:y2}, {x:x1,y:y1})-45, {x:x2,y:y2} )
  line(x2,y2,ah2a.x, ah2a.y)
  line(x2,y2,ah2b.x, ah2b.y)
  if(logBool)console.log(
    {
      ah1a, ah1b, x1, y1, x2, y2
    }
  )
}

function drawCracker(){
  stroke(255);
  if(multa >= multb){
    mult_bigger = multa;
    mult_smaller = multb;
  }
  if(multb > multa){
    mult_bigger = multb;
    mult_smaller = multa;
  }
  
  if(!cracker_broken){
    // if(multa >= multb)tilew = (tileZone.w/multa)
    // if(multb > multa)tilew = (tileZone.h/multb)
    // drawTiles(tileZone.x, tileZone.y, multa, multb)
    tilew = getTileSize(mult_smaller, mult_bigger)
    drawTiles(tileZone.x, tileZone.y, mult_smaller, mult_bigger)
    if( collidePointRect( mousepos.x, mousepos.y, tileZone.x, tileZone.y, mult_smaller * tilew, mult_bigger * tilew) ){
      fill(170,170,255,200); noStroke();
      rect(tileZone.x, tileZone.y, mult_smaller * tilew, mult_bigger * tilew)
      shape_mouse_over = "whole cracker"
    }
  }
  if(cracker_broken){
    var rc = getRowsColumns();
    var x = tileZone.x
    var y = tileZone.y
    var space_between_shapes = 2; //multiple of tilew
    // tilew = 5;
    tilew = getTileSize(mult_smaller + (rc.columns.length-1)*space_between_shapes, mult_bigger + (rc.rows.length-1)*space_between_shapes )
    shape_mouse_over = null;
    for(var c = 0; c < rc.columns.length; c ++){
      for(var r = 0; r < rc.rows.length; r ++){
        if(rc.columns[c] > 0 && rc.rows[r] > 0 ){
          drawTiles(x, y, rc.columns[c], rc.rows[r])
          if( collidePointRect(mousepos.x, mousepos.y, x, y, rc.columns[c] * tilew, rc.rows[r] * tilew) ){
            fill(170,170,255,200); noStroke();
            rect(x, y, rc.columns[c] * tilew, rc.rows[r] * tilew)
            shape_mouse_over = (c * rc.rows.length) + r
          }
        }
        y += (rc.rows[r]+ space_between_shapes) * (tilew)
      }
      x += (rc.columns[c]+ space_between_shapes ) * (tilew)
      y = tileZone.y
    }
  }
}

function getRowsColumns(){
  var rows = []
  var columns = []
  var mss = mult_smaller + ''
  var mbs = mult_bigger + ''
  var column_count = mss.length
  var row_count = mbs.length
  for(var i = 0; i < row_count; i ++){
     rows.push( int(mbs[i]) * (10 ** ( row_count-i-1 ) ) )
  }
  for(var i = 0; i < column_count; i ++){
    columns.push( int(mss[i]) * (10 ** ( column_count-i-1 ) ) )
  }
  tilew = getTileSize(mult_smaller + (column_count-1) , mult_bigger + (row_count-1) )
  return {rows, columns}
}

function getTileSize(a, b){
  var ret = tileZone.w/a
  if(b * ret > tileZone.h)ret = tileZone.h/b
  return ret;
}

function setMult(a, b){
  multa = a
  multb = b
  if(multa > 99)multa = 99;
  if(multb > 99)multb = 99;
  if(multa < 1)multa = 1;
  if(multb < 1)multb = 1;
  numbersToSum = getNumbersToSum();
  cracker_broken = false;
}

function getNumbersToSum(){
  var mas = mult_bigger + ''
  var mbs = mult_smaller + ''
  multa_digits = mas.length;
  multb_digits = mbs.length;
  var ret = [];
  for(var i = 1; i <= multb_digits; i ++){
    for(var j = 1; j <= multa_digits; j ++){
      var b = int(mbs[mbs.length- (i) ] ) * (10 ** (i-1) )
      var a = int(mas[mas.length- (j) ] ) * (10 ** (j-1) )
      ret.push(a * b)
    }
  }
  return ret;
}

function keyTyped(){
}
