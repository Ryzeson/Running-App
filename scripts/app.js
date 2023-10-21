function generateTable(data) {
    const rowLength = 7;
    var currentRow = 0;

    let table = '<table>';
    table += '<tr><th colspan="7">Day of the Week</th></tr>';
    table += '<tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>'
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

function createTable(data) {
    console.log(data);
    let table = generateTable(data);
    $(".table").html(table);

    attachTDListener();
}

parseJSON(createTable);
