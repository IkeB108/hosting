function setupButtons(){
  //CREATE CONSTANTS FOR BUTTONS
  buttonTextSize = (width/15);
  font_vertical_offset = buttonTextSize *(1/6) ;
  width_of_most_buttons = width * (1/3) ;
  height_of_most_buttons = width_of_most_buttons * (1/3)
  
  //CREATE THE BUTTONS THEMSELVES
  buttons = {}
  buttons.back_arrow = {
    x: pxSpacing, y: pxSpacing,
    w: logo_height,//use height of logo image for height of this button
    icon: "chevron-left",
    onclick: ()=>{
      imageInput.elt.value = null;
      image_file_selected = false;
      if(typeof chosen_image_graphic !== 'undefined')chosen_image_graphic.background(255,0,0) //make the entire image red so we can tell if something went wrong; we shouldn't see red
      fileInput.elt.value = null;
      file_selected = false;
      current_screen = "front"
      decoding_with_animation = false;
      decoding_complete = false;
      if(typeof decoded_audio_element !== "undefined"){
        decoded_audio_element.pause();
        decoded_audio_element.currentTime = 0;
      }
    }
  }
  buttons.next = {
    x: width - pxSpacing - width_of_most_buttons,
    y: height - (pxSpacing*3) - height_of_most_buttons,
    w: width_of_most_buttons,
    h: height_of_most_buttons,
    text: "Next",
    icon: "chevron-right",
    icon_side: "right", //on which side of the text should the icon display?
    color: ui_colors.red,
    onclick: ()=>{
      if(current_screen=="create2")current_screen="create3"
      if(current_screen=="create1"){
        current_screen="create2"
      }
    }
  }
  buttons.ikebotLink = {
    x: (width/2) - (width_of_most_buttons),
    y: height/3 + (height_of_most_buttons*2) + (pxSpacing*4),
    w: width_of_most_buttons*2,
    h: height_of_most_buttons,
    text: "By Ike Bischof",
    icon: "link",
    icon_side: "right",
    color: ui_colors.white,
    onclick: ()=>{
      if(current_screen=="front")window.open("https://ikebot.dev/", "_blank")
    }
  }
  buttons.back = {
    x: pxSpacing,
    y: height - (pxSpacing*3) - height_of_most_buttons,
    w: width_of_most_buttons,
    h: height_of_most_buttons,
    text: "Back",
    icon: "chevron-left",
    icon_side: "left", //on which side of the text should the icon display?
    color: ui_colors.red,
    onclick: ()=>{
      if(current_screen == "create2"){
        fileInput.elt.value = null;
        file_selected = false;
        current_screen = "create1"
      }
    }
  }
  
  buttons.saveImage = {
    x: (width/2)- (width * (1/3)) ,
    y: height - (pxSpacing*4) - (height_of_most_buttons*2),
    w: width *(2/3) ,
    h: height_of_most_buttons,
    text: "Save",
    icon: "download",
    icon_side: "right", //on which side of the text should the icon display?
    color: ui_colors.blue,
    onclick: ()=>{
      // if(current_screen=="create4"){
      //   const monthNames = ["January", "February", "March", "April", "May", "June",
      //   "July", "August", "September", "October", "November", "December"];
      //   var d = new Date();
      // 
      //   var file_name = "myEncodedImage_"+ monthNames[d.getMonth()] + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + ".png"
      // 
      //   chosen_image_graphic.save(file_name);
      // }
      if(current_screen=="create4"){
        // var newDoc = "<html><meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1\"><body><p>Long-tap or right-click the image to save it.\n</p><a href=\"#\" onclick=\"location.reload()\">Back</a> <p>\n</p> </body></html>"
        if(choseSpecialImage){
          var newDoc = "<html><meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1\"><body> <p>Long-tap or right-click the image to save it.\n</p><a href=\"#\" onclick=\"window.open('https://bit.do/dataincolors', '_self')\">Back</a> <p>\n</p> </body></html>"
        } else {
          var newDoc = "<html><meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1\"><body> <p>Long-tap or right-click the image to save it.\n</p><a href=\"#\" onclick=\"location.reload()\">Back</a> <p>\n</p> </body></html>"
        }
        rewriteHTMLDoc(newDoc)
        var new_margin = 8;
        document.body.setAttribute("style", "margin: " + new_margin + "px;")
        var graphics_data = cig.canvas.toDataURL();
        var img_element = document.createElement("img")
        img_element.src = graphics_data;
        img_element.setAttribute('style', "-webkit-user-select: none")
        if(cig.width >= cig.height){
          img_element.setAttribute('width', "100%")
        } else {
          img_element.setAttribute('height', "80%")
        }
        document.body.appendChild(img_element)
      }
    }
  }
  buttons.downloadDecodedFile = {
    x: (width/2)- (width * (1/3)) ,
    y: height - (pxSpacing*4) - (height_of_most_buttons*2),
    w: width *(2/3) ,
    h: height_of_most_buttons,
    text: "Save",
    icon: "download",
    icon_side: "right", //on which side of the text should the icon display?
    color: ui_colors.blue,
    onclick: ()=>{
      if(current_screen=="decode1" && !decoding_with_animation && decoding_complete ){
        if(getMimeType(decoded_file_extension)=="Image"){
          
          // var newDoc = "<html><meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1\"><body><p>Long-tap or right-click the image to save it.\n</p><a href=\"#\" onclick=\"location.reload()\">Back</a> <p>\n</p> </body></html>"
          // rewriteHTMLDoc(newDoc)
          // var new_width;
          // var new_height;
          // var new_margin = 8;
          // document.body.setAttribute("style", "margin: " + new_margin + "px;")
          // if(decoded_image.width >= decoded_image.height){
          //   new_width = windowWidth - (new_margin*2);
          //   new_height = round(new_width * (decoded_image.height/decoded_image.width))
          // } else {
          //   new_height = windowHeight - (new_margin*2)-100;
          //   new_width = round(new_height * (decoded_image.width/decoded_image.height))
          // }
          // decoded_image.canvas.setAttribute('style', 'width: '+new_width+'px; height:'+new_height+'px;'); //overwrite p5's default "display: none" style
          // document.body.appendChild(decoded_image.canvas)
          if(choseSpecialImage){
            var newDoc = "<html><meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1\"><body> <p>Long-tap or right-click the image to save it.\n</p><a href=\"#\" onclick=\"window.open('https://bit.do/dataincolors', '_self')\">Back</a> <p>\n</p> </body></html>"
          } else {
            var newDoc = "<html><meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width, initial-scale=1\"><body> <p>Long-tap or right-click the image to save it.\n</p><a href=\"#\" onclick=\"location.reload()\">Back</a> <p>\n</p> </body></html>"
          }
          
          rewriteHTMLDoc(newDoc)
          var new_margin = 8;
          document.body.setAttribute("style", "margin: " + new_margin + "px;")
          var graphics_data = decoded_image.canvas.toDataURL();
          var img_element = document.createElement("img")
          img_element.src = graphics_data;
          img_element.setAttribute('style', "-webkit-user-select: none")
          if(decoded_image.width >= decoded_image.height){
            img_element.setAttribute('width', "100%")
          } else {
            img_element.setAttribute('height', "80%")
          }
          document.body.appendChild(img_element)
          
        } else {
          const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
          var d = new Date();
          
          var file_name = "myDecodedFile_"+ monthNames[d.getMonth()] + "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "." + decoded_file_extension
          hexToFile(decoded_file_hex, file_name)
        }
      }
    }
  }
  buttons.openDecodedFile = {
    x: (width/2)- (width * (1/3)) ,
    y: height - (pxSpacing*5) - (height_of_most_buttons*3),
    w: width *(2/3) ,
    h: height_of_most_buttons,
    text: "Open",
    icon: "link",
    icon_side: "right", //on which side of the text should the icon display?
    color: ui_colors.blue,
    onclick: ()=>{
      if(current_screen=="decode1" && !decoding_with_animation && decoding_complete ){
        if(decoded_file_extension == "html"){
          var newDoc = hexToBase64(decoded_file_hex)
          newDoc = atob(newDoc)
          rewriteHTMLDoc(newDoc)
        }
      }
    }
  }
  buttons.pauseDecodedAudio = {
    x: (width/2)- (width * (1/3)) ,
    y: height - (pxSpacing*5) - (height_of_most_buttons*3),
    w: width *(2/3) ,
    h: height_of_most_buttons,
    text: "Stop audio",
    color: ui_colors.blue,
    onclick: ()=>{
      if(current_screen=="decode1" && !decoding_with_animation && decoding_complete ){
        if(getMimeType(decoded_file_extension) == "Audio" && !decoded_audio_element.paused && !toggled_audio){
          decoded_audio_element.pause();
          decoded_audio_element.currentTime = 0;
          toggled_audio = true;
        }
      }
    }
  }
  buttons.playDecodedAudio = {
    x: (width/2)- (width * (1/3)) ,
    y: height - (pxSpacing*5) - (height_of_most_buttons*3),
    w: width *(2/3) ,
    h: height_of_most_buttons,
    text: "Play audio",
    color: ui_colors.blue,
    onclick: ()=>{
      if(current_screen=="decode1" && !decoding_with_animation && decoding_complete ){
        if(getMimeType(decoded_file_extension) == "Audio" && decoded_audio_element.paused && !toggled_audio){
          decoded_audio_element.play();
          toggled_audio = true;
        }
      }
    }
  }
  buttons.howDoesItWork = {
    x: (width/2)- (width * (1/3)) ,
    y: height - (pxSpacing*3) - height_of_most_buttons,
    w: width *(2/3) ,
    h: height_of_most_buttons,
    text: "How does it work?",
    icon: "link",
    icon_side: "right", //on which side of the text should the icon display?
    color: ui_colors.white,
    onclick: ()=>{
      if(current_screen=="create4"|| (current_screen=="decode1" && !decoding_with_animation && decoding_complete) ){
        window.open("https://youtu.be/bSvOVSmctTw", "_blank")
      }
    }
  }
  buttons.encode = {
    x: (width/2)-(width_of_most_buttons/2),
    y: height - (pxSpacing*3) - height_of_most_buttons,
    w: width_of_most_buttons,
    h: height_of_most_buttons,
    text: "Encode",
    icon: "encode",
    icon_side: "left", //on which side of the text should the icon display?
    color: ui_colors.red,
    onclick: ()=>{
      if(current_screen=="create3"){
        loading_screen = true;
        // current_screen = "create4"
        setTimeout( recolorImage, 500)
      }
    }
  }
  buttons.imageInput = {
    x: (width/2)-(width/4),
    y: (height/2),
    w: (width/2),
    h: height_of_most_buttons,
    text: "Choose an image",
    color: ui_colors.blue,
    onclick: ()=>{
      if( (current_screen=="create1"||current_screen=="decode1") &&!image_file_selected){
        imageInput.elt.click();
      }
    }
  }
  buttons.fileInput = {
    x: (width/2)-(width/4),
    y: (height/2),
    w: (width/2),
    h: height_of_most_buttons,
    text: "Choose a file",
    color: ui_colors.blue,
    onclick: ()=>{
      if(current_screen=="create2"){
        fileInput.elt.click();
      }
    }
  }
  buttons.createImageScreen = {
    x: (width/2) - (width_of_most_buttons),
    y: height/3,
    w: width_of_most_buttons*2,
    h: height_of_most_buttons,
    text: "Create Image",
    icon: "chevron-right",
    icon_side: "right",
    color: ui_colors.red,
    onclick: ()=>{
      if(current_screen=="front")current_screen = "create1"
    }
  }
  buttons.decodeImageScreen = {
    x: (width/2) - (width_of_most_buttons),
    y: height/3 + height_of_most_buttons + (pxSpacing*2),
    w: width_of_most_buttons*2,
    h: height_of_most_buttons,
    text: "Decode Image",
    icon: "chevron-right",
    icon_side: "right",
    color: ui_colors.red,
    onclick: ()=>{
      if(current_screen=="front")current_screen = "decode1"
    }
  }
  buttons.decode = {
    x: (width/2)-(width_of_most_buttons/2),
    y: height - (pxSpacing*3) - height_of_most_buttons,
    w: width_of_most_buttons,
    h: height_of_most_buttons,
    text: "Decode",
    icon: "decode",
    icon_side: "left", //on which side of the text should the icon display?
    color: ui_colors.red,
    onclick: ()=>{
      if(current_screen=="decode1"&& !decoding_with_animation && !decoding_complete){
        loading_screen = true;
        // setTimeout( decodeImage, 500 )
        setTimeout( setupAnimatedDecoding, 500 )
      }
    }
  }
  
  //CREATE FUNCTIONS RELATED TO BUTTONS
  collidePointRect = (pointX, pointY, x, y, xW, yW) => {
    //2d
    if (pointX >= x &&         // right of the left edge AND
        pointX <= x + xW &&    // left of the right edge AND
        pointY >= y &&         // below the top AND
        pointY <= y + yW) {    // above the bottom
            return true;
    }
    return false;
  }
  mouseOverButton = (button) => {
    if(!button.h)button.h = button.w;
    var ret = collidePointRect(mouseX, mouseY, button.x, button.y, button.w, button.h)
    //if(ret && !mouse_is_pointer && !button.disabled){cursor('pointer');mouse_is_pointer = true}
    return ret;
  }
  mouseOverButtonAtPress = (button) => {
    if(!button.h)button.h = button.w;
    return collidePointRect(mouse_x_at_press, mouse_y_at_press, button.x, button.y, button.w, button.h)
  }
  buttonStyleSettings = () => {
    noStroke();
    textSize(buttonTextSize);
  }
  drawButton = (button) => {
    var highlightButton = mouseOverButton(button) && !button.disabled && !dragging_over_canvas && !loading_screen
    noStroke();
    if(button.w && !button.h)button.h = button.w;
    if(button.icon && !button.text){
      if(button.color)tint(button.color);
      else tint(0);
      image( images[button.icon],button.x, button.y, button.w, button.h )
      fill(255,210);
      if(highlightButton)rect( button.x, button.y, button.w, button.h )
      noTint();
    }
    if(button.text){
      fill(button.color)
      if(button.text == "Decode"){
        //Make this button flash so first-time users know to press it
        var maxFillColor = []
        var increaseBy = map(sin( (frameCount*4) ), -1, 1, 0, 120)
        maxFillColor[0] = red(buttons.decode.color) + increaseBy;
        maxFillColor[1] = green(buttons.decode.color) + increaseBy;
        maxFillColor[2] = blue(buttons.decode.color) + increaseBy;
        fill(maxFillColor[0], maxFillColor[1], maxFillColor[2])
      }
      if(button.color._array.join('') == '1111'){
        //If this button's color is white, give it a border.
        stroke(100);
        rect(button.x, button.y, button.w, button.h)
        noStroke();
      }
      if(button.disabled)fill(175)
      rect(button.x, button.y, button.w, button.h)
      
      if(button.icon){
        var ix;
        var iw = buttonTextSize;
        var iy = button.y + (button.h/2) -(iw/2) - 1 ; //subtracting one at the end makes it look more centered with the text
        if(button.icon_side == 'left')ix = button.x + pxSpacing;
        if(button.icon_side == 'right')ix = button.x + button.w - iw - pxSpacing;
        if(!button.icon_side)console.log("Choose an icon side for this button " + button.text)
        if(button.color._array.join('') == '1111')tint(100);
        image( images[button.icon], ix, iy, iw, iw );
        noTint();
      }
      fill(255);
      if(button.color._array.join('') == '1111'){
        //If this button's color is white, give it non-white text.
        fill(100);
      }
      if(button.icon_side == 'right'){
        textAlign(LEFT,CENTER)
        text(button.text,button.x + pxSpacing, button.y + (button.h/2) - font_vertical_offset)
      } else if (button.icon_side == 'left') {
        textAlign(RIGHT,CENTER)
        text(button.text, button.x + button.w - pxSpacing, button.y + (button.h/2)  - font_vertical_offset)
      } else {
        textAlign(CENTER,CENTER)
        text(button.text,button.x + (button.w/2), button.y + (button.h/2) - font_vertical_offset)
      }
      if(highlightButton){
        fill(255,170)
        rect(button.x, button.y, button.w, button.h)
      }
    }
  }
  updateButtonsOnClick = () => {
    for(var buttonkey in buttons){
      var button = buttons[buttonkey]
      if(mouseOverButton( button ) && mouseOverButtonAtPress(button) && !button.disabled){
        button.onclick();
      }
    }
  }
}
