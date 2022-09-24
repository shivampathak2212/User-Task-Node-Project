const json = require('body-parser');
const express = require('express');
const db = require('../utils/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

//Configure dotenv files above using any other library and files
dotenv.config({path:'./utils/config.env'}); 

var router = express.Router();

const genericError = "Sorry, something went wrong!"

// Get all tasks for current user
// URL -> localhost:3000/tasks/getUserTasks
router.get("/getUserTasks", (req, res) => {
    try {
        if (!req.body.authorizationToken || !req.body.authorizationToken.startsWith('Bearer') || !req.body.authorizationToken.split(' ')[2]) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }

        const theToken = req.body.authorizationToken.split(' ')[2];
        const userId = req.body.authorizationToken.split(' ')[1];
        jwt.verify(theToken, process.env.JwtTokenSecretKey, (err) => {
            if(err){
                throw("Invalid JWT token " + err)
            }
        });

        var sql = `SELECT * FROM nodedb.tasks WHERE userId = "${userId}"`;

        db.query(sql, (err, doc) => {
            if (err) {
                response.status(404).send({
                    success: false,
                    error: "No records found",
                })
            }
            res.send(doc);
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

// Create a task for current user
// URL -> localhost:3000/tasks/createTask
router.post('/createTask', (req, res) => {
    try {
        if (!req.body.authorizationToken || !req.body.authorizationToken.startsWith('Bearer') || !req.body.authorizationToken.split(' ')[2]) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
        const theToken = req.body.authorizationToken.split(' ')[2];
        jwt.verify(theToken, process.env.JwtTokenSecretKey, (err) => {
            if(err){
                throw("Invalid JWT token " + err)
            }
        });

        var title = req.body.title;
        var dueDate = req.body.dueDate;
        var attachment = req.body.attachment;
        const userId = req.body.authorizationToken.split(' ')[1];

        sql = `INSERT INTO nodedb.tasks (Title, DueDate, Attachment, UserId) VALUES ("${title}" , "${dueDate}" , "${attachment}" , ${userId})`;
        db.query(sql, function (err, doc) {
            if (doc.insertId) {
                res.send({ success: true, message: "Task created", TaskId: doc.insertId })
            }
            else {
                response.status(500).send({
                    success: false,
                    error: genericError,
                })
            }
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            error: JSON.stringify(err, undefined, 2),
        })
    }
});

// Update a task by task id for current user
// URL -> localhost:3000/tasks/updateTask
router.put('/updateTask', (req, res) => {
    try {
        if (!req.body.authorizationToken || !req.body.authorizationToken.startsWith('Bearer') || !req.body.authorizationToken.split(' ')[2]) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
        const theToken = req.body.authorizationToken.split(' ')[2];
        jwt.verify(theToken, process.env.JwtTokenSecretKey, (err) => {
            if(err){
                throw("Invalid JWT token " + err)
            }
        });

        var taskId = req.body.id;
        var title = req.body.title;

        sql = `UPDATE nodedb.tasks SET title = "${title}" where Id = "${taskId}";`;
        db.query(sql, function (err, doc) {
            if (err) throw err;
            res.send({ message: doc.affectedRows + " record(s) updated" });
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            error: JSON.stringify(err, undefined, 2)
        })
    }
});

// Delete a task by task id for current user
// URL -> localhost:3000/tasks/deleteTask
router.delete('/deleteTask', (req, res) => {
    try {
        if (!req.body.authorizationToken || !req.body.authorizationToken.startsWith('Bearer') || !req.body.authorizationToken.split(' ')[2]) {
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
        const theToken = req.body.authorizationToken.split(' ')[2];
        jwt.verify(theToken, process.env.JwtTokenSecretKey, (err) => {
            if(err){
                throw("Invalid JWT token " + err)
            }
        });

        var taskId = req.body.id;
        sql = `DELETE FROM nodedb.tasks WHERE id = "${taskId}"`;
        db.query(sql, (err, doc) => {
            if (err) throw err;
            res.send({ message: "Number of records deleted: " + doc.affectedRows });
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            error: JSON.stringify(err, undefined, 2)
        })
    }
});

module.exports = router;