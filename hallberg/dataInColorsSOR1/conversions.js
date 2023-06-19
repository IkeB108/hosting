function recolorImage(){
  //This function is called when user presses "encode"
  // after selecting a file and an image to recolor.
  
  //STEP ONE: Resize the image
  cig = chosen_image_graphic
  var chunk_count = ceil(chosen_file_hex.length/3)
  
  //this formula can be proven with algebra; width in chunks / height in chunks needs to approximate cig.w/cig.h, and width in chunks * height in chunks should be at least chunk_count
  //since chunks will be square-shaped, chunk_width will be the same as the chunk_height
  chunk_width = ceil(sqrt( (cig.width * cig.height) / chunk_count ))
  if(chunk_width < 5)chunk_width = 5; //minimum of five makes it easier to read the colors
  if(chunk_width > 189)chunk_width = 189;
  //maximum chunk size is 189 pixels because of step 2b (see below)
  
  height_in_chunks = ceil( sqrt(chunk_count/(cig.width/cig.height)) )
  width_in_chunks = ceil( height_in_chunks * (cig.width/cig.height) )
  
  var new_width = width_in_chunks * chunk_width
  var new_height = height_in_chunks * chunk_width
  var new_cig = createGraphics(new_width, new_height)
  chosen_image_graphic = new_cig;
  cig = chosen_image_graphic
  cig.noSmooth();
  cig.image(chosen_image, 0, 0, new_width, new_height)
  
  //console.log({chunk_width, width_in_chunks, height_in_chunks, new_width, new_height})
  
  //STEP TWO: Write metadata to the first five pixels of the image
  //Step 2a: The first two pixels are validity checkers to confirm that
  // this image has been encoded by this program.
  // The RGB values of the first two pixels fit this pattern when taken mod 64:
  // 10 1 13 9 11 5
  //(10 1 13 is "A113", the Pixar number, and 9 11 5 = the numerical positions of I, K, and E in the alphabet 
  cig.loadPixels();
  pxs = cig.pixels
  pxs[0] = closestMultiple(pxs[0], 64) + 10
  pxs[1] = closestMultiple(pxs[1], 64) + 1
  pxs[2] = closestMultiple(pxs[2], 64) + 13
  pxs[4] = closestMultiple(pxs[4], 64) + 9
  pxs[5] = closestMultiple(pxs[5], 64) + 11
  pxs[6] = closestMultiple(pxs[6], 64) + 5
  //Step 2b: the R value of the next pixel encodes the size of the chunks in pixels when taken mod 64.
  //If the chunk size is larger than 63 pixels, add on the values of the G and B values mod 64,
  //for a maximum chunk size of 63*3 = 189 pixels.
  if(chunk_width.between(0, 63)){
    pxs[8] = closestMultiple(pxs[8], 64) + chunk_width
    pxs[9] = closestMultiple(pxs[9], 64) + 0
    pxs[10] = closestMultiple(pxs[10], 64) + 0
  }
  if(chunk_width.between(64, 126)){
    pxs[8] = closestMultiple(pxs[8], 64) + 63
    pxs[9] = closestMultiple(pxs[9], 64) + (chunk_width-63)
    pxs[10] = closestMultiple(pxs[10], 64) + 0
  }
  if(chunk_width.between(127, 189)){
    pxs[8] = closestMultiple(pxs[8], 64) + 63
    pxs[9] = closestMultiple(pxs[9], 64) + 63
    pxs[10] = closestMultiple(pxs[10], 64) + (chunk_width-126)
  }
  //Step 2c: encode the file extension
  //Have each of the following characters correspond to a number (which will be its index in this array):
  var extensionChars = "?0123456789abcdefghijklmnopqrstuvwxyz_".split('')
  //If a file extension has characters other than these, or if a file extension has
  // more than six characters, we cannot encode the file and the user will be told.
  //The RGB values of the fourth and fifth pixels will store the characters of the file extension
  //If a file extension has fewer than 6 characters (likely),
  // the remaining spaces will hold a "?" character,
  // telling the program to ignore it. This means the file extension also
  // cannot have a question mark in it.
  var extensionNumbers = []
  for(var i = 0; i < 6; i ++){
    if(chosen_file_extension[i])
    extensionNumbers.push(extensionChars.indexOf(chosen_file_extension[i]));
    else
    extensionNumbers.push(0); //0 is the index of the question mark character in the extensionChars array
  }
  //This time we will do mod 38 since there are 38 characters in the extensionChars list
  pxs[12] = closestMultiple(pxs[12], 38) + extensionNumbers[0]
  pxs[13] = closestMultiple(pxs[13], 38) + extensionNumbers[1]
  pxs[14] = closestMultiple(pxs[14], 38) + extensionNumbers[2]
  pxs[16] = closestMultiple(pxs[16], 38) + extensionNumbers[3]
  pxs[17] = closestMultiple(pxs[17], 38) + extensionNumbers[4]
  pxs[18] = closestMultiple(pxs[18], 38) + extensionNumbers[5]

  //STEP THREE: Encode every chunk with its corresponding hex (base-16) digit in the chosen_file_hex string
  //The R, G, and B values of each chunk correspond to the
  //next three hex digits in the string, where the color value % 17 = a number corresponding to a hex digit.
  //If the color value % 17 = 16, then that tells us that that color value stores no data (i.e. we have extra chunks)
  //and the decoder will ignore these color values.
  //In fact, 16 in base 17 is represented with a "g", and there's no "g" in base 16 so that's a clear sign that this chunk is not part of our data
  
  var random_chunk_values_1 = []
  for(var i = 0; i < chunk_count; i++)random_chunk_values_1.push(random(1));
  var random_chunk_values_2 = []
  for(var i = 0; i < chunk_count; i++)random_chunk_values_2.push(random(1));
  
  for(var i = 0; i < pxs.length; i += 4){
    if(i > 18){ //skip the first 5 pixels since they encode metadata and we don't want to change them
      var chunk = pxIndexToChunk(i)
      //Get the next 3 hexadecimal digits to encode
      var r_encode_val = chosen_file_hex[ (chunk.i*3) ]
      var g_encode_val = chosen_file_hex[ (chunk.i*3)+1 ]
      var b_encode_val = chosen_file_hex[ (chunk.i*3)+2 ]
      
      //Convert those hexadecimal digits to base 10 numbers, and if
      //We have run out of digits, set the base 10 number to 16 (or in other words a "g" in base 17)
      if(r_encode_val===undefined)r_encode_val = 16;
      else r_encode_val = parseInt(r_encode_val,16)
      if(g_encode_val===undefined)g_encode_val = 16;
      else g_encode_val = parseInt(g_encode_val,16)
      if(b_encode_val===undefined)b_encode_val = 16;
      else b_encode_val = parseInt(b_encode_val,16)
      
      //At this point, we could just do this to encode the data:
            // pxs[i] = closestMultiple(pxs[i], 17) + r_encode_val
            // pxs[i+1] = closestMultiple(pxs[i+1], 17) + g_encode_val
            // pxs[i+2] = closestMultiple(pxs[i+2], 17) + b_encode_val
      // However, the squares aren't super visible this way, so for clarity, we will
      // make them more visible by randomly adding/subtracting the r g and b values
      // but making sure they still encode the correct hex digit.
      // One way to do this that looks visually appealing
      // is to utilize the color of the pixel in the top right corner of this chunk.
      //(doesn't really make a difference when the chunks are small but when they're big it looks cool)
      //Using the corner is causing some sort of glitch where the corner pixel
      //of every chunk is noticably different from the rest of the chunk,
      //so I will not use the corner and instead we'll just say the "corner" is the pixel itself
      
      var cornerx = chunk.x * chunk_width
      var cornery = chunk.y * chunk_width
      var corneri = pxXYToIndex({'x':cornerx, 'y':cornery})
      // var corner_r = pxs[corneri]
      // var corner_g = pxs[corneri+1]
      // var corner_b = pxs[corneri+2]
      var corner_r = pxs[i]
      var corner_g = pxs[i+1]
      var corner_b = pxs[i+2]
      
      var pxx = pxIndexToXY(i).x;
      var pxy = pxIndexToXY(i).y;
      
      
      var random_value_1 = random_chunk_values_1[chunk.i]
      var random_value_2 = random_chunk_values_2[chunk.i]
      
      
      var large_value = 17*3;
      
      //50% chance of increasing the new R and B values, and 50% chance of decreasing them
      if(random_value_1 < (3/4)){
        new_r = closestMultiple(corner_r, large_value)
        if(new_r + large_value + r_encode_val <= 255 )new_r += large_value;
        new_b = closestMultiple(corner_b, large_value)
        if(new_b + large_value + b_encode_val <= 255 )new_b += large_value;
      } else {
        new_r = closestMultiple(corner_r, large_value)
        if(new_r - large_value >= 0 )new_r -= large_value;
        new_b = closestMultiple(corner_b, large_value)
        if(new_b - large_value >= 0 )new_b -= large_value;
      }
      
      // A certain chance of only using the new B value,
      // A certain chance of only using the new R and B values,
      // and a certain chance of not changing anything
      var probability_b_only = 10/20
      var probability_r_and_b_only = 5/20
      
      pxs[i] = closestMultiple(pxs[i], 17) + r_encode_val
      pxs[i+1] = closestMultiple(pxs[i+1], 17) + g_encode_val
      pxs[i+2] = closestMultiple(pxs[i+2], 17) + b_encode_val
      if(random_value_2 < probability_b_only ){
        pxs[i+2] = new_b + b_encode_val
      } else if (random_value_2 < probability_b_only + probability_r_and_b_only ) {
        pxs[i] = new_r + r_encode_val;
        pxs[i+2] = new_b + b_encode_val;
      }
      
    }
  }
  
  cig.updatePixels();
  
  
  loading_screen = false;
  current_screen = "create4"
}

function decodeImage(){
  cig = chosen_image_graphic
  cig.loadPixels();
  pxs = cig.pixels;
  //STEP ONE: Make sure the image is a valid image that has been encoded by this program
  //(Only one in 68 billion chance of false positive)
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
    //STEP THREE: Get hex data from each chunk and write it to the decoded_file_hex variable
    width_in_chunks = round(cig.width/chunk_width) //We shouldn't have to round if the image has been encoded correctly but this is a falesafe
    height_in_chunks = round(cig.height/chunk_width)
    chunk_count = width_in_chunks * height_in_chunks
    for(var chunki = 0; chunki < chunk_count; chunki ++){
      var chunk = chunkIndexToXY(chunki)
      var samplepx = {
        'x':(chunk.x*chunk_width) + floor(chunk_width/2),
        'y':(chunk.y*chunk_width) + floor(chunk_width/2)
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
      if(r_decoded_val !== 'g')decoded_file_hex += r_decoded_val;
      if(g_decoded_val !== 'g')decoded_file_hex += g_decoded_val;
      if(b_decoded_val !== 'g')decoded_file_hex += b_decoded_val;
    }
    loading_screen = false;
    // hexToFile(decoded_file_hex, "myDecodedFile." + decoded_file_extension)
  }
}

function listHex(arr){
  //This function is for debugging purposes
  var ret = ''
  for(var i = 0; i < arr.length; i ++){
    var val = arr[i] % 17
    val = val.toString(17)
    ret += val;
  }
  console.log(ret.toUpperCase())
  console.log( chosen_file_hex.substr(0, arr.length) + " <- True hex" )
}

function closestMultiple(number, multiple, maximum){
  //Given a number, and a number "multiple" to take the closest multiple of,
  // return what is the multiple of "multiple" that's closest to "number"
  // The returned value cannot exceed the given maximum when added by multiple
  // If no maximum is given, assume 255
  if(!maximum)maximum = 255;
  var ret = round(number/multiple) * multiple
  while(ret+multiple > maximum)ret -= multiple;
  return ret;
}

function pxIndexToChunk(pxi){
  var px = pxIndexToXY(pxi);
  var x = floor(px.x/chunk_width)
  var y = floor(px.y/chunk_width)
  var i = chunkXYToIndex({x,y})
  return {x,y,i}
}
function pxIndexToXY(pxi){
  var npxi = pxi/4
  var x = npxi%chosen_image_graphic.width
  var y = floor(npxi/chosen_image_graphic.width)
  return {x, y}
}
function pxXYToIndex(pxxy){
  var x = pxxy.x
  var y = pxxy.y
  return ( (y * chosen_image_graphic.width) + x ) * 4
}
function chunkXYToIndex(chunkxy){
  var chunkx = chunkxy.x
  var chunky = chunkxy.y
  return (chunky * width_in_chunks) + (chunkx % width_in_chunks)
}
function chunkIndexToXY(chunki){
  var chunkx = (chunki%width_in_chunks)
  var chunky = floor(chunki/width_in_chunks)
  return {'x':chunkx, 'y':chunky, 'i': chunki}
}

function createFileReader(){
  myReader = new FileReader();
  myReader.onload = () => {
    chosen_file_64 = (myReader.result.substr(myReader.result.indexOf(',') + 1) )
    chosen_file_hex = base64ToHex(chosen_file_64)
  }
  myReader.onerror = () => {console.log('Error: ' + error)}
}
function fileTo64(){
  // Referring to the file uploaded via fileInput,
  // store the base64 data of that file in the variable chosen_file_64
  // and same for hex data of the file
  // myReader.readAsDataURL(fileInput.elt.files[0])
  myReader.readAsDataURL(chosen_file.file)
}
function base64ToHex(str) {
  //Given a string of base64 data, convert the data to hex values
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}
function saveText(textString, fileName){
  if(!fileName)fileName = "myText.txt"
  var writer = createWriter(fileName);
  writer.print(textString)
  writer.close();
}

function hexToFile(hexString, filename) {
  //Given a string of hex values, create and download a file containing that hex data
  var cleaned_hex = clean_hex(hexString, true);
    if (cleaned_hex.length % 2) {
      cleaned_hex += "0"
      //alert ("Error: cleaned hex string length is odd.");
      //return;
    }
    var binary = new Array();
    for (var i=0; i<cleaned_hex.length/2; i++) {
      var h = cleaned_hex.substr(i*2, 2);
      binary[i] = parseInt(h,16);
    }
	var byteArray = new Uint8Array(binary);
	var a = document.createElement('a');
	a.href = window.URL.createObjectURL(new Blob([byteArray], { type: 'application/octet-stream' }));
  a.download = filename;
	// Append anchor to body.
	document.body.appendChild(a)
	a.click();
	// Remove anchor from body
	document.body.removeChild(a)
}
function clean_hex(input, remove_0x) {
  input = input.toUpperCase();
  if (remove_0x) {
    input = input.replace(/0x/gi, "");
  }
  var orig_input = input;
  input = input.replace(/[^A-Fa-f0-9]/g, "");
  //if (orig_input != input)
  //    alert ("Warning! Non-hex characters (including newlines) in input string ignored.");
  return input;
}
function hex2bin(hex){
    return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
function hexToBase64(hexstring) {
    return btoa(hexstring.match(/\w{2}/g).map(function(a) {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function rewriteHTMLDoc(newTextString){
  document.open();
  document.write(newTextString);
  document.close();
}
