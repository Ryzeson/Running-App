// This function retrieves the json file that holds the program's (e.g., 5k, half-marathon) workout information
// The callback function is executed after the json is retrieved, and takes that json's data as a paramter
    // In index.html, the callback creates the table
    // In stopwatch.html, the callback initializes the timer values
function parseJSON(callback) {
    // fetch("https://www.ryzeson.org/Running-App-dummy/program_files/test.json")
    fetch("https://www.ryzeson.org/Running-App/program_json/5k.json")
        .then(response => {
            // console.log(response);
            return response.json(); // multiple line function, so you need to explicitly return the promise to continue the promise/then() chain
        })
        .then(data => {
            callback(data);
        });

    // This would print before the console.log(response) line in the then() block above, becauuse promises allow asynchronous behavior
    // console.log("Hello")
}

// Similar to above, but using async/await, which will exhibit blocking (synchronous) behavior within this function
// Hello prints after the json in this version
// async function parseJSON(callback) {
//     const response = await fetch("https://www.ryzeson.org/Running-App/program_json/5k.json");
//     const json = await response.json();
//     callback(json)
//     console.log(json);
//     console.log("Hello");
// }


$(function () {
$('[data-toggle="popover"]').popover();
});

$('.popover-dismiss').popover({
trigger: 'focus'
})