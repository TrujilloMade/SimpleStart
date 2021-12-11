const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Load User Model
const User = require('../models/user');


module.exports = function(passport){
    //Creates a middleware that uses a local strategy with Passport
    passport.use(
        //Defines our local strategy 
        new localStrategy({usernameField: 'email'},(email, password, done)=>{
            // Searches our database for a match to the email sent by the form
            User.findOne({email:email.toLowerCase()})
            // Waits for the search to finish before continuing
            .then(user=>{
                //if there is no user that matches return
                if(!user){return done(null,false,{msg: 'Email or Password is incorrect'});}

                //If the user exists compare the password to the one in the database
                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;

                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null,false, {msg: 'Email or Password is incorrect'})
                    }
                });
            })
            .catch(err => console.log(err));
        })
    )

    passport.serializeUser((user,done)=>{
        done (null, user.id);
    })

    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        })
    })
}