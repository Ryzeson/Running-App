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
        let classValue = "class=";
        if (workout.intervals != undefined)
            classValue += 'stopwatch';
        table += `<td ${id} ${classValue}><p class='workout-desc'>${workout.desc}</p></td>`; // add the workout id to the <td> element
    });
    table += '</table>';

    return table;
}

function attachTDListener() {
    // $(this) with arrow syntax (=>) was not working; it was returning a reference to the entire window
    // By using function(e), $(this) actually points to the object calling this callback function, which is the td.stopwatch element 
    const td = $("td");
    td.on("click", addTDOptions);
}

function addTDOptions(e) {
    let target = e.target.tagName;

    // We want to add/remove the checkbox and button to the cell, but only if the <td> element was the one actually getting clicked
    // i.e. not the input, a, or form tags
    if (!(target == 'INPUT' || target == 'A' || target == 'FORM')) {
        // $(this) always refers to the object the listener is actually attached to
        // So in this case, $(this) is equivalent to the current td handling this listener
        // $(this) is not equivalent to td, because td is a list of all td elements
        if ($(this).children().length > 1) {
            removeTDOptions($(this));
        }
        else {
            let workoutID = this.id;
            let tdOptions = $(this).html();
            tdOptions += "<div class='td-options'>";
            tdOptions += "<div class='d-flex justify-between align-items-center'>"
            tdOptions += "<button class='td-options-close mr-1'>X</button>";
            tdOptions += `<form id="form" action="" method="get" onChange="updateProgress(${workoutID})">`;
            tdOptions += 'Completed: <input type="checkbox" name="isCompleted"';
            if ($(this).hasClass("completed"))
                tdOptions += ' checked';
            tdOptions += '></input>';
            tdOptions += '</form>';
            tdOptions += "</div>"
            if ($(this).hasClass("stopwatch")) {
                tdOptions += `<a class="workout" type="button" href="/stopwatch?workoutID=${workoutID}">Go to Workout</a>`;
            }
            tdOptions += "</div>";
            $(this).html(tdOptions);
        }
    }
}

function updateProgress(id) {
    updateDB(id);
}

function updateDB(id) {
    // Disable clicking on the cell while it is being updated
    var td = $("td#" + id);
    td.on("click", handler);
    td.off("click", addTDOptions);

    $('*').css('cursor', 'progress');
    $.ajax({
        url: '/updateProgress', //can use relative path because this will be on the same domain as the node server
        type: "POST",
        data: {
            'id': id
        },
        success: function (data) {
            // Enable clicking on the cell after it has been updated
            updateCellUI(id);
            td.off("click", handler);
            td.on("click", addTDOptions);
            $('*').css('cursor', '');
        }
    });
}

// https://stackoverflow.com/questions/1755815/disable-all-click-events-on-page-javascript
function handler(e) {
    e.stopPropagation();
    e.preventDefault();
}

function updateCellUI(id) {
    var td = $("td#" + id);
    td.toggleClass("completed");
    removeTDOptions(td);
}

function removeTDOptions(td) {
    while (td.children().length != 1)
        td.children().eq(td.children().length - 1).remove();
}

// function createTable(data) {
//     console.log(data);
//     let table = generateTable(data);
//     $(".table").html(table);

//     attachTDListener();
// }

// parseJSON(createTable);
attachTDListener();