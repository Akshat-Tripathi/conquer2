function getCountryCodes(countrycode) {
  var fs = require("fs");
  //enter country to search
  var textByLine = fs.readFileSync("../maps/world.txt").toString().split("\n");
  var countriesBordering = [];

  for (let j = 0; j < textByLine.length; j++) {
    var borders = textByLine[j].split(" ");
    if (borders[0] == countrycode) {
      for (let i = 1; i < borders.length; i++) {
        //Get border codes
        countriesBordering.push(borders[i]);
      }
    }
  }
  return countriesBordering;
}

console.log(getCountryCodes("UK").includes("FR"));
