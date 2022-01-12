const express = require('express');
const route = express.Router();

const users = [];

route.get('/', (req, res, next) => {
    res.render('main', {pageTitle: 'Home'});
});

route.post('/', (req, res, next) => {
    users.push({username : req.body.username});
    res.redirect('/users');
});

exports.route = route;
exports.users = users;