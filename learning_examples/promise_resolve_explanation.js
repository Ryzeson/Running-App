// This is a general outline of what the Promise constructor looks like under the hood (via Chat-GPT)

function Promise(executor) {
  // Initial state of the promise
  this.state = 'pending';
  // Value with which the promise is fulfilled or reason for rejection
  this.result = undefined;

  const resolve = (value) => {
    if (this.state === 'pending') {
      this.state = 'fulfilled';
      this.result = value;
    }
  };

  const reject = (reason) => {
    if (this.state === 'pending') {
      this.state = 'rejected';
      this.result = reason;
    }
  };

  try {
    // Call the executor function with the resolve and reject functions
    executor(resolve, reject);
  } catch (error) {
    // If an exception occurs in the executor, reject the promise with the error
    reject(error);
  }
}

// 
// When you initialize a promise like below:
//

function promiseCallBack(resolve, reject) {
    var num = Math.floor(Math.random() * 2);
    if (num == 1)
        resolve("Promise resolved message!");
    else
        reject("Promise rejected message");
}

// Creating the promise itself, which takes in a callback function
const promise = new Promise(promiseCallBack);

// This is what is happening:
// The executor function (promiseCallBack) is executed, because of line 25.
// The resolve and reject parameters passed in this line are functions that are created/defined in the constructor itself
// For this reason, resolve and reject can not be custom definted functions;
// They are always defined in the Promise constructor itself (as defined in lines 12-26) and will always take in one parameter
// The executor function (promiseCallBack) must still have two parameters (which are functions themselves), because
// this is what is expected by the promise constructor on line 25

// So if you take the below example:
function customResolve(value) {
    console.log('Custom resolve called with value:', value);
  }
  
  function customReject(error) {
    console.error('Custom reject called with error:', error);
  }

  function callback(customResolve, customReject) {
        const success = true;
  
        if (success) {
          customResolve('Operation completed successfully');
        } else {
          customReject(new Error('Something went wrong'));
        }
  };
  
  const customPromise = new Promise(callback);

    customPromise
    .then(result => {
      console.log('Promise resolved:', result);
    })
    .catch(error => {
      console.error('Promise rejected:', error);
    });

  // The console.log statements in the initally defined customResolve and customReject methods are never called
  // because when callback is called, it is called on line 25 in this way: callback(resolve, reject)
  // where resolve and reject are the methods created in the promise constructor itself
  // It is not called like this: callback(customResolve, customReject), which is a misconception I had

 