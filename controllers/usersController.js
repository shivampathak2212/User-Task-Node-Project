// Here we need to implement router from express, so add the request statement for express and store the result of express.Router() function in a router variable.
const json = require('body-parser');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db.js');
const dotenv = require('dotenv');

//Configure dotenv files above using any other library and files
dotenv.config({path:'./utils/config.env'}); 

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

// user login
// URL -> localhost:3000/users/login
router.post('/login', (req, res, next) => {
    var UserId;
    db.query(
        `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
        (err, result) => {
            // user does not exists
            if (err) {
                return res.status(400).send({
                    message: err
                });
            }
            if (!result.length) {
                return res.status(401).send({
                    message: 'Email or password is incorrect!'
                });
            }
            // check password
            bcrypt.compare( req.body.password, result[0]['Password'], (bErr, bResult) => {                
                UserId = result[0]['ID'];
                console.log(UserId);
                    // wrong password
                    if (bErr) {
                        return res.status(401).send({
                            message: 'Email or password is incorrect!'
                        });
                    }
                    if (bResult) {
                        
                        const token = jwt.sign({ id: result[0].id }, process.env.JwtTokenSecretKey, { expiresIn: '1d' });
                        return res.status(200).send({
                            message: 'Logged in!',
                            token : 'Bearer' + ' ' + UserId + ' ' + token,
                            user: result[0]
                        });
                    }
                    return res.status(401).send({
                        message: 'Username or password is incorrect!'
                    });
                }
            );
        }
    );
});


module.exports = router;
