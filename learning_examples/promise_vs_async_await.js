// Promise vs Async/Await Practice
// This file was created to help me understand the differences between the two, and clear up some misconceptions that I had.

////////////////////
//                //
//    Promises    //
//                //
////////////////////

// Promise executor function
function promiseCallBack(resolve, reject) {
    var num = Math.floor(Math.random() * 2);
    if (num == 1)
        resolve("Promise resolved message!");
    else
        reject("Promise rejected message");
}

// Creating the promise itself, which takes in a callback function
const promise = new Promise(promiseCallBack);

// The then method takes in two parameters.
// The first is a callback function that is executed if the promise is resolved
// The second is a callback function that is executed if the promise is rejected
promise.then(function(result) {
    console.log(result);
}
, function(failure) {
    console.log(failure);
})

// This is the same as the above, but with explicitly defined functions as opposed to anonymous functions
// Exmaple 1:
function onResolve(result) {
    console.log(result);
    // throw "Error in resolve method";
}

function onReject(failure) {
    console.log(failure);
}

promise.then(onResolve, onReject);

// Alternatively, instead of passing in two functions as parameters, it is common to only specify the first one
// which handles the case when the promise is resolved. The rejected promise can be handled by the catch() method
// Exmaple 2:
function onResolve(result) {
    console.log(result);
    // throw "Error in resolve method";
}

function onReject(failure) {
    console.log(failure);
}

promise.then(onResolve)
        .catch(onReject)

// What is the difference between the examples 1 and 2? https://stackoverflow.com/questions/24662289/when-is-thensuccess-fail-considered-an-antipattern-for-promises
// 1. In example 1, if there was an error thrown in the onResolve method, this would not be caught anywhere.
// Whereas in example 2, this catch block catches all errors created by the initial promise producer, as well as any from the onResolve method
// This can be tested by uncommenting the line that throws an error in the onResolve() method for each example, and seeing how they behave differently
// 2. In example 1, having multiple parameters in a single then() call could be more difficult to visually parse, but it would provide more control over handling specific errors
// that occur at each level of the then() chain, as they appear.


/////////////////////////
//                     //
//    Async / await    //
//                     //
/////////////////////////

// Using Async/await
async function test() {
    console.log('Ready');
    let example = await fetch('http://httpbin.org/get');
    console.log('I will print second');
  }
  
  test();
  console.log('I will print first');

//  Using Promise/then()
 function test() {
    console.log('Ready');
    let example = fetch('http://httpbin.org/get').then((res) => {
      console.log('I will print last');

    });

    console.log('I will print first');
  }
  
  test();
  console.log('I will print second');

// Async (no await keyword, so in this case async keyword has no effect)
async function test() {
    console.log('Ready');
    let example = fetch('http://httpbin.org/get');
    console.log('I will print first');
  }
  
  test();
  console.log('I will print second');


// Good Stack Overflow post about the order of execution between synchronous, asynchronous, and promises
// https://stackoverflow.com/questions/63257952/understanding-async-js-with-promises-task-and-job-queue
// and this video https://www.youtube.com/watch?v=28AXSTCpsyU