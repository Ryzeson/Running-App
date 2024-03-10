// The logic for this stopwatch functionality is contained here (client-side) because it requires constant updating to the UI while
// the workout is in progress. Some of the things could be done server side (like displayWorkoutName() or calculateTotalWorkoutTime()),
// but it makes more sense to parse this json in just one place

var timerText = $('#timer-text');
var exerciseText = $('#exercise-text');
var startStopButton = $('#stop-start');
var startStopButtonLabel = $('#stop-start-label');
var startStopButtonIcon = $('#stop-start-icon');
var progressBar = $('#progress-bar');

var interval = 0;
var isStopped = true;
var timer; // in hundredth seconds
var totalTimeElapsed = 0; // in hundredth seconds

// Save workout information
var id;
var desc;
var intervals;


// https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
function updateTimer() {
    // timer values
    // 100 = 1 second
    // 600 = 6 seconds
    // 6000 = 60 seconds
    minutes = parseInt(timer / 6000);
    seconds = parseInt((timer % 6000) / 100);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerText.text(minutes + ":" + seconds);
    exerciseText.text(capitalizeFirstLetter(exercise) + " Cycle");

    // called 100 times per second, so that is why we only need to subtract 1 here
    timer--;
    totalTimeElapsed++;

    updateProgressBar();

    // current interval of the workout is over
    if (timer < 0) {
        interval++;
        // if there is another interval in the workout, go to it
        if (interval < intervals.length) {
            updateInterval();
            playAudio();
        }
        else {
            clearInterval(timerInterval);
            timerText.text();
            exerciseText.text('Workout completed. Congratulations!');
            new Audio("audio/Workout_Complete.mp3").play();
        }
    }
}

function updateInterval() {
    exercise = intervals[interval][0];
    timer = intervals[interval][1] * 100;
}

function playAudio() {
    if (exercise == 'run') {
        new Audio("audio/Begin_Running.mp3").play();
    }
    else {
        new Audio("audio/Begin_Walking.mp3").play();
    }
}

function displayWorkoutName() {
    let textToDisplay = "Day " + id + ": " + desc;
    timerText.text(textToDisplay);
}

function updateProgressBar() {
    let percentage = ((totalTimeElapsed * 100) / totalWorkoutTime) / 100;
    let width = percentage + '%';
    progressBar.css('width', width);
}

// Calculates the total workout time in seconds
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
    // Pressing 'Play' for the first time
    if (totalTimeElapsed == 0) {
        playAudio();
        $("div.progress").toggleClass("invisible");
    }

    if (isStopped)
        timerInterval = setInterval(updateTimer, 10); // will be called 100 times per second
    else
        clearInterval(timerInterval);

    isStopped = !isStopped;
    toggleButtonDisplay();
});

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

function setUpTimer(data, workoutID) {
    id = data.workouts[workoutID - 1].id;
    desc = data.workouts[workoutID - 1].desc;
    let intervalsFromJSON = data.workouts[workoutID - 1].intervals;
    intervals = intervalsFromJSON;

    displayWorkoutName();
    calculateTotalWorkoutTime();
    updateInterval();
}

function init() {
    let workout = getQueryVariable('workout');
    let program = workout.split('-')[0];
    let workoutID = workout.split('-')[1];
    fetch(`https://www.ryzeson.org/Running-App/program_json/${program}.json`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            setUpTimer(data, workoutID);
        });
}

init();
