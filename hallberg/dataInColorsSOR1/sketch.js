/*
TO DO:
x Create new logo with name included: Data In Colors?
x Download icons
x Reverse engineer the sample photo: can I recreate that look?
x Create canvas that resizes correctly (post to SO if I want to get resolution correct)
x Mobile test
x Draw things that go on all pages
x Mobile test
x Create button structure
x Create skeleton of all of the pages (all buttons to navigate between pages)
x Create file input and image input screens
x Mobile test
x Make create3 screen
x Make create4 screen
x Test web workers, probably in a separate project
x Save button and "How does it work" button. Text on create4: "Send this image to your friends! They can decode the image using this website."
x Create image encoder (probably no animations)
  x Diagram the way the image will be encoded
  x Rescaling the image
  x Write metadata to the image
  x Write data to the image
x Tell user not to do files with ? or more than 6 chars extension (also warn about file size)
x Test encoder with an image that has extreme colors (high and low vals)
x Make decode button flash
x Mobile test
x Test HTML files, particularly on mobile
x Make decoder for one chunk at a time and test it
x Diagram what decoding animation will look like
x Make sure the decode1 end result buttons aren't clickable at the wrong time
*/
function preload() {
  images = {
    logo: loadImage("data_in_colors.png")
  }
  var imagesToLoad = "chevron-left chevron-right decode download encode file-audio file-document file-image file-video folder link file-webpage".split(" ")
  for(var i = 0; i < imagesToLoad.length; i ++){
    images[ imagesToLoad[i] ] = loadImage("icons/" + imagesToLoad[i] + ".png" )
  }
  
  //MORE FONTS: https://www.1001fonts.com/modern+light-fonts.html?page=1
  // coco_font = loadFont("coco_gothic_light.ttf")
  dosis_font = loadFont("dosis_light.ttf")
  choseSpecialImage = false;
  setupSpecialImage("rusch_encoded_louder.png")
  
}

function setup() {
  
  myCanvas = createCanvas(1,1); //set canvas size to 1 because we fix it in setupCanvas()
  drawingContext = canvas.getContext("2d")
  canvas.ondragover = onDragOver
  canvas.ondragleave = onDragLeave
  myCanvas.drop(onDrop)
  dragging_over_canvas = false; //set to true when user is dragging a file over the canvas
  canvas.setAttribute('style', "-webkit-user-select: none")
  pixelDensity(1);
  
  fileInput = createFileInput(handle_file);
  fileInput.hide()
  imageInput = createFileInput(handle_image_file);
  imageInput.hide()
  
  if(!choseSpecialImage)image_file_selected = false;
  file_selected = false;
  loading_screen = false;
  decoded_image = null;
  decoded_audio = null;
  toggled_audio = false;
  
  pxSpacing = 10; //value for how spaced apart elements should generally be
  setupCanvas(); //sets canvas to the correct size
  if(!choseSpecialImage)current_screen = "front"; //string representing what page the user is looking at
  //current_screen options:
  //front, decode1, create1, create2, create3, create4
  ui_colors = {
    red: color(219, 41, 85),
    blue: color(28, 110, 140),
    white: color(255)
  }
  setupButtons();
  //button will not function if it's been a short amount of time
  // since the last button click. This addresses a glitch on mobile
  // where a button click will be registered twice on one tap
  //This variable keeps track of time since the last click.
  time_of_last_mouse_release = -1000;
  time_of_last_mouse_press = -1000;
  
  decoding_with_animation = false;
  decoding_complete = false;
  mouse_is_pointer = false; //Set to true when user is hovering over a button
  
  createFileReader();
  
  angleMode(DEGREES) //for drawing buttons
  textFont(dosis_font)
}
function draw() {
  background(255);
  mouse_is_pointer = false;
  draw_general();
  buttonStyleSettings();
  if(current_screen =="front")draw_front();
  if(current_screen =="decode1")draw_decode1();
  if(current_screen =="create1")draw_create1();
  if(current_screen =="create2")draw_create2();
  if(current_screen =="create3")draw_create3();
  if(current_screen =="create4")draw_create4();
  if(loading_screen){
    background(255,210);
    textAlign(CENTER,CENTER); textSize(buttonTextSize)
    fill(0);
    text("Loading...", width/2, height/2)
  }
  if(!mouse_is_pointer)cursor('default')
}



function setupCanvas(){
  var h = windowHeight - pxSpacing * 2;
  var w = windowWidth - pxSpacing * 2;
  if(h/w <= 1.5)w = h / 1.5;
  resizeCanvas(w,h)
  icons8linky = height - (width/15)
  logo_height = width * (3/4) * (images.logo.height/images.logo.width);
  y_below_logo = logo_height + (pxSpacing*3)
}

function mousePressed(){
  mouse_x_at_press = mouseX;
  mouse_y_at_press = mouseY;
  time_of_last_mouse_press = millis();
}
function mouseReleased(){
  if(!loading_screen){
    var current_time = millis();
    if(current_time - time_of_last_mouse_release >= 100)
    updateButtonsOnClick(); //this function is written in the setupButtons() function
    
    if(mouse_y_at_press > icons8linky &&
      mouseY > icons8linky &&
      current_screen == "front"
      && current_time - time_of_last_mouse_release >= 100)window.open("https://icons8.com/icons/small", "_blank")
      
      time_of_last_mouse_release = current_time;
      setTimeout( ()=>{mouseX = width; mouseY = 0} , 100)
  }
}

function windowResized(){
  setupCanvas();
  setupButtons();
}
