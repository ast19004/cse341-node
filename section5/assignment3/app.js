const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');

const userRoutes = require('./routes/users');
const homeRoutes = require('./routes/home');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(homeRoutes);
app.use(userRoutes);

app.listen(3300);