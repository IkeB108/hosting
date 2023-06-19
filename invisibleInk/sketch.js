function preload(){
  img_logo = loadImage('logo-new.png')
}
function windowResized(){

  canvasPosition(link_what_is_this, myCanvas, width/2-37, height-50);
  canvasPosition(link_ikebot, myCanvas, width/2-40, height-30);
  canvasPosition(imageInput, myCanvas, width/2-70, 430)
  canvasPosition(fileInput, myCanvas, width/2-70, 430)
  canvasPosition(radixInput, myCanvas, width/2-30, 430)
}
window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function getBrowser(){
  // Opera 8.0+
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
  if(isOpera)return "Opera";
  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';
  if(isFirefox)return "Firefox";
  // Safari 3.0+ "[object HTMLElementConstructor]"
  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
  if(isSafari)return "Safari";
  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/false || !!document.documentMode;
  if(isIE)return "IE";
  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;
  if(isEdge)return "Edge";
  // Chrome 1 - 79
  var isChrome = !!window.chrome;
  if(isChrome)return "Chrome";
  // Edge (based on chromium) detection
  var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
  if(isEdgeChromium)return "EdgeChromium";
  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;
  if(isBlink)return "Blink";
  return "Unknown browser"
}
function setup() {
  compatible = true
  //if(mobileCheck()){compatible=false;alert("This program currently does not function on mobile devices.");}
  var browser = getBrowser();
  if(browser == "Safari"){compatible=false;alert("This program is currently not supported in Safari.")}

  myCanvas = createCanvas(600,600)
  //noSmooth();
  //document.addEventListener('mousedown', function(e){ e.preventDefault(); }, false);
  myReader = new FileReader();
  myReader.onload = ()=>{
    //my64 = (file.data.substr(file.data.indexOf(',') + 1) )
    my64 = (myReader.result.substr(myReader.result.indexOf(',') + 1) )
    //my64 = file.data
    myHex = base64ToHex(my64);
    console.log("Successfuly converted to base 64 " + my64.substr(0,10))
  }
  myReader.onerror = () => {console.log('Error: ' + error)}

  link_what_is_this = createA('misc/about.html', 'What is this?', '_blank');
  link_ikebot = createA('http://ikeb108.github.io/goTo/?home', 'Made by Ikebot', '_blank');
  link_what_is_this.elt.style="font-family: Arial"
  link_ikebot.elt.style="font-family: Arial"
  //link_ikebot.position(100,100)

  canvasPosition(link_ikebot, myCanvas, width/2, height-30);
  canvasPosition(link_what_is_this, myCanvas, width/2-37, height-50);

  imageInput = createFileInput(handleImageFile);
  canvasPosition(imageInput, myCanvas, width/2-70, 430)
  imageInput.hide()

  fileInput = createFileInput(handleFile);
  canvasPosition(fileInput, myCanvas, width/2-70, 430)
  fileInput.hide()

  radixInput = createInput('3');
  radixInput.elt.placeholder = "Ex. 5, 10"
  canvasPosition(radixInput, myCanvas, width/2-30, 430)
  radixInput.size(60)
  radixInput.hide()

  imageMode(CENTER)
  textAlign(CENTER,CENTER)
  current_screen = 'front' //front, create1, create2, create3, scan1, scan2

  buttons = {
    'create_image': {'w':200,'h':50,'x':width/2 - 100,'y':400,'text':'+ Create image'},
    'scan_image': {'w':200,'h':50,'x':width/2 - 100,'y':470,'text':'🔍 Scan image'},
    'back':{'x':(width/2)-200,'y':480,'w':130,'h':50,'text':'< Back'},
    'next':{'x':(width/2)+70,'y':480,'w':130,'h':50,'text':'Next >'},
    'convert':{'x':(width/2)-65,'y':480,'w':130,'h':50,'text':'✏️ Encode'},
    'scan':{'x':(width/2)-65,'y':480,'w':130,'h':50,'text':'🔍 Scan'},
    'download':{'w':200,'h':50,'x':width/2 - 100,'y':320,'text':'⇓ Download'},
  }

  image_chosen = false;
  file_chosen = false;
  loading_screen = false;
  loading_countdown = -1; //frames remaining until loading screen should disappear. -1 = not loading
  new_chosen_image = null;
  image_converted = false;
  min_chunk_size = 5; //what is the smallest size a chunk's width and height can be in px? If chunks are smaller, image will be scaled up.
  image_decoded = false;
  operationCount = 0;
  converting_to_file = false;
  valid_file_selected = false;


  image_ready = false;
  just_downloaded_hex = false;
}

function draw() {
  background(255)
  if(current_screen == 'front')draw_front();
  if(current_screen == 'create1')draw_create1();
  if(current_screen == 'create2')draw_create2();
  if(current_screen == 'create3')draw_create3();
  if(current_screen == 'scan1')draw_scan1();
  if(loading_screen){
    background(255); noStroke(); fill(0);
    text('Loading...', width/2, height/2)
  }
  // drawOutline();
  countdownLoad();
  just_downloaded_hex = false;
}

function draw_front(){
  image(img_logo, width/2, 190, 1300 * 0.35, 1144 * 0.35)
  if(compatible){
    displayButton(buttons.create_image)
    displayButton(buttons.scan_image)
  }
}

function clickUpdate_front(){
  if(mouseOverRect(buttons.create_image)&&compatible){current_screen = 'create1';imageInput.show()}
  if(mouseOverRect(buttons.scan_image)&&compatible){
    current_screen = 'scan1'
    imageInput.show();
  }
}

function draw_create1(){
  //if(!image_chosen)image(img_logo, width/2, 190, 1300 * 0.35, 1144 * 0.35);
  if(image_chosen){
    //if(chosen_image.width > chosen_image.height)image(chosen_image, width/2, 190, 370, chosen_image.height * (370/chosen_image.width) )
    //if(chosen_image.height > chosen_image.width)image(chosen_image, width/2, 190, chosen_image.width * (370/chosen_image.height), 370 )
    displayImageInCenter(chosen_image)
    //noFill(); stroke(0);
    //rect((width/2)-(370/2),10,370,370)
  }

  noStroke();fill(0);text('STEP 1: Upload an image', width/2, 400)
  displayButton(buttons.back)
  displayButton(buttons.next, !image_chosen)
}
function draw_create2(){
  noStroke();fill(0);textSize(80)
  text('🗎', width/2, height/2)
  textSize(24)
  text('STEP 2: Choose a file', width/2, 400)
  displayButton(buttons.back)
  displayButton(buttons.next, !file_chosen)
}
function draw_create3(){

  fill(0); noStroke();
  if(new_chosen_image){
    displayImageInCenter(new_chosen_image)

  }
  //if(image_converted)mouseHelpText();

  textSize(24)

  stroke(255); strokeWeight(10);

  if(image_converted){
    text('STEP 4: Press "Download" to save your image.', width/2, 400);
    if(mouseOverRect(buttons.download))fill(180);
    text("⇓ Download", width/2, 360);

  }
  if(!image_converted)text('STEP 3: Set a pixel color variance level (3-36)', width/2, 400);
  displayButton(buttons.convert)
  displayButton(buttons.back)



}
function draw_scan1(){
  if(!image_chosen){noStroke();fill(0);text('STEP 1: Upload an image', width/2, 400)}
  if(image_chosen){noStroke();fill(0);text('STEP 2: Click "Scan"', width/2, 400)}
  displayButton(buttons.back);
  displayButton(buttons.scan, !image_ready);
  if(image_decoded){
    displayImageInCenter(chosen_image_graphic)
  } else if(image_chosen){
    displayImageInCenter(chosen_image)
  }
  if(loading_countdown == 15 && converting_to_file)imageToFile();
}
function clickUpdate_scan1(){
  if(mouseOverRect(buttons.back)){
    current_screen = 'front'
    imageInput.hide();
    image_chosen = false;
    image_decoded = false;
    image_ready = false;
    imageInput.elt.value = null;
  }
  if(mouseOverRect(buttons.scan) && image_chosen && image_ready && !just_downloaded_hex){
    console.log("converting...")
    loading_countdown = 30;
    loading_screen = true;
    converting_to_file = true;

    //imageToFile();
  }
}
function clickUpdate_create1(){
  if(mouseOverRect(buttons.back)){
    current_screen = 'front';
    imageInput.hide();
    imageInput.elt.value = null;
    image_chosen = false;
    image_decoded = false;
    image_ready = false;
  }
  if(mouseOverRect(buttons.next, !image_chosen)){current_screen = 'create2';imageInput.hide();fileInput.show()}
}
function clickUpdate_create2(){
  if(mouseOverRect(buttons.back)){current_screen = 'create1';imageInput.show();fileInput.hide();fileInput.elt.value = null}
  if(mouseOverRect(buttons.next, !file_chosen)){
    current_screen = 'create3';
    fileInput.hide();
    radixInput.show();
  }
}
function clickUpdate_create3(){
  if(mouseOverRect(buttons.convert)){
    //if user pressed convert button, start converting the image
    var ri = Number(radixInput.value())
    if( Number.isInteger(ri) && ri >= 3 && ri <= 36 ){
      loading_screen = true;
      loading_countdown = 30;
      new_chosen_image = createGraphics(chosen_image.width, chosen_image.height)
      new_chosen_image.image(chosen_image, 0, 0)
      fileToImage();
    } else {
      alert("You must enter a whole number between 3 and 36.")
    }

  }
  if(mouseOverRect(buttons.back)){
    current_screen = 'create2';
    fileInput.show();
    radixInput.hide();
  }
  if(mouseOverRect(buttons.download) && image_converted){
    new_chosen_image.save("myEncodedImage.png");
  }
}

function displayImageInCenter(imageObj){
  if(imageObj.width >= imageObj.height)image(imageObj, width/2, 190, 370, imageObj.height * (370/imageObj.width) )
  if(imageObj.height > imageObj.width)image(imageObj, width/2, 190, imageObj.width * (370/imageObj.height), 370 )
}
function mouseHelpText(){
  textSize(13);
  var imageMouse = mouseToImageCoords(new_chosen_image_overlay)

  var helpText = 'x ' + round(imageMouse.x) + ', ' + 'y ' + + round(imageMouse.y)
  var pxi = xyToIndex(imageMouse.x, imageMouse.y, new_chosen_image_overlay.width)
  var trueCol = {
    'r': new_chosen_image_overlay.pixels[pxi],
    'g': new_chosen_image_overlay.pixels[pxi + 1],
    'b': new_chosen_image_overlay.pixels[pxi + 2],
  }
  helpText += '\nTrue col: ' + '(' + trueCol.r + ', ' + trueCol.g + ', ' + trueCol.b + ')'
  var imc = pxCoordToChunkCoord(imageMouse.x, imageMouse.y)
  if(imc.i >= 0 && imc.i < allChunks.length-1){
    helpText += '\nchunkx ' + imc.x + ', chunky ' + imc.y + ', chunki ' + imc.i
    helpText += '\nchunk color vals (dec): (' + allChunks[imc.i].dec_r + ', ' + allChunks[imc.i].dec_g + ', ' + allChunks[imc.i].dec_b + ')'
    helpText += '\nchunk color vals (usr): (' + allChunks[imc.i].usr_r + ', ' + allChunks[imc.i].usr_g + ', ' + allChunks[imc.i].usr_b + ')'

  }
  text(helpText, width/2, 60)
}
function mouseToImageCoords(imageObj){
  /*
  Returns the x and y coordinates of the mouse on the image,
  instead of on the canvas (when an image is displayed with
displayImageInCenter)
  */
  if(imageObj.width >= imageObj.height){
    var cx = width/2;
    var cy = 190;
    var w = 370;
    var h = imageObj.height * (370/imageObj.width)
  }
  if(imageObj.height > imageObj.width){
    var cx = width/2;
    var cy = 190;
    var w = imageObj.width * (370/imageObj.height)
    var h = 370;
  }
  var cornerx = cx - (w/2);
  var cornery = cy - (h/2);
  return {
    'x': (mouseX - cornerx)/w * imageObj.width,
    'y': (mouseY - cornery)/h * imageObj.height
  }
}

function centerOfRect(rectobj){
  return createVector(rectobj.x+(rectobj.w/2), rectobj.y+(rectobj.h/2))
}

function mouseOverRect(rectobj, disabled){
  if(disabled)return false;
  return collidePointRect(mouseX, mouseY, rectobj.x,rectobj.y,rectobj.w,rectobj.h)
}

function displayButton(buttonobj, disabled){
  if(mouseOverRect(buttonobj))fill(150,150,255);
  else fill(100,100,230)
    if(disabled)fill(160)
  noStroke();
  rect(buttonobj.x, buttonobj.y, buttonobj.w, buttonobj.h, 10)
  fill(255); textSize(24)
  text(buttonobj.text, centerOfRect(buttonobj).x, centerOfRect(buttonobj).y)
}
function keyTyped(){
  if(key == 'j')console.log(pixelCandidateScoreAtMouse())
}
function mouseClicked(){
  if(!loading_screen){
    if(current_screen=='front')clickUpdate_front()
    else if(current_screen=='create1')clickUpdate_create1()
    else if(current_screen=='create2')clickUpdate_create2()
    else if(current_screen=='create3')clickUpdate_create3()
    else if(current_screen=='scan1')clickUpdate_scan1()
  }
}
function drawOutline(){
  noFill();
  stroke(0);
  rect(1,1,width-2,height-2)
}
function countdownLoad(){
  if(loading_countdown > -1)loading_countdown --;
  if(loading_countdown == 0){
    loading_screen = false;
    if(current_screen == 'create1' || current_screen == 'scan1'){
      image_chosen = true;
    }
    if(current_screen == 'create2' && valid_file_selected){
      file_chosen = true;
    }
  }
}
document.addEventListener('mousedown', function (event) {
  if (event.detail > 1) {
    event.preventDefault();
    // of course, you still do not know what you prevent here...
    // You could also check event.ctrlKey/event.shiftKey/event.altKey
    // to not prevent something useful.
  }
}, false);
function randomChars(len){
  var ret = ''
  var alph = "abcdefghijklmnopqrstuvwxyz0123456789"
  for(var i = 0; i < len; i ++){
    ret += alph[ floor(random(alph.length-1)) ]
  }
  var writer = createWriter('randomChars.txt')
  writer.print(ret)
  writer.close();
  //return ret;
}
