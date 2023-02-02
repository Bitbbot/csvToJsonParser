const fs = require("fs");
const { getLineSeparator, getValueDelimiter } = require("./utils");

function getFileSize(path) {
  return new Promise((resolve) =>
    fs.stat(path, (err, stats) => {
      resolve(stats.size);
    })
  );
}

async function getSeparators(path) {
  const readStream = fs.createReadStream(path, { highWaterMark: 1e8 });
  return new Promise((resolve) =>
    readStream.on("data", async (chunk) => {
      readStream.destroy();
      const chunkString = chunk.toString();
      const lineSeparator = getLineSeparator(chunkString);
      const valueDelimiter = await getValueDelimiter({
        chunkString,
        lineSeparator,
      });
      resolve({ lineSeparator, valueDelimiter });
    })
  );
}

module.exports = { getFileSize, getSeparators };
