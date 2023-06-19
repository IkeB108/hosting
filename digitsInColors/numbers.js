

//The following code is copied from the first Jacob Diagram
//program so please don't ask me to explain it
const isPrime = num => {
    if(allowed_composites.includes(num) )return true;
    for(let i = 2, s = Math.sqrt(num); i <= s; i++)
        if(num % i === 0) return false; 
    return num > 1;
}

function getPrimeFactors(given){
  if(given <= 1){
    return given;
  }
  factorsOfGiven = []
  remaining = given;
  while(!isPrime(remaining)){
    remainingFactors = getFactors(remaining)
    divideBy = remainingFactors[remainingFactors.length - 1]
    while(!isPrime(divideBy)){
      remainingFactors = del(remainingFactors.length - 1, remainingFactors)
      divideBy = remainingFactors[remainingFactors.length - 1]
    }
    factorsOfGiven.push(divideBy);
    remaining /= divideBy
  }
  factorsOfGiven.push(remaining)
  //reverse(factorsOfGiven)
  return factorsOfGiven;
}

function getFactors(given){
  ret = [];
  for(var i = 2; i < given; i ++){
    if(given/i == round(given/i) && given != i){
      ret.push(i)
    }
  }
  return ret;
}

function setNumber(n){
  number_to_draw = n;
  ntd_factors = getPrimeFactors(number_to_draw);
  ntd_radii = getPreferredRadii();
  
  //Calculate how many shapes will be in this drawing so we know whether we should do iterated_drawing
  var number_of_shapes = 0;
  var multiplier = 1;
  for(var i = 0; i < ntd_factors.length; i ++){
    if(number_of_shapes <= 1000){
      number_of_shapes += multiplier;
      multiplier *= ntd_factors[i]
    }
  }
  if(number_of_shapes > 1000){
    //Use iterated_drawing
    sg.clear();
    iterated_drawing_frame = 0; 
  } else {
    iterated_drawing_frame = -2;
  }
  cycling_layers = []
  factor_list_offset = 0;
}
