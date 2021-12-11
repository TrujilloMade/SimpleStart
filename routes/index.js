const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {ensureAuthenticated, isLoggedIn} = require('../config/auth');

router.get('/', (req,res)=>{
    res.render('index', {
        'loggedIn': req.session.loggedIn,
        'page': 'Home'
    })
});


router.get('/dashboard',ensureAuthenticated, (req,res)=>{
    res.render('dashboard', {
        'loggedIn': req.session.loggedIn,
        'page': 'Dashbaord'
    })
});


//Login Page
router.get('/login', isLoggedIn, (req,res)=>res.render('login', {
    'loggedIn': req.session.loggedIn,
    'page': 'Login'
}));

router.post('/login', isLoggedIn, (req,res, next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
})

//Logout Page
router.get('/logout', ensureAuthenticated, (req,res)=>{
    req.logout();
    req.session.loggedIn = false;
    res.redirect('/');    
});


//Register Page
router.get('/register', isLoggedIn, (req,res)=>res.render('register', {
    'loggedIn': req.session.loggedIn,
    'page': 'Register'
}));

router.post('/register', isLoggedIn, (req,res)=>{
    const {username, email, password, confirmPass} = req.body;
    let errors = [];

    if(!username || !email || !password || !confirmPass){
        errors.push({ msg: 'Please fill in all fields.'});
    }

    if(password !== confirmPass){
        errors.push({msg: 'Passwords do not match.'})
    }

    if(password.length < 12){
        errors.push({msg: 'Passwords should be at least 12 characters.'})
    }

    if(errors.length>0){
        
        res.render('register',{
           errors,
           username,
           email 
        });
    }else{
        User.findOne({$or: [
            {email: email},
            {username: username}
        ]})
        .then(user => {
            if(user){
                // User Exists
                errors.push({msg: 'User exists.'})
                res.render('register',{
                    errors
                })
            }else{
      
                const newUser = new User({
                    username,
                    email,
                    password
                });

                // Make all emails lowercase for auth purposes
                newUser.email = email.toLowerCase();

                // Hash Password
                bcrypt.genSalt(10, (err,salt) =>{
                    bcrypt.hash(newUser.password, salt, (err,hash)=>{
                        if(err) throw err;
                        //Saved Hash password
                        newUser.password = hash;

                        //save new user
                        newUser.save()
                        .then(user=>{
                            req.flash('success_msg', 'You are now registered and can login');
                            res.redirect('login');
                        })
                        .catch(err => console.log(err));
                    })
                })
            }
        }); 
    }

})


module.exports = router; 