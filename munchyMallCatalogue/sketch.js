function preload(){
  myFont = loadFont('myFont.ttf')
  myFont2 = loadFont('myFont2.otf')
}
function setup() {
  myCanvas = createCanvas(700,700)
  textAlign(CENTER, CENTER)
  textSize(40)
  noStroke();

  passcodeEntry = createInput();
  canvasPosition(passcodeEntry, myCanvas, width/2 + 150, height/2 + 60)
}

function draw() {
  background(255); fill(0);
  textFont(myFont); textSize(40);
  text("MUNCHY MC\nMALL CATALOGUES\nby Qwerty_2001", width/2, height/2 - 80)
  textFont(myFont2); textSize(30);
  text('Enter your passcode:', width/2 - 90, height/2 + 65)

  if(passcodeEntry.value().length > 0){
    fill(100);
    if(mouseOverButton())fill(180);
    var w = 160
    var h = 40
    rect(width/2-(w/2), height/2-(h/2) + 150, w, h);
    fill(255);
    text("Go!", width/2, height/2 + 147)
  }
}

function startRedirect(){
  var inputDate = decodeDate( passcodeEntry.value() );
  if(inputDate.day && inputDate.month && inputDate.year && inputDate.type){
    //passcode was successful
    if(inputDate.type == 'buy')var rand = 12;
    if(inputDate.type == 'sell')var rand = 13;
    if(inputDate.type == 'buy lite')var rand = 14;
    if(inputDate.type == 'sample')var rand = 15;
    //rand is manually set to a value between 12 and 15 depending on book type
    var typeName = inputDate.type;
    if(inputDate.type == 'buy lite')typeName = "buylite"
    var fileName = encodeDate(inputDate.day, inputDate.month, inputDate.year, rand, inputDate.type).toString() + typeName + '.html'
    console.log(fileName)
    window.location = 'https://ikeb108.github.io/munchyMallCatalogue/' + fileName
  } else {
    window.location = 'https://ikeb108.github.io/munchyMallCatalogue/invalidPage.html'
  }
}

function mouseOverButton(){
  var w = 160
  var h = 40
  return collidePointRect(mouseX, mouseY, width/2-(w/2), height/2-(h/2) + 150, w, h)
}

function mouseClicked(){
  if(mouseOverButton()){
    startRedirect();
  }
}

function windowResized(){
  canvasPosition(passcodeEntry, myCanvas, width/2 + 150, height/2 + 60)
}
