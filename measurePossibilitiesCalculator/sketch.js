function preload(){
  timeSigFont = loadFont('KlaberFraktur.ttf')
  otherFont = loadFont('cloud-calligraphy.regular.ttf')

  //note images
  wholeImg = loadImage('noteImages/whole.png')
  halfImg = loadImage('noteImages/half.png')
  quarterImg = loadImage('noteImages/quarter.png')
  eighthImg = loadImage('noteImages/eighth.png')
  sixteenthImg = loadImage('noteImages/sixteenth.png')
  thirtysecondImg = loadImage('noteImages/32nd.png')

  emptyCircleImg = loadImage('emptyCircle.png')
  fullCircleImg = loadImage('fullCircle.png')

}

function setup() {
  createCanvas(700,700)

  customScaleInp = createInput('14')
  customScaleInp.size(50)
  customScaleInp.position((windowWidth/2)-(width/2) + 150,(windowHeight/2)-(height/2) + 240)
  customScaleInp.input(updateCustomScale) //when user updates custom scale input box, apply the update

  customDurationInp = createInput('64')
  customDurationInp.size(50);
  customDurationInp.position((windowWidth/2)-(width/2) + 555,(windowHeight/2)-(height/2) + 360)
  customDurationInp.input(updateCustomDuration)
  customDuration = 64; //what value is the custom duration? 64 = 64th note

  //time signature input boxes
  tsTopInp = createInput('4')
  tsTopInp.size(20)
  tsTopInp.position((windowWidth/2)-(width/2) + 55,(windowHeight/2)-(height/2) + 455)
  tsTopInp.input(updateTimeSignature)

  tsBottomInp = createInput('4')
  tsBottomInp.size(20)
  tsBottomInp.position((windowWidth/2)-(width/2) + 55,(windowHeight/2)-(height/2) + 520)
  tsBottomInp.input(updateTimeSignature)

  smooth();
  timeSignatureTop = 4
  timeSignatureBottom = 4
  smallestDivision = 4; //4 = quarter note, 8 = 8th note, 16 = 16th note, etc.
  notesInScale = 8; //notesInScale: add one extra for a rest (silence)

  calculateInXFrames = -1; //calculate total in this many frames; when zero, calculate. When -1, do not calculate.
  scaleChoice = 'Major/Minor'; //which option is selected from scale options list
  scaleChoices = [
    {'name':'Major/Minor','notes':7},
    {'name':'Chromatic','notes':12},
    {'name':'Pentatonic','notes':5},
    {'name':'Custom','notes':14}
  ]

  durationChoice = 'quarter'; //which option is selected from the duration options list
  durationChoices = ['whole','half','quarter','eighth','sixteenth','thirtysecond','custom']

  totalCalculation = calculateTotal();

  barPxWidth = 500;
  barPxHeight = 140;
}

function draw() {
  background(255)
  drawBar(0, 150)

  noStroke(); fill(0); textAlign(CENTER);

  textSize(40); textFont(otherFont)
  text('Measure Possibilities Calculator', width/2, 50)
  text('Total possibilities: ' + totalCalculation, width/2, height-50)

  drawScaleOptions();
  drawDurationOptions();

  if(calculateInXFrames > -1){
    if(calculateInXFrames == 0)totalCalculation = calculateTotal();
    calculateInXFrames --;
  }

}

function mouseClicked(){
  //check for whether user clicked on a scale option
  var startX = 50; var startY = 100; var yDistance = 40;
  for(var i = 0; i < scaleChoices.length; i ++){
    if(collidePointRect(mouseX, mouseY, startX-30, startY+((i+1) * yDistance)-20, 18, 18)){
      scaleChoice = scaleChoices[i].name;
      notesInScale = scaleChoices[i].notes + 1;

      totalCalculation = 'Calculating...'
      calculateInXFrames = 20;
    }
  }


  //check for whether user clicked on a note duration option
  startX = 470; startY = 100; yDistance = 40;
  for(var i = 0; i < durationChoices.length; i ++){
    if(collidePointRect(mouseX, mouseY, startX-30, startY+((i+1) * yDistance)-20, 18, 18)){
      durationChoice = durationChoices[i]
      if(durationChoice == 'whole')smallestDivision = 1;
      if(durationChoice == 'half')smallestDivision = 2;
      if(durationChoice == 'quarter')smallestDivision = 4;
      if(durationChoice == 'eighth')smallestDivision = 8;
      if(durationChoice == 'sixteenth')smallestDivision = 16;
      if(durationChoice == 'thirtysecond')smallestDivision = 32;
      if(durationChoice == 'custom')smallestDivision = customDuration;

      totalCalculation = 'Calculating...'
      calculateInXFrames = 20;
    }
  }
}

function windowResized(){
  customScaleInp.position((windowWidth/2)-(width/2) + 150,(windowHeight/2)-(height/2) + 240)
  customDurationInp.position((windowWidth/2)-(width/2) + 555,(windowHeight/2)-(height/2) + 360)
  tsTopInp.position((windowWidth/2)-(width/2) + 55,(windowHeight/2)-(height/2) + 455)
  tsBottomInp.position((windowWidth/2)-(width/2) + 55,(windowHeight/2)-(height/2) + 520)
}

function drawScaleOptions(){
  var startX = 50; var startY = 100; var yDistance = 40;
  textAlign(LEFT); textSize(30)
  text('Scale:',startX, startY)
  for(var i = 0; i < scaleChoices.length; i ++){
    if(scaleChoices[i].name != 'Custom')text(scaleChoices[i].name + ' (' + scaleChoices[i].notes + ' notes)', startX, startY + ((i+1) * yDistance));
    if(scaleChoices[i].name == 'Custom')text('Custom: (          notes)', startX, startY + ((i+1) * yDistance));
    if(scaleChoices[i].name == scaleChoice)image(fullCircleImg, startX-30, startY + ((i+1) * yDistance) - 20, 18, 18)
    else image(emptyCircleImg, startX-30, startY + ((i+1) * yDistance) - 20, 18, 18);
  }
}

function drawDurationOptions(){
  var startX = 470; var startY = 100; var yDistance = 40;
  textAlign(LEFT); textSize(30)
  text('Smallest Note Allowed:',startX - 10, startY)
  for(var i = 0; i < durationChoices.length; i ++){
    if(durationChoice == durationChoices[i])image(fullCircleImg, startX-30, startY + ((i+1) * yDistance) - 20, 18, 18);
    else image(emptyCircleImg, startX-30, startY + ((i+1) * yDistance) - 20, 18, 18);

    if(durationChoices[i] == 'whole')image(wholeImg,startX, startY + ((i+1) * yDistance) - 40,85*0.3,130*0.3);
    if(durationChoices[i] == 'half')image(halfImg,startX, startY + ((i+1) * yDistance) - 33,85*0.3,130*0.3);
    if(durationChoices[i] == 'quarter')image(quarterImg,startX, startY + ((i+1) * yDistance) - 33,85*0.3,130*0.3);
    if(durationChoices[i] == 'eighth')image(eighthImg,startX, startY + ((i+1) * yDistance) - 33,85*0.3,130*0.3);
    if(durationChoices[i] == 'sixteenth')image(sixteenthImg,startX, startY + ((i+1) * yDistance) - 33,85*0.3,130*0.3);
    if(durationChoices[i] == 'thirtysecond')image(thirtysecondImg,startX, startY + ((i+1) * yDistance) - 33,85*0.3,130*0.3);
    if(durationChoices[i] == 'custom')text('Custom:          th note', startX, startY + ((i+1) * yDistance))
  }
}

function drawBar(xadjust,yadjust){
  push();
  translate(xadjust,yadjust)
  x = (width/2)-(barPxWidth/2)
  y = (height/2)-(barPxHeight/2)
  w = barPxWidth
  h = barPxHeight
  stroke(0); strokeWeight(1); noFill();
  rect(x,y,w,h)
  line(x, y+(h * (1/4)), x + w, y+(h * (1/4)) )
  line(x, y+(h * (2/4)), x + w, y+(h * (2/4)) )
  line(x, y+(h * (3/4)), x + w, y+(h * (3/4)) )

  //time signature
  noStroke(); fill(0); textAlign(CENTER);
  textSize(105);textFont(timeSigFont);
  text(timeSignatureTop, (width/2)-(barPxWidth/2) + 60, (height/2))
  text(timeSignatureBottom, (width/2)-(barPxWidth/2) + 60, (height/2)+(barPxHeight/2))

  var imageToDisp;
  if(durationChoice == 'whole')imageToDisp = wholeImg;
  if(durationChoice == 'half')imageToDisp = halfImg;
  if(durationChoice == 'quarter')imageToDisp = quarterImg;
  if(durationChoice == 'eighth')imageToDisp = eighthImg;
  if(durationChoice == 'sixteenth')imageToDisp = sixteenthImg;
  if(durationChoice == 'thirtysecond')imageToDisp = thirtysecondImg;

  if(durationChoice != 'custom')image(imageToDisp, 205, 245, 85, 130);

  pop();
}

function updateCustomScale(){
  if(customScaleInp.value() == int(customScaleInp.value())){
    scaleChoices[scaleChoices.length-1].notes = int(customScaleInp.value())
    if(scaleChoice == 'Custom'){notesInScale = scaleChoices[scaleChoices.length-1].notes + 1;}
  }
  if(scaleChoice == 'Custom'){
    totalCalculation = 'Calculating...'
    calculateInXFrames = 20;
  }
}

function updateCustomDuration(){
  if(customDurationInp.value() == int(customDurationInp.value())){
    customDuration = int(customDurationInp.value())
  }
  if(durationChoice == 'custom'){
    totalCalculation = 'Calculating...'
    calculateInXFrames = 20;
  }
}

function updateTimeSignature(){
  if(tsTopInp.value() == int(tsTopInp.value())){
    timeSignatureTop = int(tsTopInp.value())
  }

  if(tsBottomInp.value() == int(tsBottomInp.value())){
    timeSignatureBottom = int(tsBottomInp.value())
  }

  totalCalculation = 'Calculating...'
  calculateInXFrames = 20;
}

function calculateTotal(){
  var grandTotal = 0;
  noOfSmallNotes = timeSignatureTop * (smallestDivision/timeSignatureBottom)
  for (var noOfNotes = 1; noOfNotes <= noOfSmallNotes; noOfNotes ++){
    var possibleRhythms = recursiveT(noOfNotes - 2, noOfSmallNotes - (noOfNotes-1))
    //console.log('rhythms with ' + noOfNotes + ' notes: ' + possibleRhythms)
    grandTotal += possibleRhythms * pow(notesInScale,noOfNotes)
  }
  if(noOfSmallNotes !== int(noOfSmallNotes) ||
  (scaleChoice == 'Custom' && customScaleInp.value() != int(customScaleInp.value())) ||
  tsTopInp.value() != int(tsTopInp.value()) ||
  tsBottomInp.value() != int(tsBottomInp.value()))grandTotal = 'Invalid calculation'
  return grandTotal;
}

function recursiveT(tcount, n){
  var total = 0
  if(tcount == -1)return 1;
  if(tcount == 0)return n;
  if(tcount == 1){
    for(var i = 1; i <= n; i ++){
      total += i
    }
  }
  if(tcount > 1){
    for(var i = 1; i <= n; i ++){
      total += recursiveT(tcount-1, i)
    }
  }
  return total
}
