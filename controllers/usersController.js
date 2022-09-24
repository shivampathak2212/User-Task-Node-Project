// Here we need to implement router from express, so add the request statement for express and store the result of express.Router() function in a router variable.
const json = require('body-parser');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db.js');

var router = express.Router();


// Get all users
// URL -> localhost:3000/users/getUsers
router.get("/getUsers", (req, res) => {
    let sql = "SELECT * FROM nodedb.users";

    db.query(sql, (err, doc) => {
        if (err) {
            response.status(404).send({
                success: false,
                error: "No records found",
            })
        }
        res.send(doc);
    });
});

// Create/register a user
// URL -> localhost:3000/users/registerUser
router.post('/registerUser', (req, res) => {
    try {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;

        // Send a message to user if all the required information in not provided
        if (!name || !email || !password) {
            return res.json({ message: 'Please enter all the details' })
        }

        // check if a user is already registered for the given email id
        var getUserSql = `SELECT * FROM nodedb.Users WHERE email = "${email}"`;
        db.query(getUserSql, function (err, result, field) {
            if (result.length === 0) {
                // Insert user record to the database if no user exists currently for given email id 
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).send({
                            msg: err
                        });
                    } else {
                        // has hashed pw => add to database
                        var sql = `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(req.body.email)}, ${db.escape(hash)})`;
                        db.query(sql, (err, doc) => {
                            if (err) {
                                throw err;
                            }
                            return res.status(201).send({
                                success: true, message: "User Registered", UserId: doc.insertId
                            });
                        }
                        );
                    }
                });
            } else {
                res.send({ message: "User already exists for emailId: " + email })
            }
        });
    }
    catch(err)
    {
        res.status(500).send({
            success: false,
            error: JSON.stringify(err, undefined, 2)
        })
    }
});

//  user login
// URL -> localhost:3000/users/login
router.get('/login', async (req, res) => {
    try {
        var email = req.body.email;
        var password = req.body.password;

        // Send a message to user if all the required information in not provided
        if (!email || !password) {
            return res.json({ message: 'Please enter email and password' })
        }

        // check if a user exists for given email id
        var getUserSql = `SELECT * FROM nodedb.Users WHERE email = "${email}"`;
        db.query(getUserSql, function (err, result, field) {

            if (result.length === 0) {
                res.send({ message: "No user exists for email id: " + email })
            }
            else {
                // when user exists for given email id
                var sql = `SELECT * FROM nodedb.Users WHERE email = "${email}" AND password = "${password}"`;
                db.query(sql, function (err, doc) {
                    if (doc.length === 0) {
                        // user exists in database but incorrect password
                        res.send({ message: "Incorrect password entered" })
                    }
                    else {
                        // email and password both match with a user record in database
                        res.send({ message: "User Logged-in" })
                    }
                });
            }
        })
    }
    catch(err)
    {
        res.status(500).send({
            success: false,
            error: JSON.stringify(err, undefined, 2)
        })
    }
});


module.exports = router;
