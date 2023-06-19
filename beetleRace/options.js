function dispOptionsScreen(){
  image(emptyBG, 0, 0, gWidth, gHeight);
  var textColor = color(255);
  var highlightBoxColor = color(0,100);
  textAlign(CENTER,CENTER); textSize(12);
  noStroke();fill(textColor);text('OPTIONS', gWidth/2,gHeight*(1/8));

  soundToggleBox = centerRect(gWidth/2, gHeight*(3/8),150,20)
  musicToggleBox = centerRect(gWidth/2, gHeight*(4/8),150,20)
  lightSensitiveToggleBox = centerRect(gWidth/2, gHeight*(5/8),150,20)
  backBox = centerRect(gWidth/2, gHeight*(6/8),150,20)
  musicByBox = centerRect(gWidth/2, gHeight*(7/8),150,20)

  if(mouseOverBox(soundToggleBox)){fill(highlightBoxColor);dispBox(soundToggleBox)}
  if(soundOn){fill(textColor);text('Sound: On', soundToggleBox[0]+soundToggleBox[2]/2, soundToggleBox[1]+soundToggleBox[3]/2 - 2.5)}
  if(!soundOn){fill(textColor);text('Sound: Off', soundToggleBox[0]+soundToggleBox[2]/2, soundToggleBox[1]+soundToggleBox[3]/2 - 2.5)}

  if(mouseOverBox(musicToggleBox)){fill(highlightBoxColor);dispBox(musicToggleBox)}
  if(musicOn){fill(textColor);text('Music: On', musicToggleBox[0]+musicToggleBox[2]/2, musicToggleBox[1]+musicToggleBox[3]/2 - 2.5)}
  if(!musicOn){fill(textColor);text('Music: Off', musicToggleBox[0]+musicToggleBox[2]/2, musicToggleBox[1]+musicToggleBox[3]/2 - 2.5)}

  if(mouseOverBox(lightSensitiveToggleBox)){fill(highlightBoxColor);dispBox(lightSensitiveToggleBox)}
  if(lightSensitive){fill(textColor);text('Flashing Lights: Off', lightSensitiveToggleBox[0]+lightSensitiveToggleBox[2]/2, lightSensitiveToggleBox[1]+lightSensitiveToggleBox[3]/2 - 2.5)}
  if(!lightSensitive){fill(textColor);text('Flashing Lights: On (Default)', lightSensitiveToggleBox[0]+lightSensitiveToggleBox[2]/2, lightSensitiveToggleBox[1]+lightSensitiveToggleBox[3]/2 - 2.5)}

  if(mouseOverBox(backBox)){fill(highlightBoxColor);dispBox(backBox)}
  fill(textColor);text('Back', backBox[0]+backBox[2]/2,backBox[1]+backBox[3]/2 - 2.5)

  if(mouseOverBox(musicByBox)){fill(highlightBoxColor);dispBox(musicByBox)}
  textSize(8);
  fill(textColor);text('Music by Sawsquarenoise (Click here)', musicByBox[0]+musicByBox[2]/2,musicByBox[1]+musicByBox[3]/2 - 2.5)

}
