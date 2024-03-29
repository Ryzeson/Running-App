module.exports = {
    createProgressTable: createProgressTable,
    sendEmail: sendEmail
};

async function createProgressTable(progressStr, program) {
    // Get the program data in json format
    var response = await fetch(`https://www.ryzeson.org/Running-App/program_json/${program}.json`);
    var data = await response.json();

    // Create the actual html table
    const rowLength = 7;
    var currentRow = -1;

    let table = '<table>';
    table += '<tr><th></th><th>Day 1</th><th>Day 2</th><th>Day 3</th><th>Day 4</th><th>Day 5</th><th>Day 6</th><th>Day 7</th></tr>'
    data.workouts.forEach(workout => {
        let rowNum = Math.floor((workout.id - 1) / rowLength);
        if (rowNum > currentRow) {
            currentRow++;
            let weekNum = parseInt(currentRow) + 1;
            table += '<tr><td class="week-heading"><span>Week ' + weekNum + '</span></td>';
        }
        let id = `id=${program}-${workout.id}`;
        let classValue = "class='";
        if (workout.intervals != undefined)
            classValue += "stopwatch ";
        if (workout.desc.toLowerCase().includes('run') || workout.desc.toLowerCase().includes('walk'))
            classValue += "workout-cell";
        var completedClass = progressStr.charAt(workout.id - 1) == "1" ? " completed" : "";
        classValue += completedClass;
        classValue += "'";
        table += `<td ${id} ${classValue}><p class='workout-desc'>${workout.desc}</p></td>`; // add the workout id to the <td> element
    });
    table += '</table>';

    return table;
}


function sendEmail(subject, message, toEmail, nodemailer) {
    var mailOptions = {
        from: process.env.EMAIL,
        to: toEmail,
        subject: subject,
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
