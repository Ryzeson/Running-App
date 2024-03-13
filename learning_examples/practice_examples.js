// Below are some practice examples I made to solidify my understanding of asynchronous code in JavaScript,
// and the order of callbacks, promises, and async/await as processed by the event loop.
// Answers/Output is at the bottom of this file

/////////////////////
//                 //
//    Example 1    //
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
//    Example 2    //
//                 //
/////////////////////
function async(callback) {
    console.log("Beginning async method");
    callback();
    callback();
    setTimeout(() => callback(), 200);
    console.log("Ending async method");
}

function display() {
    console.log("Display method");
}

async(display);

console.log("Over");

/////////////////////
//                 //
//    Example 3    //
//                 //
/////////////////////
function async(callback) {
    console.log("Beginning async method");
    callback(1);
    callback(1);
    setTimeout(() => callback(5), 1);
    console.log("Ending async method");
}

function display(n) {
    for (let i = 0; i < n; i++)
        console.log("Display method: " + i);
}

async(display);

setTimeout(() => {
    for (let i = 0; i < 5; i++)
    console.log("Another method: " + i);
}, 100);

console.log("Over");

/////////////////////
//                 //
//    Example 4    //
//                 //
/////////////////////
function async(callback) {
    console.log("Beginning async method");
    callback(1);
    callback(1);
    setTimeout(() => callback(5), 1);
    console.log("Ending async method");
}

function display(n) {
    for (let i = 0; i < n; i++)
        console.log("Display method: " + i);
}

async(display);

for (let i = 0; i < 5; i++)
    console.log("Another method: " + i);

console.log("Over");

/////////////////////
//                 //
//    Example 5    //
//                 //
/////////////////////
console.log('start');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('end');

/////////////////////
//                 //
//    Example 6    //
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
//    Example 7    //
//                 //
/////////////////////
const promise = new Promise(function executor(resolve, reject) {
    console.log('entering executor, resolve is: [' + resolve + ']');
    setTimeout(function () {
        console.log('about to call resolve');
        resolve(42);
        console.log('returning from resolve');
    }, 1000);
});

console.log('about to call "then"');

promise.then(function resolveCallback(answer) {
    console.log('the answer is: ' + answer);
});

/////////////////////
//                 //
//    Example 8    //
//                 //
/////////////////////
const promise = new Promise(function executor(resolve, reject) {
    console.log('entering executor, resolve is: [' + resolve + ']');
    setTimeout(function () {
        console.log('about to call resolve');
        resolve(42);
        setTimeout(() => console.log('returning from resolve'), 1000);
    }, 1000);
});

console.log('about to call "then"');

promise.then(function resolveCallback(answer) {
    console.log('the answer is: ' + answer);
});

/////////////////////
//                 //
//    Example 9    //
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


//////////////////////////////////////
//                                  //
//    Answers / Generated Output    //
//                                  //
//////////////////////////////////////
// Example 1
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

// Example 2
// Beginning async method
// Display method
// Display method
// Ending async method
// Over
// Display method

// Example 3
// Beginning async method
// Display method: 0
// Display method: 0
// Ending async method
// Over
// Display method: 0
// Display method: 1
// Display method: 2
// Display method: 3
// Display method: 4
// Another method: 0
// Another method: 1
// Another method: 2
// Another method: 3
// Another method: 4

// Example 4
// Beginning async method
// Display method: 0
// Display method: 0
// Ending async method
// Another method: 0
// Another method: 1
// Another method: 2
// Another method: 3
// Another method: 4
// Over
// Display method: 0
// Display method: 1
// Display method: 2
// Display method: 3
// Display method: 4

// Example 5
// start
// end
// promise
// timeout

// Example 6
// start
// promise 1 log
// end
// In set timeout
// promise 1

// Example 7 (https://stackoverflow.com/questions/50413583/resolve-and-reject-functions-inside-a-promises-executor)
// entering executor, resolve is: [function () { [native code] }]
// about to call "then"
// about to call resolve
// returning from resolve
// the answer is: 42

// Example 8
// entering executor, resolve is: [function () { [native code] }]
// about to call "then"
// about to call resolve
// the answer is: 42
// returning from resolve

// Example 9
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