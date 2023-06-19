

function draw_front(){
  draw_top_text("The website that lets you put a secret file inside of an image!")
  buttonStyleSettings();
  drawButton(buttons.createImageScreen) //See these buttons in buttons.js
  drawButton(buttons.decodeImageScreen)
  drawButton(buttons.ikebotLink)
}

function draw_decode1(){
  if(!decoding_with_animation && !image_file_selected){
    draw_top_text("Select an image to decode.")
  }
  if(!image_file_selected){
    draw_input("image")
  }
  if(image_file_selected && !decoding_with_animation &&!decoding_complete){
    draw_input("image")
    buttonStyleSettings();
    drawButton(buttons.decode)
  }
  if(decoding_with_animation){
    draw_input("image")
    updateAnimatedDecoding();
    noStroke();
    textFont(dosis_font)
    draw_top_text("Decoding...", map(sin(frameCount*4), -1, 1, 0, 255 ) )
  }
  if(!decoding_with_animation && decoding_complete){
    draw_decoded_file();
  }
  // draw_decoded_file();
}
function draw_create1(){
  draw_top_text("Choose an image")
  
  buttons.next.disabled = !image_file_selected
  buttonStyleSettings();
  drawButton(buttons.next)
  
  draw_input("image")
}
function draw_create2(){
  draw_top_text("Choose a file (any file type)")
  
  buttons.next.disabled = !file_selected
  buttonStyleSettings();
  drawButton(buttons.back)
  drawButton(buttons.next)
  
  draw_input("file")
}
function draw_create3(){
  // draw_top_text("Create Three")
  draw_chosen_image_graphic();
  buttonStyleSettings();
  drawButton(buttons.encode)
}
function draw_create4(){
  // draw_top_text("Create Four")
  draw_top_text("Send this image to your friends! They can decode the image using this website.")
  draw_chosen_image_graphic();
  buttonStyleSettings();
  drawButton(buttons.saveImage)
  drawButton(buttons.howDoesItWork)
}
