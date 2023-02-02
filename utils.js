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
  else return "\r";
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
      validationResult.isCorrect
        ? resolve(validationResult.delimiter)
        : fatalError("Wrong separator");
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
  } else return { isCorrect: false };
}

function splitChunkIntoLines(restOfPrevChunk, chunk, separator) {}
splitChunkIntoLines("452", "4554", "\n");

module.exports = {
  updateProgressBar,
  getLineSeparator,
  getValueDelimiter,
};
