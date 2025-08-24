const mongoose = require('mongoose');
require('dotenv').config()
//Define the MongoDB connection URL
const mongoURL =process.env.MONGODB_URL_LOCAL //Replace 'mydatabase' with your satabase name 
//const mongoURL = process.env.mongoDB_URL
//set up MongoDB connection
mongoose.connect(mongoURL, {

})

//Get the default connection
//Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

//Define event listerners for database connection

db.on('connected', () => {
    console.log("Connected to MongoDB server");
})

db.on('error', (err) => {
    console.log("MongoDB connection error", err);
})

db.on('disconnected', () => {
    console.log("MOngoDB disconnected");
})

//Export the database connection
module.exports = db;


//  useNewUrlParser: true,
//    useUnifiedTopology: true