setInterval = -1; //how many frames in between saying numbers?
//set to -1 to have interval vary depending on length of number

function preload(){
  var toLoad = 'billion eight eighteen eighty eleven fifteen fifty five forty four fourteen hundred million nine nineteen ninety one quadrillion quintillion seven seventeen seventy sextillion six sixteen sixty ten thirteen thirty thousand three trillion twelve twenty two'.split(' ')
  sounds = {}
  soundDurations = loadJSON('soundDurations.json') //how many frames should this word be?
  for(var i = 0; i < toLoad.length; i ++){
    sounds[toLoad[i]] = new Audio('numbers/' + toLoad[i] + '.mp3')
    //sounds[toLoad[i]] = loadSound('numbers/' + toLoad[i] + '.mp3')
  }
  quickSheep = createVideo('quickSheep.mp4')
  quickSheep.hide();
  quickSheep.onended(vidEnd)
  freezeFrame = loadImage('freezeFrame.png')

  sound421 = loadSound('421.mp3')
  sound70 = loadSound('70.mp3')
}

function setup() {
  myw = 1920 / 2
  myh = 1080 / 2
  myCanvas = createCanvas(myw, myh)
  textAlign(CENTER,CENTER);fill(255); noStroke();textSize(30)


  numberInput = createInput();
  canvasPosition(numberInput, myCanvas, width/2,height - 30 )
  currentWordIndex = 1;
  wordArray = []
  currentNumber = 0;
  frameTimer = 0;
  autoPlay = false;

  stillSpeaking = false;

  lastVidStart = 0;

  startCounting = false;
  quickSheepPlaying = false;

  /*var keys = Object.keys(sounds)
  for(var i = 0; i < keys.length; i ++){
    sounds[keys[i]].onended = soundEnd
  }*/
}

function draw() {
  playArray(wordArray);
  image(freezeFrame, 0, 0, width, height)
  image(quickSheep, 0, 0, width, height)
  fill(0);
  text("Jump to number:", 270, 520)



  if(startCounting)count();

  if(!startCounting){
    background(0,170); fill(255);
    text('Press space to start counting\n(Firefox not recommended)',width/2,height/2)
  }

  if(!sound421.isPlaying() || !sound70.isPlaying())stillSpeaking = false;
  if(sound421.isPlaying())stillSpeaking = true;
  if(sound70.isPlaying())stillSpeaking = true;

}

function windowResized(){
  canvasPosition(numberInput, myCanvas, width/2,height - 30 )
}

function vidEnd(){
  quickSheepPlaying = false;
}

function count(){
  if(  (setInterval == -1 && !stillSpeaking && !quickSheepPlaying) || (setInterval > 0 && frameCount % setInterval == 0) ){
    quickSheep.stop();
    currentNumber ++
    if(currentNumber == 420)currentNumber = 421;
    sayNumber(currentNumber)
    quickSheep.play();
    quickSheepPlaying = true;
    lastVidStart = frameCount;
  }
}

function keyTyped(){
  if(key == ' ')startCounting = !startCounting;
}

function keyPressed(){
  if(keyCode == ENTER && numberInput.value() > 0 && numberInput.value() < 1000000000000001 ){
    currentNumber = round(int(numberInput.value())) - 1
  }
}

function playArray(ar){
  if(currentWordIndex == 0 && frameTimer == 0 && ar.length > 0){
    sounds[ar[0]].play();
  }
  if(currentWordIndex < ar.length - 1){
    var max = round(soundDurations[ar[currentWordIndex]])
    if(frameTimer == max ){
      currentWordIndex ++;
      sounds[ar[currentWordIndex]].play();
      frameTimer = 0;
    }
  }
  frameTimer ++;

  if(currentWordIndex == ar.length - 1){
    var max = round(soundDurations[ar[currentWordIndex]])
    if(frameTimer >= max + 50){
      stillSpeaking = false;
    }
  }
}

function numberToArray(n){
  var x  = numberToWords.toWords(n)
  for(var i = 0; i < 20; i ++){
    x = x.replace('-', ' ')
    x = x.replace(',', '')
  }
  x = x.split(' ')
  return x;
}

function sayNumber(n){
  var x = numberToWords.toWords(n)
  stillSpeaking = true;
  for(var i = 0; i < 20; i ++){
    x = x.replace('-', ' ')
    x = x.replace(',', '')
  }

  x = x.split(' ')

  wordArray = x

  if(n == 70){
    wordArray = []
    sound70.play()
  }
  if(n == 421){
    wordArray = []
    sound421.play();
  }

  currentWordIndex = 0;
  frameTimer = 0;
}

function s(st, newdur){
  soundDurations[st] = newdur
}

function longestNumber(n){
  var longestN = 1;
  var longestD = 1; //in frames
  for(var i = 1; i < n; i ++){
    var iName = numberToArray(i)
    var durOfI = 0;
    for(var j = 0; j < iName.length; j ++){
      durOfI += soundDurations[ iName[j] ]
    }
    if(durOfI > longestD){
      longestN = i;
      longestD = durOfI
    }
  }
  return [longestN, longestD] //longest N is 666,666
}

function orderDurs(){
  var orderedDurs = []
  var keys = Object.keys(soundDurations)
  for(var i = 0; i < keys.length; i ++){
    orderedDurs.push( {'name':keys[i], 'duration':soundDurations[keys[i]]} )
  }
  orderedDurs.sort( biggestDur )
  return orderedDurs
}

function biggestDur(a, b){
  if(a.duration > b.duration)return 1;
  if(a.duration < b.duration)return -1;
  if(a.duration == b.duration)return 0;
}

//numberToWords.toWords(num)
!function toWords(){"use strict";var e="object"==typeof self&&self.self===self&&self||"object"==typeof global&&global.global===global&&global||this,t=9007199254740991;function f(e){return!("number"!=typeof e||e!=e||e===1/0||e===-1/0)}function l(e){return"number"==typeof e&&Math.abs(e)<=t}var n=/(hundred|thousand|(m|b|tr|quadr)illion)$/,r=/teen$/,o=/y$/,i=/(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/,s={zero:"zeroth",one:"first",two:"second",three:"third",four:"fourth",five:"fifth",six:"sixth",seven:"seventh",eight:"eighth",nine:"ninth",ten:"tenth",eleven:"eleventh",twelve:"twelfth"};function h(e){return n.test(e)||r.test(e)?e+"th":o.test(e)?e.replace(o,"ieth"):i.test(e)?e.replace(i,a):e}function a(e,t){return s[t]}var u=10,d=100,p=1e3,v=1e6,b=1e9,y=1e12,c=1e15,g=9007199254740992,m=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],w=["zero","ten","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function x(e,t){var n,r=parseInt(e,10);if(!f(r))throw new TypeError("Not a finite number: "+e+" ("+typeof e+")");if(!l(r))throw new RangeError("Input is not a safe number, it’s either too large or too small.");return n=function e(t){var n,r,o=arguments[1];if(0===t)return o?o.join(" ").replace(/,$/,""):"zero";o||(o=[]);t<0&&(o.push("minus"),t=Math.abs(t));t<20?(n=0,r=m[t]):t<d?(n=t%u,r=w[Math.floor(t/u)],n&&(r+="-"+m[n],n=0)):t<p?(n=t%d,r=e(Math.floor(t/d))+" hundred"):t<v?(n=t%p,r=e(Math.floor(t/p))+" thousand,"):t<b?(n=t%v,r=e(Math.floor(t/v))+" million,"):t<y?(n=t%b,r=e(Math.floor(t/b))+" billion,"):t<c?(n=t%y,r=e(Math.floor(t/y))+" trillion,"):t<=g&&(n=t%c,r=e(Math.floor(t/c))+" quadrillion,");o.push(r);return e(n,o)}(r),t?h(n):n}var M={toOrdinal:function(e){var t=parseInt(e,10);if(!f(t))throw new TypeError("Not a finite number: "+e+" ("+typeof e+")");if(!l(t))throw new RangeError("Input is not a safe number, it’s either too large or too small.");var n=String(t),r=Math.abs(t%100),o=11<=r&&r<=13,i=n.charAt(n.length-1);return n+(o?"th":"1"===i?"st":"2"===i?"nd":"3"===i?"rd":"th")},toWords:x,toWordsOrdinal:function(e){return h(x(e))}};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=M),exports.numberToWords=M):e.numberToWords=M}();
