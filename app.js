intervals = [
    // ['walk', 120],
    // ['run', 300],
    // ['walk', 120],
    // ['run', 300],
    ['walk', 1],
    ['run', 5],
    ['walk', 2]
]

var interval = 0;
var isStopped = true;
var timer; // tenth of seconds

// 1200 => 2 mins

// https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript
function updateTimer() {
    minutes = parseInt(timer / 6000);
    seconds = parseInt((timer % 6000) / 100);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    $('#timer').text(minutes + ":" + seconds);
    $('#exercise').text(capitalizeFirstLetter(exercise) + " cycle");

    timer -= 1;
    if (timer < 0) {
        interval++;
        if (interval < intervals.length) {
            updateInterval();
        }
        else {
            clearInterval(timerInterval);
            $('#timer').text();
            $('#exercise').text('Workout completed. Congratulations!');
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
    updateInterval();
    console.log(timer);
}

init();