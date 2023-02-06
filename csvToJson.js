async function start() {}

await start();

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
