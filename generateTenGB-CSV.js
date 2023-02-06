const fs = require("fs");
const { Transform } = require("stream");
const {
  updateProgressBar,
  fatalError,
  splitChunkIntoLines,
} = require("./utils");
const { getFileSize, getSeparators } = require("./file");

const handleChunk = (function () {
  const numberOfCopies = 15000;
  let isFirst = true;
  let restOfPrevChunk = "";
  let byteProcessed = 0;
  return function (chunk, lineSeparator, fileSize) {
    byteProcessed += 10;
    updateProgressBar(`${Math.round((byteProcessed / fileSize) * 100)}%`);
    const chunkString = restOfPrevChunk + chunk.toString();
    const { lines, restOfTheChunk } = splitChunkIntoLines(
      chunkString,
      lineSeparator
    );
    restOfPrevChunk = restOfTheChunk;
    let result;
    if (lines.length > 1) result = lines.join("") + lineSeparator;
    else if (lines.length === 1) result = lines[0] + lineSeparator;
    else result = "";
    if (isFirst && lines.length === 1) {
      isFirst = false;
      return result;
    } else return result.repeat(numberOfCopies);
  };
})();

function modify({ fileSize, lineSeparator }) {
  return new Transform({
    transform(chunk, encoding, callback) {
      const res = handleChunk(chunk, lineSeparator, fileSize);
      callback(null, res);
    },
    flush(callback) {
      const res = handleChunk(lineSeparator, lineSeparator, fileSize);
      callback(null, res);
    },
  });
}

function pars(modify, readPath, writePath) {
  const readStream = fs.createReadStream(readPath, {
    highWaterMark: 10,
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
  const readPath = "./test.csv";
  const writePath = "./extendedTest.csv";
  const { lineSeparator, valueDelimiter } = await getSeparators(readPath);
  const fileSize = await getFileSize(readPath);
  pars(
    modify({ fileSize, lineSeparator, valueDelimiter }),
    readPath,
    writePath
  );
}

generateTenGBCSV();
