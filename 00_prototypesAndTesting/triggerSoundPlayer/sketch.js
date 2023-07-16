//Windows cmd in project directory: dir /a-d /s /b > soundlist.txt
//REMEMBER to take the soundlist.txt file itself OFF of the list!

soundLoadSuccessCallback = ()=> {
  loadedSoundCount ++;
  if(loadedSoundCount == soundPaths.length)onLoadComplete();
}

function setURLToUserSettings(){
  window.history.replaceState({additionalInformation:"Updated URL with JS"}, "", "?" + JSON.stringify(userSettings));
}

function getUserSettingsFromURL(){
  let url = window.location.href
  let lastSlashIndex = url.lastIndexOf("/")
  if(lastSlashIndex >= 6 && lastSlashIndex < url.length - 1){
    let grabbedData = decodeURI(url.substring(lastSlashIndex + 1))
    try {
      return JSON.parse(grabbedData.substring(1))
    } catch(error) {
      return null
    }
  } else {
    return null
  }
}

function preload(){
  currentVersion = 3;

  soundList = loadStrings("sounds/soundlist.txt")
  userSettingsFromURL = getUserSettingsFromURL();
  completeSound = loadSound("complete.mp3")

  icons = {
    "soundon": loadImage("icons/soundon.png"),
    "soundoff": loadImage("icons/soundoff.png"),
    "play": loadImage("icons/play.png"),
    "pause": loadImage("icons/pause.png"),
  }
}

function setup(){
  icursor = new MobileFriendlyCursor({
    threeFingerConsole: true,
    marginInPixels: 10,
  })
  
  //Now that soundList has loaded...
  soundCategories = [];
  soundPaths = {}
  for(let line in soundList){
    let soundPath = soundList[line].split("\\sounds\\")[1]
    if(soundPath !== undefined){
      soundPath = soundPath.replaceAll("\\", "/")
      if( !soundCategories.includes(soundPath.split("/")[0])  )
        soundCategories.push( soundPath.split("/")[0] )
      
      soundPath = "sounds/" + soundPath
      soundPaths[soundPath] = soundPath
    }
  }
  soundPaths = Object.keys(soundPaths)

  loadedSoundCount = 0;
  
  soundsObject = {}
  for(i in soundPaths){
    let newAudio = document.createElement("AUDIO")
    newAudio.setAttribute("src", soundPaths[i])
    newAudio.onloadeddata = soundLoadSuccessCallback
    soundsObject[ soundPaths[i] ] = newAudio
  }

  minAllowedInterval = 2; //seconds
  maxAllowedInterval = 60;

  maxAllowedTimer = 30; //minutes
  timerRunning = false;
  
  soundEnabled = false;

  userModifying = false;
  settingsHaveChanged = false;

  scrollOffset = 0
  userScrolling = false;

  playColorTimer = 0;

  if(userSettingsFromURL == null || userSettingsFromURL.version !== currentVersion){
    //Initialize user settings
    console.log("Setting user settings for the first time")
    userSettings = {
      timeRemaining: 5 * 60, //seconds
      version: currentVersion,
    }
    for(let i in soundCategories){
      let category = soundCategories[i]
      let categorySettings = {
        muted: true,
        volume: 0.7,
        minInterval: 5,
        maxInterval: 20
      }
      userSettings[category] = categorySettings
      setURLToUserSettings();
    }
  } else {
    userSettings = userSettingsFromURL
    console.log("Retrieved settings: " + userSettings)
  }

  timeRemaining = userSettings.timeRemaining; // seconds
  
  cursorInBoxAtPress = function(box){
    return collidePointRect(icursor.atPress.x, icursor.atPress.y, box.x, box.y, box.w, box.h)
  }

}

function onLoadComplete(){
  //Set an interval to decrement the timer
  setInterval( ()=>{
    if(timerRunning){
      timeRemaining --;
      if(timeRemaining == 0){
        //console.log("Time's up")
        timerRunning = false;
        soundEnabled = false;
        stopAllSounds();
        completeSound.play();
      }
    }
  }, 1000)

  //Set all sounds to have the volume defined in userSettings
  for(let sound in soundsObject){
    let category = sound.split("/")[1]
    let volume = userSettings[category].volume
    soundsObject[sound].volume = volume
  }

  categoryTimeOfNext = {}
  for(let i in soundCategories){
    categoryTimeOfNext[soundCategories[i]] = 0;
  }
}

function topRect(){
  let s = categoryBox(0).spacing
  return {
    x: 0,
    y: 0,
    w: width,
    h: height * (1/10) + (categoryBox(0).muteRect.w) + (s * 4)
  }
}

function draw(){
  background(0);
  noStroke();
  
  icursor.update();
  
  if(loadedSoundCount == soundPaths.length){
    

    push();
    translate(0, scrollOffset)
    drawCategories();
    pop();
    let s = categoryBox(0).spacing;
    let playWidth = categoryBox(0).muteRect.w
    fill(0);
    rect(0, 0, width, topRect().h )
    fill(255); textAlign(LEFT, CENTER); textSize(width/15);
    text("Trigger Sound Player", s * 4, height * (1/30))
    textSize(width/25)
    if(!icursor.onMobile && icursor.y < timelineBox().y && icursor.y !== null)fill(255,255,0)
    text("By Ike Bischof 🔗", s * 4, height * (1/30) + width * (1.1/15))
    
    //play button
    fill(80)
    if(!soundEnabled && playColorTimer > 0){
      let col1 = color(80);
      let col2 = color(200,50,70);
      let colmix = lerpColor(col1, col2, playColorTimer/60)
      fill(colmix)
      playColorTimer --;
    }
    
    let playRect = playBox();
    rect(playRect.x, playRect.y, playRect.w, playRect.h, playRect.r)
    let playButtonIcon = icons.play
    if(timerRunning || soundEnabled)playButtonIcon = icons.pause
    image(playButtonIcon, playRect.x + s, playRect.y + s, playRect.w - (s*2), playRect.h - (s*2))
    
    //timeline rectangle
    fill(80)
    let timelineRect = timelineBox();
    rect(timelineRect.x,timelineRect.y,timelineRect.w,timelineRect.h,timelineRect.r)
    fill(120);
    let timeRemainingBarWidth = map(timeRemaining, 0, maxAllowedTimer * 60, 0, timelineRect.w)
    rect(timelineRect.x,timelineRect.y,timeRemainingBarWidth,timelineRect.h,timelineRect.r)
    fill(255);
    let sec = timeRemaining % 60
    let min = floor(timeRemaining/60)
    let timelineText = "Time remaining: " + min + "m " + sec + "s"
    if(timeRemaining == 0)
      timelineText = "No Timer"
    text(timelineText, timelineRect.x + (s*2), timelineRect.y + (timelineRect.h * 0.55) )

    if(soundEnabled)updateSounds();

  } else {
    fill(255); textAlign(CENTER); textSize(height/30);
    text("Loading sound files...\n" + loadedSoundCount + "/" + soundPaths.length, width/2, height/2)
  }

  //Check if user is modifying any settings
  
  if(icursor.leftPressed){
    let timelineRect = timelineBox();
    let changingTimer = cursorInBoxAtPress(timelineRect)
    if(changingTimer){
      userModifying = true;
      settingsHaveChanged = true;
      timerRunning = false;
      soundEnabled = false;
      timeRemaining = map(icursor.x, timelineRect.x, timelineRect.x + timelineRect.w, 0, maxAllowedTimer * 60)
      timeRemaining = constrain(round(timeRemaining/60)*60, 0, 60 * maxAllowedTimer)
      userSettings.timeRemaining = timeRemaining;
    }
    if(icursor.y > topRect().h){
      for(let i in soundCategories){
        if( !userSettings[soundCategories[i]].muted ){

          let box = categoryBox(i, true)
          //Check if user is modifying any settings in this box other than mute
          let changingVolume = cursorInBoxAtPress(box.volRect)
          if(changingVolume){
            userModifying = true;
            settingsHaveChanged = true;
            let newVolume = map(icursor.x, box.volRect.x, box.volRect.x + box.volRect.w, 0, 1)
            newVolume = constrain(newVolume, 0, 1)
            userSettings[soundCategories[i]].volume = newVolume;
            //Set all sounds in this category to have this new volume
            for(let sound in soundsObject){
              if(sound.includes(soundCategories[i])){
                soundsObject[sound].volume = newVolume
              }
            }
          }

          let currentMin = userSettings[soundCategories[i]].minInterval;
          let currentMax = userSettings[soundCategories[i]].maxInterval;

          let changingMinInterval = cursorInBoxAtPress(box.minIntervalRect)
          if(changingMinInterval){
            userModifying = true;
            settingsHaveChanged = true;
            let newMinInterval = map(icursor.x, box.minIntervalRect.x, box.minIntervalRect.x + box.minIntervalRect.w, minAllowedInterval, maxAllowedInterval)
            newMinInterval = constrain(newMinInterval, minAllowedInterval, currentMax)
            newMinInterval = round(newMinInterval)
            userSettings[soundCategories[i]].minInterval = newMinInterval;
            pickNewInterval(soundCategories[i])
          }

          let changingMaxInterval = cursorInBoxAtPress(box.maxIntervalRect)
          if(changingMaxInterval){
            userModifying = true;
            settingsHaveChanged = true;
            let newMaxInterval = map(icursor.x, box.maxIntervalRect.x, box.maxIntervalRect.x + box.maxIntervalRect.w, minAllowedInterval, maxAllowedInterval)
            newMaxInterval = constrain(newMaxInterval, currentMin, maxAllowedInterval)
            newMaxInterval = round(newMaxInterval)
            userSettings[soundCategories[i]].maxInterval = newMaxInterval;
            pickNewInterval(soundCategories[i])
          }

        }
        
        
      }
    }
    
  }

  if(icursor.onMobile && userScrolling && !userModifying){
    scrollOffset = scrollOffsetAtPress + (icursor.y - icursor.atPress.y) 
  }
  if(icursor.onMobile && !userScrolling && !userModifying)scrollOffset += icursor.swipeVelocity.y;
  if(scrollOffset > 0)scrollOffset = 0;
  
}

function pickNewInterval(category){
  let min = userSettings[category].minInterval;
  let max = userSettings[category].maxInterval;
  let randomInterval = random(min, max) * 1000
  categoryTimeOfNext[category] = millis() + randomInterval
}

function stopAllSounds(){
  for(let k in soundsObject){
    soundsObject[k].pause()
    soundsObject[k].currentTime = 0;
  }
}

function updateSounds(){
  for(let i in soundCategories){
    let category = soundCategories[i]
    if(!userSettings[category].muted){
      if( millis() > categoryTimeOfNext[category] ){
        //Play a random sound in this category
        let options = []
        for(let i in soundPaths){
          if(soundPaths[i].includes('/' + category + '/'))
            options.push(soundPaths[i])
        }
        let chosenSound = soundsObject[ options[ floor(random(options.length)) ] ]
        chosenSound.play();
        
        
        //Set the next time
        pickNewInterval(category)
        
      }
    }
  }
}

function playBox(){
  let s = categoryBox(0).spacing;
  let playWidth = categoryBox(0).muteRect.w
  return {
    x: s * 3,
    y: height * (1/10) + s,
    w: playWidth,
    h: playWidth,
    r: width/50
  }
}

function timelineBox(){
  let s = categoryBox(0).spacing;
  let p = playBox();
  return {
    x: p.x + p.w + (s * 2),
    y: p.y,
    w: width - (p.x + p.w + (s * 2)) - (s * 4),
    h: p.h,
    r: p.r
  }
}

function drawCategories(){
  for(let i in soundCategories){
    let category = soundCategories[i]
    let settings = userSettings[category]
    let box = categoryBox(i, false);
    let main = box.mainRect;
    let r = width/50
    let s = box.spacing;

    textSize(width/20); textAlign(LEFT, CENTER)
    noStroke(); fill(150);
    if(settings.muted)fill(80)

    rect(main.x, main.y, main.w, main.h, r)

    fill(80);
    if(settings.muted)fill(50)
    let max = box.maxIntervalRect;
    rect(max.x, max.y, max.w, max.h, 0, 0, r, r)

    let min = box.minIntervalRect;
    rect(min.x, min.y, min.w, min.h)

    let vol = box.volRect;
    rect(vol.x, vol.y, vol.w, vol.h)

    let mute = box.muteRect;
    rect(mute.x, mute.y, mute.w, mute.h, r, 0, 0, 0)
    if(settings.muted){
      push();
      tint(180)
      image(icons.soundoff, mute.x + s, mute.y + s, mute.w - (s*2), mute.w - (s*2) )
      pop();
    }
    if(!settings.muted){
      image(icons.soundon, mute.x + s, mute.y + s, mute.w - (s*2), mute.w - (s*2) )
    }
    
    fill(120);
    if(settings.muted)fill(65)
    let barwidth = vol.w * settings.volume;
    rect(vol.x, vol.y, barwidth, vol.h)
    barwidth = map(settings.minInterval, minAllowedInterval, maxAllowedInterval, 0, min.w)
    rect(min.x, min.y, barwidth, min.h)
    barwidth = map(settings.maxInterval, minAllowedInterval, maxAllowedInterval, 0, max.w)
    rect(max.x, max.y, barwidth, max.h, 0, 0, r, r)

    fill(255);
    if(settings.muted)fill(160);
    text(category, mute.x + mute.w + (s * 2), mute.y + (mute.h/2))
    textSize(width/30)
    text("Volume: " + round(settings.volume * 100) + "%", vol.x + (s * 2), vol.y + (vol.h * 0.55) )
    text("Min Interval: " + settings.minInterval + " sec", min.x + (s * 2), min.y + (min.h * 0.55) )
    text("Max Interval: " +  settings.maxInterval + " sec", max.x + (s * 2), max.y + (max.h * 0.55) )
  }
}

function categoryBox(categoryIndex, countingScrollOffset){
  
  let spacing = width/100
  let x = spacing * 6;
  
  let w = width * (3/4)
  let h = width * (0.4)
  let y = (h + (spacing*2) ) * categoryIndex
  y += height * (2/10)

  if(countingScrollOffset)y += scrollOffset;
  
  let barSize = h/5

  
  let mainRect = {x, y, w, h}
  let maxIntervalRect = {x: x + spacing, y: y + h - barSize - spacing, w: w - (spacing*2), h: barSize}
  let minIntervalRect = {x: x + spacing, y: y + h - ((barSize + spacing) * 2), w: w - (spacing*2), h: barSize}
  let volRect = {x: x + spacing, y: y + h - ((barSize + spacing) * 3), w: w - (spacing*2), h: barSize}
  let muteRect = {x: x + spacing, y: y + spacing, w: volRect.y - y - (spacing*2), h: volRect.y - y - (spacing*2)}
  let ret = {mainRect, maxIntervalRect, minIntervalRect, volRect, muteRect, spacing}
  return ret;
}

function mouseWheel(e){
  scrollOffset += Math.sign(e.delta) * (height/10) * -1
  if(scrollOffset > 0)scrollOffset = 0;
}

function cursorClick(b){
  if(b == "left"){
    //Check if user clicked the play button
    let playRect = playBox();
    if(collidePointRect(icursor.x, icursor.y, playRect.x, playRect.y, playRect.w, playRect.h)){
      //Start or stop the timer
      if(!timerRunning && timeRemaining > 0){
        timerRunning = true;
        completeSound.play();
      }
      else if(timerRunning)timerRunning = false;

      soundEnabled = !soundEnabled;
      //console.log("Sound Enabled: " + soundEnabled)
      playColorTimer = 0;
      if(!soundEnabled){
        stopAllSounds();
      }
      if(soundEnabled){
        for(let i in soundCategories){
          pickNewInterval(soundCategories[i])
          //console.log("Setting new interval: " + soundCategories[i])
        }
      }
    } else {
      //Check if user clicked the mute/unmute button on any categories
      for(let i in soundCategories){
        let box = categoryBox(i, true).muteRect
        if(collidePointRect(icursor.x, icursor.y, box.x, box.y, box.w, box.h)){
          userSettings[soundCategories[i]].muted = !userSettings[soundCategories[i]].muted
          playColorTimer = 60;
          if(userSettings[soundCategories[i]].muted){
            for(let j in soundPaths){
              if(soundPaths[j].includes(soundCategories[i]))
                soundsObject[ soundPaths[j] ].pause();
                soundsObject[ soundPaths[j] ].currentTime = 0;
            }
          }
        }
          
      }
    }

    if(icursor.y < timelineBox().y){
      //Go to ikebot website
      let openPermission = confirm("Open the Ikebot website in a new tab?")
      if(openPermission)window.open("https://ikebot.dev/", "_blank")
    }

  }
  
}

function touchPressStart(b){
  userScrolling = true
  scrollOffsetAtPress = scrollOffset;
}

function cursorPressEnd(b){
  userScrolling = false;
  userModifying = false;
  if(settingsHaveChanged){
    setURLToUserSettings();
    settingsHaveChanged = false;
    console.log("Updated URL to user settings")
  }
}
