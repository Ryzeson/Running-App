
// Using promises
// app.post('/signup', (req, res) => {
//     var db_client;
//     var errorMsg = "";
//     // Establish a connection to the database, and query based on username
//     pool.connect().then(client => {
//         db_client = client;
//         var query = "SELECT * FROM users WHERE username = $1";
//         var params = [req.body.username];
//         return client.query(query, params)
//     }).then(result => {
//         // First check if this username (primary key) exists in the database. If it does, ask the user to pick a different username
//         if (result.rows.length > 0) {
//             errorMsg = "Username is already taken. Please use a different username.";
//             // Note that I use Promise.reject as the failure case here, but you can also throw an error for the same effect (//https://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw)
//             return Promise.reject(errorMsg);
//         }
//         else {
//             // No matches found, username is not taken
//             // Table also requires email to be unique, so check that the email is not taken either
//             var emailQuery = "SELECT * FROM users WHERE email = $1";
//             var emailParam = [req.body.email];
//             return db_client.query(emailQuery, emailParam);
//         }
//     }).then(emailResult => {
//         // Email is already taken
//         if (emailResult.rows.length > 0) {
//             errorMsg = "Email is already taken. Please use a different email.";
//             return Promise.reject(errorMsg);
//         }
//         else {
//             // Email is not taken. Insert this record into the table
//             // Hash password
//             bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
//                 //Insert into db
//                 var insertQuery = "INSERT INTO users VALUES($1, $2, $3)";
//                 var insertParams = [req.body.username, hash, req.body.email];
//                 db_client.query(insertQuery, insertParams).then(result => {
//                     console.log("Successfully inserted the record");
//                     return res.sendFile(__dirname + '/signup_success.html');
//                 })
//                     .catch(err => console.log(err))
//             });


//             // Construct and send verification email
//             var href = 'http://' + process.env.IPV4 + ':3000/verify?username=' + req.body.username;

//             var message = 'Verification link: <a href="' + href + '"><button>Click Here</button></a>';

//             var mailOptions = {
//                 from: process.env.EMAIL,
//                 to: req.body.email,
//                 subject: 'Running App Verification Email',
//                 html: message
//             };

//             transporter.sendMail(mailOptions, function (error, info) {
//                 if (error) {
//                     console.log(error);
//                 } else {
//                     console.log('Email sent: ' + info.response);
//                 }
//             });
//         }
//     }).catch(err => {
//         console.error(err);
//         res.render('signup', { text: errorMsg });
//     })
// })

// Using Async / Await
app.post("/signup", async (req, res) => {
    var errorMsg = "";
    // Establish a connection to the database, and query based on username
    try {
        var client = await pool.connect();
        var query = "SELECT * FROM users WHERE username = $1";
        var params = [req.body.username];
        var result = await client.query(query, params);
        // First check if this username (primary key) exists in the database. If it does, ask the user to pick a different username
        var emailResult;
        if (result.rows.length > 0) {
            throw 'ExistingUsername';
        }
        // No matches found, username is not taken
        // Table also requires email to be unique, so check that the email is not taken either
        var emailQuery = "SELECT * FROM users WHERE email = $1";
        var emailParam = [req.body.email];
        emailResult = await client.query(emailQuery, emailParam);

        if (emailResult.rows.length > 0) {
            throw 'ExistingEmail';
        }
        // Email is not taken. Insert this record into the table
        // Hash password
        var hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
                if (err) reject(err);
                else resolve(hash);
            });
        });

        //Insert into db
        var insertQuery = "INSERT INTO users VALUES($1, $2, $3)";
        var insertParams = [req.body.username, hashedPassword, req.body.email];
        await client.query(insertQuery, insertParams);
        console.log("Successfully inserted the users table record");

        // Create a corresponding entry in the progress table for this user
        var progressInsertQuery = "INSERT INTO progress SELECT id, '0000000000000000000000000000000000000000000000000000000000000000' FROM users WHERE username = $1";
        var progressInsertParams = [req.body.username];
        await client.query(progressInsertQuery, progressInsertParams);

        util.sendVerificationEmail(req.body.username, req.body.email, nodemailer);

        return res.sendFile(__dirname + '/signup_success.html');
    }
    catch (err) {
        console.error(err);
        if (err == 'ExistingUsername')
            res.render('signup', { text: 'Username is already taken. Please use a different username.' });
        else if (err == 'ExistingEmail')
            res.render('signup', { text: 'Email is already taken. Please use a different email.' });
        else
            res.render('error');
    }
})