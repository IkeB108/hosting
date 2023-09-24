let globalTime = 0
let globalTimeStep = 20; //milliseconds between global time updates

let timeToCompletion = 10 * 60; //seconds

let triggerSoundsLoaded = 0;

//Load sounds from list
$.ajax({
  url: 'sounds/soundlist.txt',
  type: 'get',
  async: false,
  success: function(sl) {
    soundCategories = {}
    
    soundListStrings = sl.split("\n")
    
    for(let i in soundListStrings){
      soundListStrings[i] = soundListStrings[i].split("\\sounds\\")[1]
      let soundCategory = soundListStrings[i].split("\\")[0]
      let soundFileName = soundListStrings[i].split("\\")[1]
      if(!soundCategories.hasOwnProperty(soundCategory)){
        soundCategories[soundCategory] = {
          "enabled": true,
          "volume": 0.5,
          "minInterval": 2, //Seconds
          "maxInterval": 10,
          "timeOfNextPlay": -1, //Seconds
          "sounds": [],
        }
      }
      //Store sound file names in the soundCategories object.
      //When we get to onLoad() and Howler.js is ready, then load the sounds
      //from sound paths.
      soundFileName = soundFileName.replaceAll("\r", "")
      soundCategories[soundCategory].sounds.push( soundFileName )
    }
    
    //For testing
    // soundCategories = { "beeps": {
    //   "enabled": true,
    //   "volume": 0.5,
    //   "minInterval": 1, //Seconds
    //   "maxInterval": 4,
    //   "timeOfNextPlay": -1,
    //   "sounds": [ "beep1.mp3", "beep2.mp3", "beep3.mp3" ],
    // } }
    
    //Set a next time of play for all sounds
    for(let i in soundCategories){
      setTimeOfNextPlay(i);
    }
  }
});

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min);
}

function nearestMult(val, multiple){
  return Math.round(val/multiple) * multiple;
}

function setTimeOfNextPlay(soundCategory){
  let cat = soundCategories[soundCategory]
  let newInterval = getRandomFloat(cat.minInterval, cat.maxInterval) * 1000;
  newInterval = nearestMult(newInterval, globalTimeStep);
  cat.timeOfNextPlay = globalTime + newInterval;
}

function onLoad(){
  //Load settings from local storage if there are any.
  let soundCategoriesLocalStorage = localStorage.getItem("soundCategories")
  if(soundCategoriesLocalStorage !== null){
    soundCategories = JSON.parse(soundCategoriesLocalStorage)
    console.log("Found soundcategories in local storage")
  }
  
  let timeToCompletionLocalStorage = localStorage.getItem("timeToCompletion")
  if(timeToCompletionLocalStorage !== null){
    timeToCompletion = Number(timeToCompletionLocalStorage)
    timeRemaining = timeToCompletion;
    $("#timer-slider").val(timeToCompletion/60)
    console.log("Found time to completion in local storage")
  }
  updateTimerIndicator();
  
  completeSound = new Howl({ src: ["complete.mp3"], volume: 1})
  
  sounds = {}
  
  for(let cat in soundCategories){
    for(let i in soundCategories[cat].sounds){
      let sound = new Howl({
        src: ["sounds/" + cat + "/" + soundCategories[cat].sounds[i]],
        volume: soundCategories[cat].volume,
        onload: ()=>{
          triggerSoundsLoaded ++;
          $("#sounds-loaded-indicator").text("Trigger sounds loaded: " + triggerSoundsLoaded)
          if(triggerSoundsLoaded == Object.keys(sounds).length){
            $("#sounds-loaded-indicator").attr("hidden", true);
            $("#start").attr("hidden", false)
            $("#stop").attr("hidden", false)
          }
          
        }
      })
      sounds[cat + "_" + soundCategories[cat].sounds[i]] = sound
    }
  }
  
  //Store sound category object data in textarea
  $("#settings-text-area").text(JSON.stringify(soundCategories, null, 2))
}

function updateTimerIndicator(){
    let seconds = "" + timeRemaining % 60
    seconds = seconds.padStart(2, "0")
    $("#timer-indicator").text( "Time remaining: " + Math.floor(timeRemaining/60) + ":" + seconds )
}

let timeRemaining = timeToCompletion; //in seconds
let timerActive = false;
let timerInterval = setInterval( ()=>{
  if(timerActive){
    if(timeRemaining >= 0)timeRemaining -= 1;
    if(timeRemaining == 0){
      timerActive = false;
      console.log("FINISHED")
      completeSound.play();
      stopAllSounds();
    }
    updateTimerIndicator();
  }
}, 1000)

let globalTimeInterval = setInterval( ()=> {
  if(timerActive){
    globalTime += globalTimeStep
    $("#global-timer-indicator").text(globalTime)
    
    //Play any sounds that are scheduled to play at this time
    for(let i in soundCategories){
      if(soundCategories[i].timeOfNextPlay == globalTime && soundCategories[i].enabled){
        //Pick a random sound from the category
        let sound = Math.floor(Math.random() * soundCategories[i].sounds.length)
        console.log(i + ":  " + sound)
        sounds[i + "_" + soundCategories[i].sounds[sound]].play()
        setTimeOfNextPlay(i)
      }
    }
  }
}, globalTimeStep)

function stopAllSounds(){
  for(let i in sounds){
    sounds[i].stop()
  }
}

function startClick(){
  console.log("start click")
  timerActive = true;
  completeSound.play();
  if(timeRemaining == 0)timeRemaining = timeToCompletion;
}
function stopClick(){
  console.log("stop click")
  timerActive = false;
  timeRemaining = timeToCompletion;
  updateTimerIndicator();
  
  stopAllSounds();
  
  completeSound.play();
}

function updatePreferencesClick(){
  try {
    soundCategories = JSON.parse( $("#settings-text-area").val() )
    $("#syntax-error-warning").attr("hidden", true)
    completeSound.play();
  } catch {
    $("#syntax-error-warning").removeAttr("hidden")
  }
  
  //Update volumes of all sounds and set a time of next play
  for(let cat in soundCategories){
    for(let i in soundCategories[cat].sounds){
      let sound = sounds[ cat + "_" + soundCategories[cat].sounds[i]]
      sound.volume( soundCategories[cat].volume )
    }
    setTimeOfNextPlay(cat)
  }
  
  //Store settings in local storage
  localStorage.setItem("soundCategories", JSON.stringify(soundCategories))
}

function revertPreferencesClick(){
  localStorage.removeItem("soundCategories")
  window.location.reload()
}

function onTimerSliderChange(){
  timerActive = false;
  stopAllSounds();
  timeToCompletion = $("#timer-slider").val() * 60;
  timeRemaining = timeToCompletion;
  updateTimerIndicator();
  localStorage.setItem("timeToCompletion", timeToCompletion)
}

function devClick(){
  try {
    alert( eval( prompt("Enter a command:") ) )
  } catch (error) {
    alert(error)
  }
  
}