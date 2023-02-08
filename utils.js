const lodash = require("lodash");

const updateProgressBar = lodash.throttle(function (str) {
  if (process.stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(str);
  }
}, 1000);

function warning(str) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log(`\x1B[31m${str}\x1B[37m`);
}

function fatalError(error) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  console.log(`\x1B[31m${error}\x1B[37m`);
  process.exit();
}

function getLineSeparator(chunkString) {
  const lfSepIndex = chunkString.indexOf("\n");
  const crlfSepIndex = chunkString.indexOf("\r\n");

  if (crlfSepIndex !== -1) return "\r\n";
  else if (lfSepIndex !== -1) return "\n";
  return "\r";
}

async function getValueDelimiter({ chunkString, lineSeparator }) {
  return new Promise((resolve) => {
    //try to detect delimiter automatically
    const delimiters = [",", "\t", ";", " ", "|"];
    const firstLine = chunkString.slice(0, chunkString.indexOf(lineSeparator));

    for (let delimiter of delimiters) {
      const indexOfDelimiter = firstLine.indexOf(delimiter);
      if (indexOfDelimiter !== -1) {
        return resolve(firstLine[indexOfDelimiter]);
      }
    }
    //ask user to send a delimiter if it hasn't been found automatically
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    warning(`Auto-detection of values delimiter has failed.`);

    readline.question(`Enter the delimiter in double quotes: `, (delimiter) => {
      const validationResult = validateDelimiter(delimiter);
      if (validationResult.isCorrect) resolve(validationResult.delimiter);
      else fatalError("Wrong separator");
      readline.close();
    });
  });
}

function validateDelimiter(delimiter) {
  if (
    delimiter[delimiter.length - 1] === delimiter[0] &&
    delimiter[0] === `"` &&
    delimiter.length >= 3
  ) {
    return {
      isCorrect: true,
      delimiter: delimiter.slice(1, delimiter.length - 1),
    };
  }
  return { isCorrect: false };
}

function splitChunkIntoLines(chunkString, lineSeparator) {
  const lineSeparators = getIndexesOfString(chunkString, lineSeparator);
  const symbolsInSeparator = lineSeparator === "\r\n" ? 2 : 1;

  return splitChunk(chunkString, lineSeparators, symbolsInSeparator);
}

function splitChunk(chunkString, elementsArray, symbolsInSeparator) {
  const lines = [];
  let index = 0;

  elementsArray.forEach((el) => {
    lines.push(chunkString.slice(index, el.index));
    index = el.index + symbolsInSeparator;
  });

  return {
    lines,
    restOfTheChunk: chunkString.slice(index, chunkString.length),
  };
}

function getElementsArray(valueDelimiters, quotes) {
  return getElementArray(valueDelimiters, "value")
    .concat(getElementArray(quotes, "quote"))
    .sort((a, b) => a.index - b.index);
}

function getElementArray(array, symbol) {
  return array.map((el) => {
    return { index: el.index, symbol };
  });
}

function getIndexesOfString(chunkString, subStr) {
  return [...chunkString.matchAll(new RegExp(`${subStr}`, "g"))];
}

module.exports = {
  splitChunkIntoLines,
  updateProgressBar,
  getLineSeparator,
  getValueDelimiter,
  fatalError,
  warning,
  getIndexesOfString,
  getElementsArray,
};
