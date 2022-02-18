const PORT = process.env.PORT || 3500;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
//csrf token makes sure session only attached to OUR views and not some malicious copy cat look alike (install csurf)
const csrf = require('csurf');
//connect-flash allows temporary storage in session
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');
const MONGODB_URI = 'mongodb+srv://aMongus:eBha7xJf3m9Xb6F@cluster0.0slwi.mongodb.net/shop?retryWrites=true';
const cors = require('cors');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions' 
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { nextTick } = require('process');
const corsOptions = {
    origin: "https://<your_app_name>.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  family: 4
};


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// in production 'my secret' should instead be a long string value
app.use(
  session({
    secret: 'my secret', 
    resave: false, 
    saveUninitialized: false, 
    store: store
    })
  );
app.use(csrfProtection);
//flash middleware must come after session
app.use(flash());

app.use((req, res, next) => {
  //creates local variables for each req executed
 res.locals.isAuthenticated = req.session.isLoggedIn;
 res.locals.csrfToken = req.csrfToken();
 next();
});

app.use((req, res, next) => {
  //throw new Error("Sync Dummy")
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    // throw new Error('Dummy');

    //user may be saved in session, but deleted in database 
    if(!user){
      return next();
    }
    req.user = user;
    next();
  })
  .catch(err => {
    //err comes from techincal issue, for ex w/ connecting to database
    //err in .catch & callbacks isn't thrown- use next();
    next(new Error(err));
  });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)
app.use(errorController.get404);

//error handling middleware has 4 arguments
app.use((error, req, res, next) => {
  // res.redirect('/500');
  res.status(500).render('500', {
  pageTitle: 'Error!',
  path: '/500'
  });
});

mongoose
.connect(MONGODB_URI, options)
.then(result => {
  app.listen(PORT)
}).catch(err => {
  next(new Error(err));
});
