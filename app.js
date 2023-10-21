async function parseJSON() {
    // fetch("https://www.ryzeson.org/Running-App-dummy/program_files/test.json")
    fetch("https://www.ryzeson.org/Running-App/program_json/5k.json")
        .then(response => {
            console.log(response);
            return response.json(); // multiple line function, so you need to explicitly return the promise to continue the promise/then() chain
        })
        .then(data => {
            console.log(data);
            let table = generateTable(data);
            $(".table").html(table);

            attachTDListener();
        });

    // Similar to above, but using async/await, which will exhibit blocking (synchronous) behavior within this function
    // const response = await fetch("https://www.ryzeson.org/Running-App/program_json/test.json");
    // const json = await response.json();
    // console.log(json);
}

function generateTable(data) {
    const rowLength = 7;
    var currentRow = 0;

    let table = '<table>';
    table += '<tr><th colspan="7"></th></tr>';
    data.workouts.forEach(workout => {
        let rowNum = Math.floor((workout.id - 1) / rowLength);
        if (rowNum > currentRow) {
            currentRow++;
            table += '<tr>';
        }
        let id = `id=${workout.id}`;
        let classValue = "";
        if (workout.intervals != undefined)
            classValue = 'stopwatch';
        let classDef = 'class=' + classValue;
        table += `<td ${id} ${classDef}>${workout.desc}</td>`; // add the workout id to the <td> element
    });
    table += '</table>';


    return table;
}

function attachTDListener() {
    $("td").on("click", e => {
        console.log("click " + e.target.id);
        console.log(e.target.className);
        if (e.target.className == "stopwatch")
            window.location = 'https://www.ryzeson.org/Running-App/stopwatch.html?workoutID=' + e.target.id;
    });
}

parseJSON();