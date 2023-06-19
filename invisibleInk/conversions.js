function fileToImage(){
  /*
  This function is called after the image and file have both been selected.
  We are working with the new_chosen_image p5 graphics object
  and the myHex variable.
  */
  myHex = clean_hex(myHex);
  //convert myHex into the user's selected base/radix
  //step one: convert the hex code into decimal by storing it in a big integer (BigInt)
  fileBigInt = BigInt('0x' + myHex)
  //step two: convert the decimal big integer into the new radix by using BigInt's .toString() method
  usr = Number(radixInput.value()) //user-selected radix
  data_in_usr = fileBigInt.toString( usr - 1 )

  //Check to see if the image is already large enough for this
  //much data. If not, resize it to fit.
  if(new_chosen_image.width * new_chosen_image.height < ceil(data_in_usr.length/3) + 3 ){

    var old_width = new_chosen_image.width;
    var old_height = new_chosen_image.height;
    var des_px = ceil(data_in_usr.length/3) + 3 //desired number of pixels
    var new_width = ceil ( sqrt( ( old_width * des_px ) / old_height ) )
    var new_height = ceil ( new_width / (old_width / old_height) )
    var resized = createGraphics(new_width, new_height)
    resized.image(new_chosen_image, 0, 0, new_width, new_height)
    new_chosen_image = resized;
  }

  new_chosen_image.loadPixels();
  pxs = new_chosen_image.pixels
  current_digit = 0;

  //First pixel of image denotes the usr.
  if(usr == 36){
    // pxs[0] = closestMultiple(pxs[0], 36) + 0;
    // pxs[1] = closestMultiple(pxs[1], 36) + 0;
    // pxs[2] = closestMultiple(pxs[2], 36) + 0;
    pxs[0] = encodeColorValue(pxs[0], 0, 36)
    // pxs[1] = encodeColorValue(pxs[1], 0, 36)
    // pxs[2] = encodeColorValue(pxs[2], 0, 36) //not really necessary
  } else {
    pxs[0] = encodeColorValue(pxs[0], usr, 36)
    // pxs[1] = encodeColorValue(pxs[1], usr, 36)
    // pxs[2] = encodeColorValue(pxs[2], usr, 36) //not really necessary
  }
  //Second and third pixel denotes file extension (six characters max).
  extension = fileInput.elt.files[0].name.split('.')[1].toLowerCase()
  charTo36Val = (char) => {
    var vals = "abcdefghijklmnopqrstuvwxyz0123456789"
    for(var i = 0; i < vals.length; i ++){
      if(vals[i] == char.toLowerCase())return i;
    }
    return null;
  }
  if(extension[0])pxs[4] = pxs[4] = encodeColorValue(pxs[4], charTo36Val(extension[0]), 36); else pxs[4] = encodeColorValue(pxs[4], 26, 36);
  if(extension[1])pxs[5] = pxs[5] = encodeColorValue(pxs[5], charTo36Val(extension[1]), 36); else pxs[5] = encodeColorValue(pxs[5], 26, 36);
  if(extension[2])pxs[6] = pxs[6] = encodeColorValue(pxs[6], charTo36Val(extension[2]), 36); else pxs[6] = encodeColorValue(pxs[6], 26, 36);
  if(extension[3])pxs[8] = pxs[8] = encodeColorValue(pxs[8], charTo36Val(extension[3]), 36); else pxs[8] = encodeColorValue(pxs[8], 26, 36);
  if(extension[4])pxs[9] = pxs[9] = encodeColorValue(pxs[9], charTo36Val(extension[4]), 36); else pxs[9] = encodeColorValue(pxs[9], 26, 36);
  if(extension[5])pxs[10] = pxs[10] = encodeColorValue(pxs[10], charTo36Val(extension[5]), 36); else pxs[10] = encodeColorValue(pxs[10], 26, 36);

  /*for(var pxi = 4; pxi < 12; pxi ++){
    if(extension[pxi-4])pxs[pxi] = encodeColorValue(pxs[pxi], charTo36Val(extension[pxi-4]), 36)
    else { pxs[pxi] = encodeColorValue(pxs[pxi], 26, 36) }
  }*/
  /*for(var i = 0; i < extension.length; i ++){
    pxs[4+i] = closestMultiple(pxs[4+i], 36) + charTo36Val(extension[i])
    start_px = 4+i
  }*/

  start_px = 12;

  for(var d = 0; d < data_in_usr.length; d ++){
    var px = floor(d/3)
    var rgb_val = d%3
    pxi = (px*4) + rgb_val + start_px
    // var new_col_val = closestMultiple(pxs[pxi], usr) + parseInt(data_in_usr[d], usr)
    // if(new_col_val > 255)new_col_val -= usr;
    pxs[ pxi ] = encodeColorValue(pxs[pxi], parseInt(data_in_usr[d], usr), usr ) + 1
    //pxs[ pxi ] = closestMultiple(pxs[pxi], usr) + parseInt(data_in_usr[d], usr)
  }
  //Set remaining pixels to have be 0
  pxi ++;
  while(pxi < pxs.length){
    if(pxi%4 !== 3)pxs[pxi] = encodeColorValue(pxs[pxi], 0, usr )
    pxi ++;
  }

  //Set all pixels to have an alpha of 1
  for(var i = 0; i < pxs.length; i += 4){
    pxs[i+3] = 255;
  }

  new_chosen_image.updatePixels();
  // for(var i = 0; i < pxs.length; i += 4){
  //   if(current_digit < data_in_usr.length){
  //     var r_val_in_dec = parseInt(data_in_usr[current_digit], usr)
  //     current_digit ++;
  //     var g_val_in_dec = parseInt(data_in_usr[current_digit], usr)
  //     current_digit ++;
  //     var b_val_in_dec = parseInt(data_in_usr[current_digit], usr)
  //     current_digit ++;
  //   }
  // }
  image_converted = true;
}
function pxCoordToChunkCoord(x, y){
  /*
  Given the coordinates of a pixel in the image,
  return the coordinates of the chunk that pixel is in.
  Also return the index of this chunk
  */

  var chunkx = floor(x/chunk_width)
  var chunky = floor(y/chunk_height)
  return {'x':chunkx, 'y':chunky, 'i':(chunky * width_in_chunks) + chunkx }
}
function xyToIndex(x, y, imageWidth){
  return ((round(y) * imageWidth) + round(x)) * 4
}
function indexToXY(i, imageWidth){
  return {
    'x': floor(i/4) %imageWidth,
    'y': floor( floor(i/4) /imageWidth)
  }
}

function handleImageFile(file){
  if(file.type == 'image'){
    image_converted = false;
    image_ready = false;
    loading_screen = true;
    loading_countdown = 30;
    //create an html element of the image (but hide it)
    chosen_image = createImg(file.data, '');
    chosen_image.hide();
    if(current_screen == 'scan1')imageInput.hide();

    //create a p5 graphics object to be the new, edited version of this image.
    //The new_chosen_image will start out with the same pixels as chosen_image.
    setTimeout( ()=>{
      new_chosen_image = createGraphics(chosen_image.width, chosen_image.height)
      new_chosen_image.pixelDensity(1)
      new_chosen_image.noSmooth();
      new_chosen_image.image(chosen_image,0,0)
      chosen_image_graphic = createGraphics(chosen_image.width, chosen_image.height)
      chosen_image_graphic.pixelDensity(1)
      chosen_image_graphic.noSmooth();
      chosen_image_graphic.image(chosen_image,0,0)
      image_ready = true;
    }, 300)

    //new_chosen_image.image(chosen_image,0,0)
    console.log('finished loading image')
  }
  else {
    alert("The file you've selected is not an image file.")
  }
}

function handleFile(file){

  extension = file.name.split('.')[1].toLowerCase()
  if( !contains("0", extension) && extension.length <= 6 ){
    valid_file_selected = true;
    loading_screen = true;
    loading_countdown = 30;
    myReader.readAsDataURL(fileInput.elt.files[0])
    if(file.size > 100002){
      alert("WARNING: Files bigger than 100 KB are likely not to work, unless you select a pixel flexibility of 17 on the next page.")
      radixInput.value("17")
    } else {
      radixInput.value("3")
    }
  } else {
    valid_file_selected = false;
    file_chosen = false;
    loading_screen = true;
    loading_countdown = 30;
    alert("Files must have an extension that's six or less characters long, and the extension must not contain a zero. Sorry for the inconvenience.")

  }
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

function hexToFile(hexString, filename) {
  just_downloaded_hex = true;
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
  console.log(a)
  a.download = filename;
	// Append anchor to body.
	document.body.appendChild(a)
	a.click();
	// Remove anchor from body
	document.body.removeChild(a)
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
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
function closestMultiple(number, multiple){
  /*
  Given a number, return the nearest multiple
  of another number that is close to that number
  */
  var lower = floor(number/multiple) * multiple;
  var upper = ceil(number/multiple) * multiple;
  if( abs(lower-number) > abs(upper-number) ){
    //upper is closer
    return upper;
  } else {
    //lower is closer
    return lower;
  }
}
function encodeColorValue(current_val, target_enc_val, radix){
  var cm = closestMultiple(current_val, radix)
  if(cm + target_enc_val > 254){
    /*if the returned value would be greater than 255, then
    it will display as 255 and the data will be lost. So instead,
    go down to the multiple directly below cm.*/
    return (cm - radix) + target_enc_val
  }

  return cm + target_enc_val;
}

function imageToFile(){
  gr = chosen_image_graphic;
  chosen_image_graphic.loadPixels();
  pxs = chosen_image_graphic.pixels

  data_in_usr = ''
  radix = pxs[0]%36;
  if(radix == 0)radix = 36;
  extension = ''
  vals = "abcdefghijklmnopqrstuvwxyz0123456789"
  extension += vals[ pxs[4]%36 ]
  extension += vals[ pxs[5]%36 ]
  extension += vals[ pxs[6]%36 ]
  extension += vals[ pxs[8]%36 ]
  extension += vals[ pxs[9]%36 ]
  extension += vals[ pxs[10]%36 ]
  extension = removeTrailingZeroes(extension)
  var okToDownload = confirm("A file of this type has been detected:   " + extension.toUpperCase() + "\nIf you don't recognize this file type, the encoded file may be corrupt. Proceed to convert and download this file?")
  if(okToDownload){


    //Start reading actual data from pixel 3 (meaning start at pixel index of 12)
    for(var pxi = 12; pxi < pxs.length; pxi += 4){
      //if(pxs[pxi]%radix == 0){console.log('Zeros begin at ' + pxi);break;}
      var r_in_dec = (pxs[pxi] %  radix)  - 1;
      var g_in_dec = (pxs[pxi+1] % radix) - 1;
      var b_in_dec = (pxs[pxi+2] % radix) - 1;
      if(r_in_dec>=0)data_in_usr += r_in_dec.toString(radix)
      if(g_in_dec>=0)data_in_usr += g_in_dec.toString(radix)
      if(b_in_dec>=0)data_in_usr += b_in_dec.toString(radix)

      // var new_r = pxs[pxi]
      // var new_g = pxs[pxi+1]
      // var new_b = pxs[pxi+2]
      // if(r_in_dec == 0)new_r = 0;
      // if(g_in_dec == 0)new_g = 0;
      // if(b_in_dec == 0)new_b = 0;
      // chosen_image_graphic.pixels[pxi] = new_r
      // chosen_image_graphic.pixels[pxi+1] = new_g
      // chosen_image_graphic.pixels[pxi+2] = new_b
    }
    if(radix == 17){
      // data_in_hex = removeTrailingZeroes(data_in_usr)
      data_in_hex = data_in_usr
      console.log("Didn't convert")
    } else {
      // data_in_usr = removeTrailingZeroes(data_in_usr)
      data_in_dec = parseBigInt(data_in_usr, radix-1)
      data_in_hex = data_in_dec.toString(16)
    }

    // var writer = createWriter("My Hex.txt");
    // writer.print(data_in_hex)
    // writer.close();
    if(extension == 'html')hexToFile(data_in_hex, 'ClickMe.html');
    else hexToFile(data_in_hex, 'myFile.' + extension);

  }
  chosen_image_graphic.updatePixels();
  image_decoded = true;
  converting_to_file = false;

}

function isGrayscale(i, px_array){
  /*
  Given an index of a pixel and the array the pixel is stored in,
  return whether or not this pixel is a shade of grey (same r g and b values)
  */
  return px_array[i] == px_array[i+1] && px_array[i+1] == px_array[i+2]
}
function setpx(i, px_array, color_array){
  /*Given an index of a pixel and a color to set it to and the array the pixel
  is stored in, color that pixel according to the color.
  color_array can be created with color('red').levels*/
  px_array[i] = color_array[0]
  px_array[i+1] = color_array[1]
  px_array[i+2] = color_array[2]
}


//The following code stolen from stackOverflow
/*function parseBigInt(bigint, base) {
  //convert bigint string to array of digit values
  for (var values = [], i = 0; i < bigint.length; i++) {
    values[i] = parseInt(bigint.charAt(i), base);
  }
  return values;
}*/

function formatBigInt(values, base) {
  //convert array of digit values to bigint string
  for (var bigint = '', i = 0; i < values.length; i++) {
    bigint += values[i].toString(base);
  }
  return bigint;
}

function convertBase(bigint, inputBase, outputBase) {
  //takes a bigint string and converts to different base
  var inputValues = parseBigInt(bigint, inputBase),
    outputValues = [], //output array, little-endian/lsd order
    remainder,
    len = inputValues.length,
    pos = 0,
    i;
  while (pos < len) { //while digits left in input array
    remainder = 0; //set remainder to 0
    for (i = pos; i < len; i++) {
      //long integer division of input values divided by output base
      //remainder is added to output array
      remainder = inputValues[i] + remainder * inputBase;
      inputValues[i] = Math.floor(remainder / outputBase);
      remainder -= inputValues[i] * outputBase;
      if (inputValues[i] == 0 && i == pos) {
        pos++;
      }
    }
    outputValues.push(remainder);
  }
  outputValues.reverse(); //transform to big-endian/msd order
  return formatBigInt(outputValues, outputBase);
}
function parseBigInt(str, base=10) {
  base = BigInt(base)
  var bigint = BigInt(0)
  for (var i = 0; i < str.length; i++) {
    var code = str[str.length-1-i].charCodeAt(0) - 48; if(code >= 10) code -= 39
    bigint += base**BigInt(i) * BigInt(code)
  }
  return bigint
}

function removeTrailingZeroes(str){
  var zerocount = 0;
  for(var c = str.length-1; c > 0; c --){
    if(str[c] == 0 )zerocount ++;
    if(str[c] != 0)break;
  }
  return str.substr(0, str.length-zerocount )
}

function findDifferences(stra, strb){
  var difs = []
  for(var i = 0; i < stra.length; i ++){
    if(stra[i] !== strb[i]){
      pxi = 4*(floor(i/3)) + (i % 3) + 12
      var col = 'r'
      if( pxi %4 == 1)col = 'g'
      if( pxi  %4 == 2)col = 'b'
      if( pxi % 4 == 3)col = "ALPHA (oops)"
      difs.push(
        {
          'i': i+12,
          'x': indexToXY( pxi , chosen_image_graphic.width).x,
          'y': indexToXY( pxi , chosen_image_graphic.width).y,
          'col': col,
          'val_a': stra[i],
          'val_b': strb[i]
        }
      )
    }
  }
  return difs;
}
