async function start() {
  // const { sourceFile, resultFile, separator } = getArgs();
  getArgs();
}

function getArgs() {
  const args = process.argv.slice(2);
  function findIndexCallback(item, name) {
    return item === name;
  }
  console.log(args);
  // if
  const sourceFileIndex =
    args.findIndex((item) => findIndexCallback(item, "--sourceFile")) + 1;
  const resultFileIndex =
    args.findIndex((item) => findIndexCallback(item, "--resultFile")) + 1;
  const separatorIndex =
    args.findIndex((item) => findIndexCallback(item, "--separator")) + 1;
}

start();

// function splitChunk(
//     chunkString,
//     elementsArray,
//     isInQuotes,
//     symbolsInSeparator
// ) {
//     const lines = [];
//     let index = 0;
//     elementsArray.forEach((el, elIndex) => {
//         if (el.symbol === "line") {
//             if (!isInQuotes) {
//                 lines.push(chunkString.slice(index, el.index + symbolsInSeparator));
//                 index = el.index + symbolsInSeparator;
//             }
//         } else if (el.symbol === "quote") {
//             isInQuotes = !isInQuotes;
//         } else {
//         }
//     });
//     return lines;
// }
