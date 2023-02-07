const fs = require("fs");
const { getLineSeparator, getValueDelimiter, fatalError } = require("./utils");

function getFileSize(path) {
  return new Promise((resolve) =>
    fs.stat(path, (err, stats) => {
      resolve(stats.size);
    })
  );
}

async function getSeparators(path, isValueDelimiter) {
  const readStream = fs.createReadStream(path, { highWaterMark: 1e8 });

  return new Promise((resolve) =>
    readStream.on("data", async (chunk) => {
      const chunkString = chunk.toString();
      const results = {};

      results.lineSeparator = getLineSeparator(chunkString);
      if (isValueDelimiter)
        results.valueDelimiter = await getValueDelimiter({
          chunkString,
          lineSeparator: results.lineSeparator,
        });

      readStream.destroy();
      resolve({
        lineSeparator: results.lineSeparator,
        valueDelimiter: results.valueDelimiter,
      });
    })
  );
}

function pars(modify, readPath, writePath, highWaterMark) {
  const readStream = fs.createReadStream(readPath, {
    highWaterMark,
  });
  const writeStream = fs.createWriteStream(writePath);

  readStream
    .on("error", (e) => fatalError(`Error reading file ${readPath}\n${e}`))
    .pipe(modify)
    .on("error", (e) => fatalError(`Error modifying file\n${e}`))
    .pipe(writeStream)
    .on("error", (e) => fatalError(`Error writing file ${writePath}\n${e}`));
}

module.exports = { getFileSize, getSeparators, pars };
