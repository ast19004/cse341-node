const bcrypt = require('bcryptjs');
//using free third party server for email: SendGrid
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    //Value found in sendGridAccount
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email})
    .then(user => {
      if(!user){
        //flash takes a key and then the message
        req.flash('error', 'Invalid email or password.');
       return res.redirect('/login'); 
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if(doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
      })
      .catch(err => {
        console.log(err);
        redirect('/login') 
      })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
 
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  //create user only if user with that email does not yet exist
  User
  .findOne({email: email})
  .then( userDoc => {
    if(userDoc){
      req.flash('error', 'E-Mail exists already, please pick a different one.');
      return res.redirect('/signup');
    }
    //install bcryptjs for password hashing, salt of 12 accepted as highly secure
    return bcrypt
      .hash(password, 12) 
      .then( hashedPassword => {
        const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: []}
      });
    return user.save();
  })
  .then(result => {
    res.redirect('/login');
    return transporter.sendMail({
      to: email,
      from: 'shop@node-complete.com',
      subject: 'Signup succeeded!',
      html: '<h1>You successfully signed up!</h1>' 
      });
    })
    .catch(err=> {
      console.log(err);
      });
    })
  .catch(err => {
    console.log(err);
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
