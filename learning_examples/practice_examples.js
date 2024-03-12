// Below are some practice examples I made to solidify my understanding of asynchronous code and the order of callbacks, promises, and async/await as processed by the event loop

/////////////////////
//                 //
//    Example 1    //
//                 //
/////////////////////
console.log('start');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('end');

/////////////////////
//                 //
//    Example 2    //
//                 //
/////////////////////
function a() {
    console.log("Function A");
}
async function test() {
    setTimeout(a, 0);
    for (let i = 1; i < 10; i++) {
        console.log(i);
    }
    setTimeout(() => {console.log("Here")}, 0);
}

test()

/////////////////////
//                 //
//    Example 3    //
//                 //
/////////////////////
console.log('start');

const p1 = new Promise(resolve => {
    console.log('promise 1 log');
    setTimeout(() => {
        console.log("In set timeout");
        resolve('promise 1');
    }, 0);
});

p1.then(msg => console.log(msg));

console.log('end');

/////////////////////
//                 //
//    Example 4    //
//                 //
/////////////////////
setTimeout(() => new Promise(testC), 1000);

var f = new Promise(testF);
f.then(f => console.log(f))
.catch(f_err => console.log("g"))
.finally(() => console.log("h"))

console.log("e");

setTimeout(async () => {
    console.log("a");
    var x_raw = await fetch("https://api.sampleapis.com/switch/games");
    var x = await x_raw.json();
    console.log(x[0].id); // prints 1
    var y_raw = await fetch("https://api.sampleapis.com/switch/games");
    var y = await y_raw.json();
    console.log(y[1].id); // prints 2
    console.log("b");
}, 0)

async function testC(resolve, reject) {
    var z_raw= await fetch("https://api.sampleapis.com/switch/games");
    var z = await z_raw.json();
    console.log(z[2].id); // prints 3
    resolve("c");
}

console.log("i");

function testF(resolve, reject) {
    resolve("f");
}

console.log("d");


// Answer outputs
// Example 1
// start
// end
// promise
// timeout

// Example 2
// 1
// 2
// 3
// 4
// 5
// 6
// 7
// 8
// 9
// Function A
// Here

// Example 3
// start
// promise 1 log
// end
// In set timeout
// promise 1

// Example 4
// e
// i
// d
// f
// h
// a
// 1
// 2
// b
// 3