// importing mysql2 to use its for connecting with MySQL database
const mySql = require('mysql');
const dotenv = require('dotenv');

//Configure dotenv files above using any other library and files
dotenv.config({path:'./utils/config.env'}); 


// Creating a connection
const connection = mySql.createConnection({
    host: process.env.host,
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
});

module.exports = connection;