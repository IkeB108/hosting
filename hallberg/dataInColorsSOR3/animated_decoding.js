function setupAnimatedDecoding(){
  cig = chosen_image_graphic
  cig.loadPixels();
  pxs = cig.pixels;
  var image_valid = 
    pxs[0] % 64 == 10 &&
    pxs[1] % 64 == 1 &&
    pxs[2] % 64 == 13 &&
    pxs[4] % 64 == 9 &&
    pxs[5] % 64 == 11 &&
    pxs[6] % 64 == 5
  if(!image_valid){
    alert("The image you've chosen is not encoded with any data. Make sure your image has not been resized, cropped, or 'screenshotted'.")
    loading_screen = false;
    image_file_selected = false;
  } else {
    //STEP TWO: Read metadata (get chunk size and file extension)
    chunk_width = pxs[8] % 64 + pxs[9] % 64 + pxs[10] % 64
    decoded_file_extension = ""
    var extensionChars = "?0123456789abcdefghijklmnopqrstuvwxyz_".split('')
    decoded_file_extension += extensionChars[pxs[12] % 38]
    decoded_file_extension += extensionChars[pxs[13] % 38]
    decoded_file_extension += extensionChars[pxs[14] % 38]
    decoded_file_extension += extensionChars[pxs[16] % 38]
    decoded_file_extension += extensionChars[pxs[17] % 38]
    decoded_file_extension += extensionChars[pxs[18] % 38]
    var ndfe = ''
    for(var i = 0; i < decoded_file_extension.length; i ++){
      if(decoded_file_extension[i] !== "?")ndfe += decoded_file_extension[i]
    }
    decoded_file_extension = ndfe;
    
    decoded_file_hex = ""
    width_in_chunks = round(cig.width/chunk_width) //We shouldn't have to round if the image has been encoded correctly but this is a falesafe
    height_in_chunks = round(cig.height/chunk_width)
    chunk_count = width_in_chunks * height_in_chunks
    
    //Variables for animated decoding:
    current_chunk_index = 0;
    var ado_w = chosen_image_graphic.width;
    if(ado_w > 500)ado_w = 500;
    ado_h = round(ado_w * (chosen_image_graphic.height/chosen_image_graphic.width))
    ado_scale = ado_w/chosen_image_graphic.width;
    animated_decoding_overlay = createGraphics(ado_w, ado_h)
    animated_decoding_textbox = createGraphics(600, 600/8 )
    ado = animated_decoding_overlay;
    ado.noFill(); ado.strokeWeight( ado.width * ado.height * (4/300000) );
    adt_alpha = 255;
    textFont("Courier")
    
    loading_screen = false;
    decoding_with_animation = true;
    animated_decoding_timer = 0; //frame timer
    binary_display_text = ""
    
    //How many chunks should be done slowly as an example?
    example_chunks = 4;
    //After we do a few slow example chunks, we need to speed things up.
    //How many chunks should we decode per frame at this point?
    chunks_per_frame = 1
    decoding_complete = false;
    last_decoded_chunk_index = -1;
  }
}
function decodeOneChunk(chunkIndex){
  current_chunk = chunkIndexToXY(chunkIndex)
  samplepx = {
    'x':(current_chunk.x*chunk_width) + floor(chunk_width/2),
    'y':(current_chunk.y*chunk_width) + floor(chunk_width/2)
  }
  samplepx.i = pxXYToIndex(samplepx)
  samplepx.r = pxs[samplepx.i]
  samplepx.g = pxs[samplepx.i+1]
  samplepx.b = pxs[samplepx.i+2]
  var r_decoded_val = (samplepx.r%17)
  var g_decoded_val = (samplepx.g%17)
  var b_decoded_val = (samplepx.b%17)
  r_decoded_val = r_decoded_val.toString(17)
  g_decoded_val = g_decoded_val.toString(17)
  b_decoded_val = b_decoded_val.toString(17)
  
  new_addition_to_file_hex = ''
  if(r_decoded_val !== 'g')new_addition_to_file_hex += r_decoded_val;
  if(g_decoded_val !== 'g')new_addition_to_file_hex += g_decoded_val;
  if(b_decoded_val !== 'g')new_addition_to_file_hex += b_decoded_val;
  decoded_file_hex += new_addition_to_file_hex;
  
  
}
function updateAnimatedDecoding(){
  var frames_for_each_example_chunk = 150; //How many frames should we spend going through each example chunk?
  var ffec = frames_for_each_example_chunk;
  textSize(buttonTextSize/2)
  ado.noFill(); ado.strokeWeight( ceil(ado.width * ado.height * (4/300000)) )
  ado.noTint();
  
  ado.clear();
  if(current_chunk_index < chunk_count && current_chunk_index != last_decoded_chunk_index){
    decodeOneChunk(current_chunk_index)
    last_decoded_chunk_index = current_chunk_index
  }
  var chunkColor = color(samplepx.r, samplepx.g, samplepx.b)
  
  
  var x = current_chunk.x * chunk_width * ado_scale;
  var y = current_chunk.y * chunk_width * ado_scale;
  ado.stroke(255); 
  ado.rect(x, y, chunk_width * ado_scale, chunk_width * ado_scale)
  x += chunk_width/2 * ado_scale;
  y += chunk_width/2 * ado_scale;
  ado.stroke(0);
  ado.line(x,y+3,ado.width/2,ado.height/2+3) //shadow line for visual clarity
  ado.stroke(chunkColor); 
  ado.line(x, y, ado.width/2, ado.height/2)
  
  adt = animated_decoding_textbox;
  adt.background(chunkColor);
  if(getTextColorWithBackground(chunkColor)=='black')adt.fill(0);
  if(getTextColorWithBackground(chunkColor)=='white')adt.fill(255);
  
  adt.noStroke();
  adt.textSize( 55 )
  adt.textAlign(LEFT, CENTER)
  
  var chunk_color_in_hex = hex(samplepx.r, 2) + hex(samplepx.g, 2) + hex(samplepx.b, 2)
  var binary_data_string = hex2bin(new_addition_to_file_hex)
  if(binary_data_string.includes("NaN"))binary_data_string = ''; //we have reached extra chunks
  
  if(current_chunk_index < example_chunks){
    timeIsBetween = (min, max) => {
      return (animated_decoding_timer % ffec).between(min*ffec, max*ffec )
    }
    
    if( timeIsBetween(0, 1/5) ){
      var downBy = ((animated_decoding_timer-0) % ffec) * (3.3 * (150/ffec))
      adt.text("Color: #"+chunk_color_in_hex, pxSpacing, adt.height/2 + 4 + downBy - 100)
    }
    if( timeIsBetween(1/5, 2/5) ){
      adt.text("Color: #"+chunk_color_in_hex, pxSpacing, adt.height/2 + 4)
    }
    if( timeIsBetween(2/5, 3/5) ){
      var downBy = ((animated_decoding_timer- (2/5 * ffec)  ) % ffec) * (3.3 * (150/ffec))
      adt.text("Color: #"+chunk_color_in_hex, pxSpacing, adt.height/2 + 4 + downBy)
      adt.text("Binary: "+binary_data_string, pxSpacing, adt.height/2 + 4 + downBy - 100)
    }
    if( timeIsBetween(3/5, 4/5) ){
      adt.text("Binary: "+binary_data_string, pxSpacing, adt.height/2 + 4)
    }
    if( timeIsBetween(4/5, 5/5) ){
      var downBy = ((animated_decoding_timer- (4/5 * ffec) ) % ffec) * (3.3 * (150/ffec))
      adt.text("Binary: "+binary_data_string, pxSpacing, adt.height/2 + 4 + downBy)
    }
    
    if(animated_decoding_timer % ffec == round(4.5/5 * ffec) ){
      binary_display_text += binary_data_string;
      //Only display the last one hundred binary characters;
      //no point in needlessly drawing all of them when the user
      //will only see about 100
      binary_display_text = binary_display_text.substr( binary_display_text.length-800, binary_display_text.length )
    }
    
    if(animated_decoding_timer % ffec == 0 && animated_decoding_timer > 0 && current_chunk_index < chunk_count){
      current_chunk_index ++;
    }
  }
  if(current_chunk_index >= example_chunks && current_chunk_index < chunk_count){
    if(current_chunk_index == last_decoded_chunk_index)current_chunk_index ++
    for(var i = 0; i < chunks_per_frame; i ++){
      if(current_chunk_index < chunk_count){
        decodeOneChunk(current_chunk_index);
        last_decoded_chunk_index = current_chunk_index
        binary_display_text += binary_data_string;
        binary_display_text = binary_display_text.substr( binary_display_text.length-800, binary_display_text.length )
        current_chunk_index ++;
      }
    }
    noStroke();
    if(binary_data_string.length > 0)
    adt.text("Binary: "+ binary_data_string, pxSpacing, adt.height/2 + 4)
    else
    adt.text("Binary: 00000000", pxSpacing, adt.height/2 + 4)
  }
  
  if(current_chunk_index == chunk_count){
    noStroke();
    adt.text("Binary: 00000000", pxSpacing, adt.height/2 + 4)
    if(!decoding_complete){
      decoding_complete = true;
      animated_decoding_timer = 0;
    }
  }
  if(current_chunk_index < chunk_count){
    var binary_text_location = {
      'x': pxSpacing,
      'y': cigImageBox.y + cigImageBox.h + pxSpacing + 10,
      'w': width-(pxSpacing*2),
    }
    var btl = binary_text_location
    btl.h = height - (btl.y + (pxSpacing*4))
    // btl_area = (btl.w * btl.h) / (textWidth('0') * (textAscent()+textDescent())  )
    noStroke(); fill(0); textAlign(LEFT, TOP); textWrap(CHAR);
    textFont('Courier')
    text(binary_display_text, btl.x, btl.y, btl.w, btl.h)
    stroke(0); noFill();
    // rect(btl.x, btl.y, btl.w, btl.h)
  }
  
  if(current_chunk_index >= 300 + example_chunks && chunks_per_frame == 1){
    //After around two seconds, speed up the chunks_per_frame
    //Such that we can expect it to finish in about 3 seconds
    chunks_per_frame = ceil( (chunk_count-(300+example_chunks)) /180 )
  }
  
  if(decoding_complete){
    if(animated_decoding_timer.between(0,98)){
      //Draw binary text
      var binary_destination = {
        'x':(width/2),
        'y': height/2
      }
      var binary_starting_pos = {
        'x': pxSpacing,
        'y': cigImageBox.y + cigImageBox.h + pxSpacing + 10,
        'w': width-(pxSpacing*2),
      }
      var bsp = binary_starting_pos
      bsp.h = height - (bsp.y + (pxSpacing*4))
      
      
      var binary_text_location = {
        'x': lerp(binary_starting_pos.x, binary_destination.x, animated_decoding_timer/100 ),
        'y': lerp(binary_starting_pos.y, binary_destination.y, animated_decoding_timer/100 ),
        'w': lerp(bsp.w, 0, animated_decoding_timer/100),
        'h': lerp(bsp.h, 0, animated_decoding_timer/100)
      }
      var btl = binary_text_location
      
      noStroke(); fill(0); textAlign(LEFT, TOP);
      textSize( lerp(buttonTextSize/2, 0, animated_decoding_timer/100) )
      textFont('Courier')
      text(binary_display_text, btl.x, btl.y, btl.w, btl.h)
      if(adt_alpha > 0)adt_alpha -= 5;
    }
    if(animated_decoding_timer == 100){
      var h = height - round(y_below_logo) - (pxSpacing * 4)
      expanding_circle_graphic = createGraphics(width, h)
      expanding_circle_graphic.fill(0); expanding_circle_graphic.noStroke();
      textFont(dosis_font)
    }
    if(animated_decoding_timer.between(100,150)){
      //Draw growing black circle
      noTint();
      var fillCol = map(animated_decoding_timer,125,150, 0, 255)
      expanding_circle_graphic.fill(fillCol)
      var esize = map(animated_decoding_timer, 100, 150, 0, width*2)
      expanding_circle_graphic.ellipse(width/2, expanding_circle_graphic.height/2, esize  )
      image(expanding_circle_graphic, 0, y_below_logo)
    }
    if(animated_decoding_timer == 150){
      decoding_with_animation = false;
      if(decoded_file_extension == 'txt'){
        decoded_file_text = hexToBase64(decoded_file_hex)
        decoded_file_text = atob(decoded_file_text)
      }
      if(getMimeType(decoded_file_extension) == "Image"){
        decoded_image = loadImage("data:image/"+decoded_file_extension+ ";base64,"+hexToBase64(decoded_file_hex))
      }
      if(getMimeType(decoded_file_extension) == "Audio"){
        // decoded_audio = loadSound("data:audio/"+decoded_file_extension+ ";base64,"+hexToBase64(decoded_file_hex), ()=>{decoded_audio.play()}  )
        decoded_audio_element = document.createElement('audio')
        decoded_audio_element.src = "data:audio/"+decoded_file_extension+ ";base64,"+hexToBase64(decoded_file_hex);
        decoded_audio_element.play();
      }
      textWrap(WORD)
    }
  }
  
  animated_decoding_timer ++;
  
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
  if(r * 0.299 + g * 0.587 + b * 0.114 > 186){
    return 'black';
  } else {
    return 'white';
  }
  
}
