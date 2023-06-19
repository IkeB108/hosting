//ike.js version 2.1
//DATA
function del(itemNo, List){
  newList = [];
  for(var i = 0; i < List.length; i++){
    if(i != itemNo){newList.push(List[i])}
  }
  return newList;
}
function contains(item, List){
  for(var i = 0; i < List.length; i ++){
    if(List[i] === item){
      return true;
    }
  }
  return false
}
function within(val,min,max){
  return min < val && max > val
}
function withinInc(val,min,max){
  return min <= val && max >= val
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
  for(var i = 0; i < vertices.length; i ++){
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

//DISPLAY
function dispSprite(spriteJson,completeImg,smallImgTitle,xarg,yarg,warg,harg){ //warg and harg optional
  var spframe = spriteJson.frames[smallImgTitle].frame;
  if(warg && harg)image(completeImg,spframe.x,spframe.y,spframe.w,spframe.h,xarg,yarg,warg,harg);
  else image(completeImg,spframe.x,spframe.y,spframe.w,spframe.h,xarg,yarg);
} //Displays "cropped" images using data from a json file (use piskelapp to generate PixiJS movies)
function changeCol(col1,col2, threshold){ //changes all pixels of col1 to col2. Threshold optional
  colorMode(RGB)
  loadPixels();
  for(var x = 0; x < width; x ++){
    for(var y = 0; y < height; y ++){
      var index = (x + (y * width)) * 4;
      var pixelCol = color(pixels[index],pixels[index+1],pixels[index+2])
      if(threshold){
        var correctCol = (abs(red(pixelCol) - red(col1))<=threshold &&
                          abs(green(pixelCol) - green(col1))<=threshold &&
                          abs(blue(pixelCol) - blue(col1))<=threshold)
      } else {
        var correctCol = (red(pixelCol) == red(col1) &&
                          green(pixelCol) == green(col1) &&
                          blue (pixelCol) == blue(col1))
      }
      if(correctCol){
           pixels[index] = red(col2)
           pixels[index+1] = green(col2)
           pixels[index+2] = blue(col2)
      }
    }
  }
  updatePixels();
}


//Handy Information:
//NOTE: USE window.location = "url" TO REDIRECT (LINK)
// USE window.open("url", "_blank") TO OPEN IN NEW TAB
/*To write a text file:
var writer = createWriter('myText.txt');
writer.print(textVariable)
writer.close();

TO COPY AN OBJECT WITHOUT SIMPLY RE-ASSIGNING THE VARIABLE:
newObject = JSON.parse(JSON.stringify(oldObject))

*/
//To read a text file: loadStrings('myText.txt')
