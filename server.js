#!/usr/bin/env node
// Above line used by systemd service, which tells it to interpret this file as a node file

const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true })); // To parse incoming requests, including JSON and form data
// app.use(express.json()) // To parse the incoming requests with JSON payloads
app.use(express.static('public')); // Allows express to serve static files, which should be stored in a folder called 'public'

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
const port = process.env.PORT || 3000

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

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
})

app.post("/login", function (req, res) {
    var usernmae = req.body.username;

    pool.connect()
        .then(client => {
            var query = 'SELECT * FROM users WHERE username = $1';
            var params = [usernmae];

            client.query(query, params)
                .then(result => {
                    // This 'result' variable contains lots of information in json format. 'rows' is just one part that we can access
                    client.release();
                    if (result.rows.length == 0) {
                        res.render("login_failure", { reasonMsg: "User does not exist. Please try again with a different username." });
                        return;
                    }
                    var hash = result.rows[0].password;
                    var db_verified = result.rows[0].verified;
                    var form_password = req.body.password;

                    bcrypt.compare(form_password, hash, function (err, result) {
                        if (result && db_verified == 'Y') {
                            res.render("index", { username: usernmae });
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


                })
                .catch(queryError => {
                    // It is possible that the client was already released in the previous then block, so try/catch this release()
                    try {
                        client.release();
                    }
                    catch (error) {
                        console.error(error);
                    }
                    console.error('Error executing query', queryError); // just concatenates the error message
                    res.status(500).send('Error');
                });
        })
        .catch(connectError => {
            console.error('Error connecting to database', connectError);
            res.status(500).send('Error');
        })
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


//             // Cobnstruct and send verification email
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
                    var result = await client.query(insertQuery, insertParams);
                    console.log("Successfully inserted the record");
                    return res.sendFile(__dirname + '/signup_success.html');
                }
                catch (err) {
                    console.log(err);
                }
            });


            // Construct and send verification email
            var href = 'http://' + process.env.IPV4 + ':3000/verify?username=' + req.body.username;

            var message = 'Verification link: <a href="' + href + '"><button>Click Here</button></a>';

            var mailOptions = {
                from: process.env.EMAIL,
                to: req.body.email,
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
    }
    catch (err) {
        console.error(err);
        res.render('signup', { text: errorMsg });
    }
})


app.get('/verify', (req, res) => {
    console.log(req.query);
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

app.listen(port, function () {
    console.log("Listening on: " + port);
});