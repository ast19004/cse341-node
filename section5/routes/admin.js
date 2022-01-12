const path = require('path');

const express = require("express");

const rootDir = require('../util/path');

const router = express.Router();

//all paths techinally start with /admin due to func in app.js
router.get('/add-product', (req, res, next)=> {
    res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'));
});

router.post("/add-product", (req, res, next) => {
    console.log(req.body);
    res.redirect("/");
});

module.exports = router;