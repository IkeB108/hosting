function preload(){
  spray_paint_image = loadImage("sprayPaint_dark.png")
  spray_paint_image_bright = loadImage("sprayPaint.png")
  icon_names = 
  "checkbox_check checkbox_empty chevron_down chevron_up " + 
  "drag_reorder eye_closed eye information play playing cannot_play"
  icon_names = icon_names.split(' ')
  icons = {};
  for(var i = 0; i < icon_names.length; i ++){
    icons[icon_names[i]] = loadImage("icons/" + icon_names[i] + ".png" )
  }
}

function setup() {
  
  //CONSTANTS
  pxSpacing = 10;
  allowed_composites = [] //Options: 4, 6, 8
  
  pixelDensity(1);
  createCanvas(1,1)
  setupCanvas(true);
  createCanvasEventListeners();
  
  // preferences_radius = { 77:[100,50,25] } //Name = name of the number; array = list of shape radii for that number
  // preferences_color = { 100:[ color(230), color(200), color(170), color(140), color(110) ] } //Name = name of the number; array = list of colors for that number
  
  preferences_radius = {}
  preferences_color = {}
  preferences_hidden = {}
  
  
  cycling_layers = []
  //Not specific to each number_to_draw; this list contains
  //indeces of layers which the user wants to automatically cycle in size
  
  zoom_multiplier = 1;
  iterated_drawing_frame = -2;
  iterated_drawing_frame = 0;
  //-2 = this shape is not being drawn with iterative drawing at all
  //-1 = the iterative drawing of this shape is complete
  //0+ = number of frames since iterated drawing began
  
  setNumber(108);
  setRenderMode("add")
  renderModes = "add difference multiply outline overlap".split(" ")
  number_position = {'x':width/2,'y':height/2}
  
  //UI things
  menu_open = false;
  menu_height = height/2;
  mouse_over_at_press = null;
  mouse_over_at_release = null;
  number_selector_at_press = number_to_draw;
  maxClickDistance = 30; //maximum distance mouse is allowed to travel to count as a click and not a drag
  color_dropdown_open = false;
  factor_list_offset = 0; //quantity of list items below the top of the list 
  textSize(width/30);
  imageMode(CENTER, CENTER)
  icon_size = 2
  factor_grabbed = null; //set to index of factor being grabbed when one is grabbed
  factor_drop_position = null; //set to index of factor that the grabbed factor will be dropped above
  factor_resizing = null;
  factor_size_at_press = null;
  
  random_pastels = [];
  for(var i = 0; i < 100; i ++){
    random_pastels.push( averageColors( color(random(255),random(255),random(255)), color(100) ) )
  }
  
  mtb = getMenuToggle();
  var factorBoxes = getFactorBoxes();
  icon_size = factorBoxes[0].h * (2/4)
  
}

function draw() {
  background(0);
  
  renderShapeGraphic();
  
  // Test mouse and touch functionality
  fill(255,255,0); noStroke();
  // if(mousepos.pressed)fill(0);
  // ellipse(mousepos.x, mousepos.y, 30)
  
  handleKeys();
  mouseX = "Ike don't use this"
  mouseY = "Ike don't use this"
  
  draw_ui();
  updateCursor();
  
}



function handleKeys(){
  // i = 2;
  // if(keyIsDown(32))preferences_radius[number_to_draw] = [50,50,50,50,50]
  // if(keyIsDown(LEFT_ARROW)){
  //   preferences_radius[number_to_draw][i] --;
  //   ntd_radii = getPreferredRadii();
  // }
  // if(keyIsDown(RIGHT_ARROW)){
  //   preferences_radius[number_to_draw][i] ++;
  //   ntd_radii = getPreferredRadii();
  // }
}
