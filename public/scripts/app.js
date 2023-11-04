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
            let weekNum = parseInt(currentRow) + 1;
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
    // $(this) with arrow syntax (=?) was not working; was returning the entire window

    $("td.stopwatch").on("click", function (e) {
        let target = e.target.tagName;
        console.log(target);
        // If the actual element that was clicked was the form or button, handle this normally
        if (target == 'INPUT' || target == 'A' || target == 'FORM') {
            console.log("Doing nothing");
        }
        // otherwise, add the completed checkbox and button to the cell if it is not there, or remove it if it is
        else {
            if ($(this).children().length > 0) {
                while ($(this).children().length != 0)
                    $(this).children().eq(0).remove();
            }
            else {
                let workoutID = this.id;
                let tdOptions = $(this).html();
                tdOptions += '<form id="form" action="" method="get" onChange="this.form.submit()">';
                tdOptions += 'Completed: <input type="checkbox" name="isCompleted"></input>';
                tdOptions += '</form>';
                tdOptions += `<a class="workout" type="button" href="https://www.ryzeson.org/Running-App/stopwatch.html?workoutID=${workoutID}">Go to Workout</a>`;
                $(this).html(tdOptions);
            }
        }

        // if (e.target.className == "stopwatch")
        //     window.location = 'https://www.ryzeson.org/Running-App/stopwatch.html?workoutID=' + e.target.id;
    });
}

function createTable(data) {
    console.log(data);
    let table = generateTable(data);
    $(".table").html(table);

    attachTDListener();
}

parseJSON(createTable);
