const lodash = require("lodash");

const updateProgressBar = lodash.throttle(function (str) {
  if (process.stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(str);
  }
}, 1000);

function splitChunkIntoLines(restOfPrevChunk, chunk, separator) {
  // const fullChunk = restOfPrevChunk + chunk;
  // const
}

splitChunkIntoLines("452", "4554", "\n");

module.exports = { updateProgressBar };
