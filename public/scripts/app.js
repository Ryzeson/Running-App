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


// Controls which nav-link tab is currently active
$('button.nav-link').on("click", handleNavLinkClick);
var prevClickedNav = $('button.nav-link.active');
function handleNavLinkClick(e) {
    // Show the correct tab as active
    var clickedNav = $(this);
    clickedNav.toggleClass('active');

    // Show the correct workout table
    var table_div_class = '.table-' + clickedNav.attr('id').substring(4);
    console.log(table_div_class);
    $(table_div_class).toggleClass('show');
    $(table_div_class).toggleClass('active');

    // Make the previous tab inactive
    prevClickedNav.toggleClass('active');

    // Hide the previous workout table
    var prev_table_div_class = '.table-' + prevClickedNav.attr('id').substring(4);
    console.log(prev_table_div_class);
    $(prev_table_div_class).toggleClass('show');
    $(prev_table_div_class).toggleClass('active');

    prevClickedNav = clickedNav;
}

attachTDListener();