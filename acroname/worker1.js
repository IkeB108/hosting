function getResultText(matchingWords){
  let resultText = ""
  let matchingWordsKeys = Object.keys(matchingWords)
  matchingWordsKeys.sort( (a, b) => {return b.length - a.length} )
  for(let k in matchingWordsKeys){
    let namesList = sortNamesByWord(matchingWords[ matchingWordsKeys[k] ].split(" "), matchingWordsKeys[k]).join(", ")
    resultText += matchingWordsKeys[k] + ": " + namesList + "\n"
  }
  if(resultText == "")resultText = "No matching words."
  return resultText;
  //Put all results in the resultsP element
}

function sortNamesByWord(namesList, wordString){
  let sortedNames = []
  let availableNames = namesList.slice();
  for(let i in wordString){
    let letterFound = false;
    for(let j in namesList){
      if(!letterFound && namesList[j][0].toLowerCase() == wordString[i].toLowerCase() && availableNames.includes(namesList[j])){
        availableNames.splice( availableNames.indexOf(namesList[j]), 1 )
        sortedNames.push(namesList[j])
        letterFound = true;
      }
    }
  }
  return sortedNames;
}

function getCombn(arr, pre) {
  pre = pre || '';
  
  if (!arr.length) {
      return pre;
  }
  
  let ans = arr[0].reduce(function (ans, value) {
      return ans.concat(getCombn(
          arr.slice(1), pre + value));
  }, []);
  return ans;
}

onmessage = (e) => {
  //User has clicked generate acronyms button.
  
  //Get full names from textarea
  let namesInputVal = e.data[0];
  let wordList = e.data[1];
  let minLetterSliderVal = e.data[2];
  let includeMultipleSpellings = e.data[3];
  fullNames = namesInputVal.split("\n")
  
  //Remove any lines that are empty
  fullNames = fullNames.filter(element => (element != "") )
  
  //Create a pruned word list by removing words that can't possibly be used
  postMessage([
    "status text",
    "Creating pruned word list..."
  ])
  
  //Step 1: Calculate the min & max number of letters a usable word can have
  maximumWordLength = fullNames.length
  if(minLetterSliderVal > maximumWordLength){
    postMessage(["setMinLetterSlider", maximumWordLength])
    minLetterSliderVal = maximumWordLength;
  }
  
  minimumWordLength = fullNames.filter( e => !e.includes("[") && !e.includes("]")).length
  if(minimumWordLength < minLetterSliderVal )minimumWordLength = minLetterSliderVal;
  
  //Step 2: Create an array of usable letters. Words that include unusable letters can be eliminated.
  usableLetters = []
  for(let i in fullNames){
    let nameWithoutBrackets = fullNames[i].replaceAll("[", "").replaceAll("]", "").split(" ")
    for(let j in nameWithoutBrackets){
      let initial = nameWithoutBrackets[j][0].toLowerCase()
      if(!usableLetters.includes(initial))usableLetters.push(initial)
    }
  }
  //Step 3: Eliminate words that are the wrong length or include unusable letters
  prunedWordList = []
  for(let i in wordList){
    if(wordList[i].length >= minimumWordLength &&
    wordList[i].length <= maximumWordLength){
      //Word is the correct length. Check if it has unusable letters
      let hasUnusableLetters = false;
      for(let j in wordList[i]){
        if( !usableLetters.includes(wordList[i][j].toLowerCase()) )hasUnusableLetters = true;
      }
      if(!hasUnusableLetters){
        prunedWordList.push(wordList[i])
      }
    }
  }
  
  let nameCombinations = [];
  
  //If the pruned word list is empty, then there are no possible acronames and we don't need to go any further.
  if(prunedWordList.length == 0){
    postMessage(["alert", "No words can be spelt with this list of names. Try making some names optional with [brackets], or try adding middle names or nick-names."])
  } else {
    //There is at least one word in the pruned word list, so continue.
    
    //Get all combinations of names
    let combnSettings = []
    for(let i in fullNames){
      //If the full name has brackets, then it is deemed optional by the user.
      fullNameIsOptional = fullNames[i].includes("[") || fullNames[i].includes("]");
      
      fullNames[i] = fullNames[i].replaceAll("[", "").replaceAll("]", "") //Remove brackets if any
      
      
      let splitName = fullNames[i].split(" ")
      for(let i in splitName){
        splitName[i] += " "
      }
      if(fullNameIsOptional)splitName.push(""); //Add an empty option if the full name is optional
      combnSettings.push(splitName)
    }
    
    nameCombinations = getCombn(combnSettings)
  }
  
  //Search all name combinations to see if any of them
  //have the same letters as a word in the pruned word list
  matchingWords = {}
  for(let i in nameCombinations){
    
    //Get initials of this name combination and sort alphabetically
    let s = nameCombinations[i].split(" ").filter(element => (element != "") )
    let letters = []
    s.forEach( element => { 
      letters.push( element[0].toLowerCase() )
    } )
    letters = letters.sort().join("")
    
    //Search the pruned word list for matches with this combination
    for(let j in prunedWordList){
      let sortedWord = prunedWordList[j].toLowerCase().split("").sort().join("")
      if(sortedWord == letters){
        //We've got a matching word.
        
        matchingWords[prunedWordList[j]] = nameCombinations[i];
        // let repeatIndex = 0;
        // while(matchingWords.hasOwnProperty(prunedWordList[j] + "_" + repeatIndex.toString()) && includeMultipleSpellings){
        //   repeatIndex ++;
        // }
        // matchingWords[ prunedWordList[j] + "_" + repeatIndex] = nameCombinations[i]
      }
    }
    let asteriskCount = Math.round((i / nameCombinations.length) * 20);
    let percentage = Math.round((i / nameCombinations.length) * 100);
    let loadingBarText = "[" + "*".repeat(asteriskCount) + "_".repeat(20-asteriskCount) + "] " + percentage + "%"
    if(i % 100 == 0 || i == nameCombinations.length - 1){
      postMessage([
        "status text",
        `Pruned word list has ${prunedWordList.length} words.\nTesting ${nameCombinations.length} potential name combinations: ${letters}\n${loadingBarText}\nWords found:${Object.keys(matchingWords).length}`
      ])
      
      postMessage([
        "results text",
        getResultText(matchingWords)
      ])
    }
  }
  
  postMessage(["complete progress", matchingWords])
}