function handle_image_file(event){
  //This is called on the user choosing a file via the 
  // choose image file button OR by dragging and dropping in an image
  // on create1
  if(event.type !== "image"){
    alert("You must choose an image file (PNG, JPG, JPEG, GIF, etc).")
  } else {
    //Don't set "image_file_selected" to true until the file has loaded in
    loading_screen = true;
    setTimeout( () => {
      chosen_image = createImg(event.data, '');
      chosen_image.hide();
      
      setTimeout(() => {  
        chosen_image_graphic = createGraphics(chosen_image.width, chosen_image.height);
        chosen_image_graphic.pixelDensity(1);
        chosen_image_graphic.image(chosen_image, 0, 0)
        cig = chosen_image_graphic
        image_file_selected = true;
        loading_screen = false;
      }, 200)
      
    }, 200)
  }
}

function setupSpecialImage(imgFileName){
  choseSpecialImage = true;
  chosen_image = loadImage(imgFileName, chosen_image =>{
    chosen_image_graphic = createGraphics(chosen_image.width, chosen_image.height);
    chosen_image_graphic.pixelDensity(1);
    chosen_image_graphic.image(chosen_image, 0, 0)
    cig = chosen_image_graphic
    image_file_selected = true;
    loading_screen = false;
    current_screen = 'decode1'
  } )
}

function handle_file(event){
  //This is called on the user choosing a file via the 
  // choose image file button OR by dragging and dropping in an image
  // on create2
  loading_screen = true;
  var fileNameSplit = event.name.split('.')
  chosen_file_extension = fileNameSplit[fileNameSplit.length-1].toLowerCase()
  var file_valid = true;
  if(chosen_file_extension.length > 6){
    file_valid = false;
    alert("You have chosen a file with this extension: " + chosen_file_extension + "\nFiles with extensions that are longer than six characters are not allowed.")
  }
  var valid_extension_chars = "0123456789abcdefghijklmnopqrstuvwxyz_"
  var invalid_char = false;
  for(var i = 0; i < chosen_file_extension.length; i ++){
    if( !valid_extension_chars.includes(chosen_file_extension[i]) ){
      file_valid = false;
      invalid_char = true;
    }
  }
  if(invalid_char)alert("You have chosen a file with this extension: " + chosen_file_extension + "\nThe extension contains an invalid character. Extensions can only have numbers, letters, and underscores.");
  if(!file_valid)loading_screen = false;
  if(file_valid){
    useImage = true;
    if(event.size >= 100000){
      var fileSize = humanFileSize(event.size, true)
      useImage = confirm("Files larger than 100 KB are not recommended. The file you've chosen is " + fileSize + ". Use this file anyway?")
      if(!useImage)loading_screen = false;
    }
    if(useImage){
      setTimeout( () => {
        chosen_file = event;
        fileTo64();
        file_selected = true;
        loading_screen = false;
      }, 500)
    }
  }
}

function onDragOver(){
  dragging_over_canvas = true;
}
function onDragLeave(){
  dragging_over_canvas = false;
}
function onDrop(event){
  dragging_over_canvas = false;
  if(current_screen == "create1")handle_image_file(event)
  if(current_screen == "decode1")handle_image_file(event)
  if(current_screen == "create2")handle_file(event)
}
function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}
