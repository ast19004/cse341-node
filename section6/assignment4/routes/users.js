const express = require('express');

const route = express.Router();

const mainData = require('./main');

route.get('/users', (req, res, next)=>{
    const users = mainData.users;
    res.render('users', {users: users, pageTitle: 'Users'});
});

module.exports = route;

