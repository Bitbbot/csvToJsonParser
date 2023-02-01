const fs = require("fs");
const { Transform } = require("stream");
const { updateProgressBar } = require("./utils");
const { getLineSeparator, getFileSize, getValueDelimiter } = require("./file");

//n defines how many times file will be replicated
const n = 100;
//highWaterMark defines the size if every chunk of data
const highWaterMark = 10;
const readPath = "./test.csv";
const writePath = "./extendedTest.csv";

async function generateTenGBCSV() {
  const readStream = fs.createReadStream(readPath);
  const writeStream = fs.createWriteStream(writePath);
  const lineSeparator = JSON.stringify(await getLineSeparator(readPath));
  const valueDelimiter = getValueDelimiter({ readPath, lineSeparator });
  console.log(valueDelimiter);
  const fileSize = await getFileSize(readPath);
}

// function createTransform() {
//   const transform = new Transform({
//     transform(chunk, encoding, callback) {
//       // const line=splitChunkIntoLines(chunk)
//     },
//     flush(callback) {},
//   });
// }

generateTenGBCSV();
