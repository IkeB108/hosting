function setup(){
  icursor = new MobileFriendlyCursor({
    threeFingerConsole: true,
    minAspectRatio: 2/3,
    maxAspectRatio: 2/3,
  })
  
  myLoader = new FileLoader({
    spritesheetImage: "spritesheet.png",
    spritesheetJSONImport: "spritesheet.json",
    arrow0: "arrow0.png",
    arrow1: "arrow1.png",
    restart0: "restart0.png",
    restart1: "restart1.png",
    clickArrow0: "clickArrow0.png",
    clickArrow1: "clickArrow1.png",
  })
  
  
  
  
  textAlign(CENTER);
  imageMode(CENTER)
  animationFrame = 0;
  
  pauseFrames = [
    0, 2, 17, 18, 19, 20, 21, 22
  ]
  alternatePauseFrame = false;
  
  idleFrames = 0;
  
  buttonPosition = function(buttonName){
    let d = 0.15
    let id = 1 - d
    if(buttonName == "back"){
      let visible = () => { return animationFrame !== 0 }
      return {x: width * d, y: height - (width * d), w: width * 0.15, visible }
    }
    if(buttonName == "next"){
      let visible = () => { return animationFrame !== 22 }
      return {x: width * id, y: height - (width * d), w: width * 0.15, visible }
    }
    if(buttonName == "restart"){
      let visible = () => { return animationFrame == 22 }
      return {x: width * id, y: height - (width * d), w: width * 0.15, visible}
    }
  }
}



function onLoadComplete(){
  spritesArray = []
  for(let i = 0; i < 23; i ++){
    let n = str(i).padStart(4, "0")
    if(spritesheetJSONImport.frames["frame_" + n + ".png"]){
      spritesArray.push( spritesheetJSONImport.frames["frame_" + n + ".png"])
    }
  }
}

function draw(){
  //Remember to use if(myLoader.complete)
  if(myLoader.complete){
    background(0,0,100)
    displaySprite(animationFrame, width/2, height/2, width, height)
    if(frameCount % 22 == 0 ){
      if(!pauseFrames.includes(animationFrame) ){
        animationFrame = (animationFrame + 1) % spritesArray.length
      }
    }
    
    let backr = buttonPosition("back")
    let nextr = buttonPosition("next")
    let restartr = buttonPosition("restart")
    let n = floor(frameCount/20) % 2
    if(backr.visible()){
      push();
      translate(backr.x, backr.y)
      scale(-1, 1)
      image(window["arrow" + n], 0, 0, backr.w, backr.w)
      pop();
    }
    if(nextr.visible()){
      image(window["arrow" + n], nextr.x, nextr.y, nextr.w, nextr.w)
    }
    if(restartr.visible()){
      image(window["restart" + n], restartr.x, restartr.y, restartr.w, restartr.w)
    }
    if(animationFrame == 0){
      n = floor(frameCount/20) % 2
      img = window["clickArrow" + n]
      let w = width/3
      let h = img.height * (w/img.width)
      let x = width/2
      let y = height * 0.9
      image(img, x, y, w, h)
    }
  } else {
    background(255)
    fill(0); textSize(width/20)
    text("Loading... " + myLoader.progress + "/" + myLoader.completion, width/2, height/2)
  }
  
  icursor.update();
  
  idleFrames ++
  let shouldRefresh = idleFrames == 70 * 60 * 60; //Refresh after 1 hour
  if(animationFrame !== 0)shouldRefresh = idleFrames == 70 * 25
  
  if(shouldRefresh)location.reload();
}

function displaySprite(no, x, y, w, h){
  let r = spritesArray[no].frame
  image(spritesheetImage, x, y, w, h, r.x, r.y, r.w, r.h,)
}

function cursorClick(b){
  
  if(b == "middle")location.reload();
  
  if(myLoader.complete){
    
    let buttonPressed = null;
    let backr = buttonPosition("back")
    let nextr = buttonPosition("next")
    let restartr = buttonPosition("restart")
    if(backr.visible() && collidePointRect(icursor.x, icursor.y, backr.x - (backr.w/2), backr.y - (backr.w/2), backr.w, backr.w))buttonPressed = "back"
    if(nextr.visible() && collidePointRect(icursor.x, icursor.y, nextr.x - (nextr.w/2), nextr.y - (nextr.w/2), nextr.w, nextr.w))buttonPressed = "next"
    if(restartr.visible() && collidePointRect(icursor.x, icursor.y, restartr.x - (restartr.w/2), restartr.y - (restartr.w/2), restartr.w, restartr.w))buttonPressed = "restart"
    
    // console.log(buttonPressed)
    
    if(true){
      if(buttonPressed !== null)idleFrames = 0;
      if(buttonPressed == "next"){
        
        if(!pauseFrames.includes(animationFrame)){
          //Go to the next available pause frame
          for(let i = animationFrame + 1; i < 23; i ++){
            if(pauseFrames.includes(i)){animationFrame = i;break}
          }
        } else {
          animationFrame = (animationFrame + 1) % spritesArray.length
        }
        
      }
      if(buttonPressed == "restart")animationFrame = 0;
      if(buttonPressed == "back"){
        for(let i = animationFrame - 1; i >= 0; i --){
          if(pauseFrames.includes(i)){animationFrame = i;break}
        }
      }
    }
  }
}

function windowResized(){
  if(typeof willRefresh == "undefined"){
    setTimeout( ()=> { location.reload(); }, 3000 )
    console.log("Will refresh...")
    willRefresh = true; 
  }
}
