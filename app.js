var mongoose = require("mongoose");
var express = require("express");
var blogRoutes = require('./routes/blogRoutes');
var userRoutes = require('./routes/userRoutes');
var commentRoutes = require('./routes/commentRoutes');
var categoryRoutes = require('./routes/categoryRoutes');
var tokenRoutes = require('./routes/tokenRoutes');
var key = require('./keys');

//creating an express app
var app = express();

app.set('view engine', 'ejs');

//connecting to mongodb database
const dbURL = key.connectKey;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then( result => {app.listen(3000);console.log("connected to db");})
    .catch( err => console.log(err));

app.use(express.static('public')); //static is an inbuilt express middleware that allows css files, images, etc to be displayed in the browser.
//here the argument of the static function indicates the name of the folder where in we keep our static files likes css,images,etc.

app.use(express.urlencoded( {extended: true} ));//url encoded is a middleware that accepts the entries of the form when we click submit

app.use('/blogs', blogRoutes);

app.use('/users', userRoutes);

app.use('/comments', commentRoutes);

app.use('/categories', categoryRoutes);

app.use('/tokens', tokenRoutes);

app.use((req, res) => {
    res.status(400);
});