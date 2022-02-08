const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

//check function takes fieldnames that need to be checked and returns a middleware
router.get('/signup', authController.getSignup);

router.post('/login', 
[
    check('email')
        .isEmail()
        .withMessage('Please Enter a valid Email')
        .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
],
 authController.postLogin);

router.post(
    '/signup',
    [ 
        check('email')
            .isEmail()
            .withMessage('Please Enter a valid Email.')
            .custom((value, { req }) => {
            //     if(value === 'test@test.com'){
            //         throw new Error('This email address is forbidden.');
            //     }
            //     //return true if no error
            //     return true;
                //create user only if user with that email does not yet exist
                
                //This allow us to add our own async validation
                return User
                    .findOne({email: value})
                    .then( userDoc => {
                        if(userDoc){
                            return Promise.reject(
                                'E-Mail exists already, please pick a different one.'
                            );
                        } 
                    });
                })
                .normalizeEmail(),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters.'//default error message for all validators 
        )
            .isLength({min: 5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if(value !== req.body.password){
                    throw new Error('Passwords have to match!');
                }
                return true;
            })

    ], 
    authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;