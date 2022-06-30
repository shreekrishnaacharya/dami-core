// class AsyncPromise {
//   all(promises: Promise<any>[]) {
//     const count = promises.length;
//     let holder = [];
//     let chunk = [];
//     const max = 2;
//     let counter = 0;
//     let localCounter = 0;
//     while (true) {
//       chunk.push(promises[counter]);
//       if (localCounter === max) {
//         Promise.all(chunk).then((e) => { });
//       }
//     }
//     promises.forEach((element) => {
//       // for ()
//     });
//   }
// }
