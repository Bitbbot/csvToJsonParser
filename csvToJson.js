const { fatalError } = require("./utils");
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
  if (
    args.resultFilePath.slice(
      args.resultFilePath.length - 5,
      args.resultFilePath.length
    ) !== ".json"
  )
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

function modify({ fileSize, lineSeparator }) {
  return new Transform({
    transform(chunk, encoding, callback) {
      console.log("here");
      callback(null);
    },
    flush(callback) {
      console.log("end");
    },
  });
}

start();
