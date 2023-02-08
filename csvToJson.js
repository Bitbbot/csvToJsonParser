const {
  fatalError,
  updateProgressBar,
  splitChunkIntoLines,
  getIndexesOfString,
  getElementsArray,
} = require("./utils");
const { getSeparators, pars, getFileSize } = require("./file");
const fs = require("fs");
const path = require("path");
const { Transform } = require("stream");

async function start() {
  const { sourceFile, resultFile, lineSeparator, valueDelimiter } =
    await getParams();
  const fileSize = await getFileSize(sourceFile);
  pars(
    modify({ fileSize, lineSeparator, valueDelimiter }),
    sourceFile,
    resultFile,
    1e8
  );
}

async function getParams() {
  const processArgs = process.argv.slice(2);
  const args = {};

  //get source, result files paths
  if (processArgs[0] === "--sourceFile" && processArgs[2] === "--resultFile") {
    args.sourceFilePath = processArgs[1];
    args.resultFilePath = processArgs[3];
  } else fatalError("Incorrect arguments");

  //handle incorrect input
  if (processArgs.length !== 4 && processArgs.length !== 6)
    fatalError("Incorrect number of arguments");
  if (fs.existsSync(args.sourceFilePath) === false)
    fatalError("Source file hasn't been found");
  if (path.extname(args.sourceFilePath) !== ".csv")
    fatalError("Source file has wrong format");
  if (args.resultFilePath.slice(args.resultFilePath.length - 5) !== ".json")
    fatalError("Wrong extension of the result file");

  //get optional argument "separator"
  if (processArgs.length === 6)
    if (processArgs[4] === "--separator") args.valueDelimiter = processArgs[5];
    else fatalError("Incorrect arguments");

  //get lineSeparator and valueDelimiter if wasn't passed
  if (processArgs.length === 6) {
    const { lineSeparator } = await getSeparators(args.sourceFilePath, false);
    args.lineSeparator = lineSeparator;
  } else {
    const { lineSeparator, valueDelimiter } = await getSeparators(
      args.sourceFilePath,
      true
    );
    args.lineSeparator = lineSeparator;
    args.valueDelimiter = valueDelimiter;
  }

  return {
    sourceFile: args.sourceFilePath,
    resultFile: args.resultFilePath,
    lineSeparator: args.lineSeparator,
    valueDelimiter: args.valueDelimiter,
  };
}

function modify({ fileSize, lineSeparator, valueDelimiter }) {
  let restOfPrevChunk = "";

  return new Transform({
    transform(chunk, encoding, callback) {
      const { res, restOfPrevChunkNew } = handleChunk(
        chunk,
        fileSize,
        lineSeparator,
        valueDelimiter,
        restOfPrevChunk
      );
      restOfPrevChunk = restOfPrevChunkNew;
      callback(null, res);
    },
    flush(callback) {
      const res = handleFlush(restOfPrevChunk, valueDelimiter);
      callback(null, res);
    },
  });
}

const handleChunk = (function () {
  let byteProcessed = 0;
  let isFirstTime = true;

  return function (
    chunk,
    fileSize,
    lineSeparator,
    valueDelimiter,
    restOfPrevChunk
  ) {
    let chunkString = restOfPrevChunk + chunk.toString();
    let resultString;

    //define the beginning of the resultString and find keys
    if (isFirstTime) {
      isFirstTime = false;
      keys(
        chunkString
          .slice(0, chunkString.indexOf(lineSeparator))
          .split(valueDelimiter)
      );
      chunkString = chunkString.slice(
        chunkString.indexOf(lineSeparator) + lineSeparator.length
      );
      resultString = `{"objects":[`;
    } else resultString = `,`;

    //update progressBar
    byteProcessed += chunk.toString().length;
    updateProgressBar(`${Math.round((byteProcessed / fileSize) * 100)}%`);

    const { lines, restOfTheChunk } = splitChunkIntoLines(
      chunkString,
      lineSeparator
    );

    const objects = lines.map((line) =>
      transformLineIntoObject(line, valueDelimiter)
    );
    resultString += objects.join(",");

    return { res: resultString, restOfPrevChunkNew: restOfTheChunk };
  };
})();

const transformLineIntoObject = function (line, valueDelimiter) {
  let isInQuotes = false;
  let index = 0;
  const resObject = {};
  const values = [];

  const valueDelimiters = getIndexesOfString(line, valueDelimiter);
  const quotes = getIndexesOfString(line, `"`);
  const elementsArray = getElementsArray(valueDelimiters, quotes);

  for (let i = 0; i < elementsArray.length; i++) {
    if (elementsArray[i].symbol === "value") {
      if (!isInQuotes) {
        values.push(line.slice(index, elementsArray[i].index));
        index = elementsArray[i].index + 1;
      }
    } else {
      if (!isInQuotes) isInQuotes = true;
      else if (line[elementsArray[i].index + 1 === valueDelimiter]) {
        isInQuotes = false;
      }
    }
  }

  values.push(line.slice(index));

  for (let i = 0; i < values.length; i++) {
    resObject[keys()[i]] = values[i];
  }
  return JSON.stringify(resObject);
};

const handleFlush = function (restOfPrevChunk, valueDelimiter) {
  let resultString = ",";

  const object = transformLineIntoObject(restOfPrevChunk, valueDelimiter);

  resultString += object + "]}";
  return resultString;
};

const keys = (function () {
  let value;
  return function (newValue) {
    if (newValue) {
      value = newValue;
    }
    return value;
  };
})();

start();
