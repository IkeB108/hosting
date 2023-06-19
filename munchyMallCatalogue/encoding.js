/*
BOOK TYPES:
Buy (0), sell (1), buy lite (2), sample (3)

*/
function encodeDate(d, m, y, setRand, bookType){
  var dayi = replace0with32(d-1)
  var monthi = replace0with32(m-1)
  var yeari = replace0with32(y-2001)
  var n = primes[dayi] * primes[monthi] * primes[yeari]
  var ord = dateOrder(dayi, monthi, yeari)
  /*the prime number 37 will be a placeholder for the number 2
  because the quantity of 2s will be used as an indicator for day month year order
  */
  //console.log(ord)
  var pow2 = 0;
  if(ord == 'day month year')pow2 = 0;
  if(ord == 'day year month')pow2 = 1;
  if(ord == 'month day year')pow2 = 2;
  if(ord == 'month year day')pow2 = 3;
  if(ord == 'year day month')pow2 = 4;
  if(ord == 'year month day')pow2 = 5;
  n *= Math.pow(2, pow2)
  /*tack on two extra digits; n will be multiplied
  by this random number between 10 and 99. That way every keycode is unique.
  */
  var randMult = ceil(random(10, 98))
  if(setRand)randMult = setRand; //99 will be the multiplier for a date-encoded URL
  if(setRand != 99){
    randMult = nearestMultipleOf(4, randMult)
    if(bookType == 'buy')randMult += 0;
    if(bookType == 'sell')randMult += 1;
    if(bookType == 'buy lite')randMult += 2;
    if(bookType == 'sample')randMult += 3;
  }
  //console.log('set randmult to ' + randMult%4)
  n *= randMult;
  n = int(n.toString() + randMult.toString())
  if(setRand && setRand == 99)return n.toString();
  //return NumberToLetters(n)
  return n;
}
function decodeDate(n){
  n = LettersToNumber(n)
  var nstring = n.toString();
  //remove the last two digits from the number. this is the randMult
  var randMult = nstring.slice(-2)
  //console.log(randMult)
  //console.log(randMult)
  if(randMult%4==0)var bookType = 'buy';
  if(randMult%4==1)var bookType = 'sell';
  if(randMult%4==2)var bookType = 'buy lite';
  if(randMult%4==3)var bookType = 'sample';

  nstring = nstring.slice(0, -2);
  //console.log(nstring)
  n = int(int(nstring)/randMult)
  var decom = primeDecompose(n)
  var count2 = 0;
  var newDecom = []
  for(var i = 0; i < decom.length; i ++){
    if(decom[i] == 2)count2 ++;
    if(decom[i] == primes[32])newDecom.push(2)
    if(decom[i] != 2 && decom[i] != primes[32])newDecom.push(decom[i])
    //count how many 2s there are
  }
  if(count2 == 0)ord = 'day month year'
  if(count2 == 1)ord = 'day year month'
  if(count2 == 2)ord = 'month day year'
  if(count2 == 3)ord = 'month year day'
  if(count2 == 4)ord = 'year day month'
  if(count2 == 5)ord = 'year month day'

  //newDecom is now sorted correctly with all 2s back in place
  var d;
  var m;
  var y;
  if(ord == 'day month year'){d = newDecom[0]; m = newDecom[1]; y = newDecom[2];}
  if(ord == 'day year month'){d = newDecom[0]; m = newDecom[2]; y = newDecom[1];}
  if(ord == 'month day year'){d = newDecom[1]; m = newDecom[0]; y = newDecom[2];}
  if(ord == 'month year day'){d = newDecom[2]; m = newDecom[0]; y = newDecom[1];}
  if(ord == 'year day month'){d = newDecom[1]; m = newDecom[2]; y = newDecom[0];}
  if(ord == 'year month day'){d = newDecom[2]; m = newDecom[1]; y = newDecom[0];}
  d = primeIndex(d) + 1;
  m = primeIndex(m) + 1;
  y = primeIndex(y) + 2001;
  return {'day':d, 'month':m, 'year':y, 'type':bookType}
}
function primeDecompose(n) {
  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
}
function dateOrder(d, m, y){
  /*
  returns the string 'day month year', ordered by which
  value is smallest. (Smallest = first)
  day month year
  day year month
  month day year
  month year day
  year day month
  year month day
  */
  var day = d
  var month = m
  var year = y
  if(day <= month && month <= year){
    return 'day month year'
  }
  if(day <= year && year <= month){
    return 'day year month'
  }
  if(month <= day && day <= year){
    return 'month day year'
  }
  if(month <= year && year <= day){
    return 'month year day'
  }
  if(year <= day && day <= month){
    return 'year day month'
  }
  if(year <= month && month <= day){
    return 'year month day'
  }
}
function replace0with32(n){
  if(n == 0)return 32;
  return n;
}
function primeIndex(n){
  //given a prime n, return the index of n in the primes list
  //var ret = 0;
  var pLength = Object.keys(primes).length
  for(var i = 0; i < 35; i ++){
    if(primes[i] == n)return i;
  }
  //return ret;
}
function checkMatch(d, m, y, t){
  /*checks if this date can be successfully encoded and decoded*/
  var n = encodeDate(d, m, y, 5, t)

  var newDate = decodeDate(n.toString() );
  if(newDate.day == d && newDate.month == m && newDate.year == y && newDate.type == t){
    return 'success'
  } else {
    //console.log(n[0])
    //console.log(newDate)
    return 'failure'
  }
}
function checkMatches(n){
  //check matches n times.
  var d; var m; var y; var t;
  for(var i = 0; i < n; i ++){
    d = ceil(random(1,31))
    m = ceil(random(1, 12))
    y = ceil(random(2001,2030))
    var x = floor(random(0,4))
    if(x==0)t = 'buy';
    if(x==1)t = 'sell';
    if(x==2)t = 'buy lite';
    if(x==3)t = 'sample';
    checkMatch(d, m, y, t)
  }

}

function containsIllegals(toExamine){
  var allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for(var i = 0; i < toExamine.length; i ++){
    if(!contains(toExamine[i], allowedChars))return true;
  }
  return false;
}

function LettersToNumber(letterString){
  /*
  abc = 2
  def = 3
  ghi = 4
  jkl = 5
  mno = 6
  pqrs = 7
  tuv = 8
  wxyz = 9

  */
  var ret = ''
  for(var i = 0; i < letterString.length; i ++){
    if( contains(letterString[i], 'abc') )ret += '2'
    if( contains(letterString[i], 'def') )ret += '3'
    if( contains(letterString[i], 'ghi') )ret += '4'
    if( contains(letterString[i], 'jkl') )ret += '5'
    if( contains(letterString[i], 'mno') )ret += '6'
    if( contains(letterString[i], 'pqrs') )ret += '7'
    if( contains(letterString[i], 'tuv') )ret += '8'
    if( contains(letterString[i], 'wxyz') )ret += '9'
    if( contains(letterString[i], '0123456789'))ret += letterString[i]
  }
  return int(ret);
}
function NumberToLetters(n){
  var wcount = Object.keys(englishWords).length
  var results = []
  var resultsWithN = []
  for(var w = 0; w < wcount;  w ++){
    var wn = LettersToNumber(englishWords[w]).toString();
    n = n.toString();
    if( n.includes(wn)){
      var wnIndex = n.match( RegExp(wn) ).index
      var wordWithN = replaceRange(n, wnIndex, wnIndex + wn.length, englishWords[w])


      results.push(
        {'word':englishWords[w],
        'wordWithN':wordWithN}
      )
    }
  }
  results.sort((a,b) => b.word.length - a.word.length);

  var ret = []
  for(var i = 0; i < constrain(results.length, 0, 10); i ++){
    ret.push(results[i].wordWithN)
  }

  return ret;
}
function replaceRange(s, start, end, substitute) {
    return s.substring(0, start) + substitute + s.substring(end);
}

function encodeDateAll(d, m, y, type){
  var allCodes = []
  for(var i = 10; i < 99; i ++){
    var newCodes = encodeDate(d, m, y, i, type)
    allCodes = allCodes.concat(newCodes)
  }
  allCodes.sort((a,b) => letterCount(b) - letterCount(a))
  return allCodes

}

/*function myFunction(){
  var ret = []
  var wcount = Object.keys(englishWords).length
  for(var i = 0; i < wcount; i ++){
    if(englishWords[i].length >= 3 && containsVowel(englishWords[i])){
      ret.push(englishWords[i])
    }
  }
  return ret;
}*/

function containsVowel(myString){
  var vowels = 'aeiouy'
  for(var i = 0; i < vowels.length; i ++){
    if( contains(vowels[i], myString) )return true;
  }
  return false;
}

function letterCount(myString){
  var letters = 'abcdefghijklmnopqrstuvwxyz'
  var ret = 0
  for(var i = 0; i < letters.length; i ++){
    for(var j = 0; j < myString.length; j ++){
      if(myString[j] == letters[i])ret ++;
    }
  }
  return ret;
}

function nearestMultipleOf(a, n){
  var ret = a;
  for(var i = 0; i < ceil(2 * n / a); i ++){
    if( abs( (a * i) - n) < abs(ret - n) ){
      ret = a * i
    }
  }
  ret = constrain(ret, 12, 96)
  return ret;
}

function numbersOnly(myString){
  var allowed = '0123456789'
  var ret = ''
  for(var i = 0; i < myString.length; i ++){
    if(contains(myString[i], allowed))ret += myString[i]
  }
  return ret;
}

primes = [
  2,
  3,
  5,
  7,
  11,
  13,
  17,
  19,
  23,
  29,
  31,
  37,
  41,
  43,
  47,
  53,
  59,
  61,
  67,
  71,
  73,
  79,
  83,
  89,
  97,
  101,
  103,
  107,
  109,
  113,
  127,
  131,
  137,
  139,
  149,
  151,
  157,
  163,
  167,
  173
]
