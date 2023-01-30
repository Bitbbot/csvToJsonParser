const fs = require("fs");

function getFileSize(path) {
  return new Promise((resolve) =>
    fs.stat(path, (err, stats) => {
      resolve(stats.size);
    })
  );
}

async function getLineSeparator(path) {
  const readStream = fs.createReadStream(path, { highWaterMark: 1e8 });
  return new Promise((resolve) =>
    readStream.on("data", (chunk) => {
      console.log(chunk.length);
      readStream.destroy();
      const chunkString = chunk.toString();
      const lfSepIndex = chunkString.indexOf("\n");
      const crlfSepIndex = chunkString.indexOf("\r\n");
      if (crlfSepIndex !== -1) resolve("\r\n");
      else if (lfSepIndex !== -1) resolve("\n");
      else resolve("\r");
    })
  );
}
module.exports = { getFileSize, getLineSeparator };
