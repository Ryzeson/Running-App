function generateTable(data) {
    const rowLength = 7;
    var currentRow = -1;

    let table = '<table>';
    // table += '<tr><th colspan="8">Day of the Week</th></tr>';
    table += '<tr><th></th><th>Day 1</th><th>Day 2</th><th>Day 3</th><th>Day 4</th><th>Day 5</th><th>Day 6</th><th>Day 7</th></tr>'
    data.workouts.forEach(workout => {
        let rowNum = Math.floor((workout.id - 1) / rowLength);
        if (rowNum > currentRow) {
            currentRow++;
            let weekNum = parseInt(currentRow)+1;
            table += '<tr><td class="week-heading"><span>Week ' + weekNum + '</span></td>';
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
