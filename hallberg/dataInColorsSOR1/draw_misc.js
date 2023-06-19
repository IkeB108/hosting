function draw_general(){
  //Draws everything that belongs on every page,
  // including title
  
  //Draw the title
  var w = width * (3/4)
  var h = w * (images.logo.height/images.logo.width)
  draw_centered(images.logo, width/2, (h/2 + pxSpacing) , w, h  )
  
  //Draw decorative lines at top and bottom of screen (that help viewer gauge where the webpage starts and ends)
  stroke(0); 
  var ellipsey;
  var ellipsed = width/60;
  for(var i = 0; i < 2; i ++){ //Draw two lines; one on top and one on bottom. Set ellipsey according to which line we're drawing
    noFill();
    if(i==0)ellipsey = (pxSpacing)+h + pxSpacing;
    if(i==1)ellipsey = height - pxSpacing;
    ellipse(pxSpacing, ellipsey, ellipsed )
    ellipse(width - pxSpacing, ellipsey, ellipsed )
    if( (i==1 && current_screen!="front") || (i==0) ){
      fill(0);
      line(pxSpacing*2, ellipsey, (width/2) - (pxSpacing*2), ellipsey)
      line(width-pxSpacing*2, ellipsey, (width/2) + (pxSpacing*2), ellipsey)
      ellipse(width/2 - pxSpacing, ellipsey, 3)
      ellipse(width/2, ellipsey, 3)
      ellipse(width/2 + pxSpacing, ellipsey, 3)
    } else {
      if(mouseY > icons8linky )fill(200);
      else fill(0);
      textAlign(CENTER,CENTER);
      if(width/25<20)textSize(width/25);
      else textSize(20)
      noStroke();
      text("ICONS PROVIDED BY ICONS8", width/2, height-pxSpacing-3 );
      stroke(0);
      var tw = textWidth("ICONS PROVIDED BY ICONS8")
      line(pxSpacing*2, ellipsey, (width/2) - (tw/2 + pxSpacing), ellipsey)
      line(width-pxSpacing*2, ellipsey, (width/2) + (tw/2 + pxSpacing), ellipsey)
      
    }
  }
  
  if(current_screen != "front"){
    buttonStyleSettings();
    drawButton(buttons.back_arrow)
  }
}

function draw_input(inputType){
  // inputType = either image or file
  if(inputType == "image"){
    if(!image_file_selected){
      if(dragging_over_canvas)fill(200);
      else noFill();
      stroke(0);
      setLineDash([5,5])
      var h = (height - (pxSpacing*4) - height_of_most_buttons) - y_below_logo - buttonTextSize - 4
      rect(pxSpacing, y_below_logo + (buttonTextSize) + 4 , width-(pxSpacing*2), h )
      setLineDash([])
      
      buttonStyleSettings();
      drawButton(buttons.imageInput)
      
      fill(0); noStroke();
      if(buttonTextSize < 20)textSize(buttonTextSize);
      else textSize(20);
      text("Drag image here or", width/2, height/2 - 30)
    } else {
      draw_chosen_image_graphic();
    }
  }
  if(inputType == "file"){
    if(!file_selected){
      if(dragging_over_canvas)fill(200);
      else noFill();
      stroke(0);
      setLineDash([5,5])
      var h = (height - (pxSpacing*4) - height_of_most_buttons) - y_below_logo - buttonTextSize - 4
      rect(pxSpacing, y_below_logo + (buttonTextSize) + 4 , width-(pxSpacing*2), h )
      setLineDash([])
      
      buttonStyleSettings();
      drawButton(buttons.fileInput)
      
      fill(0); noStroke();
      if(buttonTextSize < 20)textSize(buttonTextSize);
      else textSize(20);
      text("Drag file here (any file type) or", width/2, height/2 - 30)
    } else {
      fill(0); noStroke(); textAlign(CENTER,CENTER)
      if(buttonTextSize < 20)textSize(buttonTextSize);
      else textSize(20);
      text("You selected:\n" + chosen_file.name, width/2, height/2)
      var file_icon = "file-document";
      if(chosen_file.type == "image")file_icon = "file-image"
      if(chosen_file.type == "video")file_icon = "file-video"
      if(chosen_file.type == "audio")file_icon = "file-audio"
      tint(0)
      draw_centered(images[file_icon], width/2, height*(1/3), width/4 )
      noTint();
    }
  }
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function draw_decoded_file(){
  
  var mime_type = getMimeType(decoded_file_extension)
  draw_top_text("Decoding complete. Here's the file that was decoded:")
  if(mime_type !== "Image"){
    var file_icon = images["file-"+mime_type.toLowerCase()]
    tint(0);
    if(mime_type == "Webpage"){
      draw_centered(file_icon, width/2, height*(1/3), width/12)
    } else {
      draw_centered(file_icon, width/2, height*(1/3), width/4)
    }
    noTint();
    //Text formatting taken from draw_top_text above
    var mime_type_text = mime_type + " file (" + decoded_file_extension + ")"
    if(mime_type == "Document")mime_type_text = decoded_file_extension.toUpperCase() + " file"
    text(mime_type_text, width/2, height*(1/3)+(width/8)+pxSpacing )
    
    if(decoded_file_extension != "txt"){
      textSize(buttonTextSize * (2/3))
      var y = height - (pxSpacing*5) - (height_of_most_buttons*3) - (textSize() * 5);
      text("Press the 'back' arrow to\ndecode a different image,\nor create your own image.", width/2, y )
    }
  }
  
  
  
  if(decoded_file_extension == "txt"){
    textAlign(LEFT,TOP); textFont('Arial'); textStyle(ITALIC);
    // textSize(buttonTextSize * (2/3) )
    var text_box = {'x':pxSpacing, 'y':height/2, 'w':width-(pxSpacing*2), 'h':(height/4) }
    stroke(150); noFill();
    rect(text_box.x-pxSpacing,text_box.y-pxSpacing,text_box.w+(pxSpacing*2),text_box.h+(pxSpacing*2))
    noStroke(); fill(0);
    text(decoded_file_text, text_box.x, text_box.y, text_box.w, text_box.h )
    textFont(dosis_font); textStyle(NORMAL)
  }
  
  if(mime_type == "Image"){
    draw_chosen_image_graphic(decoded_image);
  }
  
  if(mime_type == "Audio"){
    buttonStyleSettings();
    if(!decoded_audio_element.paused)
    drawButton(buttons.pauseDecodedAudio)
    else
    drawButton(buttons.playDecodedAudio)
    toggled_audio = false;
  }
  
  if(mime_type == "Webpage"){
    text("Open this webpage?", width/2, height/2)
    buttonStyleSettings();
    drawButton(buttons.openDecodedFile)
  }
  
  buttonStyleSettings();
  drawButton(buttons.howDoesItWork)
  drawButton(buttons.downloadDecodedFile)
}


function draw_top_text(textStr, fillCol){
  if(!fillCol)fill(0);
  else fill(fillCol)
  textAlign(CENTER,TOP);
  if(buttonTextSize < 20)textSize(buttonTextSize);
  else textSize(20);
  text(textStr, pxSpacing, y_below_logo, width-(pxSpacing*2), (height/3)-y_below_logo )
  
}

function draw_chosen_image_graphic(different_image){
  //draw the chosen image graphic inside a bounding box
  //uncomment the rect() line to see this bounding box
  //bounding box allows for two buttons to go below it (for create4)
  if(different_image !== undefined && different_image !== null)var cig = different_image
  else { var cig = chosen_image_graphic; }
  noFill(); stroke(0);
  
  var y =  y_below_logo + (buttonTextSize*2) + 4
  var h = (height - (pxSpacing*5) - (height_of_most_buttons*2) ) - y
  var imageBoundingBox = {
    'x':pxSpacing,
    'y': y ,
    'w': width-(pxSpacing*2),
    'h':h
  }
  
  cigBoundingBox = imageBoundingBox;
  //rect(imageBoundingBox.x, imageBoundingBox.y, imageBoundingBox.w, imageBoundingBox.h)
  
  var img_w;
  var img_h;
  if(cig.width >= cig.height){
    img_w = imageBoundingBox.w;
    img_h = img_w * (cig.height/cig.width)
  }
  if(cig.height > cig.width){
    img_h = imageBoundingBox.h;
    img_w = img_h * (cig.width/cig.height)
  }
  
  var img_x = width/2
  var img_y = imageBoundingBox.y + (imageBoundingBox.h/2)
  
  cigImageBox = {
    'x': img_x - (img_w/2),
    'y': img_y - (img_h/2),
    'w': img_w,
    'h': img_h
  }
  draw_centered(cig, img_x, img_y, img_w, img_h)
  if(decoding_with_animation){
    tint(255,255,255,adt_alpha)
    //if(chunk_count < 30000){
    if(true){
      var ado = animated_decoding_overlay;
      draw_centered(ado, img_x, img_y, img_w, img_h)
    }
    var adt = animated_decoding_textbox
    var adtw = width * (2/3)
    fill(0);
    if(adt_alpha == 255)
    draw_centered("rectangle", img_x-2,img_y+2, adtw, adtw/8)
    draw_centered(adt, img_x, img_y, adtw, adtw/8 )
    noTint();
  }
}

function draw_centered(thing_to_draw, center_x, center_y, w, h){
  /*Given a p5 image or a button object (my custom buttons,
  not html elements) draw it centered on the provided coordinates
  with the provided width and height
  */
  if(!center_x)center_x = width/2;
  if(!center_y)center_y = height/2;
  if(!w)w = thing_to_draw.width;
  if(!h)h = w * (thing_to_draw.height/thing_to_draw.width);
  
  var x = center_x - (w/2)
  var y = center_y - (h/2)
  if(typeof thing_to_draw.blend == 'function') //This property is only found in p5 images
  image(thing_to_draw, x, y, w, h)
  if(typeof thing_to_draw.blend == 'undefined') //If not an image, then it must be a button
  rect(x, y, w, h)
  
  
  
}

function getMimeType(file_extension){
  var audio_extensions = "aac mid midi mp3 oga opus ogg wav weba".split(" ")
  var video_extensions = "3gp 3g2 avi mpeg ogv ts webm mp4".split(" ")
  var image_extensions = "bmp gif jpg jpeg png svg tif tiff webp".split(" ")
  if(audio_extensions.includes(file_extension.toLowerCase()))return "Audio"
  if(video_extensions.includes(file_extension.toLowerCase()))return "Video"
  if(image_extensions.includes(file_extension.toLowerCase()))return "Image"
  if(file_extension == "html")return "Webpage"
  return "Document"
}
