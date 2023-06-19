//ike.js version 2.5

//COOKIES
function setCookie(cname, cvalue, daysTillExpiration = 398) {
  let d = new Date();
  let d2 = new Date( d.getTime() + daysTillExpiration*60*24*60000 )
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//JSON AND HJSON
function handleFile(file){
  /*
  When using a createFileInput button, set this function (handleFile) as the argument.
  This function will be triggered when a file is selected by the user.
  So far, this function processes json and hjson formats.
  IMPORTANT: replace 'x' below with the variable you want the json object to be.
  This code shamelessly stolen from stackoverflow*/
  if(file.name.endsWith('.json') || file.name.endsWith('.hjson')){ //if the file is either a .json or .hjson file
    // Split file.data and get the base64 string
    let base64Str = file.data.split(",")[1];
    // Parse the base64 string into a JSON string
    let jsonStr = atob(base64Str);
    // Parse the JSON object into a Javascript object
    if(file.name.endsWith('.json'))x = JSON.parse(jsonStr); //this line of code parses a normal json file
    if(file.name.endsWith('.hjson'))x = Hjson.parse(jsonStr); //this line, however, parses an hjson file
  }
}

//READING IMAGE DATA
function ImageToJson(p5image){
  /*given a p5 image or p5 graphics object, returns a json object
  where json.data = a string containing base64 encoded image data*/
  p5image.loadPixels();
  return {"data":p5image.canvas.toDataURL()}
}

function JsonToImage(jsonObject){
  /*
  given a json made with ImageToJson(),
  returns a p5 image of the json data.
  It will take about 2 frames before the image is fully loaded,
  so you can't draw the image right away.
  loadJSON() must be called in preload(), and JsonToImage() must be called after preload() (in setup() or draw())
  */
  return loadImage(jsonObject.data)
}

function indexToCoordinates(i, w){
  //For p5 pixels arrays:
  //Given the index of a pixel in the pixel array, return the xy coordinates of the pixel
  return {
    x: floor(i/4) % w,
    y: floor(floor(i/4) / w)
  }
}

function coordinatesToIndex(x, y, w){
  //For p5 pixels arrays:
  //Given the coordinates of a pixel, return the index of the pixel in the pixels array
  return (y * 4 * w) + (x * 4)
}

function boxifyImage(p5PixelsArray, widthInPixels){
  //Given a pixels array taken from a p5 image object,
  //groups the pixels into rectangles or "boxes" based on color and returns the boxes' coordinates and dimensions.
  // (Good for making collision boxes using an image editor like Paint or GIMP)
  // (NOTE: Skips white pixels)
  const px = p5PixelsArray
  let capturedPixels = []
  let newCollisionBoxes = []
  
  const pixelIsColor = (r, g, b, i, y) => {
    //If given an x and a y, convert to index
    let index = i;
    if(typeof y !== "undefined")index = coordinatesToIndex(i, y, widthInPixels)
    return (px[index] == r && px[index+1] == g && px[index+2] == b)
  }

  const pixelsInColumnMatch = (r, g, b, x, y1, y2) => {
    let newlyCapturedPixels = []
    for(let j = y1; j <= y2; j ++){
      if(!pixelIsColor(r,g,b,x, j) || capturedPixels.includes("x" + x + "y" + j))return false;
      else {
        newlyCapturedPixels.push("x" + x + "y" + j)
      }
    }

    //success
    for(let j in newlyCapturedPixels){
      capturedPixels.push( newlyCapturedPixels[j] )
    }
    return true;
  }

  for(let i = 0; i < px.length; i += 4){
    const r = px[i]; const g = px[i+1]; const b = px[i+2]
    const x = indexToCoordinates(i, widthInPixels).x
    const y = indexToCoordinates(i, widthInPixels).y
    const xy = "x" + x + "y" + y
    if(!pixelIsColor(255, 255, 255, i) && !capturedPixels.includes(xy)){ //If pixel is not white AND pixel has not already been captured by a previous collision box
      let newCollisionBox = {x, y, w:null, h:null}
      let marchX = x;
      let marchY = y;
      let boxW = 1; let boxH = 1;
      //First, increase height of this collision box as far as possible
      while( pixelIsColor(r, g, b, marchX, marchY + 1) && !capturedPixels.includes("x" + marchX + "y" + (marchY+1) ) ){
        boxH += 1;
        capturedPixels.push("x" + marchX + "y" + (marchY+1) )
        marchY += 1
      }
      
      //Then, increase the width of the collision box as far as possible
      while( pixelsInColumnMatch(r, g, b, marchX + 1, y, y + boxH - 1) ){
        boxW += 1;
        marchX += 1;
      }

      newCollisionBoxes.push({x, y, w: boxW, h: boxH, rgb:{r,g,b} })
    }
  }
  
  return newCollisionBoxes
}

//TRANSFORMING POINTS
function dilatePoint(thePoint, dilationFactor, centerOfDilation){ //thePoint = the point being dilated, dilationFactor = scale factor (e.g. 2 is twice as big, 0.5 is half as big), centerOfDilation = point around which the point is being dilated
  xOffset = (thePoint.x - centerOfDilation.x) * dilationFactor;
  yOffset = (thePoint.y - centerOfDilation.y) * dilationFactor;
  return createVector(centerOfDilation.x + xOffset, centerOfDilation.y + yOffset)
}
function centerOfShape(points){ //points = list of vertices of the shape
  xTotal = 0;
  yTotal = 0;
  for(var i = 0; i < points.length; i ++){
    xTotal += points[i].x
    yTotal += points[i].y
  }
  return createVector(xTotal/points.length, yTotal/points.length)
}
function rotatePoint(thePoint, rotateBy, CenterOfRotation){ //thePoint = coordinate being rotated, rotateBy = how much rotation clockwise in degrees, CenterOfRotation = point around which point is being rotated
  angleMode(DEGREES)
  xOffset = thePoint.x - CenterOfRotation.x
  yOffset = thePoint.y - CenterOfRotation.y
  angleOffset = atan(yOffset/xOffset)
  if(xOffset < 0){
    angleOffset+= 180
  }
  hypotenuse = dist(thePoint.x, thePoint.y, CenterOfRotation.x, CenterOfRotation.y)
  angleOffset += rotateBy;
  newYOffset = sin(angleOffset) * hypotenuse
  newXOffset = cos(angleOffset) * hypotenuse
  return createVector(CenterOfRotation.x + newXOffset, CenterOfRotation.y + newYOffset);
}
function shape(vertices){
  beginShape();
  for(let i in vertices){
    vertex(vertices[i].x,vertices[i].y)
  }
  endShape(CLOSE);
}
function angleOf(centerPoint, destinationPoint){
  angleMode(DEGREES)
  var ret = atan((destinationPoint.x-centerPoint.x)/(centerPoint.y-destinationPoint.y));
  if(destinationPoint.y>centerPoint.y)ret += 180;
  if(ret<0)ret+=360;
  return ret;
}

//BOX COLLISIONS
function collideRectRect(x, y, w, h, x2, y2, w2, h2, includeEdges) {
  //same function taken from p5 collide2d, but this version doesn't count edge-to-edge collision unless includeEdges = true
  if(includeEdges){
    return (x + w >= x2 &&    // r1 right edge past r2 left
    x <= x2 + w2 &&    // r1 left edge past r2 right
    y + h >= y2 &&    // r1 top edge past r2 bottom
    y <= y2 + h2)    // r1 bottom edge past r2 top
  } else {
    return (x + w > x2 &&    // r1 right edge past r2 left
    x < x2 + w2 &&    // r1 left edge past r2 right
    y + h > y2 &&    // r1 top edge past r2 bottom
    y < y2 + h2)    // r1 bottom edge past r2 top
  }
}

function collidePointRect(pointX, pointY, x, y, w, h) {
//Taken from p5 collide2d
if (pointX >= x &&         // right of the left edge AND
    pointX <= x + xW &&    // left of the right edge AND
    pointY >= y &&         // below the top AND
    pointY <= y + yW) {    // above the bottom
        return true;
}
return false;
}

function rectAfterCollisions(actorRect, collisionRects, xVelocity, yVelocity, allowedDirections = []){
  //Given the rectangle of a movable object (actorRect), and an array of all stationary rectangles (collisionRects),
  //And the movable object's x and y velocity, return where the movable object should be, so that it doesn't overlap with any collisionRects
  
  //actorRect = object: {x, y, w, h}
  //collisionRect = array: [ {x,y,w,h}, {x,y,w,h}, etc. ]
  //xVelocity & yVelocity = numbers
  //allowedDirections = array: ["left", "down"] (directions from which the actor is allowed to pass through the collisionRects, i.e. platforms in platformers)
  
  let collideRectRectNoEdges = function(x, y, w, h, x2, y2, w2, h2) {
    //same function taken from collide2d, but this version doesn't count edge-to-edge collision
    //2d
    //add in a thing to detect rectMode CENTER
    if (x + w > x2 &&    // r1 right edge past r2 left
        x < x2 + w2 &&    // r1 left edge past r2 right
        y + h > y2 &&    // r1 top edge past r2 bottom
        y < y2 + h2) {    // r1 bottom edge past r2 top
          return true;
    }
    return false;
  };
  
  //Store results
  let newActorRect = {x: actorRect.x, y: actorRect.y, w: actorRect.w, h: actorRect.h}
  
  //Test for collision if x coordinate is updated
  let newXCollides = false;
  let xCollisionDirection = "none";
  for(let i in collisionRects){
    let cr = collisionRects[i]
    if(collideRectRectNoEdges(actorRect.x + xVelocity, actorRect.y, actorRect.w, actorRect.h, cr.x, cr.y, cr.w, cr.h) ){
      
      //Use the direction of the collision to snap actor to edge of collisionRect
      
      //Direction: right
      if(xVelocity > 0 && !allowedDirections.includes("right")) {
        newXCollides = true;
        newActorRect.x = cr.x - actorRect.w; xCollisionDirection = "right"
      }
      //Direction: left
      if(xVelocity < 0 && !allowedDirections.includes("left")) {
        newXCollides = true;
        newActorRect.x = cr.x + cr.w; xCollisionDirection = "left"
      }
      
      break;
    }
  }
  //If no collision, keep the new x coordinate
  if(!newXCollides)newActorRect.x = actorRect.x + xVelocity
  
  //Test for collision if y coordinate is updated
  let newYCollides = false;
  let yCollisionDirection = "none";
  for(let i in collisionRects){
    let cr = collisionRects[i]
    if(collideRectRectNoEdges(newActorRect.x, actorRect.y + yVelocity, actorRect.w, actorRect.h, cr.x, cr.y, cr.w, cr.h) ){
      
      
      //Use the direction of the collision to snap actor to edge of collisionRect
      //Direction: down
      if(yVelocity > 0 && !allowedDirections.includes("down")) {
        newYCollides = true;
        newActorRect.y = cr.y - actorRect.h; yCollisionDirection = "down"
      }
      //Direction: up
      if(yVelocity < 0 && !allowedDirections.includes("up")) {
        newYCollides = true;
        newActorRect.y = cr.y + cr.h; yCollisionDirection = "up"
      }
      break;
    }
  }
  //If no collision, keep the new y coordinate
  if(!newYCollides)newActorRect.y = actorRect.y + yVelocity
  
  newActorRect.xCollisionDirection = xCollisionDirection;
  newActorRect.yCollisionDirection = yCollisionDirection;
  newActorRect.wasCollision = (newXCollides || newYCollides)
  return newActorRect
}

//DATA
Object.defineProperty(Number.prototype, "isBetween", {
  value: function(a,b,exclusive) {
    //a and b are numbers to check between
    //exclusive is a boolean stating whether to
    //exclude a and b (includes a and b by default)
    if(exclusive) return this > a && this < b
    return this >= a && this <= b
  }
})

Object.defineProperty(String.prototype, "splitBySeparators", {
  value: function( array_of_separators, removeEmptyStrings, leaveSeparatorsIn ) {
    var new_str = this;
    for(let s of array_of_separators) {
      new_str = new_str.split(s)
      if(leaveSeparatorsIn){
        let new_new_str = [];
        for(let n = 0; n < new_str.length; n ++){
          new_new_str.push( new_str[n] )
          if(n < new_str.length - 1)
            new_new_str.push(s)
        }
        new_str = new_new_str;
      }
      new_str = new_str.join("@splitter@")
    }
    var ret = new_str.split("@splitter@")
    if(removeEmptyStrings){
      var new_ret = [];
      for(e of ret){
        if(e.length > 0)new_ret.push(e)
      }
      return new_ret
    }
    
    return ret
  }
})

Object.defineProperty(Array.prototype, "itemsThatMeet", {
  value: function( function_returns_boolean, return_indeces ) {
    if(typeof function_returns_boolean == "object"){ //array
      return _itemsThatMeet_multiple( this, function_returns_boolean, return_indeces )
    } else {
      var rets = [];
      for(var i = 0; i < this.length; i ++){
        if( function_returns_boolean(this[i]) ){
          if(return_indeces)rets.push(i)
          else rets.push(this[i])
        }
      }
      if(rets.length == 1)rets = rets[0];
      if(rets.length == 0){rets = null;}
      return rets;
    }
  }
})

Object.defineProperty(Object.prototype, "getKeys", {
  value: function() {
    return Object.keys(this)
  }
})

Object.defineProperty(Array.prototype, "remove", {
  value: function(indexToRemove) {
    this.splice(indexToRemove, 1)
  }
})

Object.defineProperty(Array.prototype, "closestToString", {
  //Returns which string in an array most closely matches the given string
  value: function(stringParam, returnIndex){
    let arrayOfStrings = this;
    let _stringLevenshteinDistance = (str1 = '', str2 = '') => {
     if(str1 == null || str2 == null)return Infinity;
     const track = Array(str2.length + 1).fill(null).map(() =>
     Array(str1.length + 1).fill(null));
     for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
     }
     for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
     }
     for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
           const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
           track[j][i] = Math.min(
              track[j][i - 1] + 1, // deletion
              track[j - 1][i] + 1, // insertion
              track[j - 1][i - 1] + indicator, // substitution
           );
        }
     }
     return track[str2.length][str1.length];
    }
    let closestMatch = arrayOfStrings[0]
    let closestMatchIndex = 0;
    let closestMatchDist = _stringLevenshteinDistance(stringParam, arrayOfStrings[0])
    let exactMatches = [];
    let exactMatchesIndeces = [];
    for(let stringIndex in arrayOfStrings){
      let thisString = arrayOfStrings[stringIndex]
      let stringDist = _stringLevenshteinDistance(stringParam, thisString)
      if(stringDist < closestMatchDist){
        closestMatch = thisString;
        closestMatchDist = stringDist
        closestMatchIndex = int(stringIndex) ;
      }
      if(stringDist == 0){
        exactMatches.push(thisString)
        exactMatchesIndeces.push( int(stringIndex) )
      }
    }
    if(returnIndex){
      //Only return an array of exact matches if returnIndex is set to true
      if(exactMatches.length > 1)return exactMatchesIndeces;
      else return closestMatchIndex;
    }
    if(!returnIndex){
      return closestMatch;
    }
  }
})

function _itemsThatMeet_multiple(myArray, list_of_funcs, return_indeces) {
  var ret = [];
  var t = [...myArray]
  for(var i = 0; i < list_of_funcs.length; i ++){
    var itemFound = null;
    for(var j = 0; j < t.length; j ++){
      if( list_of_funcs[i](t[j]) ){
        if(!return_indeces)itemFound = t[j]
        if(return_indeces)itemFound = j
      }
    }
    ret.push(itemFound)
  }
  return ret;
}


/*

HANDY INFORMATION

To remove from an array by index:
myArray.splice(index, 1)
^-- splice here is different from the "splice" you will find in p5js Reference page

To redirect (link):
window.location = "url"

To open in new tab:
window.open("url", "_blank")

To write a text file:
var writer = createWriter('myText.txt');
writer.print(textVariable)
writer.close();

To read a text file:
loadStrings('myText.txt')

To execute a string as a line of code:
myFunction = Function('instructions')
myFunction();
https://stackoverflow.com/questions/939326/execute-javascript-code-stored-as-a-string

To create a text area (multiline text input box):
https://discourse.processing.org/t/multi-line-text-box-needed/2318

TO COPY AN OBJECT WITHOUT SIMPLY RE-ASSIGNING THE VARIABLE:
newObject = JSON.parse(JSON.stringify(oldObject))

*/
