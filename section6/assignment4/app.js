const bodyParser = require("body-parser");
const express = require("express");

const path = require('path');

const app = express();

const mainData = require('./routes/main');
const userRoute = require('./routes/users');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(userRoute);
app.use(mainData.route);

app.use('/', (req, res, next)=> {
    res.send('<h1>Home</h1>');
});

app.listen(3500);