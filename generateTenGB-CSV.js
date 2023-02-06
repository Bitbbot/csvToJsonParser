const fs = require("fs");
const { Transform } = require("stream");
const {
  updateProgressBar,
  fatalError,
  splitChunkIntoLines,
} = require("./utils");
const { getFileSize, getSeparators } = require("./file");

const handleChunk = (function () {
  let isInQuotes = false;
  let restOfPrevChunk = "";
  return function (chunk, lineSeparator, valueDelimiter) {
    const chunkString = restOfPrevChunk + chunk.toString();
    const resultOfSplitting = splitChunkIntoLines(
      chunkString,
      lineSeparator,
      valueDelimiter,
      isInQuotes
    );
    console.log(resultOfSplitting.join(lineSeparator));
    return resultOfSplitting.join(lineSeparator);
    // { lines, isInQuotesNew, resOfPrevChunkNew }
  };
})();

function modify({ fileSize, lineSeparator, valueDelimiter }) {
  return new Transform({
    transform(chunk, encoding, callback) {
      const res = handleChunk(chunk, lineSeparator, valueDelimiter);
      callback(null, res);
    },
    flush(callback) {},
  });
}

function pars(modify, readPath, writePath) {
  const readStream = fs.createReadStream(readPath, {
    highWaterMark: 1000,
  });
  const writeStream = fs.createWriteStream(writePath);
  readStream
    .on("error", (e) => fatalError(`Error reading file ${readPath}\n${e}`))
    .pipe(modify)
    .on("error", (e) => fatalError(`Error modifying file\n${e}`))
    .pipe(writeStream)
    .on("error", (e) => fatalError(`Error writing file ${writePath}\n${e}`));
}

async function generateTenGBCSV() {
  const numberOfCopies = 100;
  const readPath = "./test.csv";
  const writePath = "./extendedTest.csv";
  const { lineSeparator, valueDelimiter } = await getSeparators(readPath);
  const fileSize = await getFileSize(readPath);
  console.log({ lineSeparator, valueDelimiter });
  pars(
    modify({ fileSize, lineSeparator, valueDelimiter }),
    readPath,
    writePath
  );
}

generateTenGBCSV();
