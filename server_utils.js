module.exports = {
    createProgressTable: createProgressTable,
    sendVerificationEmail : sendVerificationEmail
  };

async function createProgressTable(progressStr) {
    // Get the program data in json format
    var response = await fetch("https://www.ryzeson.org/Running-App/program_json/5k.json");
    var data = await response.json();

    // Creates the actual html table
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
        let classValue = "class='";
        if (workout.intervals != undefined)
            classValue += "stopwatch";
        var completedClass = progressStr.charAt(workout.id - 1) == "1" ? " completed" : "";
        classValue += completedClass;
        classValue += "'";
        table += `<td ${id} ${classValue}><p class='workout-desc'>${workout.desc}</p></td>`; // add the workout id to the <td> element
    });
    table += '</table>';

    return table;
}

function sendVerificationEmail(username, email, nodemailer) {
    // Construct and send verification email
    var href = 'http://' + process.env.IPV4 + ':3000/verify?username=' + username;

    var message = 'Click the following link to verify your email: <a href="' + href + '"><button>Click Here</button></a>';

    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'PacePal Email Verification',
        html: message
    };

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}