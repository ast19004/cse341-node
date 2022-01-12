const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const app = express();
//npm install --save express-handlebars@3.0
//this is used for engines that are not built in:
//Also view/layout is already the default:
//app.engine('handlebars', expressHbs({layoutsDir: 'views/layouts', defaultLayout: 'main-layout'}));

//app.set('view engine', 'handlebars');
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');

//app.set('view engine', 'handlebars');

//this technically is not necessary since the default is to look for views in a views folder at the root of the project
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page Not Found'});
});

app.listen(3000);
