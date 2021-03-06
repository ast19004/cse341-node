const PORT = process.env.PORT || 3000;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('61eb4e192175a6affa20a254')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


mongoose
.connect('mongodb+srv://aMongus:eBha7xJf3m9Xb6F@cluster0.0slwi.mongodb.net/shop?retryWrites=true&w=majority')
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
