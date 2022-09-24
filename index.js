// Request statement for express and body-parser
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// In order to make a connection with database we need to execute the "db.js" file.
// The constant db will store the connection that we exported in the db.js file.
const db = require('./utils/db.js');

//Configure dotenv files above using any other library and files
dotenv.config({path:'./utils/config.env'}); 

// Request statement for the controller we want to use
var usersController = require('./controllers/usersController');
var tasksController = require('./controllers/tasksController');

// Connecting to MySQL Database
db.connect((err) => {
    if (err) {
        console.log(err);
    }
    else{
        console.log("MySql Connected");
    }
  });

// To work with express we need to call the express package, the result will be saved in the "app" variable here.
var app = express();

// We need to configure express middleware in-order to send json data to this nodejs project. 
app.use(bodyParser.json());

// To start the express server we can call the app.listen() method, the first parameter takes the port number we want to start our application, after the server starts the callback function will be involved.
app.listen(3000, () => console.log("Server started at port: 3000"));

app.use('/users', usersController);
app.use('/tasks', tasksController);