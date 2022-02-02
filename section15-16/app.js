const PORT = process.env.PORT || 5000;
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
const MONGODB_URI = 'mongodb+srv://aMongus:eBha7xJf3m9Xb6F@cluster0.0slwi.mongodb.net/shop?retryWrites=true&w=majority';

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
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    req.user = user;
    next();
  })
  .catch(err => {
    console.log(err);
  });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoose
.connect(MONGODB_URI)
.then(result => {
  User.findOne().then(user => {
    if(!user){
        const user = new User({
        name: "Max",
        email: "max.test.com",
        cart: {
          items: []
        }
      });
      user.save();
    }
  })
  app.listen(PORT)
}).catch(err => {
  console.log(err);
});
