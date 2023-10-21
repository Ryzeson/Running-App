var timerText = $('#timer-text');
var exerciseText = $('#exercise-text');
var startStopButton = $('#stop-start');
var startStopButtonLabel = $('#stop-start-label');
var startStopButtonIcon = $('#stop-start-icon');
var progressBar = $('#progress-bar');


var interval = 0;
var intervals;
var isStopped = true;
var timer; // in hundredth seconds
var totalTimeElapsed = 0; // in hundredth seconds


// https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
function updateTimer() {
    minutes = parseInt(timer / 6000);
    seconds = parseInt((timer % 6000) / 100);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerText.text(minutes + ":" + seconds);
    exerciseText.text(capitalizeFirstLetter(exercise) + " cycle");

    timer--;
    totalTimeElapsed++;

    updateProgressBar();

    if (timer < 0) {
        interval++;
        if (interval < intervals.length) {
            updateInterval();
        }
        else {
            clearInterval(timerInterval);
            timerText.text();
            exerciseText.text('Workout completed. Congratulations!');
        }
    }
}

function updateInterval() {
    exercise = intervals[interval][0];
    timer = intervals[interval][1] * 100;
}

function toggleButtonDisplay() {
    startStopButton.toggleClass("btn-success");
    startStopButton.toggleClass("btn-danger");
    startStopButtonIcon.toggleClass("fa-play");
    startStopButtonIcon.toggleClass("fa-pause");

    if (isStopped) {
        startStopButtonLabel.text("Play");
    }
    else {
        startStopButtonLabel.text("Pause");
    }
}

function updateProgressBar() {
    let percentage = ((totalTimeElapsed * 100) / totalWorkoutTime) / 100;
    let width = percentage + '%';
    progressBar.css('width', width);
}

function calculateTotalWorkoutTime() {
    let sum = 0;
    intervals.forEach(element => {
        sum += element[1];
    });
    totalWorkoutTime = sum;
}

/*
    Listeners
*/

$("#stop-start").on("click", () => {
    if (isStopped)
        timerInterval = setInterval(updateTimer, 10);
    else
        clearInterval(timerInterval);

    isStopped = !isStopped;
    toggleButtonDisplay();
});


/*
    Helpers
*/

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

/*
    Initialization
*/

function init() {
    parseJSON();
}

async function parseJSON() {
    // fetch("https://www.ryzeson.org/Running-App-dummy/program_files/test.json")
    fetch("https://www.ryzeson.org/Running-App/program_json/5k.json")
        .then(response => {
            console.log(response);
            return response.json(); // multiple line function, so you need to explicitly return the promise to continue the promise/then() chain
        })
        .then(data => {
            let workoutID = getQueryVariable('workoutID');
            let intervalsFromJSON = data.workouts[workoutID - 1].intervals;
            intervals = intervalsFromJSON;

            calculateTotalWorkoutTime();
            updateInterval();
        });
    // Similar to above, but using async/await, which will exhibit blocking (synchronous) behavior within this function
    // const response = await fetch("https://www.ryzeson.org/Running-App/program_json/test.json");
    // const json = await response.json();
    // console.log(json);
}

init();
