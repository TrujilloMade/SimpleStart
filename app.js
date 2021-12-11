if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const ejs = require("ejs");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

//EJS
app.set("view engine","ejs");
app.use(express.static('public'));
app.use(expressLayouts);

//For the api
app.use(express.json());

// BodyParser
app.use(express.urlencoded({extended:false}));

// Express Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {sameSite: 'strict'} 
  }))
  
  // Passport
  require('./config/passport')(passport);//Passport Config --was above EJS section
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Connect Flash
  app.use(flash())
  app.use((req,res,next)=>{
      res.locals.success_msg = req.flash('success_msg');
      res.locals.err_msg = req.flash('err_msg');
      res.locals.error = req.flash('error');
      res.locals.session = req.session;
      next();
  })

  //Connect to the Main DB (users for now)
  mongoose.connect(process.env.USERS_DATABASE_URI,{
    useNewUrlParser:true,
    useUnifiedTopology: true })
    .then( (res) => { 
      console.log('Connected to MongoDB')
    })
    .catch(err => console.log(err))
  


// Routes
app.use('/', require('./routes/index'));

app.listen(PORT, ()=> console.log( `Server started on Port:${PORT}`));