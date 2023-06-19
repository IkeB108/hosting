function setup(){
  icursor = new ImprovedCursor({
    threeFingerConsole: true,
  })
  
  myLoader = new FileLoader({
    comicImage: "comic2.png"
  })
  
  textAlign(CENTER,CENTER)
  
  currentPanel = 0;

  //357 x 500
  imagesw = 500
  imagesh = 700

  //when image is 533 x 774...
  buttonPos = {
    x: 277,
    y: 669,
    w: 516-289,
    h: 750-669,
  }
  
  imagePos = {}
}

function onLoadComplete(){
  
}

function draw(){
  //Remember to use if(myLoader.complete)
  
  icursor.update();
  if(myLoader.complete){
    let sx = imagesw * (currentPanel*2) + 5
    
    let dw = null;
    let dh = null;
    if( (imagesh/imagesw) >= width/height){
      dw = width;
      dh = imagesh * (dw/imagesw)
    } else {
      dh = height;
      dw = imagesw * (dh/imagesh)
    }
    
    let dx = (width/2) - (dw/2)
    let dy = (height/2) - (dh/2)
    
    if(frameCount % 60 < 30){
      sx += imagesw;
    }
    image(comicImage, dx, dy, dw, dh, sx, 0, imagesw - 5, imagesh)
    
    imagePos = {dx, dy, dw, dh}
    
    // let widthMultiply = (imagePos.dw/533)
    // let heightMultiply = (imagePos.dh/774)
    // let newButtonPos = {
    //   x: imagePos.dx + (buttonPos.x * widthMultiply),
    //   y: imagePos.dy + (buttonPos.y * heightMultiply),
    //   w: buttonPos.w * widthMultiply,
    //   h: buttonPos.h * heightMultiply,
    // }
    // fill(0,0,255,100);
    // rect(newButtonPos.x,newButtonPos.y,newButtonPos.w,newButtonPos.h)
  }
  else {
    background(255);
    fill(0); textSize(width/20)
    text("Loading...", width/2, height/2)
  }
}

function cursorClick(){
  
  let widthMultiply = (imagePos.dw/533)
  let heightMultiply = (imagePos.dh/774)
  let newButtonPos = {
    x: imagePos.dx + (buttonPos.x * widthMultiply),
    y: imagePos.dy + (buttonPos.y * heightMultiply),
    w: buttonPos.w * widthMultiply,
    h: buttonPos.h * heightMultiply,
  }
  
  let pressedButton = collidePointRect(icursor.x, icursor.y, newButtonPos.x, newButtonPos.y, newButtonPos.w, newButtonPos.h);
  
//   if(currentPanel == 0 && pressedButton){
    
//     window.location = "https://ikeb108.github.io/Data-In-Colors-SOR-2/"
    
//   }
  if(currentPanel == 8 && pressedButton){
    
    window.location = "https://ikeb108.github.io/goTo/?dataInColorsSOR2"
    
  }
  
  
  if(currentPanel < 8 && frameCount > 100){
    currentPanel ++;
  }
  
}
