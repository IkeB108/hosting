//ike.js version 2.2
//JSON AND HJSON

function escapeString(myString){
  return JSON.stringify(myString).slice(1, -1);
}

function handleMyFile(file){
  if(file.name.endsWith('.json') || file.name.endsWith('.hjson')){ //if the file is either a .json or .hjson file

    game = file.data[0];
    newGameLoaded = true;
    menuWindowOpen = false;
    gameFileInput.remove();
    //x has been changed to game in this copy of the function
  }
}

//myField = myTextArea.elt; myValue = 'this string will be inserted'
function insertAtCursor(myField, myValue) {
    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}
//taken from https://stackoverflow.com/questions/11076975/how-to-insert-text-into-the-textarea-at-the-current-cursor-position

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
function getIndex(item, List){
  //given an item 'item', return the index of that item in List
  for(var i = 0; i < List.length; i ++){
    if(List[i] == item)return i;
  }
  return null;
}
function within(val,min,max){
  return min < val && max > val
}
function withinInc(val,min,max){
  return min <= val && max >= val
}

function collideRectRectNoEdges(x, y, w, h, x2, y2, w2, h2) {
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

function canvasPosition(element, canvas, xarg, yarg){
  /*positions a p5 element relative to a canvas instead of relative to the
  upper left corner of the window*/
  element.position(0,0)
  element.position(canvas.position().x + xarg, canvas.position().y + yarg)
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

To load and parse a HJSON file:
- In preload(): myObject = loadStrings('myfile.hjson') in preload()
- In setup():   myObject = Hjson.parse(join(myObject, '\n'))

*/
