#!/usr/bin/env node
// Above line used by systemd service, which tells it to interpret this file as a node file

const express = require("express");
const app = express();

const dotenv = require('dotenv').config(); // Package to help safely store db connection details and other environment vairables in a '.env' file
const ejs = require('ejs'); // JavaScript templating package
app.set('view engine', 'ejs'); // Look in the folder called 'views'
const nodemailer = require('nodemailer'); // For sending emails
const bcrypt = require('bcrypt'); // For hasing passwords
const saltRounds = 12; // Salt added to initial password before decryption. rounds=12: 2-3 hashes/sec (https://blog.logrocket.com/password-hashing-node-js-bcrypt/#auto-generating-salt-hash)
const { Pool } = require('pg'); // Package for connecting to Postgres db
// The above is equivalent to the following two lines
// const pg = require('pg');
// const Pool = pg.Pool;
// The below two lines are used for storing and retriving session state (e.g., userid)
const session = require("express-session");

const util = require('./util_functions');

const port = process.env.PORT || 3000

// Set middleware
app.use(express.urlencoded({ extended: true })); // To parse incoming requests, including JSON and form data
// app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(express.static('public')); // Allows express to serve static files, which should be stored in a folder called 'public'

app.use(session({
    secret: "secrettext",
    saveUninitialized: true,
    resave: true
    // cookie: { secure: false }// this should be set to true, but needs to be false because right now the server only operates under https
}));


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

app.get("/", async function (req, res) {
    // If the user's session exists, skip the login page and take them directly to the main page that contains the progress table
    var userid = req.session.userid;
    if (req.session.userid) {
        var username = await getUsername(userid);
        var progressStr = await getProgress(userid);

        var table = await util.createProgressTable(progressStr);
        res.render("index", { username: username, table: table });
    }
    else
        res.sendFile(__dirname + "/login.html");
})

app.post("/login", async function (req, res) {
    var username = req.body.username;

    try {
        var client = await pool.connect();
        var query = 'SELECT * FROM users WHERE username = $1';
        var params = [username];

        var result = await client.query(query, params);
        // This 'result' variable contains lots of information in json format. 'rows' is just one part that we can access
        if (result.rows.length == 0) {
            res.render("login_failure", { reasonMsg: "User does not exist. Please try again with a different username." });
            return;
        }
        var hash = result.rows[0].password;
        var db_verified = result.rows[0].verified;
        var form_password = req.body.password;

        bcrypt.compare(form_password, hash, async function (err, result) {
            if (result && db_verified == 'Y') {
                // Create a session that stores this logged in user's info
                var idResult = await client.query("SELECT id FROM users WHERE username=$1", [username]);
                var userid = parseInt(idResult.rows[0].id);
                req.session.userid = userid;
                req.session.save();
                console.log("Logged in userid session:", req.session.userid);

                var progressStr = await getProgress(userid);
                var table = await util.createProgressTable(progressStr);

                res.render("index", { username: username, table: table });
            }
            else {
                var reasonMsg;
                if (db_verified == 'N')
                    reasonMsg = 'Your email is not verified yet. Please check your inbox for an email containing your verification link';
                else
                    reasonMsg = 'Your password is incorrect. Please try again';

                res.render("login_failure", { reasonMsg: reasonMsg });
            }
        });
    }
    catch (err) {
        console.error('Error connecting to database or executing query', err);
        res.sendFile(__dirname + "/error.html");
    }
})

app.get('/stopwatch', (req, res) => {
    res.sendFile(__dirname + '/stopwatch.html');
})

app.get('/signup', (req, res) => {
    res.render('signup');
});

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
            errorMsg = "Username is already taken. Please use a different username.";
            throw errorMsg;
        }
        else {
            // No matches found, username is not taken
            // Table also requires email to be unique, so check that the email is not taken either
            var emailQuery = "SELECT * FROM users WHERE email = $1";
            var emailParam = [req.body.email];
            emailResult = await client.query(emailQuery, emailParam);
        }

        if (emailResult.rows.length > 0) {
            errorMsg = "Email is already taken. Please use a different email.";
            throw errorMsg;
        }
        else {
            // Email is not taken. Insert this record into the table
            // Hash password
            bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
                //Insert into db
                var insertQuery = "INSERT INTO users VALUES($1, $2, $3)";
                var insertParams = [req.body.username, hash, req.body.email];
                try {
                    await client.query(insertQuery, insertParams);
                    console.log("Successfully inserted the users table record");

                    // Create a corresponding entry in the progress table for this user
                    var progressInsertQuery = "INSERT INTO progress SELECT id, '0000000000000000000000000000000000000000000000000000000000000000' FROM users WHERE username = $1";
                    var progressInsertParams = [req.body.username];

                    await client.query(progressInsertQuery, progressInsertParams);
                    console.log("Successfully inserted the progress table record");
                    return res.sendFile(__dirname + '/signup_success.html');
                }
                catch (err) {
                    console.log(err);
                }
            });

            sendVerificationEmail(req.body.username, req.body.email);
        }
    }
    catch (err) {
        console.error(err);
        // If the errorMsg has content, then this means the error that occurred is due to logic (e.g., username is already taken, password is incorrect)
        // otherwise it is a different error, such as db connectivity or another unexpected error
        if (errorMsg) {
            res.render('signup', { text: errorMsg });
        }
        else {
            res.sendFile(__dirname + "/error.html");
        }
    }
})


app.get('/verify', (req, res) => {
    pool.connect()
        .then(client => {
            var query = 'SELECT * FROM users WHERE username = $1';
            var params = [req.query.username];
            client.query(query, params)
                .then(result => {

                    if (result.rowCount == 1) {
                        var updateQuery = 'UPDATE users SET verified = \'Y\' WHERE username = $1';
                        var updateParams = [req.query.username];
                        client.query(updateQuery, updateParams)
                            .then(result => {
                                res.send('Successfully validated your email. You can now close this tab.');
                            })
                            .catch(error => {
                                console.error("Error executing update query", error);
                                res.status(500).send('Error');
                            })
                    }
                    else {
                        // Throw some error
                        console.error("Username does not exist, or exists multiple times. At this point, only one should exist.");
                        res.status(500).send('Error');
                    }
                })
                .catch(queryError => {
                    console.error('Error executing query', queryError);
                    res.status(500).send('Error');
                })
        })
        .catch(connectError => {
            console.error('Error connecting to database', connectError);
            res.status(500).send('Error');
        })
})

app.get('/signout', (req, res) => {
    req.session.destroy(function(err) {
        res.sendFile(__dirname + "/login.html");
      })
})

app.post('/test', async (req, res) => {
    var client = await pool.connect();
    var result = await client.query("SELECT * FROM progress where ID=$1", [1]);
    var progressVal = result.rows[0].progress;
    console.log(progressVal);
    res.sendStatus(204); //https://restfulapi.net/http-status-204-no-content/
})

// Post route used by ajax request
app.post('/updateProgress', async (req, res) => {
    var userid = req.session.userid;
    console.log("Updating progress vale as ", userid);
    var id = req.body.id;
    var client = await pool.connect();
    var result = await client.query("SELECT * FROM progress WHERE id=$1", [userid]);
    var progressVal = result.rows[0].progress;
    var newBit = progressVal.charAt(id - 1) == "0" ? "1" : "0";
    progressVal = progressVal.substring(0, id - 1) + newBit + progressVal.substring(id, progressVal.length);

    await client.query("UPDATE progress SET progress=$2 WHERE id=$1", [userid, progressVal]);
    res.send(progressVal);
})

app.listen(port, function () {
    console.log("Listening on: " + port);
});


// Helper functions

function sendVerificationEmail(username, email) {
    console.log("Send mail");
    // Construct and send verification email
    var href = 'http://' + process.env.IPV4 + ':3000/verify?username=' + username;

    var message = 'Verification link: <a href="' + href + '"><button>Click Here</button></a>';

    var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Running App Verification Email',
        html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

async function getUsername(userid) {
    var client = await pool.connect();

    var result = await client.query("SELECT username FROM users WHERE id=$1", [userid]);
    return result.rows[0].username;
}

async function getProgress(userid) {
    var client = await pool.connect();

    // Query the database to get the string containing progress values
    var result = await client.query("SELECT progress FROM progress WHERE id=$1", [userid]); // get the progress for this specific user

    // Assuming that this progress query will always return one row (should check for this later)
    // This progressStr is a 64 character string of 0's and 1's
    return result.rows[0].progress;
}