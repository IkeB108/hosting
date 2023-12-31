/*
filesToLoadObject = {
  exampleFile1: ["filepath.png", loadImage, successCallback, failCallback ],
  exampleFile2: [ loadJSON, "filepath.json", successCallback, failCallback ],
  exampleFile3: "filepath.txt"
}

dumpObject = {...} // Optional: Object that loaded files will be bound to (defaults to window so that they are global variables)
hideAutofills = false // Optional: if true, auto-filled files will not be logged to console
*/
function FileLoader( filesToLoadObject, dumpObject = window, hideAutofills ){
  this.successCount = 0;
  this.failCount = 0;
  this.progress = 0;
  this.completion =  Object.keys(filesToLoadObject).length ;
  if(this.completion == 0)this.complete = true;
  else this.complete = false;
  
  let thisCopy = this;
  let defaultSuccessCallback = () => {
    
  };
  let defaultFailCallback = (e) => {
    console.error(e)
  };
  
  let _checkForCompletion = function() {
    if(thisCopy.progress == thisCopy.completion){
      thisCopy.complete = true;
      if(typeof onLoadComplete === "function")onLoadComplete();
    }
  }
  
  let _autoDetectLoaderLog = 'Autodetected files:\n';
  
  let _primarySuccessCallback = function( e, fileSuccessCallback ){
    thisCopy.successCount ++;
    thisCopy.progress ++
    fileSuccessCallback(e);
    _checkForCompletion();
  }
  let _primaryFailCallback = function( e, fileFailCallback, fileName ){
    console.warn("FAILED TO LOAD FILE " + fileName)
    thisCopy.progress ++
    fileFailCallback(e);
    _checkForCompletion();
  }
  let _filesList = {};
  
  let _itemsThatMeet_multiple = function(myArray, list_of_funcs, return_indeces) {
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
  
  let _itemsThatMeet = function(arr1, function_returns_boolean, return_indeces){
    if(typeof function_returns_boolean == "object"){ //array
      return _itemsThatMeet_multiple( arr1, function_returns_boolean, return_indeces )
    } else {
      var rets = [];
      for(var i = 0; i < arr1.length; i ++){
        if( function_returns_boolean(arr1[i]) ){
          if(return_indeces)rets.push(i)
          else rets.push(arr1[i])
        }
      }
      if(rets.length == 1)rets = rets[0];
      if(rets.length == 0){rets = null;}
      return rets;
    }
  }
  
  for(i in filesToLoadObject){
    let f = filesToLoadObject[i];
    
    let thisFileName = null;
    let thisFileSuccessCallback = null;
    let thisFileFailCallback = null;
    let thisLoader = null;
    
    if(typeof f == "string"){
      thisFileName = f;
    }
    if(typeof f == "object"){ //assume it's an array
      let ordered_f = _itemsThatMeet(f, [
        (n)=>{return typeof n == "string"},
        (n)=>{return typeof n == "function" && n.name == "bound "},
      ], true)
      
      let fCopy = [...f]
      let index_of_loader = ordered_f[1];
      if(index_of_loader !== null){
        thisLoader = f[index_of_loader]
        fCopy.splice(index_of_loader, 1)
      }
      for(let i of fCopy){
        if(typeof i == "string")thisFileName = i;
        if(typeof i == "function"){
          if(thisFileSuccessCallback == null)
          thisFileSuccessCallback = i; //assume successCallback comes before failCallback
          else
          thisFileFailCallback = i;
        }
      }
    }
    
    if(thisFileName == null){
      thisFileName = "NameNotProvided.txt";
      thisLoader = loadStrings
      console.error("File path for " + i + " was not provided.")
    }
    if(thisLoader == null){
      let thisFileExtension = thisFileName.split('.')
      thisFileExtension = thisFileExtension[thisFileExtension.length - 1]
      let fileExtensionKey = {
        Image: "jpg jpeg png gif webp tiff psd raw bmp heif indd svg ai eps pdf",
        Font: "otf ttf",
        Model: "obj stl",
        Shader: "vert frag",
        "JSON": "json",
        Table: "csv ods",
        "XML": "docx xlsx pptx doc xls ppt docm xlsm pptm",
        Strings: "txt",
        Sound: "mp3 wav ogg"
      }
      for(j in fileExtensionKey){
        if( fileExtensionKey[j].includes(thisFileExtension) ){
          let loaderFunctionName = "load" + j
          // console.log("Loader function for " + thisFileName + " was not specified; " + loaderFunctionName + " will be used")
          _autoDetectLoaderLog += thisFileName + " => " + loaderFunctionName + "\n"
          thisLoader = window[loaderFunctionName]
        }
      }
      if(thisLoader === null){ //If file type still unknown, use loadBytes()
        _autoDetectLoaderLog += thisFileName + " => loadBytes (unknown filetype)\n"
        thisLoader = loadBytes
      }
    }
    if(thisFileSuccessCallback == null)thisFileSuccessCallback = defaultSuccessCallback;
    if(thisFileFailCallback == null)thisFileFailCallback = defaultFailCallback;
    
    _filesList[i] = {
      fileName: thisFileName,
      loader: thisLoader,
      successCallback: thisFileSuccessCallback,
      failCallback: thisFileFailCallback
    }
    
  }
  for(let fileName in _filesList){
    let f = _filesList[fileName]
    dumpObject[fileName] = f.loader(
      f.fileName,
      (e) => _primarySuccessCallback(e, f.successCallback) ,
      (e) => _primaryFailCallback(e, f.failCallback, f.fileName)
    )
  }
  if(_autoDetectLoaderLog !== "Autodetected files:\n" && !hideAutofills)
  console.log(_autoDetectLoaderLog)
}

function SoundElementLoader( filesToLoadObject, dumpObject = window){
  let thisCopy = this;
  
  this.successCount = 0;
  this.failCount = 0;
  this.progress = 0;
  this.complete = false;
  this.completion = Object.keys(filesToLoadObject).length;
  
  let fileExtensionKey = {
    Image: "jpg jpeg png gif webp tiff psd raw bmp heif indd svg ai eps pdf",
    Font: "otf ttf",
    Model: "obj stl",
    Shader: "vert frag",
    "JSON": "json",
    Table: "csv ods",
    "XML": "docx xlsx pptx doc xls ppt docm xlsm pptm",
    Strings: "txt",
    Sound: "mp3 wav ogg",
  }
  
  let _itemsThatMeet_multiple = function(myArray, list_of_funcs, return_indeces) {
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
  
  let _itemsThatMeet = function(arr1, function_returns_boolean, return_indeces){
    if(typeof function_returns_boolean == "object"){ //array
      return _itemsThatMeet_multiple( arr1, function_returns_boolean, return_indeces )
    } else {
      var rets = [];
      for(var i = 0; i < arr1.length; i ++){
        if( function_returns_boolean(arr1[i]) ){
          if(return_indeces)rets.push(i)
          else rets.push(arr1[i])
        }
      }
      if(rets.length == 1)rets = rets[0];
      if(rets.length == 0){rets = null;}
      return rets;
    }
  }
  
  let _filesList = [];
  
  for(i in filesToLoadObject){
    let f = filesToLoadObject[i];
    
    let thisFileName = null;
    let thisFileSuccessCallback = null;
    let thisFileFailCallback = null;
    let thisLoader = null;
    
    if(typeof f == "string"){
      thisFileName = f;
    }
    if(typeof f == "object"){ //assume it's an array
      let ordered_f = _itemsThatMeet(f, [
        (n)=>{return typeof n == "string"},
        (n)=>{return typeof n == "function" && n.name == "bound "},
      ], true)
      
      let fCopy = [...f]
      let index_of_loader = ordered_f[1];
      if(index_of_loader !== null){
        thisLoader = f[index_of_loader]
        fCopy.splice(index_of_loader, 1)
      }
      for(let i of fCopy){
        if(typeof i == "string")thisFileName = i;
        if(typeof i == "function"){
          if(thisFileSuccessCallback == null)
          thisFileSuccessCallback = i; //assume successCallback comes before failCallback
          else
          thisFileFailCallback = i;
        }
      }
    }
    
    if(thisFileName == null){
      thisFileName = "NameNotProvided.txt";
      thisLoader = loadStrings
      console.error("File path for " + i + " was not provided.")
    }
    if(thisLoader == null){
      let thisFileExtension = thisFileName.split('.')
      thisFileExtension = thisFileExtension[thisFileExtension.length - 1]
      for(j in fileExtensionKey){
        if( fileExtensionKey[j].includes(thisFileExtension) ){
          let loaderFunctionName = "load" + j
          // console.log("Loader function for " + thisFileName + " was not specified; " + loaderFunctionName + " will be used")
          thisLoader = window[loaderFunctionName]
        }
      }
      if(thisLoader === null){ //If file type still unknown, use loadBytes()
        thisLoader = loadBytes
      }
    }
    if(thisFileSuccessCallback == null)thisFileSuccessCallback = () => {}
    if(thisFileFailCallback == null)thisFileFailCallback = () => {}
    
    _filesList[i] = {
      fileName: thisFileName,
      loader: thisLoader,
      successCallback: thisFileSuccessCallback,
      failCallback: thisFileFailCallback
    }
    
  }
  
  let getElementTag = (filepath) => {
    let ext = filepath.split(".")
    ext = ext[ ext.length - 1 ]
    let tag = null
    for(let i in fileExtensionKey){
      if( fileExtensionKey[i].includes(ext) ){
        if( i == "Sound")tag = "audio";
      }
    }
    return tag;
  }
  
  for(let i in _filesList){
    let f = _filesList[i]
    let src = f.fileName
    let tag = getElementTag( src )
    let e = document.createElement( tag )
    e.hidden = true;
    e.id = src;
    
    if(tag == "audio"){
      
      e.src = src;
      
      e.oncanplaythrough = (ev) => {
        if(thisCopy.progress <= thisCopy.completion){
          
          thisCopy.successCount ++
          thisCopy.progress ++;
          if(thisCopy.progress == thisCopy.completion){
            thisCopy.complete = true;
            if(typeof onSoundElementLoadComplete !== "undefined"){
              onSoundElementLoadComplete();
            }
          }
          f.successCallback();
          
        }
      }
      
      e.onerror = () => {
        thisCopy.failCount ++
        thisCopy.progress ++
        if(thisCopy.progress >= thisCopy.completion)
        thisCopy.complete = true;
        f.failCallback();
      }
      
      e.load();
      
    } else {
      
      let ext = src.split(".")
      ext = ext[ ext.length - 1 ]
      console.error("The filetype " + ext + " is not supported by soundElementLoader. Only mp3, wav, and ogg are accepted.")
      
    }
    
    dumpObject[ i ] = e;
    
  }
  
}
