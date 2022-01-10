const express = require('express');
const bodyParser = require('body-parser');
const mongoose=require('mongoose')
const multer=require('multer')
const route = require('./routes/route');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())
app.use('/', route);

mongoose.connect("mongodb+srv://user-open-to-all:hiPassword123@cluster0.xgk0k.mongodb.net/TANDON-DB?retryWrites=true&w=majority",
{UseNewUrlParser:true} )
.then(()=>console.log("mongodb running and connected"))
.catch((err)=>console.log(err));
app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
}); 