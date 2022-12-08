const express = require("express")
const mongoose = require("mongoose")
const route = require('../src/route/route');
const app = express()
const multer=require("multer")
const { AppConfig } = require('aws-sdk');

app.use(express.json())
app.use(multer().any())

mongoose.connect("mongodb+srv://yashsingh:8i1kfhU26wUDrXft@cluster0.e53dru9.mongodb.net/group22Database",
 	 { useNewUrlParser: true })
.then(() => console.log("MongoDB is connected"))
.catch((error) => console.log(error))



app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
	console.log('Express app running on port ' + (process.env.PORT || 3000))})