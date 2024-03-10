#!/usr/bin/env node
// Above line used by systemd service, which tells it to interpret this file as a node file

const express = require("express");
const app = express();

require('dotenv').config(); // Package to help safely store db connection details and other environment vairables by loading info from a '.env' file into process.env
app.set('view engine', 'ejs'); // ejs is a JavaScript templating package. This sets the templating engine to use ejs, which will render .ejs files in the 'views' folder
const nodemailer = require('nodemailer'); // For sending emails
const bcrypt = require('bcrypt'); // For hasing passwords
const saltRounds = 12; // Salt added to initial password before decryption. rounds=12: 2-3 hashes/sec (https://blog.logrocket.com/password-hashing-node-js-bcrypt/#auto-generating-salt-hash)
const { Pool } = require('pg'); // Package for connecting to Postgres db
// The above is equivalent to the following two lines
// const pg = require('pg');
// const Pool = pg.Pool;
const session = require("express-session"); // Used for storing and retriving session state (e.g., userid)
const crypto = require('crypto') // used to generate a sufficiently long and entropic token used for password reset token
const date_fns = require('date-fns') // used for date operations, specifically for creating an expiration timestamp for the password reset table

const util = require('./server_utils');

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
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000
});

app.get("/", async function (req, res) {
    // If the user's session exists, skip the login page and take them directly to the main page that contains the progress table
    var userid = req.session.userid;
    if (req.session.userid) {
        try {
            var username = await getUsername(userid);
            var progressStr = await getProgress(userid);
            var table5k = await util.createProgressTable(progressStr, "5k");
            var table10k = await util.createProgressTable(progressStr, "10k");
    
            res.locals.isLoggedIn = true;
    
            res.render("index", { username: username, table5k: table5k, table10k: table10k });
        }
        catch (err) {
            if (err == 'InvalidProgram') {
                console.error('Invalid program data', err);
            }
            res.render('error');
        }
    }
    else
        res.render("login");
})

// User might try to refresh the login page after an unsuccessful login attempt, in which case we need a GET route to handle this.
app.get('/login', (req, res) => {
    res.render("login");
})

app.post("/login", async function (req, res) {
    var username = req.body.username;

    try {
        var client = await pool.connect();
        var query = 'SELECT * FROM users WHERE username = $1';
        var params = [username];

        var queryResult = await client.query(query, params);
        // This 'queryResult' variable contains lots of information in json format. 'rows' is just one part that we can access
        if (queryResult.rows.length == 0) {
            throw 'IncorrectUsernameOrPassword'; // Incorrect username
        }
        var hash = queryResult.rows[0].password;
        var db_verified = queryResult.rows[0].verified;
        if (db_verified == 'N')
            throw 'UnverifiedEmail';
        var form_password = req.body.password;

        // Returns true if the password entered in this login form matches the one we have hashed in the db
        var result = await new Promise((resolve, reject) => {
            bcrypt.compare(form_password, hash, async function (err, result) {
                if (err) reject(err);
                else resolve(result);
            });
        });

        if (!result) {
            throw 'IncorrectUsernameOrPassword'; // Incorrect password
        }
        else {
            var idResult = await client.query("SELECT id FROM users WHERE username=$1", [username]);
            var userid = parseInt(idResult.rows[0].id);

            var progressStr = await getProgress(userid);
            var table5k = await util.createProgressTable(progressStr, '5k');
            var table10k = await util.createProgressTable(progressStr, '10k');

            // Create a session that stores this logged in user's info
            req.session.userid = userid;
            req.session.save();

            // Set a flag in the ejs locals variable to show that a user is logged in
            // This way, we can have front-end logic without the need to always pass this information everytime we call res.render()
            res.locals.isLoggedIn = true;

            res.render("index", { username: username, table5k: table5k, table10k: table10k });
        }
    }
    catch (err) {
        if (err == 'UnverifiedEmail')
            res.render("login", { reasonMsg: 'Your email is not verified yet. Please check your inbox for an email containing your verification link.' });
        else if (err == 'IncorrectUsernameOrPassword') // This is combined into a single error, because we don't want to give any indication if a user does / does not exist, due to security concerns
            res.render("login", { reasonMsg: 'Your username or password is incorrect. Please try again.' });
        else if (err == 'InvalidProgram') {
            console.error('Invalid program data was requested', err);
            res.render('error');
        }
        else {
            console.error('Error connecting to database or executing query', err);
            res.render('error');
        }
    }
    finally {
        if (client)
            client.release();
    }
})

app.get('/stopwatch', (req, res) => {
    // Only show this file if the user is logged in!
    if (req.session.userid)
        res.render('stopwatch');
    else
        res.sendStatus("401");

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

app.get('/verify', (req, res) => {
    var db_client;
    pool.connect()
        .then(client => {
            db_client = client;
            var query = 'SELECT * FROM users WHERE username = $1';
            var params = [req.query.username];
            return db_client.query(query, params)
        }).then(result => {
            if (result.rowCount != 1) {
                return Promise.reject('NoSingleUser');
            }
            else {
                var updateQuery = 'UPDATE users SET verified = \'Y\' WHERE username = $1';
                var updateParams = [req.query.username];
                return db_client.query(updateQuery, updateParams)
            }
        }).then(result => {
            res.sendFile(__dirname + '/verified_email.html');
        }).catch(err => {
            console.error('Error ', err);

            // Example of how to handle multiple types of erros within one single catch block
            // The first if statement is a custom error, created to account for custom application logic, and thrown when Promise.reject() is called
            // If an error occurs while calling db_client, an error object comes back, and the err.code attribute tells us what went wrong. I cover one of these cases
            // Postgres error code reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
            if (err == "NoSingleUser") {
                console.error("Username does not exist, or exists multiple times. At this point, only one should exist.");
            }
            else if (err.code == 42601) {
                console.error("There is a syntax error in one of the executed queries.");
            }
            else {
                console.error("An unexpected error occurred. Either unable to connect to db or a query was unable to be successfully executed.");
            }
            res.render('error');
        })
})

app.get('/forgot-password', (req, res) => {
    res.render('forgot_password');
});

app.post('/forgot-password', async (req, res) => {
    var email = req.body.userOrEmail

    try {
        // Determine user id
        console.log(email.toLowerCase())
        var client = await pool.connect();
        var statement = 'SELECT id, username FROM users WHERE lower(email) = $1';
        var params = [(email.toLowerCase())];
        var result = await client.query(statement, params);

        // Hash reset token and store in the db, if there is an account tied to this email
        if (result.rowCount == 1) {
            // Create reset token

            // The below commented code is the original crypto.randomBytes method, which has a callback, and does not return a promise
            // If we were to use this default function, the rest of the code in this if statement would need to be contained within this callback
            // This is because we need the generated token to be available in order to hash it, insert it, and send the password reset email
            // Having all of this in the callback function can be confusing, and I have come to prefer promises. Therefore I created a wrapper function
            // that "promisifies" this randomBytes method, so I can simply await it.

            // var token = crypto.randomBytes(48, function (err, buffer) {
            //     var token = buffer.toString('hex');
            // });

            // Promise-based function wrapper (https://byby.dev/node-promisify)

            var token = await new Promise((resolve, reject) => {
                crypto.randomBytes(48, function (err, buffer) {
                    if (err) {
                        reject(err); // Reject the Promise with the error
                    } else {
                        resolve(buffer.toString('hex')); // Resolve the Promise with the result (the token)
                    }
                });
            });

            // Hash reset token
            var record = result.rows[0];
            var user_id = record.id;
            var username = record.username;
            var hash = await new Promise((resolve, reject) => {
                bcrypt.hash(token, saltRounds, (err, hash) => {
                    if (err) reject(err);
                    else resolve(hash);
                })
            });

            //Insert into db
            // Create and expiration timestamp which is 15 minutes ahead of the current timestamp
            const currentTimestamp = new Date();
            const expirationTimestamp = date_fns.addMinutes(currentTimestamp, 15);

            var insertQuery = "INSERT INTO password_reset_tokens VALUES($1, $2, $3)";
            var insertParams = [user_id, hash, expirationTimestamp];
            await client.query(insertQuery, insertParams);
            console.log("Successfully inserted the password_reset_tokens table record");

            // Create and send reset email
            var href = 'http://' + process.env.IPV4 + ':3000/reset-password?token=' + token + '&username=' + username;

            var message = 'Reset your password by clicking the following link: <a href="' + href + '"><button>Click Here</button></a> This link will expire 15 minutes after it was sent. Do not share this email.';

            var mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'PacePal Password Reset',
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
    }
    catch (err) {
        console.log(err);
        res.render('error');
    }
    finally {
        if (client)
            client.release();
    }

    res.render('forgot_password', { email: email });
});

app.get('/reset-password', async (req, res) => {
    try {
        var token = req.query.token;
        var username = req.query.username;
        var client = await pool.connect();

        // Get all unexpired tokens for this user
        var statement = "SELECT token FROM password_reset_tokens t JOIN users u ON t.user_id = u.id WHERE username = $1 AND token_expiration > $2";
        var currentTimestamp = new Date();
        var params = [username, currentTimestamp];
        var queryResult = await client.query(statement, params);

        // Check to see if the token in the reset link matches any of the hashed tokens for this user
        var result;
        var promiseArray = queryResult.rows.map(async (row) => {
            var hashedToken = row.token;
            return new Promise((resolve, reject) => {
                bcrypt.compare(token, hashedToken, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        });

        // If any of the hashed tokens for this user match the token in the reset link, return the reset password page
        // (Theu ser could have requested multiple reset links that are all unexpired, so that is why we need to loop through and check each one for a possible match)
        Promise.all(promiseArray).then(function (resultsArray) {
            console.log(resultsArray);
            var isValid = resultsArray.some(e => e); // checks to see if at least one of the promises resolved to true (token matched hashed token)
            if (isValid)
                res.render('reset_password', { username: username });
            else
                throw "InvalidOrExpiredToken";
        }).catch(function (err) {
            console.log(err);
            res.render('error', { errMsg: "This link is invalid or has expired. Click <a href= '/forgot-password'>here</a> to generate a new password reset link." });
        })
    }
    catch (err) {
        console.log(err);
        res.render('error');
    }
    finally {
        if (client)
            client.release();
    }
});

app.post('/reset-password', async (req, res) => {
    try {
        var client = await pool.connect();
        var newPassword = req.body.password;
        var username = req.body.username;
        var hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(newPassword, saltRounds, async function (err, hash) {
                if (err) reject(err);
                else resolve(hash);
            })
        });

        var updateStatement = 'UPDATE users SET password = $1 WHERE username = $2';
        var updateParams = [hashedPassword, username];
        await client.query(updateStatement, updateParams);

        res.render('reset_password', { result: "true" });
    }
    catch (err) {
        console.log(err)
        res.render('error', { errMsg: 'An error occurred while resetting your password. Click <a href= "/forgot-password">here</a> to generate a new password reset link.' })
    }

});

app.get('/signout', (req, res) => {
    req.session.destroy(function (err) {
        res.render("login");
    })
})

// Post route used by ajax request
app.post('/updateProgress', async (req, res) => {
    var userid = req.session.userid;
    console.log("Updating progress vale as ", userid);
    var id = req.body.id;
    try {
        var client = await pool.connect();
        var result = await client.query("SELECT * FROM progress WHERE id=$1", [userid]);
        var progressVal = result.rows[0].progress;
        var newBit = progressVal.charAt(id - 1) == "0" ? "1" : "0";
        progressVal = progressVal.substring(0, id - 1) + newBit + progressVal.substring(id, progressVal.length);

        await client.query("UPDATE progress SET progress=$2 WHERE id=$1", [userid, progressVal]);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        if (client)
            client.release();
    }

    res.send(progressVal);
})

app.listen(port, function () {
    console.log("Listening on: " + port);
});


// Helper functions
async function getUsername(userid) {
    try {
        var client = await pool.connect();
        var result = await client.query("SELECT username FROM users WHERE id=$1", [userid]);
    }
    catch (err) {
        res.render('error');
    }
    finally {
        if (client)
            client.release();
    }

    return result.rows[0].username;
}

async function getProgress(userid) {
    try {
        var client = await pool.connect();
        // Query the database to get the string containing progress values
        var result = await client.query("SELECT progress FROM progress WHERE id=$1", [userid]); // get the progress for this specific user
    }
    catch (err) {
        res.render('error');
    }
    finally {
        if (client)
            client.release();
    }

    // Assuming that this progress query will always return one row (should check for this later)
    // This progressStr is a 64 character string of 0's and 1's
    return result.rows[0].progress;
}
