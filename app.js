intervals = [
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90],
    ['run', 60],
    ['walk', 90]

    // ['walk', 1],
    // ['run', 5],
    // ['walk', 2]
]

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
    if (isStopped) {
        timerInterval = setInterval(updateTimer, 10);
    }
    else {
        clearInterval(timerInterval);
    }

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

/*
    Initialization
*/

function init() {
    calculateTotalWorkoutTime();
    updateInterval();
}

function parseJSON() {
    fetch("https://www.ryzeson.org/Running-App/program_json/test.json")
  .then(response => response.json())
  .then(json => console.log(json));
}

init();
parseJSON();