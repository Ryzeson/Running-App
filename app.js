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



var interval = 0;
var isStopped = true;
var timer; // tenth of seconds


// https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
function updateTimer() {
    minutes = parseInt(timer / 6000);
    seconds = parseInt((timer % 6000) / 100);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerText.text(minutes + ":" + seconds);
    exerciseText.text(capitalizeFirstLetter(exercise) + " cycle");

    timer -= 1;
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

/*
    Initialization
*/

function init() {
    updateInterval();
    console.log(timer);
}

init();