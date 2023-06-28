function preload(){
  logoImage = loadImage('logo.png')
  samplePhoto = loadImage("samplePhoto.png")
}
function setup() {
  createCanvas(1,1);
  canvas.setAttribute("onmouseup", "myMouseReleased()")
  canvas.setAttribute("ontouchend", "myMouseReleased()")
  pxSpacing = 10;
  textSize(30)
  setCanvasSize();
  current_screen = "decode"
  //Screens: encode, decode, decoding, front
  pressMouseX = 0;
  pressMouseY = 0;
  userClickedAButton = false;
  chunks_per_frame = -20;
  //How many chunks should be decoded per frame when decoding?
  //Negative numbers represent frames per chunk; ex. -3 is three frames per chunk
  setButtons();
  framesSinceLastClick = 5;
}

function draw() {
  background(255);
  textAlign(LEFT, BOTTOM)
  draw_details();
  if(current_screen == "decode")draw_decode();
  if(current_screen == "decoding")draw_decoding();
  framesSinceLastClick ++;
}
function mousePressed(){
  pressMouseX = mouseX;
  pressMouseY = mouseY;
}
function myMouseReleased(){
  //This function keeps getting called twice on mobile devices,
  // even when I don't use p5's default mouseReleased() function.
  // I don't know why, but my solution is to prevent another click
  // for 5 frames after the first one.
  if(framesSinceLastClick >= 5){
    if(current_screen == "decode")click_update_decode();
    if(current_screen == "decoding")click_update_decoding();
    if(!userClickedAButton){mouseX = 0; mouseY = 0;}
    userClickedAButton = false;
  }
  framesSinceLastClick = 0;
}
function draw_decode(){
  draw_button("start_over")
  draw_button("decode")
  draw_photo();
}

function click_update_decode(){
  if(userClickedOn(buttons.decode)){
    setTimeout(()=>{
      mouseX = 0;
      mouseY = 0;
      current_screen = 'decoding'
      setDecodingProcess();
    }, 100)
  }
  if(userClickedOn(buttons.start_over)){
    setTimeout(()=>{mouseX = 0; mouseY = 0;current_screen = "front"}, 100)
  }
}

function draw_decoding(){
  var dp = decodingProcess;
  draw_photo(true);
  draw_button("start_over");
  dp.overlayGraphic.noStroke();
  if(dp.current_chunk.i < dp.chunk_count){
    for(var i = 0; i < chunks_per_frame; i ++){
      decodeNextChunk();
    }
    if(chunks_per_frame < 0 &&
      frameCount % abs(round(chunks_per_frame)) == 0 ) decodeNextChunk();
  }
  if(dp.current_chunk.i == dp.chunk_count-1){
    dp.time_of_completion = frameCount;
  }
  if(dp.time_of_completion > -1){
    var frames_since_completion = frameCount - dp.time_of_completion
    var ellipse_size = frames_since_completion * 10;
    if( (dp.image_width > dp.image_height && ellipse_size/2 < dp.image_width)
      || (dp.image_height > dp.image_width && ellipse_size/2 < dp.image_height)
    ){
      fill(255,255,0)
      noStroke();
      dp.overlayGraphic.ellipse(dp.image_width/2, dp.image_height/2, ellipse_size )
      time_of_circle_completion = frameCount;
    } else {
      dp.overlayGraphic.clear();
      dp.overlayGraphic.background(0,190);
      var fractionComplete = (frameCount - time_of_circle_completion)/30
      push();
      stroke(0);
      rectMode(CENTER,CENTER)
      fill(0);rect(width/2, height/2+5, width-(pxSpacing*2) , height*(1/3))
      fill(255);rect(width/2, height/2, width-(pxSpacing*2), height*(1/3))
      textAlign(CENTER,CENTER); textSize(round(width/30));
      fill(0); noStroke();
      text("Decoding complete.\nHere's the file that was decoded:\n\nMP3 File (Music)\n\nOpen this file?\n\n",
      width/2, height/2, (width-(pxSpacing*2)), height/3 )
      pop();
      draw_button("open_decoded_file");
      
      var ycol_a = lerp(255, 0, fractionComplete)
      dp.overlayGraphic.background( 255, 255, 0, ycol_a )
    }
    
  }
  
}

function click_update_decoding(){
  if(userClickedOn(buttons.start_over)){
    setTimeout(()=>{mouseX = 0; mouseY = 0;current_screen = "front"}, 100)
  }
  if(userClickedOn(buttons.open_decoded_file)){
    setTimeout(()=>{
      mouseX = 0;
      mouseY = 0;
      current_screen = "music"
      musicElement = document.createElement('audio')
      musicSource = document.createElement('source')
      musicSource.src = "data:audio/mp3;base64," + songData
      musicElement.appendChild(musicSource);
      musicElement.setAttribute('controls', "controls")
      document.body.appendChild(musicElement);
      console.log("appended to body")
      canvas.hidden = true;
    }, 100)
  }
}

function decodeNextChunk(){
  var dp = decodingProcess
  var rectx = dp.current_chunk.x * dp.chunk_width;
  var recty = dp.current_chunk.y * dp.chunk_height;
  var rectw = dp.chunk_width;
  var recth = dp.chunk_height;
  dp.overlayGraphic.fill(0,190)
  dp.overlayGraphic.rect(rectx, recty, rectw, recth)
  dp.overlayGraphic.fill(255,255,0)
  dp.overlayGraphic.text(dp.chars.substr(dp.current_chunk.i*3,3), rectx+(rectw/2), recty+(recth/2))
  
  var newi = decodingProcess.current_chunk.i + 1
  decodingProcess.current_chunk = {
    'i': newi,
    'x': chunkXY(newi).x,
    'y': chunkXY(newi).y,
  }
  
  //Increase or decrease speed (ease in and out)
  
  // chunks_per_frame += 0.6;
  // if( round(chunks_per_frame) == 0 || round(chunks_per_frame) > 1)chunks_per_frame = 1;
  if(decodingProcess.current_chunk.i == 10)chunks_per_frame = -2;
}

function draw_details(){
  logow = (width * (3/5) )
  // if(width< (width/4) )logow = width;
  logoh = logow * (logoImage.height/logoImage.width)
  image(logoImage, 0, 0, logow, logoh);
  
  fill(0); noStroke(); textSize(logoh)
  text("BY IKE BISCHOF", 0, logoh * 2.2)
  
  stroke(0); noFill();
  //rect(1, 1, width-2, height-2);
  var y = logoh * 2.2 + pxSpacing
  ellipse(4, y, 6)
  ellipse(width-4, y, 6)
  line( pxSpacing * 2 , y, width - (pxSpacing*2), y )
  var by = height - pxSpacing;
  ellipse(4, by, 6)
  ellipse(width-4, by, 6)
  line( pxSpacing * 2 , by, width - (pxSpacing*2), by )
}

function draw_photo(with_overlay){
  //This box represents photo area:
  var boxx = 0;
  var boxy = round(logoh * 2.2 + pxSpacing + pxSpacing);
  var boxw = width;
  var boxh = round(buttons.decode.y - pxSpacing - boxy)
  //stroke(0); noFill();
  //rect(boxx, boxy, boxw, boxh)
  
  var imgx, imgy, imgw, imgh
  if(samplePhoto.width/samplePhoto.height > boxw/boxh){
    /*Photo is 'fatter' than the box we're putting it in,
    so width is the limiting factor*/
    imgw = boxw;
    imgh = imgw * (samplePhoto.height/samplePhoto.width);
    imgx = 0;
  }
  if(samplePhoto.width/samplePhoto.height < boxw/boxh){
    /*Photo is 'skinnier' than the box we're putting it in,
    so height  is the limiting factor*/
    imgh = boxh;
    imgw = imgh * (samplePhoto.width/samplePhoto.height)
    imgx = (width/2) - (imgw/2)
  }
  imgy = boxy
  // fill(255,117,117);
  // rect(imgx, imgy, imgw, imgh)
  image(samplePhoto, imgx, imgy, imgw, imgh)
  if(with_overlay)image(decodingProcess.overlayGraphic, imgx, imgy, imgw, imgh)
}


function draw_button(button){
  noStroke();
  textSize(width/15)
  if(typeof button == "string")button = buttons[button];
  if(button.style == "box"){
    textAlign(CENTER,CENTER);
    if(mouseOverButton(button))fill(86, 77, 210)
    else fill(39, 33, 131)
    rect(button.x + 5, button.y + 5, button.w, button.h)
    if(mouseOverButton(button))fill(162,157,231);
    else fill(86, 77, 210);
    rect(button.x, button.y, button.w, button.h)
    fill(255);
    text(button.text, (button.x+(button.w/2)), (button.y+(button.h/2)) )
  }
  if(button.style == "noBox"){
    textAlign(button.align[0], button.align[1]);
    fill(0);
    if(mouseOverButton(button))fill(170);
    if(button.align[0]==CENTER)
    text(button.text, (button.x+(button.w/2)), (button.y+(button.h/2)) )
    if(button.align[0]==LEFT)
    text(button.text, (button.x+pxSpacing), (button.y+(button.h/2)) )
  }
}

function mouseOverButton(button){
  if(typeof button == "string")button = buttons[button];
  return (
    mouseX > button.x &&
    mouseX < button.x + button.w &&
    mouseY > button.y &&
    mouseY < button.y + button.h
  )
}

function pressMouseOverButton(button){
  //Using the mouse position when the user STARTED
  //tapping/clicking, check if this position is over a button
  if(typeof button == "string")button = buttons[button];
  return (
    pressMouseX > button.x &&
    pressMouseX < button.x + button.w &&
    pressMouseY > button.y &&
    pressMouseY < button.y + button.h
  )
}

function userClickedOn(button){
  
  if(mouseOverButton(button) && pressMouseOverButton(button)){
    userClickedAButton = true;
    return true;
  }
}

function setCanvasSize(){
  var ch = windowHeight - (pxSpacing * 2);
  var cw = windowWidth - (pxSpacing * 2);
  if(windowHeight/windowWidth <= (3/2) )var cw = round(ch * (2/3) );
  resizeCanvas(cw, ch);
  //corrected_canvas_resize(cw, ch);
  // corrected_canvas_resize(300, 30);
}

function setButtons(){
  var sc = {'x':width/2, 'y':height/2} //screen center
  buttons = {
    'start_over':{
      'text':"< Start Over",
      'style': "noBox",
      "align":[LEFT,CENTER],
      "x":pxSpacing,
      "y":height-pxSpacing-(height*(1/14)) ,
      'w':width * (1/2),
      'h':height * (1/14)
    },
    'decode':{
      'text':"Decode",
      'style': "box",
      "x":sc.x - (width*(1/2)/2) ,
      "y": height-pxSpacing-(height*(2/14))-(pxSpacing*3) ,
      'w':width * (1/2),
      'h':height * (1/14)
    },
    "open_decoded_file":{
      'text':"Open",
      'style':"box",
      "x": sc.x - (width*(1/2)/2),
      "y": height * (1/3) + (3/4 * 1/3 * height) ,
      "w": (width/2),
      "h": height * (1/14)
    }
  }
}

function setDecodingProcess(){
  //This is called at the time the user presses decode.
  decodingProcess = {
    "current_chunk": {'x':0,'y':0,'i':0},
    "chunk_width": 42, //These are hard-coded for demo purposes
    "chunk_height": 50,
    "image_width": samplePhoto.width,
    "image_height": samplePhoto.height,
    "width_in_chunks": 10, //hard coded
    "height_in_chunks": 10,
    "chunk_count": 100,
    "chars": '', //For now generate a set of random hex characters
    "time_of_completion": -1, //frameCount at time of competion; negative 1 until complete
  }
  
  var potentialChars = "0123456789ABCDEF"
  for(var i = 0; i < decodingProcess.chunk_count * 3; i ++){    
    decodingProcess.chars += potentialChars[ floor(random(potentialChars.length)) ]
  }
  
  decodingProcess.overlayGraphic = createGraphics(decodingProcess.image_width, decodingProcess.image_height)
  decodingProcess.overlayGraphic.textAlign(CENTER,CENTER);
  decodingProcess.overlayGraphic.textSize(decodingProcess.chunk_width * (5/9) )
  decodingProcess.overlayGraphic.textFont("Courier")
  // decodingProcess.overlayGraphic.background(0,255,255)
  
  chunkIndex = (x,y) => {
    //Given x and y of a chunk, return its index
    return ( y * (decodingProcess.width_in_chunks) + x )
  }
  chunkXY = (i) => {
    //Given index of a chunk, return its x and y coords
    return {'x': i%decodingProcess.width_in_chunks, 'y': floor(i/decodingProcess.width_in_chunks) }
  }
  pixelIndex = (x,y) => {
    //Given x and y coords of a pixel in the image, return its index in pixels array
    return ( (y*4) * decodingProcess.image_width + (x*4) )
  }
  pixelXY = (i) => {
    //Given index of a pixel in pixels array, return its x y coords
    return {'x':floor(i/4)%decodingProcess.image_width, 'y':floor((i/4)/decodingProcess.image_width)}
  }
}

function windowResized(){
  setCanvasSize()
  setButtons()
}

function checkSpeed(){
  var startTime = performance.now()
  //Try something out here
  var endTime = performance.now();
  console.log("Time: " + (endTime - startTime) + " milliseconds")
}

function corrected_canvas_resize(w, h){
  const ratio = Math.ceil(window.devicePixelRatio);
  resizeCanvas(w * ratio, h * ratio);
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
}
